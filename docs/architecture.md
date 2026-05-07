# Architettura del progetto

## Obiettivo

App mobile .NET MAUI per la gestione turni di piccole imprese italiane. Il progetto è strutturato in soluzione multi-progetto: un layer Core condiviso, un backend ASP.NET Core 10, un'app mobile MAUI, un portale web Next.js 14 e un progetto test xUnit. I target ufficiali del build MAUI sono `net10.0-android` (sempre), `net10.0-ios` e `net10.0-maccatalyst` (se build non su Linux), `net10.0-windows10.0.19041.0` (se build su Windows).

---

## Pattern architetturale

**MVVM** implementato via `CommunityToolkit.Mvvm 8.4.2`. Tutti i ViewModel ereditano da `BaseViewModel : ObservableObject` e usano i source generator `[ObservableProperty]` e `[RelayCommand]`. I code-behind delle View contengono solo il costruttore con dependency injection; zero logica applicativa nel `.xaml.cs`.

Il layer mobile dipende direttamente da `Turnify.Core` (modelli e interfacce); non dipende da `Turnify.Infrastructure`.

---

## Diagramma architetturale

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│                                                             │
│   Turnify.Mobile (.NET MAUI 10)   │   Turnify.Web           │
│   Views (XAML) ↔ ViewModels       │   Next.js 14 (admin)    │
│   CommunityToolkit.Mvvm 8.4.2     │                         │
└─────────────────────┬───────────────────────────────────────┘
                      │  HTTP/REST  Bearer JWT
┌─────────────────────▼───────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│           Turnify.Api (ASP.NET Core 10)                     │
│   13 Controller · FluentValidation · Rate Limiting          │
│   GlobalExceptionMiddleware · JWT Auth (Bearer)             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                       │
│       Turnify.Infrastructure (EF Core 10 + Pomelo)         │
│   Repository implementations · DbContext (MySQL)            │
│   FcmPushNotificationService · SmtpEmailService             │
└─────────────────────┬───────────────────────────────────────┘
                      │  dipendenza unidirezionale
┌─────────────────────▼───────────────────────────────────────┐
│                     DOMAIN LAYER                            │
│            Turnify.Core (zero dipendenze esterne)           │
│   12 modelli · interfacce repository/service · enum        │
└─────────────────────────────────────────────────────────────┘

