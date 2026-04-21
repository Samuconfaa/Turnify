# Architettura di Sistema — Turnify

**Versione:** 1.0  
**Stato:** Approvata per sviluppo  

---

## 1. Panoramica

Turnify è un sistema client-server a 3 livelli: un'app mobile cross-platform, un backend REST API e un database relazionale. I tre componenti comunicano esclusivamente via HTTPS/JSON.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │       App Mobile .NET MAUI (iOS + Android)       │   │
│  │              Pattern: MVVM                       │   │
│  └─────────────────────┬────────────────────────────┘   │
└────────────────────────│────────────────────────────────┘
                         │ HTTPS / REST JSON
                         │ JWT Authorization Header
┌────────────────────────▼────────────────────────────────┐
│                   SERVER LAYER                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Nginx (Reverse Proxy + SSL)             │   │
│  └─────────────────────┬────────────────────────────┘   │
│  ┌─────────────────────▼────────────────────────────┐   │
│  │       ASP.NET Core Web API (.NET 8)              │   │
│  │   Controllers → Services → Repositories         │   │
│  └─────────────────────┬────────────────────────────┘   │
└────────────────────────│────────────────────────────────┘
                         │ EF Core / TCP
┌────────────────────────▼────────────────────────────────┐
│                    DATA LAYER                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              PostgreSQL 15                       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. App Mobile — .NET MAUI con MVVM

### Tecnologie
- **.NET MAUI** (.NET 8): framework cross-platform per iOS e Android
- **CommunityToolkit.Mvvm**: gestione MVVM, comandi, proprietà osservabili
- **Shell Navigation**: navigazione dichiarativa con route
- **HttpClient + Refit**: chiamate API tipizzate
- **SecureStorage**: salvataggio sicuro token JWT

### Pattern MVVM

```
┌──────────────────────────────────────────────────────┐
│  View Layer  (Pages + Controls in XAML/C#)           │
│  - Binding a ViewModel                               │
│  - Nessuna logica business                           │
├──────────────────────────────────────────────────────┤
│  ViewModel Layer                                     │
│  - ObservableProperty per stato UI                   │
│  - RelayCommand per azioni utente                    │
│  - Chiama AppServices                                │
├──────────────────────────────────────────────────────┤
│  Service Layer (App)                                 │
│  - AuthService: login, token refresh                 │
│  - ShiftService: CRUD turni                          │
│  - VacationService: richieste ferie                  │
│  - NotificationService: gestione notifiche           │
├──────────────────────────────────────────────────────┤
│  Infrastructure                                      │
│  - ApiClient (Refit): chiamate HTTP                  │
│  - LocalStorage: cache e preferenze                  │
│  - SecureStorage: token JWT                          │
└──────────────────────────────────────────────────────┘
```

### Schermate Principali
- `LoginPage` — autenticazione
- `DashboardPage` — home admin con panoramica
- `ShiftCalendarPage` — calendario turni
- `ShiftDetailPage` — dettaglio/modifica turno
- `VacationListPage` — lista richieste ferie
- `VacationRequestPage` — form nuova richiesta
- `EmployeeListPage` — gestione dipendenti (admin)
- `ProfilePage` — profilo utente e impostazioni

---

## 3. Backend — ASP.NET Core Web API

### Tecnologie
- **ASP.NET Core 8** con minimal hosting model
- **Entity Framework Core 8** con provider Npgsql (PostgreSQL)
- **AutoMapper**: mapping tra entità e DTO
- **FluentValidation**: validazione input
- **Serilog**: logging strutturato
- **Swashbuckle**: documentazione OpenAPI/Swagger
- **BCrypt.Net**: hashing password
- **System.IdentityModel.Tokens.Jwt**: generazione/validazione JWT

### Struttura Layer Backend

```
Presentation Layer  (Controllers, Middleware, DTOs)
       │
Business Layer  (Services, Validators, Business Rules)
       │
Data Layer  (Repositories, EF DbContext, Migrations)
       │
Database  (PostgreSQL)
```

### Controller Principali
- `AuthController` — login, registrazione, refresh token
- `CompaniesController` — gestione aziende
- `EmployeesController` — gestione dipendenti
- `ShiftsController` — CRUD turni
- `VacationRequestsController` — ferie e permessi
- `DashboardController` — statistiche aggregate
- `NotificationsController` — notifiche

