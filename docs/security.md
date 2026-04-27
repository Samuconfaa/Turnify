# Piano di Sicurezza — Turnify

**Versione:** 1.0  
**Principio guida:** Security by design — la sicurezza non è un'aggiunta, è una fondamenta.

---

## 1. Autenticazione e Password

### Hashing Password
- Tutte le password sono hashate con **BCrypt** con un cost factor di minimo 12
- Il salt è generato automaticamente da BCrypt (univoco per ogni utente)
- Le password non sono mai salvate in chiaro — nemmeno in log o messaggi di errore
- In caso di violazione database, le password restano al sicuro

### Requisiti Password
- Lunghezza minima: 8 caratteri
- Deve contenere: almeno una maiuscola, una minuscola, un numero
- Non può essere uguale all'email dell'utente
- Storico ultimi 5 password (evita riuso — futuro v1.1)

### Recupero Password
- Reset via link email con token monouso a scadenza (30 minuti)
- Il token è memorizzato hashato nel DB
- Dopo l'uso il token viene invalidato immediatamente
- Rate limit: massimo 3 richieste di reset per email ogni 15 minuti

---

## 2. JWT — Token di Accesso

### Configurazione Token
- **Access Token:** scadenza 15 minuti (breve per limitare esposizione)
- **Refresh Token:** scadenza 7 giorni, memorizzato nel DB per revoca
- Algoritmo firma: **HS256** (HMAC-SHA256) con secret di almeno 256 bit
- Payload: `userId`, `email`, `role`, `companyId`, `iat`, `exp`

### Sicurezza Token
- Il secret JWT è conservato nelle variabili d'ambiente del server (mai nel codice)
- I Refresh Token sono salvati hashati nel DB (non in chiaro)
- Un Refresh Token può essere usato **una sola volta** (rotation)
- Logout invalida il Refresh Token nel DB (revoca esplicita)
- Il backend valida sempre firma, scadenza e presenza nel DB (per refresh)

### Lato Mobile
- Access Token e Refresh Token salvati in **SecureStorage** (.NET MAUI)
- SecureStorage usa Keychain (iOS) e Android Keystore — cifrati a livello OS
- Mai salvare token in `Preferences` o storage non cifrato
- In caso di jailbreak/root rilevato, l'app mostra avviso (futuro)

---

## 3. HTTPS — Trasporto

