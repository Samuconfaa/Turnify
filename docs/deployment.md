# Deployment

## Obiettivo

Documentare la build e la distribuzione reale dei tre componenti del progetto: app mobile MAUI, backend ASP.NET Core 10, portale web Next.js 14. Le informazioni sono derivate dai file di configurazione presenti nel repository.

---

## Target previsti

### Mobile (Turnify.Mobile.csproj)

| Piattaforma | Framework | Condizione build | Versione minima OS |
|---|---|---|---|
| Android | `net10.0-android` | sempre (unico obbligatorio) | API 21 (Android 5.0) |
| iOS | `net10.0-ios` | build machine non Linux | iOS 15.0 |
| macOS Catalyst | `net10.0-maccatalyst` | build machine non Linux | macCatalyst 15.0 |
| Windows | `net10.0-windows10.0.19041.0` | build machine Windows | Windows 10 build 17763 |

Il target Android è l'unico presente in tutti gli ambienti di build. iOS, macOS e Windows sono condizionali alla piattaforma di sviluppo.

`WindowsPackageType` è impostato a `None`: il build Windows produce un eseguibile non impacchettato (non passa per il Microsoft Store).

### Backend (Turnify.Api.csproj)

| Componente | Framework | Host |
|---|---|---|
| ASP.NET Core API | `net10.0` | VPS, path base `/turnify` |

### Portale web (package.json)

| Componente | Runtime | Porta | Base path |
|---|---|---|---|
| Next.js 14 | Node 20 | 3004 | `/admin` |

---

## Identificativo e versione app mobile

Dal `.csproj`:

```xml
<ApplicationId>it.samuconfa.turnify.mobile</ApplicationId>
<ApplicationTitle>Turnify.Mobile</ApplicationTitle>
<ApplicationDisplayVersion>1.0</ApplicationDisplayVersion>
<ApplicationVersion>1</ApplicationVersion>
```

- `ApplicationDisplayVersion` è la versione visibile all'utente (`versionName` su Android).
- `ApplicationVersion` è il codice numerico incrementale (`versionCode` su Android). Va aumentato ad ogni release sul Play Store.

---

## Configurazioni

### XAML source generation

`MauiXamlInflator` è impostato a `SourceGen`: il XAML viene compilato in C# a compile-time invece di essere interpretato a runtime. Nessuna azione richiesta, ma va mantenuto per evitare regressioni di performance.

### Risorse mobile presenti

| Tipo | File |
|---|---|
| Icona app | `Resources/AppIcon/appicon.png` |
| Splash screen | `Resources/Splash/splash.svg` (colore `#512BD4`, base size 128×128) |
| Font | `Resources/Fonts/*` |
| Immagini | `Resources/Images/*` |

---

## Build Android

### Comando publish

```bash
dotnet publish src/Turnify.Mobile/Turnify.Mobile.csproj \
  -f net10.0-android \
  -c Release
```

L'output è un file `.apk` (debug) o `.aab` (Android App Bundle per Play Store) nella cartella `bin/Release/net10.0-android/`.

Per produrre un AAB firmato per il Play Store aggiungere le proprietà di firma:

```bash
dotnet publish src/Turnify.Mobile/Turnify.Mobile.csproj \
  -f net10.0-android \
  -c Release \
  -p:AndroidKeyStore=true \
  -p:AndroidSigningKeyStore=<path.keystore> \
  -p:AndroidSigningKeyAlias=<alias> \
  -p:AndroidSigningKeyPass=<password> \
  -p:AndroidSigningStorePass=<password>
```

### Keystore

Non è presente alcun file `.keystore` o configurazione di firma nel repository. Le credenziali di firma devono essere fornite al momento del build e non devono mai essere salvati nel repository.

---

## Permessi Android

Dichiarati in `Platforms/Android/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.INTERNET" />
```

- `INTERNET`: richiesto per tutte le chiamate HTTP verso l'API.
- `ACCESS_NETWORK_STATE`: usato per verificare la disponibilità di rete.

Altre impostazioni nel manifest:

```xml
android:allowBackup="false"
android:networkSecurityConfig="@xml/network_security_config"
```

- `allowBackup="false"`: esclude i dati dell'app dai backup Android automatici.
- `networkSecurityConfig`: punta al file di certificate pinning.

---

## Certificate pinning Android

File: `Platforms/Android/Resources/xml/network_security_config.xml`

```xml
<domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="false">samuconfa.it</domain>
    <pin-set expiration="2027-04-28">
        <pin digest="SHA-256">...</pin>   <!-- pin primario -->
        <pin digest="SHA-256">...</pin>   <!-- pin di backup -->
    </pin-set>
</domain-config>
```