Turnify.Tests (xUnit) testa Infrastructure e Api
senza dipendere da Mobile o Web.
```

---

## Componenti principali

### Views (pagine + componenti in `Turnify.Mobile/Views/`)

| View | Scopo |
|---|---|
| `LoginPage` | Form login — admin con email, dipendente con companySlug + username |
| `RegisterPage` | Registrazione nuova azienda con account admin |
| `ForgotPasswordPage` | Richiesta reset password via email |
| `GdprConsentPage` | Consenso GDPR al primo avvio (obbligatorio) |
| `OnboardingPage` | Guida multi-step per admin al primo accesso post-consenso |
| `DashboardPage` | Dashboard admin: turni del giorno, ferie pendenti, contatori, copertura settimanale |
| `ShiftCalendarPage` | Calendario settimanale turni; include sezione timbratura per dipendenti |
| `VacationListPage` | Lista richieste ferie con filtro per stato |
| `VacationEditPage` | Form creazione/modifica richiesta ferie |
| `NotificationsPage` | Lista notifiche utente |
| `ProfilePage` | Profilo: email, avatar emoji, cambio password, logout |
| `EmojiPickerPage` | Griglia emoji per selezione avatar (con `EmojiPickerViewModel` dedicato) |
| `EmployeeListPage` | Lista dipendenti con SearchBar testuale |
| `EmployeeDetailPage` | Dettaglio e modifica dati dipendente |
| `ShiftDetailPage` | Dettaglio singolo turno; badge ricorrente; dialog scope (single/following) |
| `BusinessListPage` | Lista sedi/attività azienda |
| `BusinessDetailPage` | Dettaglio e modifica sede |
| `BusinessOpeningHoursPage` | Modifica orari apertura/chiusura sede |
| `AvailabilityPage` | Impostazione giorni disponibili dipendente |
| `EmployeeDashboardPage` | Dashboard personale dipendente |
| `AttendanceHistoryPage` | Storico check-in/check-out del dipendente |
| `ChangePasswordPage` | Cambio password |
| `ReportsPage` | Download CSV ore turni e presenze con selezione intervallo date |
| `ManageDataPage` | Gestione dati GDPR (export/delete) |
| `AdminInvitesPage` | Generazione e revoca codici invito (admin) |
| `InviteCodePage` | Inserimento codice invito (dipendente) |
| `ShiftSwapsPage` | Lista richieste scambio turno con azioni peer/admin |
| `ShiftSwapRequestPage` | Form proposta scambio turno |
| `StaleDataBanner` | ContentView riusabile: banner "dati non aggiornati" con `RefreshCommand` |

### ViewModels (`Turnify.Mobile/ViewModels/`)

| ViewModel | View abbinata |
|---|---|
| `BaseViewModel` | — (classe base: `IsBusy`, `Title`, `IsStale`, `HasStaleWarning`) |
| `LoginViewModel` | `LoginPage` |
| `RegisterViewModel` | `RegisterPage` |
| `ForgotPasswordViewModel` | `ForgotPasswordPage` |
| `GdprConsentViewModel` | `GdprConsentPage` |
| `OnboardingViewModel` | `OnboardingPage` |
| `DashboardViewModel` | `DashboardPage` |
| `ShiftCalendarViewModel` | `ShiftCalendarPage` |
| `ShiftDetailViewModel` | `ShiftDetailPage` |
| `VacationListViewModel` | `VacationListPage` |
| `VacationEditViewModel` | `VacationEditPage` |
| `NotificationsViewModel` | `NotificationsPage` |
| `ProfileViewModel` | `ProfilePage` |
| `EmojiPickerViewModel` | `EmojiPickerPage` (comunica la selezione via `WeakReferenceMessenger` con `EmojiSelectedMessage`) |
| `EmployeeListViewModel` | `EmployeeListPage` |
| `EmployeeDetailViewModel` | `EmployeeDetailPage` |
| `BusinessListViewModel` | `BusinessListPage` |
| `BusinessDetailViewModel` | `BusinessDetailPage` |
| `BusinessOpeningHoursViewModel` | `BusinessOpeningHoursPage` |
| `AvailabilityViewModel` | `AvailabilityPage` |
| `EmployeeDashboardViewModel` | `EmployeeDashboardPage` |
| `AttendanceHistoryViewModel` | `AttendanceHistoryPage` |
| `ChangePasswordViewModel` | `ChangePasswordPage` |
| `ReportsViewModel` | `ReportsPage` |
| `AdminInvitesViewModel` | `AdminInvitesPage` |
| `InviteCodeViewModel` | `InviteCodePage` |
| `ShiftSwapsViewModel` | `ShiftSwapsPage` |
| `ShiftSwapRequestViewModel` | `ShiftSwapRequestPage` |

### Services (`Turnify.Mobile/Services/`)

| Service | Responsabilità |
|---|---|
| `AuthService` | `LoginAsync` (email+password → JWT), `EmployeeLoginAsync` (companySlug+username+password → JWT), `ForgotPasswordAsync`, `ResetPasswordAsync`. Salva JWT e refresh token in `SecureStorage`. |
| `SessionService` | Verifica la validità della sessione all'avvio dell'app decodificando il JWT da `SecureStorage` (Base64, senza librerie esterne). Espone `IsSessionValidAsync`. |
| `AuthDelegatingHandler` | Inietta `Authorization: Bearer <jwt>` da `SecureStorage` su ogni richiesta HTTP "TurnifyApi". Su risposta 401: tenta refresh token automatico con `SemaphoreSlim` per evitare race condition; se il refresh fallisce, cancella sessione e sostituisce `Window.Page` con nuovo `AppShell` in Login. |
| `CertificatePinningHandler` | Verifica thumbprint SHA-256 SPKI del certificato SSL prima di inviare la richiesta; usato come `PrimaryHttpMessageHandler` su entrambi i named clients. Pin su `samuconfa.it`, scadenza 2027-04-28. |
| `CacheService` | Implementa `ICacheService`. Persistenza locale via SQLite (`sqlite-net-pcl`), TTL configurabile per chiave, thread-safe tramite `SemaphoreSlim`. `CacheKeys.cs` centralizza le costanti chiave. Usato dai ViewModel principali con pattern stale-while-revalidate. |
| `ErrorReporterService` | Implementa `IErrorReporterService`. Singleton; espone `static Current` per i ViewModel che non ricevono DI. Fire-and-forget verso `POST /api/errorlogs`. Genera `device_id` persistente via `Preferences`. Fallisce silenziosamente. |
| `MobilePushService` | Registra il device token FCM al login via `POST /api/device-tokens`. |
| `AppNavigationService` | Implementa `IAppNavigationService`; astrae `Shell.Current.GoToAsync` per testabilità e navigazione programmatica dai ViewModel. |

### Modelli Core (`Turnify.Core/Models/`, 12 file)

| File | Contenuto |
|---|---|
| `User.cs` | Account: `Email`, `Username` (nullable), `PasswordHash`, `RefreshTokenHash`, `AvatarEmoji`, `UserRole`, `CompanyId`, `PasswordResetToken`, `PasswordResetTokenExpiryTime` |
| `Company.cs` | Azienda tenant: `Name`, `Slug` (univoco) |
| `Employee.cs` | Anagrafica dipendente: `ContractType`, `WeeklyHours`, `AvailableDays` (CSV string) |
| `Business.cs` | Sede/attività: `Name`, `Address`, `OpeningTime`, `ClosingTime`, `IsActive` |
| `Shift.cs` | Turno: `StartTime`, `EndTime`, `Status` (ShiftStatus), `EmployeeId`, `Label`, `Note` |
| `VacationRequest.cs` | Richiesta ferie: `Type` (VacationRequestType), `Status` (VacationRequestStatus), `StartDate`, `EndDate`, `TotalDays`, `Reason` |
| `AttendanceLog.cs` | Timbratura: `CheckInTime` (UTC), `CheckOutTime` (nullable), `Method` (CheckInMethod) |
| `Notification.cs` | Notifica: `Type`, `IsRead`, `UserId` |
| `DeviceToken.cs` | Token FCM: `UserId`, `Token`, `Platform` |
| `AppErrorLog.cs` | Log errore client: `DeviceId`, `Platform`, `AppVersion`, `ErrorType`, `Message`, `StackTrace`, `ScreenName`, `OccurredAt` |
| `DashboardModels.cs` | DTOs server: `DashboardSummaryDto`, `EmployeeHoursDto` |
| `Enums.cs` | `UserRole` (Admin/Employee/Manager), `ContractType`, `ShiftStatus`, `VacationRequestType`, `VacationRequestStatus`, `CheckInMethod` |

### DTOs locali ai ViewModel

I ViewModel che necessitano di strutture per il binding definiscono i propri DTO nello stesso file `.cs`. Esempio: `DashboardViewModel.cs` contiene `DashboardShiftDto`, `DashboardPendingVacationDto`, `DashboardSummaryDto` con proprietà calcolate (`DisplayTime`, `Initials`, `TypeDisplay`) utili al binding XAML.

### Controller API (`Turnify.Api/Controllers/`, 13 file)

| Controller | Endpoint principali |
|---|---|
| `AuthController` | `POST /api/auth/register`, `/login`, `/employee-login`, `/forgot-password`, `/reset-password` |
| `ShiftsController` | CRUD `/api/shifts`, `POST /api/shifts/recurring` |
| `VacationRequestsController` | CRUD `/api/vacation-requests`, `/approve`, `/reject` |
| `AttendanceController` | `POST /api/attendance/checkin`, `/checkout`, `GET /today`, `/history` |
| `DashboardController` | `GET /api/dashboard/summary`, `/hours-by-employee` |
| `ReportsController` | `GET /api/reports/hours`, `/attendance` (risposta CSV) |
| `EmployeesController` | CRUD `/api/employees` |
| `BusinessesController` | CRUD `/api/businesses`, `PUT /opening-hours` |
| `UsersController` + `UsersController.GdprPartial.cs` | `GET /api/users/me`, `PUT /change-password`, GDPR export/delete |
| `NotificationsController` | `GET /api/notifications` |
| `DeviceTokensController` | `POST /api/device-tokens` |
| `ErrorLogsController` | `POST /api/errorlogs` (pubblico, rate-limited), `GET` (admin-only) |

---

## Navigazione

L'app usa `Shell` come root. La navigazione è gestita interamente da `AppShell.xaml.cs`; non esiste NavigationPage o altre strutture.

### Costruttore AppShell

```csharp
public AppShell(bool isAdmin = false, string startRoute = "Login")
```

Il costruttore accetta `isAdmin` e `startRoute`. Le route accettate per `startRoute`:
- `"GdprFirst"` → naviga a `GdprConsentPage`
- `"Onboarding"` → naviga a `OnboardingPage`
- `"Main"` → naviga a `//Dashboard` (admin) o `EmployeeDashboardPage` (dipendente)
- `"Login"` (default) → nessuna navigazione; la LoginPage è la prima tab