- Tutto il traffico tra app e backend avviene esclusivamente su **HTTPS / TLS 1.2+**
- HTTP puro è disabilitato sul server (redirect forzato 301 o rifiuto)
- Certificato SSL: **Let's Encrypt** con rinnovo automatico via Certbot
- Lato app mobile: **Certificate Pinning** valutato per v1.1 (dipende da infrastruttura)
- Header di sicurezza configurati su Nginx:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`

---

## 4. Rate Limiting

Il rate limiting protegge da brute force, DDoS e abuso API.

| Endpoint | Limite | Finestra | Note |
|---|---|---|---|
| `POST /auth/login` | 10 tentativi | 15 minuti per IP | Blocco temporaneo dopo superamento |
| `POST /auth/register` | 5 richieste | 1 ora per IP | Prevenzione bot |
| `POST /auth/refresh` | 30 richieste | 1 ora per utente | |
| `POST /auth/reset-password` | 3 richieste | 15 minuti per email | |
| Endpoint generici API | 200 richieste | 1 minuto per utente autenticato | |

Implementazione: middleware ASP.NET Core con `AspNetCoreRateLimit` o Redis.

---

## 5. Validazione Input

**Regola fondamentale:** Non fidarsi mai dell'input del client. Validare tutto lato server.

### Approccio
- Usare **FluentValidation** per tutti i DTO in ingresso
- Validazioni tipiche: lunghezza massima stringhe, formato email, date valide, range numerici
- Sanitizzazione automatica: nessun HTML o script nei campi testo
- Non restituire mai informazioni interne negli errori di validazione

### Esempi di Validazioni Critiche
- `email`: formato RFC 5321, lunghezza max 255 caratteri
- `password`: requisiti minimi (vedi sezione 1)
- `startTime` / `endTime` turni: `endTime > startTime`, non nel passato (con tolleranza 1h)
- `employeeId`, `companyId`: devono appartere all'azienda dell'utente autenticato (no IDOR)
- Date ferie: `endDate >= startDate`, max 30 giorni consecutivi per richiesta

---

## 6. Controllo Accessi e Autorizzazione

### Multi-Tenancy Isolation
- **Ogni richiesta** al backend verifica che la risorsa richiesta appartenga all'azienda (`CompanyId`) dell'utente nel JWT
- Non è possibile accedere a dati di altre aziende, nemmeno con token valido
- Questa verifica avviene a livello di Service/Repository, non solo nel Controller

### Ruoli e Permessi
- **SuperAdmin:** accesso a tutte le risorse (solo uso interno)
- **CompanyAdmin:** tutte le operazioni sulla propria azienda
- **Employee:** sola lettura dei propri turni, invio richieste ferie

### Protezione da IDOR (Insecure Direct Object Reference)
- Ogni accesso a risorsa per ID verifica l'ownership (`CompanyId` + eventuale `EmployeeId`)
- Un dipendente non può accedere ai turni di un collega tramite ID diretto

---

## 7. Protezione SQL Injection

- **Entity Framework Core** con LINQ: le query sono sempre parametrizzate automaticamente
- **Proibito** costruire query SQL concatenando stringhe
- Stored procedure (se usate): usare parametri, mai interpolazione
- Review obbligatoria di qualsiasi `FromSqlRaw` o `ExecuteSqlRaw` — uso esclusivo con parametri

---

## 8. Backup Database

| Tipo | Frequenza | Retention | Storage |
|---|---|---|---|
| Full dump | Giornaliero (02:00 UTC) | 30 giorni | VPS locale + offsite (es. S3) |
| Incrementale | Ogni 6 ore | 7 giorni | VPS locale |
| Pre-deploy | Prima di ogni deploy | 5 versioni | VPS locale |

- Script cron con `pg_dump` per PostgreSQL
- Verifica integrità backup settimanale (test restore su ambiente staging)
- Notifica email in caso di fallimento backup

---

## 9. Logging e Monitoraggio Errori

### Cosa Loggare
- Tutti i login (successo e fallimento) con timestamp e IP
- Modifiche a turni e ferie (chi, quando, cosa ha cambiato)
- Errori 4xx e 5xx con dettagli (senza dati sensibili)
- Tentativi di accesso non autorizzato

### Cosa NON Loggare Mai
- Password (in chiaro o hashate)
- Token JWT (completi o parziali)
- Dati personali sensibili non necessari all'analisi

### Strumenti
- **Serilog** con sink su file e console
- Log strutturati in JSON per analisi
- Retention log: 90 giorni
- Monitoraggio uptime: UptimeRobot (ping ogni 5 minuti)

---

## 10. Sicurezza Dipendenze

- Aggiornamento regolare dei pacchetti NuGet (review mensile)
- Uso di `dotnet list package --vulnerable` in CI/CD per rilevare vulnerabilità note
- Nessun package abandonware o non mantenuto da > 2 anni

---

## 11. Checklist Pre-Deploy Sicurezza

Prima di ogni rilascio in produzione, verificare:

- [ ] Nessuna credenziale hardcoded nel codice
- [ ] `appsettings.Production.json` non presente nel repository
- [ ] JWT secret configurato come variabile d'ambiente, min 32 caratteri
- [ ] HTTPS obbligatorio configurato su Nginx
- [ ] Rate limiting attivo sugli endpoint di autenticazione
- [ ] Backup funzionante e testato
- [ ] Nessuna dependency con vulnerabilità critiche aperte
- [ ] Swagger UI disabilitato in produzione (o protetto da autenticazione)
- [ ] Header di sicurezza HTTP configurati
- [ ] Firewall VPS: solo porte 22 (SSH), 80, 443 aperte
