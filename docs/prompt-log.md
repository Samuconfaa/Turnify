# Prompt log

> ⚠️ I prompt qui registrati sono **ricostruiti** da aggiornamento message, diff e pattern del codice.
> Non esistono log originali. Ogni voce è plausibile ma non verbatim.

---

## Prompt 01

### Data
2026-04-21

### Strumento
Claude Code

### Obiettivo
Definire il modello di dominio completo dell'applicazione in `Turnify.Core`

### Prompt
> "Crea i modelli di dominio per un'app di gestione turni in C#. Le entità sono: `User` (con ruolo Admin/Employee/Manager, hash password, refresh token, avatar emoji), `Company` (con slug univoco), `Employee` (con tipo contratto, ore settimanali, giorni disponibili), `Shift` (con stato Scheduled/InProgress/Completed/Cancelled), `VacationRequest` (con tipi Holiday/PaidLeave/UnpaidLeave/SickLeave e stati Pending/Approved/Rejected/Cancelled), `AttendanceLog` (con metodo check-in App/Web/Badge/Manual), `Notification` (con tipi Info/Warning/Alert/Reminder), `Business`. Tutti gli enum in un file `Enums.cs` separato. Namespace `Turnify.Core.Models`."

### Output utile
8 file creati (`User.cs`, `Company.cs`, `Employee.cs`, `Shift.cs`, `VacationRequest.cs`, `AttendanceLog.cs`, `Notification.cs`, `Enums.cs`) per 193 righe totali. Tutti i tipi enum nel file centralizzato `Enums.cs`, proprietà `CreatedAt`/`UpdatedAt` su ogni entità.

### Decisione presa
Accettato integralmente

### Motivazione
I modelli generati corrispondono esattamente a quelli nel repository senza correzioni successive documentate. La struttura degli enum (file unico) e il naming delle proprietà (`PasswordHash`, `RefreshTokenHash`, `AvatarEmoji`) rispecchia fedelmente il codice attuale.

---

## Prompt 02

### Data
2026-04-21

### Strumento
Claude Code

### Obiettivo
Definire le interfacce repository e service nel layer Core

### Prompt
> "Basandoti sui modelli di dominio già creati, aggiungi le interfacce in `Turnify.Core/Interfaces/`. Crea `IShiftRepository`, `IUserRepository`, `IVacationRepository`, `ICompanyRepository` con metodi CRUD asincroni. Crea `IAuthService`, `IShiftService`, `IVacationService`, `INotificationService`. Usa `Task<T>` con `CancellationToken` opzionale. Namespace `Turnify.Core.Interfaces.Repositories` e `Turnify.Core.Interfaces.Services`."

### Output utile
7 interfacce create nell'aggiornamento documentato, 106 righe totali. Pattern consistente: metodi `GetByIdAsync`, `GetByCompanyIdAsync`, `CreateAsync`, `UpdateAsync`, `DeleteAsync`. `CancellationToken ct = default` come parametro opzionale.

### Decisione presa
Accettato integralmente

### Motivazione
Le firme delle interfacce corrispondono alle implementazioni concrete nei repository, senza discrepanze che richiedessero correzioni manuali.

---

## Prompt 03

### Data
2026-04-21

### Strumento
Claude Code

### Obiettivo
Configurare EF Core con MySQL e generare la prima migrazione

### Prompt
> "Crea `TurnifyDbContext` in `Turnify.Infrastructure/Data/` con EF Core e provider Pomelo MySQL. Aggiungi `DbSet<T>` per tutte le entità del dominio. In `OnModelCreating` configura: indice univoco su `User.Email`, indice su `Company.Slug`, indice composto `(EmployeeId, StartTime)` su `Shift`, conversione enum → string per tutti gli enum. Aggiungi `AddDbContext` con `UseMySql` e `ServerVersion.AutoDetect` in `Program.cs`. Genera la prima migrazione `InitialCreate`."

### Output utile
`TurnifyDbContext.cs` con tutti i `DbSet` e configurazione `OnModelCreating` completa. Migrazione `20260421185539_InitialCreate` con DDL per tutte le tabelle. Subito dopo: migrazione aggiuntiva `AddRefreshTokenToUser` per aggiungere i campi refresh token a `User`.

### Decisione presa
Accettato, con migrazione aggiuntiva immediata

### Motivazione
La migrazione `AddRefreshTokenToUser` nello stesso giorno di `InitialCreate` indica che i campi refresh token erano stati dimenticati nel modello iniziale e aggiunti subito dopo con una seconda migrazione.

---

## Prompt 04

### Data
2026-04-21

### Strumento
Claude Code

### Obiettivo
Implementare autenticazione JWT completa: AuthService e AuthController

