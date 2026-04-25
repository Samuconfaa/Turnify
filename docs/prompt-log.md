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

## Prompt 11

### Data
2026-04-22

### Strumento
Claude Code

### Obiettivo
Aggiungere avatar emoji, ristrutturare il profilo e le pagine di gestione dipendenti e notifiche

### Prompt
> "Aggiungi un sistema di avatar emoji al profilo utente: crea `EmojiPickerPage.xaml` con una griglia di emoji selezionabili, `EmojiPickerViewModel` che salva la selezione e torna al profilo. Aggiorna `ProfilePage.xaml` e `ProfileViewModel` per mostrare l'emoji avatar e permettere la modifica. Riscrivi `NotificationsPage.xaml` e `NotificationsViewModel` con dati reali dall'API. Espandi `EmployeeDetailPage.xaml` e `EmployeeDetailViewModel` con form completo per la modifica dati dipendente. Aggiungi `GlobalExceptionMiddleware` nel backend per gestire tutte le eccezioni non catturate e restituire JSON con status code."

### Output utile
`EmojiPickerPage.xaml` (55 righe), `GlobalExceptionMiddleware.cs` (55 righe), `ProfileViewModel.cs` riscritto (+164 righe), `NotificationsViewModel.cs` (+133 righe), `ShiftDetailViewModel.cs` (187 righe), `BusinessListPage.xaml` + `BusinessDetailPage.xaml` creati. Totale: 2.336 righe modificate in 32 file.

### Decisione presa
Accettato, con fix minori sequenziali

### Motivazione
I tre aggiornamento prima (, , ) correggevano endpoint API errati (slash mancanti, path sbagliati, visualizzazione turni) trovati durante il test dell'integrazione mobile dopo questa generazione. Il fix Frame→Border per `RegisterPage.xaml` è un caso specifico Android non coperto dall'output AI.

---

## Prompt 12

### Data
2026-04-23

### Strumento
Claude Code

### Obiettivo
Implementare il sistema ferie completo con form di creazione e modifica

### Prompt
> "Riscrivi il sistema ferie mobile. Espandi `VacationRequestsController` con endpoint per tutti i tipi (Holiday, PaidLeave, UnpaidLeave, SickLeave) e filtro per stato. Crea `VacationEditPage.xaml` con form: date picker inizio/fine, picker tipo ferie, campo note, pulsanti Salva e Annulla. Crea `VacationEditViewModel` con `[RelayCommand] SaveAsync` che chiama POST o PUT in base a se è una nuova richiesta o modifica. Riscrivi `VacationListViewModel` con caricamento reale dall'API e filtro per stato. Aggiorna `ShiftCalendarViewModel` per mostrare le ferie approvate nel calendario."

### Output utile
`VacationEditPage.xaml` (80 righe), `VacationEditPage.xaml.cs` (35 righe — poi pulito a zero), `VacationEditViewModel.cs` (118 righe), `VacationListViewModel.cs` riscritto (148 righe modificate), `VacationRequestsController.cs` espanso (245 righe, +86 nette), `ShiftCalendarPage.xaml` ridisegnato (251 righe modificate). 953 righe in 15 file.

### Decisione presa
Accettato con cleanup MVVM posticipato

### Motivazione
Il aggiornamento di allineamento MVVM rimuove 35 righe da `VacationEditPage.xaml.cs` e 19 da `VacationListPage.xaml.cs`: la generazione aveva inserito logica nel code-behind (navigazione, gestione risultati) che doveva stare nel ViewModel.

---

## Prompt 13

### Data
2026-04-24

### Strumento
Claude Code

### Obiettivo
Aggiungere consenso GDPR, onboarding multi-step e push notification via FCM

### Prompt
> "Aggiungi tre funzionalità al progetto. 1) GDPR: crea `GdprConsentPage.xaml` (con testo legale, checkbox, pulsante accetta), `GdprConsentViewModel` che salva il consenso in `Preferences` e naviga al login. Aggiungi `UsersController.GdprPartial.cs` con endpoint per export e cancellazione dati. 2) Onboarding: crea `OnboardingPage.xaml` multi-step con `CarouselView`, `OnboardingViewModel` con navigazione step e completamento. 3) Push notification: `DeviceToken` model + migrazione, `DeviceTokensController`, `FcmPushNotificationService` in Infrastructure che chiama FCM HTTP v1 API, `MobilePushService` nel progetto MAUI. Integra l'invio push in `ShiftService` e `VacationService` dopo ogni operazione."

### Output utile
`GdprConsentPage.xaml` (197 righe), `OnboardingPage.xaml` (418 righe), `FcmPushNotificationService.cs` (292 righe — il file più lungo del progetto), `MobilePushService.cs` (109 righe), `DeviceTokensController.cs` (69 righe), migrazione `AddDeviceTokens`. Totale: 2.215 righe in 29 file.

### Decisione presa
Accettato con refactor LoginViewModel