### Registrazione route

`RegisterAllRoutes` registra tutte le 27 route con `Routing.RegisterRoute`. Le tab principali sono dichiarate nello XAML dell'AppShell e non nelle route programmatiche.

### Tab per ruolo

`ConfigureForRole(bool isAdmin)` rimuove o ripristina tab dalla `TabBar` a runtime:

| Tab | Admin | Dipendente |
|---|---|---|
| DashboardTab | ✓ | ✗ rimossa |
| TeamTab (EmployeeList) | ✓ | ✗ rimossa |
| ShiftCalendarTab | ✓ | ✓ |
| VacationListTab | ✓ | ✓ |
| NotificationsTab | ✓ | ✓ |
| ProfileTab | ✓ | ✓ |
| EmployeeDashboardTab | ✗ rimossa | ✓ |

### Flusso startup (App.xaml.cs)

```
App.GetStartPage
  ├── GdprConsentViewModel.NeedsConsent == true
  │     → AppShell(isAdmin: false, startRoute: "GdprFirst")
  ├── Preferences["has_valid_session"] == true && role salvato
  │     ├── isAdmin && OnboardingViewModel.NeedsOnboarding
  │     │     → AppShell(isAdmin: true, startRoute: "Onboarding")
  │     └── altrimenti
  │           → AppShell(isAdmin, startRoute: "Main")
  └── altrimenti
        → AppShell(isAdmin: false, startRoute: "Login")
```

