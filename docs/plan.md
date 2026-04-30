# Piano di lavoro

## Titolo del progetto
Turnify

## Obiettivo del piano
Documentare le fasi di sviluppo effettive del progetto, derivate dallo stato attuale del progetto, dalle verifiche svolte e dalla documentazione di iterazione.

## Architettura prevista

Clean Architecture a layer separati in soluzione multi-progetto:

- **Turnify.Core** — modelli di dominio e interfacce (nessuna dipendenza esterna)
- **Turnify.Infrastructure** — implementazioni EF Core + MySQL (Pomelo), repository concreti, service concreti
- **Turnify.Api** — ASP.NET Core 10 Web API, controller, DTOs, middleware, validator FluentValidation
- **Turnify.Mobile** — .NET MAUI 10, pattern MVVM con CommunityToolkit.Mvvm, Shell navigation
- **Turnify.Tests** — xUnit, unit test su service/repository, integration test con WebApplicationFactory
- **Turnify.Web** — Next.js 14 + TypeScript + Tailwind CSS, portale admin separato

Pattern MVVM mobile:
- `BaseViewModel : ObservableObject` con `IsBusy` e `Title`
- Source generators CommunityToolkit: `[ObservableProperty]`, `[RelayCommand]`
- Zero logica nel code-behind; tutto nei ViewModel
- `x:DataType` su tutte le View XAML per binding type-safe compile-time
- Navigazione Shell con route registrate; tab configurate dinamicamente per ruolo

Database: MySQL, accesso via EF Core + Pomelo, migration-first.

---

## Struttura prevista delle cartelle

```
Turnify/
├── docs/
│   └── iterations/
├── src/
│   ├── Turnify.Api/
│   │   ├── Controllers/
│   │   ├── DTOs/
│   │   ├── Middleware/
│   │   ├── Validators/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── Turnify.Core/
│   │   ├── Interfaces/
│   │   │   ├── Repositories/
│   │   │   └── Services/
│   │   └── Models/
│   ├── Turnify.Infrastructure/
│   │   ├── Data/
│   │   ├── Migrations/
│   │   ├── Repositories/
│   │   └── Services/
│   ├── Turnify.Mobile/
│   │   ├── Converters/
│   │   ├── Platforms/
│   │   ├── Resources/
│   │   │   └── Styles/
│   │   ├── Services/
│   │   ├── ViewModels/
│   │   └── Views/
│   ├── Turnify.Tests/
│   │   ├── Integration/
│   │   ├── Middleware/
│   │   ├── Repositories/
│   │   └── Services/
│   └── Turnify.Web/
│       ├── app/
│       │   ├── admin/login/
│       │   └── dashboard/
│       ├── components/
│       └── lib/
└── Turnify.slnx
```

---

## Dipendenze previste

### Turnify.Mobile

| Dipendenza | Motivo | Tipo |
|---|---|---|
| CommunityToolkit.Mvvm 8.4.2 | MVVM: ObservableObject, RelayCommand, source generators | Obbligatoria |
| Microsoft.Maui.Controls | Framework UI multipiattaforma | Obbligatoria |
| Microsoft.Extensions.Http 10.0.7 | IHttpClientFactory, AuthDelegatingHandler | Obbligatoria |
| System.IdentityModel.Tokens.Jwt 8.0.1 | Lettura e validazione del JWT sul client | Obbligatoria |
| Microsoft.Extensions.Logging.Debug | Logging in debug build | Dev |

### Turnify.Api

| Dipendenza | Motivo | Tipo |
|---|---|---|
| Swashbuckle.AspNetCore 10.1.7 | Swagger UI e documentazione OpenAPI | Dev |
| Microsoft.AspNetCore.OpenApi 10.0.4 | Generazione schema OpenAPI | Dev |
| FluentValidation.AspNetCore 11.3.0 | Validazione input su tutti gli endpoint critici | Obbligatoria |
| Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore 9.0.2 | Health check DB | Obbligatoria |
| DotNetEnv 3.1.1 | Caricamento variabili da file .env | Obbligatoria |