### Motivazione
`LoginViewModel.cs` viene modificato di -47 righe nette nello stesso aggiornamento: la logica di routing post-login era diventata troppo complessa dopo l'aggiunta delle route GDPR/Onboarding e il prompt probabilmente richiedeva una semplificazione contestuale.

---

## Prompt 14

### Data
2026-04-25

### Strumento
Claude Code

### Obiettivo
Ridisegnare completamente l'interfaccia mobile con il nuovo design system

### Prompt
> "Ridisegna tutte le pagine principali dell'app MAUI basandoti sul nuovo design system. Prima aggiorna `Colors.xaml` con la palette completa (primary #..., secondary #..., background, surface, error, success). Poi riscrivi da zero: `DashboardPage.xaml`, `EmployeeListPage.xaml` (con SearchBar e card dipendente), `LoginPage.xaml` (con form centrato, logo, link registrazione), `NotificationsPage.xaml`, `ProfilePage.xaml` (con avatar, sezioni dati, logout), `ShiftCalendarPage.xaml` (con vista settimanale), `VacationListPage.xaml` (con chip filtro stato). Aggiorna anche `Styles.xaml` con gli stili globali."

### Output utile
7 View XAML riscritte per ~2.000 righe totali di markup. `Colors.xaml` sostituito (84 righe nette modificate). `Styles.xaml` aggiornato (+16 righe). `VacationListViewModel` aggiornato con filtro per chip stato (+18 righe).

### Decisione presa
Accettato integralmente

### Motivazione
Nessuna correzione successiva documentata sulle XAML riscritte in questa sessione. Il redesign è stato accettato direttamente come base definitiva dell'UI.

---

## Prompt 15

### Data
2026-04-25

### Strumento
Claude Code

### Obiettivo
Aggiungere timbratura presenze, ricorrenza turni e pagina disponibilità dipendente

### Prompt
> "Aggiungi tre funzionalità collegate. 1) Timbratura: crea `AttendanceController` con `POST /api/attendance/checkin` e `POST /api/attendance/checkout`, `AttendanceRepository`, migrazione `AddEmployeeAvailableDays` che aggiunge `AvailableDays string` (CSV dei giorni 1-7) a `Employee`. 2) Ricorrenza turni: espandi `ShiftCalendarViewModel` con `CreateRecurringCommand` che genera turni per N settimane da un template (giorno della settimana + orario). 3) Disponibilità: crea `AvailabilityPage.xaml` con toggle per ogni giorno della settimana e `AvailabilityViewModel` che legge/scrive `AvailableDays` via API. Aggiungi anche `ShiftDetailPage.xaml` con dettaglio completo del turno selezionato."

### Output utile
`AttendanceController.cs` (102 righe), `AttendanceRepository.cs` (40 righe), migrazione `20260425000000_AddEmployeeAvailableDays`, `AvailabilityPage.xaml` (121 righe), `AvailabilityViewModel.cs` (96 righe), `ShiftDetailPage.xaml` (+32 righe), `ShiftCalendarViewModel.cs` espanso (+210 righe nette). 905 righe in 21 file.

### Decisione presa
Accettato, con fix migrazione posticipato

### Motivazione
Il aggiornamento documentato aggiunge il file `Designer.cs` mancante alla migrazione: la migrazione era stata scritta manualmente senza generare il file companion richiesto da EF Core CLI per il discovery. Fix banale ma necessario per far funzionare `dotnet ef`.

---

## Prompt 16

### Data
2026-04-25

### Strumento
Claude Code

### Obiettivo
Allineare tutti i ViewModel alle regole MVVM: zero code-behind, x:DataType, gestione errori uniforme

### Prompt
> "Rifatta il codice mobile per rispettare le regole MVVM rigorose. Per ogni ViewModel: 1) usa solo `[ObservableProperty]` e `[RelayCommand]` senza proprietà manuali, 2) aggiungi `HasError`, `ErrorMessage`, `IsEmpty` come ObservableProperty standardizzati, 3) nei blocchi catch usa `ErrorMessage = $\"Errore {(int)response.StatusCode}\"` con il codice HTTP esplicito. Per ogni View XAML: aggiungi `x:DataType` se mancante, sposta nel ViewModel qualsiasi logica rimasta nel `.xaml.cs`. Aggiungi anche `VacationServiceTests.cs` con copertura completa."

### Output utile
Tutti i ViewModel modificati con state props standardizzate. 4 file `.xaml.cs` svuotati dalla logica (totale -76 righe rimosse da code-behind). `VacationServiceTests.cs` aggiunto (475 righe). Build zero warning raggiunta.

### Decisione presa
Accettato integralmente

### Motivazione
Nota di lavoro: "refactor: allineamento architetturale MVVM, fix bug 401, zero warning build, nuovi test". I -76 righe dai code-behind confermano la rimozione sistematica della logica. `VacationServiceTests.cs` a 475 righe in un unico blocco di lavoro indica generazione AI.

---