### Prompt
> "Implementa autenticazione JWT in `Turnify.Infrastructure/Services/AuthService.cs`. Metodi: `RegisterAsync` (hash password, crea Company + User, restituisce JWT), `LoginAsync` (verifica hash, restituisce JWT + refresh token). Il JWT deve contenere claims: `sub` (userId), `email`, `role`, `companyId`. Crea `AuthController` in `Turnify.Api/Controllers/` con `POST /api/auth/register` e `POST /api/auth/login`. Configura `AddAuthentication(JwtBearerDefaults)` in `Program.cs` con validazione issuer, audience, lifetime e firma. Aggiungi `Jwt:Secret`, `Jwt:Issuer`, `Jwt:Audience` in `appsettings.json`."

### Output utile
`AuthService.cs` (141 righe), `AuthController.cs` (109 righe), configurazione JWT Bearer in `Program.cs` (+32 righe), migrazione `AddRefreshTokenToUser` per i campi token. Totale: 759 righe in 10 file modificati.

### Decisione presa
Accettato con refactor minore posticipato

### Motivazione
Il aggiornamento documentato (stesso giorno, ore dopo) esegue un refactor di `AuthService.cs` di 41 righe per renderlo testabile. La prima generazione probabilmente aveva dipendenze non iniettate che rendevano il servizio non mockabile nei test unitari.

---

## Prompt 05

### Data
2026-04-21

### Strumento
Claude Code

### Obiettivo
Aggiungere controller turni e ferie con DTOs

### Prompt
> "Crea `ShiftsController` con endpoint: `GET /api/shifts` (filtro per companyId, employeeId, date range), `GET /api/shifts/{id}`, `POST /api/shifts`, `PUT /api/shifts/{id}`, `DELETE /api/shifts/{id}`. Crea `VacationRequestsController` con: `GET /api/vacations`, `POST /api/vacations`, `PUT /api/vacations/{id}/approve`, `PUT /api/vacations/{id}/reject`. Aggiungi i DTOs: `CreateShiftRequest`, `UpdateShiftRequest`, `ShiftDto`, `CreateVacationRequest`, `VacationRequestDto`, `ApproveRejectRequest`. Tutti gli endpoint richiedono autenticazione `[Authorize]` e filtrano per `companyId` estratto dal claim JWT."

### Output utile
`ShiftsController.cs` (204 righe), `VacationRequestsController.cs` (159 righe), 6 file DTO per 452 righe totali in 9 file.

### Decisione presa
Accettato integralmente

### Motivazione
Nessuna correzione successiva documentata immediato sui controller. I DTOs generati (`CreateShiftRequest`, `ShiftDto`, ecc.) corrispondono a quelli usati nei ViewModel mobile senza modifiche strutturali.

---

## Prompt 06

### Data
2026-04-21

### Strumento
Claude Code

### Obiettivo
Creare la struttura Shell e i ViewModel stub per l'app MAUI

### Prompt
> "Crea la navigazione Shell per l'app .NET MAUI. `AppShell.xaml` con un `TabBar` principale: tab Dashboard, ShiftCalendar, VacationList, Notifications, Profile. In `AppShell.xaml.cs` registra le route per tutte le pagine con `Routing.RegisterRoute`. Crea `BaseViewModel : ObservableObject` con `[ObservableProperty] bool IsBusy` e `string Title`. Crea ViewModel stub per ogni tab che ereditano `BaseViewModel`. Crea le View XAML corrispondenti con `ContentPage` minimali e `x:DataType` sul ViewModel. Registra tutto nel DI in `MauiProgram.cs` con `AddSingleton` per i ViewModel e `AddTransient` per le View."

### Output utile
`BaseViewModel.cs`, 6 ViewModel stub, 6 View XAML con code-behind, `AppShell.xaml` con TabBar, registrazione DI in `MauiProgram.cs`. 411 righe in 29 file (incluse modifiche a file esistenti).

### Decisione presa
Accettato integralmente

### Motivazione
La struttura generata è rimasta la base invariata per tutta l'evoluzione del progetto. Il pattern `BaseViewModel : ObservableObject` con `[ObservableProperty]` è coerente con CommunityToolkit.Mvvm 8.4.2 dichiarato nel `.csproj`.

---

## Prompt 07

### Data
2026-04-21

### Strumento
Claude Code

### Obiettivo
Implementare LoginViewModel con autenticazione reale e mobile AuthService

### Prompt
> "Implementa `LoginViewModel` completo con `[RelayCommand] async Task LoginAsync`. Il comando deve: mostrare `IsBusy = true`, chiamare `POST /api/auth/login` via `HttpClient`, salvare il JWT in `SecureStorage.SetAsync(\"jwt_token\", token)`, navigare a `//Dashboard` o `//EmployeeDashboard` in base al claim `role` nel token. Gestisci gli errori HTTP mostrando il codice di stato nel messaggio. Crea `Mobile/Services/AuthService.cs` con `LoginAsync(email, password)` e `GetTokenAsync`. Configura `HttpClient` con base address dell'API in `MauiProgram.cs`."