### Turnify.Infrastructure

| Dipendenza | Motivo | Tipo |
|---|---|---|
| Pomelo.EntityFrameworkCore.MySql | Provider EF Core per MySQL | Obbligatoria |
| Microsoft.EntityFrameworkCore.Design 9.0.2 | CLI migration e scaffolding | Dev |
| Microsoft.AspNetCore.Authentication.JwtBearer | Validazione JWT nel middleware | Obbligatoria |

### Turnify.Web

| Dipendenza | Motivo | Tipo |
|---|---|---|
| Next.js 14.2 | Framework React SSR/SSG per portale admin | Obbligatoria |
| React 18.3 | UI library | Obbligatoria |
| Tailwind CSS 3.4 | Utility-first CSS | Obbligatoria |
| TypeScript 5.4 | Tipizzazione statica | Obbligatoria |

---

## Iterazioni previste

### Iterazione 1 — Setup, dominio e backend core
**Data:** 2026-04-21

**Lavoro svolto:**
- Creazione soluzione multi-progetto (Core, Infrastructure, Api, Mobile, Tests)
- Modelli di dominio: `User`, `Company`, `Employee`, `Shift`, `VacationRequest`, `AttendanceLog`, `Notification`, enumerazioni (`UserRole`, `ContractType`, `ShiftStatus`, `VacationRequestType`, `CheckInMethod`)
- Interfacce repository: `IShiftRepository`, `IUserRepository`, `IVacationRepository`
- Interfacce service: `IAuthService`, `IShiftService`, `IVacationService`, `INotificationService`
- `TurnifyDbContext` con EF Core + Pomelo MySQL
- Migrazione `InitialCreate` (tutte le tabelle principali)
- Endpoint `/health` con risposta JSON e Swagger attivo in development
- `AuthService` con generazione JWT, `AuthController` (register + login)
- `ShiftRepository`, `ShiftService`, `ShiftsController`
- `VacationRequestsController`
- Documentazione agente AI (`AGENTS.md`, file `.md` iniziali)

**File principali:**
- `Turnify.Core/Models/*.cs` (8 modelli)
- `Turnify.Core/Interfaces/**/*.cs` (7 interfacce)
- `Turnify.Infrastructure/Data/TurnifyDbContext.cs`
- `Turnify.Infrastructure/Migrations/20260421185539_InitialCreate.*`
- `Turnify.Api/Controllers/AuthController.cs`, `ShiftsController.cs`, `VacationRequestsController.cs`
- `Turnify.Infrastructure/Services/AuthService.cs`, `ShiftService.cs`
- `Turnify.Api/Program.cs`

**Risultato:** backend compilabile, DB connesso, auth JWT funzionante, endpoint turni e ferie esposti.

---

### Iterazione 2 — Fondamenta MAUI e test unitari
**Data:** 2026-04-21

**Lavoro svolto:**
- Shell navigation: registrazione di tutte le route, `AppShell.xaml`
- `LoginPage.xaml` + `LoginViewModel.cs` con autenticazione reale verso l'API
- `Mobile/Services/AuthService.cs`: login, persistenza JWT in `SecureStorage`
- Conversione mockup HTML → XAML (prime pagine)
- `AuthServiceTests.cs` e `ShiftServiceTests.cs` (prime unit test)
- Credenziali spostate in `.env` (DotNetEnv)

**File principali:**
- `Turnify.Mobile/AppShell.xaml`, `AppShell.xaml.cs`
- `Turnify.Mobile/Views/LoginPage.xaml`
- `Turnify.Mobile/ViewModels/LoginViewModel.cs`
- `Turnify.Mobile/Services/AuthService.cs`
- `Turnify.Tests/Services/AuthServiceTests.cs`, `ShiftServiceTests.cs`