---

## 4. Database — PostgreSQL

- **PostgreSQL 15** su VPS Linux
- ORM: **Entity Framework Core** con code-first migrations
- Connection pooling: **Npgsql** built-in pooling
- Backup: dump giornaliero automatico via cron

Per lo schema dettagliato → `docs/database.md`

---

## 5. Flusso Autenticazione JWT

```
App Mobile                     Backend API
    │                               │
    │ POST /auth/login              │
    │ {email, password}             │
    │─────────────────────────────→ │
    │                               │ Verifica credenziali
    │                               │ Genera AccessToken (15min)
    │                               │ Genera RefreshToken (7gg)
    │                               │ Salva RefreshToken nel DB
    │ 200 OK                        │
    │ {accessToken, refreshToken}   │
    │ ←──────────────────────────── │
    │                               │
    │ Salva token in SecureStorage  │
    │                               │
    │ GET /shifts (con JWT header)  │
    │─────────────────────────────→ │
    │                               │ Valida JWT
    │                               │ Controlla ruolo/permessi
    │ 200 OK {dati turni}           │
    │ ←──────────────────────────── │
    │                               │
    │ [Token scaduto - 401]         │
    │ POST /auth/refresh            │
    │ {refreshToken}                │
    │─────────────────────────────→ │
    │                               │ Valida refreshToken nel DB
    │                               │ Genera nuovo accessToken
    │ 200 OK {newAccessToken}       │
    │ ←──────────────────────────── │
```

---

## 6. Notifiche Push (Architettura Futura v1.1)

```
Backend API
    │
    │ Evento: nuovo turno creato
    ▼
NotificationService
    │
    ├──→ Firebase Cloud Messaging (FCM) → Android devices
    │
    └──→ Apple Push Notification service (APNs) → iOS devices
                                                        │
                                                        ▼
                                              App riceve notifica
                                              (anche in background)
```

**Per il v1.0** le notifiche saranno implementate come in-app polling o notifiche locali. FCM/APNs verrà integrato nello sprint M7.

---

## 7. Infrastruttura VPS

```
Internet
    │
    │ HTTPS :443
    ▼
Nginx (reverse proxy)
    │ Let's Encrypt SSL
    │ Termina SSL
    │ Passa traffico su HTTP interno
    ▼
ASP.NET Core API (porta 5000, systemd service)
    │
    ▼
PostgreSQL (porta 5432, solo localhost)
```

Per la configurazione dettagliata → `docs/deployment.md`

---

## 8. Multi-Tenancy

Turnify è un'applicazione **multi-tenant** con isolamento per dati.

- Ogni azienda (`Company`) ha un `CompanyId` univoco
- Tutte le entità del dominio (Shifts, Employees, ecc.) hanno una FK verso `Companies`
- Il backend filtra **automaticamente** i dati per `CompanyId` estratto dal JWT
- Nessun dato di un'azienda è visibile a un'altra

Questo approccio è detto **"shared database, separate schemas by tenant ID"** ed è sufficiente per la fase MVP.

---

## 9. Separazione dei Livelli — Regole Chiave

| Livello | Conosce | NON conosce |
|---|---|---|
| Controller | DTO, Service | Entità DB, Repository |
| Service | Entità, Repository, DTO | HttpContext, Controller |
| Repository | EF Core, entità DB | DTO, logica business |
| ViewModel (mobile) | Service app, DTO | API HTTP diretta, DB |
| View (mobile) | ViewModel | Service, DTO |

---

## 10. Decisioni Architetturali

| Decisione | Scelta | Motivazione |
|---|---|---|
| Framework mobile | .NET MAUI | Una codebase per iOS + Android, ecosistema .NET coerente |
| ORM | Entity Framework Core | Migrazioni code-first, LINQ tipizzato, produttività alta |
| Database | PostgreSQL | Affidabilità, performance, open source, ottimo con EF Core |
| Auth | JWT stateless | Scalabile, standard, nessuna sessione server-side |
| Hosting | VPS Linux | Controllo totale, costo contenuto per MVP |
| API style | REST | Standard, comprensibile, ben supportato da tutti i client |
