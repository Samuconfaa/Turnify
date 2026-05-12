# Iterazione 20

## Data
2026-05-09

## Commit
da definire

## Obiettivo
Rendere funzionante la sessione persistente: l'utente non deve rifare il login ogni volta che apre l'app. L'infrastruttura (SessionService, refresh token, AuthDelegatingHandler) esiste già dall'it-12 ma non funziona correttamente a causa di due bug e di un problema UX.

## Root cause

### Bug 1 — ClearSession() chiamato su errori di rete (critico)
In `SessionService.TryRestoreSessionAsync()` il blocco `catch` generico chiama `ClearSession()`, che rimuove il `refresh_token` da SecureStorage anche se il fallimento è dovuto a un timeout o al server irraggiungibile al momento dell'avvio. Al riavvio successivo il token è sparito e l'utente deve rifare il login.

### Bug 2 — RefreshTokenExpiryDays = 7 (troppo corto)
`appsettings.json` ha `RefreshTokenExpiryDays: 7`. Con uso anche solo settimanale il token scade. Portare a 30 giorni.

### Problema UX — Flash di RoleSelection
`App.CreateWindow()` parte sempre con `startRoute: "RoleSelection"` e naviga alla Dashboard in background. L'utente vede la schermata di selezione ruolo per ~1s → percezione di "sempre al login". Risolvere con una `SplashLoadingPage` neutra durante il check.

### Bug minore — SyncPreferences duplicato
`SessionService.SyncPreferences()` scrive `user_role_cached` due volte.

## Piano
1. **Fix `SessionService`**: nel catch block non chiamare `ClearSession()` (network error ≠ token invalido). Distinguere risposta 401/400 del server (→ clear) da eccezione di rete (→ non toccare i token). Rimuovere ClearSession dal controllo `refreshToken` vuoto. Fixare duplicato in SyncPreferences.
2. **`appsettings.json`**: `RefreshTokenExpiryDays` da 7 a 30.
3. **Nuova `SplashLoadingPage`**: logo + ActivityIndicator. Registrata nella route `SplashLoading` di AppShell.
4. **`App.xaml.cs`**: partenza da `SplashLoading`, poi naviga a `RoleSelection` (se sessione non valida) o `Main` (se valida).

## File da creare/modificare
- `src/Turnify.Mobile/Services/SessionService.cs` — fix catch block, fix SyncPreferences
- `src/Api/Turnify.Api/appsettings.json` — RefreshTokenExpiryDays: 30
- `src/Turnify.Mobile/Views/SplashLoadingPage.xaml` — **nuovo** splash minimale
- `src/Turnify.Mobile/Views/SplashLoadingPage.xaml.cs` — **nuovo** code-behind vuoto
- `src/Turnify.Mobile/App.xaml.cs` — startRoute: "SplashLoading"
- `src/Turnify.Mobile/AppShell.xaml.cs` — registra route SplashLoading

## Verifica
1. Login → chiudi app → riapri entro 30 giorni → Dashboard diretta (nessun login).
2. Login → server offline → riapri app → NON chiede login, token rimangono.
3. Logout esplicito → riapri → chiede login (corretto).
4. Dopo 30+ giorni → chiede login (token scaduto server-side, corretto).