**Risultato:** app mobile avviabile, login reale funzionante end-to-end, prime unit test verdi.

---

### Iterazione 3 — Espansione API e feature mobile admin
**Date:** 2026-04-22 → 2026-04-23

**Lavoro svolto:**
- `UsersController`: endpoint `/api/users/me` e `change-password`
- `EmployeesController`: CRUD dipendenti lato admin
- Modello `Business` con migrazione `AddBusinessModel`; `BusinessesController` con orari apertura/chiusura
- Migrazione `AddRefreshTokenToUser`
- Dashboard mobile con dati reali dal backend (eliminati dati fake)
- `ProfileViewModel` con dati reali da `/api/users/me`
- Registrazione azienda direttamente da `LoginPage`
- Fix `RegisterPage.xaml`: sostituzione `Frame` → `Border` per consentire input
- `AuthDelegatingHandler`: JWT iniettato automaticamente su ogni chiamata HTTP
- `AppShell` reinizializzata al login per mostrare correttamente le tab admin o dipendente
- Avatar emoji: `EmojiPickerPage` + picker integrato nel profilo
- Sistema ferie completo mobile: `VacationListPage`, `VacationEditPage`, `VacationListViewModel`, `VacationEditViewModel`

**File principali:**
- `Turnify.Api/Controllers/UsersController.cs`, `EmployeesController.cs`, `BusinessesController.cs`
- `Turnify.Core/Models/Business.cs`
- `Turnify.Infrastructure/Migrations/20260422190154_AddBusinessModel.*`
- `Turnify.Mobile/Services/AuthDelegatingHandler.cs`
- `Turnify.Mobile/ViewModels/DashboardViewModel.cs`, `ProfileViewModel.cs`
- `Turnify.Mobile/Views/VacationListPage.xaml`, `VacationEditPage.xaml`
- `Turnify.Mobile/Views/EmojiPickerPage.xaml`

**Risultato:** admin gestisce dipendenti e attività, profilo reale, ferie operative, JWT automatico su tutte le chiamate.

---

### Iterazione 4 — GDPR, onboarding e push notification
**Data:** 2026-04-24

**Lavoro svolto:**
- `GdprConsentPage.xaml` + `GdprConsentViewModel.cs`: schermata consenso GDPR al primo avvio, con raccolta esplicita e salvataggio in `Preferences` (`CONSENT_GIVEN_KEY`, `CONSENT_VERSION_KEY`, `gdpr_marketing_accepted`, `gdpr_consent_date`)
- `OnboardingPage.xaml` + `OnboardingViewModel.cs`: guida multi-step al primo accesso post-consenso
- `DeviceTokensController.cs` + `DeviceTokenRepository.cs`: registrazione device token FCM lato backend
- Migrazione `AddDeviceTokens`: tabella `DeviceTokens` con `UserId`, `Token`, `Platform`
- `FcmPushNotificationService.cs`: invio push notification via Firebase FCM (292 righe)
- `MobilePushService.cs` (mobile): registrazione del device token al login
- `App.xaml.cs`: logica di startup aggiornata — controlla `Preferences` per GDPR e sessione, smista verso `GdprConsentPage`, `OnboardingPage` o login

**File principali:**
- `Turnify.Mobile/Views/GdprConsentPage.xaml`, `OnboardingPage.xaml`
- `Turnify.Mobile/ViewModels/GdprConsentViewModel.cs`, `OnboardingViewModel.cs`
- `Turnify.Api/Controllers/DeviceTokensController.cs`
- `Turnify.Infrastructure/Repositories/DeviceTokenRepository.cs`
- `Turnify.Infrastructure/Services/FcmPushNotificationService.cs`
- `Turnify.Infrastructure/Migrations/*_AddDeviceTokens.*`
- `Turnify.Mobile/App.xaml.cs`

**Risultato:** flusso di primo avvio completo con consenso GDPR e onboarding; push notification FCM operative; device token gestiti lato backend.