- Il traffico cleartext (HTTP) è vietato verso `samuconfa.it`.
- Il pin scade il **2027-04-28**: aggiornare prima della scadenza altrimenti l'app non potrà connettersi al backend.
- Per ricalcolare il pin corrente:

```bash
openssl s_client -connect samuconfa.it:443 \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform DER \
  | openssl dgst -sha256 -binary \
  | base64
```

---

## Backend ASP.NET Core

### Configurazione produzione

`appsettings.Production.json` (presente nel repository):

```json
{
  "AllowedHosts": "samuconfa.it,www.samuconfa.it",
  "Cors": { "AllowedOrigins": ["https://samuconfa.it", "https://www.samuconfa.it"] },
  "Jwt": {
    "Issuer":    "https://api.turnify.it",
    "Audience":  "turnify-mobile-app",
    "AccessTokenExpiryMinutes": 15,
    "RefreshTokenExpiryDays":   7
  },
  "Logging": { "LogLevel": { "Default": "Warning", "Microsoft.AspNetCore": "Error" } }
}
```

Le variabili sensibili (`Jwt:Secret`, `ConnectionStrings:Default`) non sono nel repository. Il backend le carica da un file `.env` alla root via `DotNetEnv` (`Env.TraversePath.Load`).

### Path base

Il backend è pubblicato al path `/turnify` sul server:

```csharp
app.UsePathBase("/turnify");
```

Tutti gli endpoint sono raggiungibili a `https://samuconfa.it/turnify/api/...`. L'URL base configurata in `MauiProgram.cs` è `https://samuconfa.it/turnify/`.

### Reverse proxy

`UseForwardedHeaders` con `XForwardedFor | XForwardedProto` è abilitato, indicando che il backend è dietro un reverse proxy (gestisce TLS e forwarda le richieste).

### Swagger

Swagger UI è attivo **solo in Development** (`if (app.Environment.IsDevelopment)`). In produzione non è esposto.

### Health check

Endpoint: `GET /turnify/health` — risposta JSON `{ "status": "healthy", "timestamp": "..." }`.

### Comando publish

```bash
dotnet publish src/Turnify.Api/Turnify.Api.csproj \
  -c Release \
  -o ./publish/api
```

---

## Portale web Next.js

### Build

```bash
cd src/Turnify.Web
npm run build   # equivale a: next build
```

Il build produce la cartella `.next/standalone/` (configurata da `output: 'standalone'` in `next.config.mjs`).

### Deploy con PM2

File `ecosystem.config.js`:

```js
{
  name: 'turnify-web',
  script: '.next/standalone/server.js',
  cwd: '/var/www/turnify/Turnify.Web',
  env: {
    NODE_ENV: 'production',
    PORT:     '3004',
    HOSTNAME: '0.0.0.0',
  }
}
```

```bash
pm2 start ecosystem.config.js
pm2 save
```

Il portale è raggiungibile al path `/admin` (da `basePath: '/admin'` in `next.config.mjs`), su porta 3004.

---

## Checklist pre-release

### Mobile (Android)

- [ ] Aggiornare `ApplicationDisplayVersion` e `ApplicationVersion` nel `.csproj`
- [ ] Verificare che i pin in `network_security_config.xml` non siano scaduti (scadenza: 2027-04-28)
- [ ] Build Release su device fisico Android (API ≥ 21)
- [ ] Verificare flusso startup completo: GDPR → Login → Dashboard admin / Employee Dashboard
- [ ] Verificare certificate pinning su device: nessun errore alla prima chiamata API
- [ ] Produrre AAB firmato con keystore di produzione
- [ ] Caricare AAB su Google Play Console (internal track prima di production)

### Backend

- [ ] File `.env` presente sul server con `Jwt:Secret` e `ConnectionStrings:Default`
- [ ] Variabile `ASPNETCORE_ENVIRONMENT=Production` impostata
- [ ] Migrazioni applicate: `dotnet ef database update`
- [ ] Health check verde: `curl https://samuconfa.it/turnify/health`
- [ ] Swagger non raggiungibile in produzione (verifica: `https://samuconfa.it/turnify/swagger` → 404)

### Portale web

- [ ] Build completata senza errori TypeScript/ESLint
- [ ] PM2 in esecuzione: `pm2 status turnify-web`
- [ ] Login admin funzionante: `https://samuconfa.it/admin/login`

---

## Risultato finale

| Componente | URL produzione | Processo |
|---|---|---|
| API backend | `https://samuconfa.it/turnify/` | ASP.NET Core dietro reverse proxy |
| Health check | `https://samuconfa.it/turnify/health` | — |
| Portale web | `https://samuconfa.it/admin` | PM2 `turnify-web` porta 3004 |
| App mobile | `it.samuconfa.turnify.mobile` | APK/AAB su dispositivo Android |