### Output utile
`AuthService.cs` mobile (58 righe), `LoginViewModel.cs` riscritto (+68 righe nette), `LoginPage.xaml` aggiornata con binding. `MauiProgram.cs` aggiornato con `AddHttpClient` e base address. Aggiunto `System.IdentityModel.Tokens.Jwt` al `.csproj` per leggere i claims del token.

### Decisione presa
Accettato integralmente

### Motivazione
Il pattern di lettura claims dal JWT (`JwtSecurityTokenHandler.ReadJwtToken(token)`) è visibile nel codice attuale di `LoginViewModel` e `AuthService` mobile, confermando che questa era la logica richiesta e generata.

---

## Prompt 08

### Data
2026-04-21

### Strumento
Claude Code

### Obiettivo
Aggiungere unit test per AuthService e ShiftService

### Prompt
> "Aggiungi test unitari xUnit in `Turnify.Tests/Services/`. Crea `AuthServiceTests.cs` con test per: registrazione nuovo utente (verifica salvataggio DB e JWT restituito), login con credenziali corrette, login con password errata (atteso eccezione o null), claims JWT contenenti userId/email/role/companyId. Crea `ShiftServiceTests.cs` con test per: creazione turno valido, recupero turni per companyId. Usa Moq per mockare i repository. Configura il progetto `Turnify.Tests` con riferimento a `Turnify.Infrastructure`."

### Output utile
`AuthServiceTests.cs` (175 righe), `ShiftServiceTests.cs` (152 righe), `Turnify.Tests.csproj` con dipendenze xUnit + Moq. Il primo aggiornamento dei test aveva aggiunto interfacce mancanti e refactored `AuthService`; il secondo ha aggiunto i file test veri e propri.

### Decisione presa
Modificato — refactor di AuthService richiesto prima

### Motivazione
Il aggiornamento documentato modifica `AuthService.cs` per 41 righe prima di aggiungere i test: indica che la versione generata in non era testabile (dipendenze hardcodate) e ha richiesto un refactor per iniettarle correttamente prima di poter scrivere i mock.

---

## Prompt 09

### Data
2026-04-21

### Strumento
Claude Code

### Obiettivo
Convertire i mockup HTML del design in XAML per le pagine MAUI

### Prompt
> "Ho una serie di mockup HTML/CSS per le pagine dell'app (login, dashboard admin, calendario turni, richiesta ferie, notifiche, profilo) in modalità dark e light. Convertili in XAML .NET MAUI mantenendo la struttura visiva: layout con `Grid`/`StackLayout`/`ScrollView`, colori mappati su risorse in `Colors.xaml`, font e dimensioni preservate. Genera: `LoginPage.xaml`, `DashboardPage.xaml`, `ShiftCalendarPage.xaml`, `VacationListPage.xaml`, `NotificationsPage.xaml`, `ProfilePage.xaml`."

### Output utile
6 pagine XAML aggiornate con contenuto reale (da 12 righe stub a 40–128 righe per pagina). I mockup HTML originali erano stati salvati nel repository insieme alla conversione e rimossi subito dopo in (3.680 righe eliminate).

### Decisione presa
Accettato con pulizia immediata

### Motivazione
Il aggiornamento documentato immediatamente successivo rimuove tutti i file HTML e PNG dei mockup dal repository e corregge i colori mancanti in `Colors.xaml`: il passaggio di conversione aveva omesso alcune variabili di colore presenti nei mockup ma assenti nel design system MAUI.

---

## Prompt 10

### Data
2026-04-22

### Strumento
Claude Code

### Obiettivo
Aggiungere il modello Business per gestione multi-attività con orari apertura

### Prompt
> "Aggiungi il modello `Business` per rappresentare sedi/attività di un'azienda: campi `Name`, `Address`, `CompanyId`, `OpeningTime`, `ClosingTime`, `IsActive`. Crea la migrazione EF Core `AddBusinessModel`. Crea `IBusinessRepository` e `BusinessRepository`. Crea `BusinessesController` con CRUD completo e endpoint `PUT /api/businesses/{id}/opening-hours` per aggiornare gli orari. Aggiungi `BusinessDto` e `OpeningHoursDto`. Registra nel DI in `Program.cs`."

### Output utile
`Business.cs`, `IBusinessRepository.cs`, `BusinessRepository.cs` (50 righe), `BusinessesController.cs` (157 righe), `BusinessDto.cs`, migrazione `20260422190154_AddBusinessModel` (65 righe DDL). 839 righe in 10 file.

### Decisione presa
Accettato integralmente

### Motivazione
Nessuna correzione successiva documentata direttamente collegato a questo modello. La struttura `Business` con `CompanyId` e `OpeningTime`/`ClosingTime` è rimasta invariata fino all'ultimo aggiornamento del repository.

---