---

### Iterazione 5 — Redesign UI, timbratura presenze e allineamento MVVM
**Data:** 2026-04-25

**Lavoro svolto:**
- Redesign completo del design system (`Colors.xaml`, `Styles.xaml`) con nuova palette
- Riscrittura XAML di tutte le pagine principali: `DashboardPage`, `EmployeeListPage`, `LoginPage`, `NotificationsPage`, `ProfilePage`, `ShiftCalendarPage`, `VacationListPage`
- `AttendanceController.cs` (check-in / check-out)
- `AttendanceRepository.cs`, migrazione `AddEmployeeAvailableDays` (campo `AvailableDays` su `Employee`)
- `ShiftCalendarViewModel` espanso: ricorrenza turni (+210 righe)
- `AvailabilityPage.xaml` + `AvailabilityViewModel.cs`: impostazione giorni disponibili dipendente
- `ShiftDetailPage.xaml` + `ShiftDetailViewModel.cs`: dettaglio turno
- Ricerca testuale dipendenti in `EmployeeListPage`
- Refactor MVVM: zero logica nel code-behind (rimossi metodi da `VacationEditPage.xaml.cs`, `VacationListPage.xaml.cs`, `EmployeeDetailPage.xaml.cs`), `x:DataType` aggiunto su tutte le View, gestione errori HTTP uniforme con codice di stato in tutti i ViewModel
- `VacationServiceTests.cs`: 475 righe di test aggiunti

**File principali:**
- `Turnify.Mobile/Resources/Styles/Colors.xaml`, `Styles.xaml`
- `Turnify.Mobile/Views/DashboardPage.xaml`, `ShiftCalendarPage.xaml`, `ProfilePage.xaml` (e altri)
- `Turnify.Api/Controllers/AttendanceController.cs`
- `Turnify.Infrastructure/Repositories/AttendanceRepository.cs`
- `Turnify.Mobile/ViewModels/ShiftCalendarViewModel.cs`
- `Turnify.Mobile/Views/AvailabilityPage.xaml`, `ShiftDetailPage.xaml`
- `Turnify.Tests/Services/VacationServiceTests.cs`

**Risultato:** UI completamente ridisegnata, timbratura operativa, ricorrenza turni, allineamento architetturale MVVM completato.

---

### Iterazione 6 — Portale web admin (Next.js)
**Data:** 2026-04-26

**Lavoro svolto:**
- Nuovo progetto `Turnify.Web` (Next.js 14, TypeScript, Tailwind CSS)
- Pagine admin: `/dashboard`, `/dashboard/employees`, `/dashboard/businesses`, `/dashboard/shifts`, `/dashboard/vacations`, `/login`
- `Sidebar.tsx` con navigazione tra sezioni
- `lib/api.ts`: client HTTP verso il backend ASP.NET Core
- `lib/auth.ts`: gestione autenticazione via cookie
- `middleware.ts`: protezione route autenticate
- `ecosystem.config.js`: configurazione PM2 per deploy VPS Node 20
- Fix deploy: compatibilità con Node 20 su VPS

**File principali:**
- `src/Turnify.Web/app/**/*.tsx`
- `src/Turnify.Web/components/Sidebar.tsx`
- `src/Turnify.Web/lib/api.ts`, `auth.ts`, `middleware.ts`
- `src/Turnify.Web/package.json`, `next.config.ts`, `tailwind.config.ts`

**Risultato:** portale web admin completo e deployabile su VPS con PM2.

---

### Iterazione 7 — Production-readiness: reportistica, ruolo dipendente, email, rate limit
**Data:** 2026-04-27

