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