### Cambio sessione a runtime

Al login riuscito: `LoginViewModel` sostituisce `Window.Page` con un nuovo `AppShell` configurato per il ruolo. Su 401: `AuthDelegatingHandler` esegue la stessa operazione rimpiazzando con `AppShell` in Login.

---

## Flusso dati tipico

```
View (XAML binding)
  → [RelayCommand] su ViewModel
    → IsBusy = true
    → HttpClient.GetFromJsonAsync<TDto>(endpoint)  // named client "TurnifyApi"
      → AuthDelegatingHandler aggiunge header JWT
        → CertificatePinningHandler verifica certificato
          → API backend ASP.NET Core
            → Controller → Service → Repository → MySQL
          ← risposta JSON
        ← risposta
      ← risposta
    → deserializzazione → aggiornamento ObservableCollection / proprietà
    ← PropertyChanged notifica binding XAML
  → IsBusy = false
```

I ViewModel che richiedono autenticazione usano il named client `"TurnifyApi"` ottenuto via `IHttpClientFactory`. Il client auth (`IAuthService`) usa un named client separato senza `AuthDelegatingHandler` (le chiamate di login non portano JWT).

---

## Gestione stato UI

Ogni ViewModel eredita da `BaseViewModel`:

```csharp
public partial class BaseViewModel : ObservableObject
{
    [ObservableProperty] private bool _isBusy;
    [ObservableProperty] private string _title = string.Empty;
}
```

I ViewModel che caricano dati aggiungono tipicamente:

```csharp
[ObservableProperty] private bool _hasError;
[ObservableProperty] private string _errorMessage = string.Empty;
[ObservableProperty] private bool _isEmptyState;
[ObservableProperty] private bool _hasData;
```

Le collection sono `ObservableCollection<T>` come proprietà get-only inizializzate a `new`:

```csharp
public ObservableCollection<DashboardShiftDto> ShiftsToday { get; } = new;
```

`ShiftCalendarViewModel` aggiunge stato specifico per la timbratura:

```csharp
[ObservableProperty] private bool _hasCheckedIn;
[ObservableProperty] private bool _hasCheckedOut;
public bool CanCheckIn  => !HasCheckedIn && !HasCheckedOut;
public bool CanCheckOut => HasCheckedIn && !HasCheckedOut;
```

Il badge tab Notifiche è aggiornato tramite `WeakReferenceMessenger.Default` con `ValueChangedMessage<int>`, ascoltato direttamente in `AppShell`.

---

## Gestione errori

Pattern catch uniforme nei ViewModel:

```csharp
catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
    → ErrorMessage = "Troppi tentativi. Riprova tra qualche minuto."
catch (HttpRequestException)
    → ErrorMessage = "Errore di connessione al server."
catch (TaskCanceledException)
    → ErrorMessage = "Richiesta scaduta. Riprova."
catch (Exception ex)
    → ErrorMessage = "Si è verificato un errore. Riprova."
    → ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(ViewModel))
```

Alcuni ViewModel aggiungono `catch (JsonException)` per errori di deserializzazione.

Il 401 non è gestito a livello di ViewModel ma da `AuthDelegatingHandler`, che sostituisce la pagina corrente con il Login.

Eccezioni non gestite a livello di processo sono intercettate in `MauiProgram.cs`:

```csharp
AppDomain.CurrentDomain.UnhandledException += (_, args) => reporter.ReportAsync(ex, "UnhandledException");
TaskScheduler.UnobservedTaskException     += (_, args) => reporter.ReportAsync(ex, "UnobservedTask");
```

---

## Persistenza locale

| Storage | Chiavi usate | Gestita da |
|---|---|---|
| `SecureStorage.Default` | `jwt_token`, `refresh_token`, `user_role` | `AuthService`, `AuthDelegatingHandler`, `LoginViewModel` |
| `Preferences.Default` | `user_role_cached`, `has_valid_session` | `LoginViewModel`, `AuthDelegatingHandler`, `App.xaml.cs` |
| `Preferences.Default` | `gdpr_consent_given`, `gdpr_consent_version` | `GdprConsentViewModel` |
| `Preferences.Default` | `device_id` | `ErrorReporterService` |
| `FileSystem.CacheDirectory` | File CSV temporaneo | `ReportsViewModel` (prima di `Share.RequestAsync`) |
| SQLite (`sqlite-net-pcl`) | Tabella `CacheEntry(Key, Value, ExpiresAt)` | `CacheService` — stale-while-revalidate su tutti i ViewModel principali |

---

## Decisioni architetturali deliberate

Alcune funzionalità sono presenti nel progetto parzialmente o come stub. Le motivazioni sono documentate qui.

| Funzionalità | Stato | Motivazione |
|---|---|---|
| **Refresh token automatico** | `AuthDelegatingHandler` tenta refresh su 401 con `SemaphoreSlim`; `AuthService.RefreshTokenAsync` lancia `NotImplementedException` come guard clause. Il campo `refresh_token` è salvato in `SecureStorage` e nella tabella `Users`. | Il flusso di refresh con retry concorrente è implementato nel handler; la logica di chiamata API refresh è dichiarata ma non completata per mantenere il perimetro del MVP. L'architettura è pronta per l'estensione. |
| **FCM push notification** | `MobilePushService` registra il device token; `FcmPushNotificationService` lato backend invia notifiche ai turni. `GetDeviceTokenAsync` su Android restituisce il token reale solo se `google-services.json` è configurato. | In ambiente di sviluppo senza progetto Firebase attivo il token è null; la failure è silenziosa per non bloccare il flusso principale. La suite di test (`FcmPushNotificationServiceTests`) copre il comportamento con token valido e null. |
| **Validator `CreateVacationRequestInput`** | Il DTO inline usato da `VacationRequestsController.Create` non ha un `AbstractValidator<T>` FluentValidation. La validazione `TotalDays > 0` è garantita lato mobile in `VacationEditViewModel`. | Il DTO inline è una scelta consapevole per evitare proliferazione di classi per un'operazione singola; la validazione lato client è sufficiente per il MVP. Un refactoring futuro esporrebbe il DTO in `Turnify.Core/DTOs/` e aggiungerebbe il validator. |

---

## Estendibilità

La struttura DI registra tutti i ViewModel e View come `AddTransient`; aggiungere una nuova pagina richiede: creare il file `.xaml` + `.xaml.cs`, creare il ViewModel, registrare entrambi in `MauiProgram.cs`, aggiungere la route in `AppShell.RegisterAllRoutes`.

Il named client `"TurnifyApi"` è il punto di integrazione verso il backend; cambiare base URL richiede di modificare la sola costante `API_BASE` in `MauiProgram.cs`.

Il `ConfigureForRole` su `AppShell` consente di aggiungere tab specifiche per ruolo aggiungendo l'elemento XAML nel `TabBar` e una condizione nel metodo.