**Lavoro svolto:**
- `ReportsController.cs`: endpoint `GET /api/reports/hours` e `GET /api/reports/attendance` → risposta CSV
- `AttendanceController` espanso con nuove query
- `AuthController` espanso: flusso reset password (generazione token + invio email)
- `DashboardController` espanso: nuove aggregazioni
- `ShiftsController`: endpoint per turni ricorrenti (`CreateRecurringShiftsRequest` DTO)
- Migrazione `AddPasswordResetToUser` (campi `PasswordResetToken`, `PasswordResetTokenExpiryTime`)
- `SmtpEmailService.cs`: invio email via SMTP configurabile
- `EmployeeDashboardPage.xaml` + `EmployeeDashboardViewModel.cs`: dashboard personale dipendente
- `AttendanceHistoryPage.xaml` + `AttendanceHistoryViewModel.cs`: storico presenze
- `ForgotPasswordPage.xaml` + `ForgotPasswordViewModel.cs`: reset password da mobile
- `LoginViewModel` aggiornato: routing post-login differenziato per ruolo (admin → `//Dashboard`, dipendente → `//EmployeeDashboard`)
- Rate limiter sliding window per-IP: 10 req/min su `/auth`, 20 req/min su `/errorlogs`, 120 req/min globale; risposta 429 con messaggio leggibile
- Fix registrazione: 409 Conflict invece di 500 se email admin già esistente
- Secondo passaggio allineamento MAUI rules (state props, error handling, x:DataType)

**File principali:**
- `Turnify.Api/Controllers/ReportsController.cs`
- `Turnify.Infrastructure/Services/SmtpEmailService.cs`
- `Turnify.Infrastructure/Migrations/20260427000000_AddPasswordResetToUser.cs`
- `Turnify.Mobile/Views/EmployeeDashboardPage.xaml`, `AttendanceHistoryPage.xaml`, `ForgotPasswordPage.xaml`
- `Turnify.Mobile/ViewModels/EmployeeDashboardViewModel.cs`, `AttendanceHistoryViewModel.cs`, `ForgotPasswordViewModel.cs`
- `Turnify.Api/Program.cs` (rate limiter)

**Risultato:** app utilizzabile da dipendenti con dashboard, storico presenze e report; backend pronto per produzione con rate limiting e email.

---

### Iterazione 8 — Sicurezza, validazione, error reporting e test suite completa
**Data:** 2026-04-28

**Lavoro svolto:**
- FluentValidation: 7 validator lato API (`LoginRequestValidator`, `RegisterRequestValidator`, `CreateShiftRequestValidator`, `UpdateShiftRequestValidator`, `CreateVacationRequestValidator`, `CreateRecurringShiftsRequestValidator`, `ReportErrorRequestValidator`), registrati via `AddValidatorsFromAssemblyContaining`
- `ErrorLogsController.cs`: raccolta e consultazione log errori client
- `AppErrorLog.cs` (modello), migrazione `AddAppErrorLogs`
- `ErrorReporterService.cs` (mobile): cattura eccezioni non gestite e le invia all'API
- `CertificatePinningHandler.cs` (mobile): certificate pinning su Android
- `Resources/xml/network_security_config.xml`: network security config Android
- `FcmPushNotificationService.cs`: invio push notification via Firebase FCM
- `DeviceTokenRepository.cs` + `DeviceTokensController.cs` + migrazione `AddDeviceTokens`
- `ChangePasswordPage.xaml` + `ChangePasswordViewModel.cs`: cambio password mobile
- `ReportsPage.xaml` + `ReportsViewModel.cs`: download CSV (ore e presenze) con scelta intervallo date e condivisione via `Share.RequestAsync`
- Integration test: `AuthControllerIntegrationTests.cs`, `ShiftsControllerIntegrationTests.cs`, `TurnifyWebFactory.cs`, `IntegrationTestBase.cs` (totale dichiarato: 122 test)
- Portale web: `/admin/login` riservato ai datori di lavoro; `/dashboard/error-logs` dashboard log errori
- Fix bug UTC nei timestamp presenze mobile
- Fix form ferie mobile (validazione date)
- Fix `Array.from` su `Set` in pagina error-logs web (compatibilità browser)

