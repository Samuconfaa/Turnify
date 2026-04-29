# Architettura del progetto

## Obiettivo

App mobile .NET MAUI per la gestione turni di piccole imprese italiane. Il progetto è strutturato in soluzione multi-progetto: un layer Core condiviso, un backend ASP.NET Core 10, un'app mobile MAUI, un portale web Next.js 14 e un progetto test xUnit. I target ufficiali del build MAUI sono `net10.0-android` (sempre), `net10.0-ios` e `net10.0-maccatalyst` (se build non su Linux), `net10.0-windows10.0.19041.0` (se build su Windows).

---

## Pattern architetturale

**MVVM** implementato via `CommunityToolkit.Mvvm 8.4.2`. Tutti i ViewModel ereditano da `BaseViewModel : ObservableObject` e usano i source generator `[ObservableProperty]` e `[RelayCommand]`. I code-behind delle View contengono solo il costruttore con dependency injection; zero logica applicativa nel `.xaml.cs`.

Il layer mobile dipende direttamente da `Turnify.Core` (modelli e interfacce); non dipende da `Turnify.Infrastructure`.

---

## Componenti principali

### Views (23 file XAML in `Turnify.Mobile/Views/`)

| View | Scopo |
|---|---|
| `LoginPage` | Form login — admin con email, dipendente con companySlug + username |
| `RegisterPage` | Registrazione nuova azienda con account admin |
| `ForgotPasswordPage` | Richiesta reset password via email |
| `GdprConsentPage` | Consenso GDPR al primo avvio (obbligatorio) |
| `OnboardingPage` | Guida multi-step per admin al primo accesso post-consenso |
| `DashboardPage` | Dashboard admin: turni del giorno, ferie pendenti, contatori |
| `ShiftCalendarPage` | Calendario settimanale turni; include sezione timbratura per dipendenti |
| `VacationListPage` | Lista richieste ferie con filtro per stato |
| `VacationEditPage` | Form creazione/modifica richiesta ferie |
| `NotificationsPage` | Lista notifiche utente |
| `ProfilePage` | Profilo: email, avatar emoji, cambio password, logout |
| `EmojiPickerPage` | Griglia emoji per selezione avatar |
| `EmployeeListPage` | Lista dipendenti con SearchBar testuale |
| `EmployeeDetailPage` | Dettaglio e modifica dati dipendente |
| `ShiftDetailPage` | Dettaglio singolo turno |
| `BusinessListPage` | Lista sedi/attività azienda |
| `BusinessDetailPage` | Dettaglio e modifica sede |
| `BusinessOpeningHoursPage` | Modifica orari apertura/chiusura sede |
| `AvailabilityPage` | Impostazione giorni disponibili dipendente |
| `EmployeeDashboardPage` | Dashboard personale dipendente |
| `AttendanceHistoryPage` | Storico check-in/check-out del dipendente |
| `ChangePasswordPage` | Cambio password |
| `ReportsPage` | Download CSV ore turni e presenze con selezione intervallo date |

> `ManageDataPage` è registrata in `AppShell.RegisterAllRoutes` ma il file `.xaml` non esiste nel repository.

### ViewModels (23 file in `Turnify.Mobile/ViewModels/`)

| ViewModel | View abbinata |
|---|---|
| `BaseViewModel` | — (classe base: `IsBusy`, `Title`) |
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

> `EmojiPickerPage.xaml` esiste ma non ha un ViewModel dedicato nel Glob dei file `.cs`.

### Services (5 file in `Turnify.Mobile/Services/`)

| Service | Responsabilità |
|---|---|
| `AuthService` | `LoginAsync` (email+password → JWT), `EmployeeLoginAsync` (companySlug+username+password → JWT), `ForgotPasswordAsync`, `ResetPasswordAsync`. Salva JWT e refresh token in `SecureStorage`. Metodi `RegisterCompanyAsync`, `RefreshTokenAsync`, `LogoutAsync` non implementati (`throw NotImplementedException`). |
| `AuthDelegatingHandler` | Inietta `Authorization: Bearer <jwt>` da `SecureStorage` su ogni richiesta HTTP "TurnifyApi". Su risposta 401: cancella sessione (`SecureStorage` + `Preferences`) e sostituisce `Window.Page` con nuovo `AppShell` in Login. Non esegue refresh token automatico. |
| `CertificatePinningHandler` | Verifica thumbprint certificato SSL del server prima di inviare la richiesta; usato come `PrimaryHttpMessageHandler` su entrambi i named clients. |
| `ErrorReporterService` | Implementa `IErrorReporterService` (interfaccia definita nello stesso file). Singleton; espone `static Current` per i ViewModel che non ricevono DI. Fire-and-forget verso `POST /api/errorlogs`. Genera `device_id` persistente via `Preferences`. Fallisce silenziosamente su qualsiasi errore. |
| `MobilePushService` | Registra il device token FCM al login via `POST /api/device-tokens`. |

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

Non è presente SQLite.

---

## Estendibilità

La struttura DI registra tutti i ViewModel e View come `AddTransient`; aggiungere una nuova pagina richiede: creare il file `.xaml` + `.xaml.cs`, creare il ViewModel, registrare entrambi in `MauiProgram.cs`, aggiungere la route in `AppShell.RegisterAllRoutes`.

Il named client `"TurnifyApi"` è il punto di integrazione verso il backend; cambiare base URL richiede di modificare la sola costante `API_BASE` in `MauiProgram.cs`.

Il `ConfigureForRole` su `AppShell` consente di aggiungere tab specifiche per ruolo aggiungendo l'elemento XAML nel `TabBar` e una condizione nel metodo.