**File principali:**
- `Turnify.Api/Validators/*.cs` (7 file)
- `Turnify.Api/Controllers/ErrorLogsController.cs`
- `Turnify.Core/Models/AppErrorLog.cs`
- `Turnify.Mobile/Services/CertificatePinningHandler.cs`, `ErrorReporterService.cs`
- `Turnify.Infrastructure/Services/FcmPushNotificationService.cs`
- `Turnify.Mobile/Views/ChangePasswordPage.xaml`, `ReportsPage.xaml`
- `Turnify.Tests/Integration/AuthControllerIntegrationTests.cs`, `ShiftsControllerIntegrationTests.cs`
- `Turnify.Web/app/admin/login/page.tsx`, `app/dashboard/error-logs/page.tsx`

**Risultato:** validazione input completa, telemetria errori client→server, certificate pinning Android, push notification, 122 test (unit + integrazione), portale web hardened.

---

### Iterazione 9 — Login dipendente con username
**Data:** 2026-04-29

**Lavoro svolto:**
- Migrazione `AddUsernameToUser`: colonna `Username` (nullable) su tabella `Users`
- Indice univoco filtrato `(CompanyId, Username) WHERE Username IS NOT NULL`
- `User.cs`: aggiunto campo `Username`
- `TurnifyDbContext`: configurazione indice con `.HasFilter("`Username` IS NOT NULL")`
- `AuthController` e `UsersController` aggiornati per gestire login con username (dipendenti) vs email (admin)
- `LoginViewModel` mobile aggiornato

**File principali:**
- `Turnify.Infrastructure/Migrations/20260429000000_AddUsernameToUser.cs`
- `Turnify.Core/Models/User.cs`
- `Turnify.Infrastructure/Data/TurnifyDbContext.cs`
- `Turnify.Api/Controllers/AuthController.cs`, `UsersController.cs`
- `Turnify.Mobile/ViewModels/LoginViewModel.cs`

**Risultato:** autenticazione differenziata per ruolo — dipendenti accedono con username (univoco per azienda), admin con email.

---

### Iterazione 10 — Redesign UI premium (Design System v2)
**Data:** 2026-04-30

**Lavoro svolto:**
- Applicato bundle di redesign generato con Claude Design (palette Navy/Indigo, font Plus Jakarta Sans)
- Sostituiti `Resources/Styles/Colors.xaml` con nuova palette completa (Navy `#0F1629`, Primary `#3B5BDB`, Background `#EDEAE5`, token semantici Success/Warning/Error/Purple)
- Riscritte 22 pagine XAML: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `GdprConsentPage`, `OnboardingPage`, `DashboardPage`, `EmployeeDashboardPage`, `ShiftCalendarPage`, `ShiftDetailPage`, `EmployeeListPage`, `EmployeeDetailPage`, `AvailabilityPage`, `VacationListPage`, `VacationEditPage`, `AttendanceHistoryPage`, `NotificationsPage`, `ReportsPage`, `ProfilePage`, `ChangePasswordPage`, `BusinessListPage`, `BusinessDetailPage`, `BusinessOpeningHoursPage`
- `MauiProgram.cs`: registrati 5 weight Plus Jakarta Sans (`PJSReg`, `PJSMed`, `PJSSemi`, `PJSBold`, `PJSXBold`)
- Stili globali definiti in `Colors.xaml`: `PrimaryButton`, `OutlineButton`, `DangerButton`, `FieldBorder`, `FieldEntry`, `CardBorder`, `SectionLabel`, `HeadingLabel`

**File principali:**
- `Turnify.Mobile/Resources/Styles/Colors.xaml`
- `Turnify.Mobile/Views/*.xaml` (22 file)
- `Turnify.Mobile/MauiProgram.cs`

**Risultato:** design system v2 applicato su tutte le schermate; font Plus Jakarta Sans registrato; palette e stili globali uniformi.

---

## Rischi tecnici

Derivati da problemi tecnici reali osservati durante lo sviluppo e la verifica:

| Rischio | Evidenza tecnica | Impatto |
|---|---|---|
| Compatibilità MAUI `Frame` vs `Border` | aggiornamento documentato fix `RegisterPage.xaml` — Frame bloccava l'input | Input utente non funzionante su alcuni controlli |
| Bug UTC nei timestamp presenze | aggiornamento documentato fix esplicito per bug UTC in `AttendanceHistoryViewModel` | Orari presenze scorretti a runtime |
| AppShell non aggiornata al cambio ruolo | aggiornamento documentato re-inizializzazione forzata AppShell al login | Tab admin visibili ai dipendenti o viceversa |
| Deploy Next.js su Node 20 VPS | aggiornamento documentato fix specifico per compatibilità Node 20 | Portale web non avviabile in produzione |
| Migrazione manuale senza designer file | aggiornamento documentato aggiunti designer file mancanti per EF Core discovery | Migrazione non scoperta dal CLI, errori `dotnet ef` |
| Rate limiter non per-IP | aggiornamento documentato fix rate limiter — era globale, non per-IP | Limite condiviso tra tutti gli IP, facilmente aggirabile |
| Registrazione restituiva 500 invece di 409 | aggiornamento documentato | UX degradata, client non poteva distinguere conflitto da errore server |
| `Array.from` vs spread su `Set` | aggiornamento documentato fix compatibilità browser in pagina error-logs | Pagina crashava su alcuni browser |
| FCM senza test automatici | `FcmPushNotificationService` non coperto da integration test | Failure silenziosa se chiave FCM errata o rete non disponibile |

---

## Strategia di testing

Derivata dal codice reale in `Turnify.Tests/`:

**Unit test (xUnit):**
- `Services/AuthServiceTests.cs` — registrazione, login, generazione JWT
- `Services/ShiftServiceTests.cs` — creazione turno, validazioni
- `Services/ShiftRecurringTests.cs` — logica ricorrenza turni
- `Services/VacationServiceTests.cs` — flusso richiesta/approvazione/rifiuto ferie (475 righe)
- `Services/DashboardServiceTests.cs` — aggregazioni dashboard
- `Repositories/ShiftRepositoryTests.cs`, `UserRepositoryTests.cs`, `VacationRepositoryTests.cs`, `AttendanceRepositoryTests.cs`, `DeviceTokenRepositoryTests.cs`
- `Middleware/GlobalExceptionMiddlewareTests.cs`

**Integration test (WebApplicationFactory):**
- `Integration/TurnifyWebFactory.cs` — factory con DB in-memory o test DB
- `Integration/IntegrationTestBase.cs` — setup comuni
- `Integration/AuthControllerIntegrationTests.cs` — register, login, token, conflitti
- `Integration/ShiftsControllerIntegrationTests.cs` — CRUD turni end-to-end

**Totale documentato nella suite di test:** 122 test.

**Non testato automaticamente:** `FcmPushNotificationService`, `SmtpEmailService`, portale web Next.js, `CertificatePinningHandler`.

---

## Definition of Done

Derivata dallo stato attuale del repository e dalle verifiche documentate:

- Il codice compila senza warning (`zero warning build` esplicitamente raggiunto nell'aggiornamento documentato)
- Ogni ViewModel non contiene logica nel code-behind corrispondente (zero metodi significativi in `.xaml.cs`)
- Ogni View XAML ha `x:DataType` impostato al ViewModel corretto
- Ogni endpoint API critico ha un validator FluentValidation registrato
- Ogni nuovo modello di dominio ha la migrazione EF Core corrispondente
- I test esistenti rimangono verdi dopo ogni modifica
- Le credenziali non sono hardcodate nel codice sorgente (in `.env` o `appsettings.json` non tracciato)
