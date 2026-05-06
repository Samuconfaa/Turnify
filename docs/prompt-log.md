# Prompt log

---

## Prompt 46

### Data
2026-05-06

### Strumento
Claude Code

### Obiettivo
Bugfix: creazione dipendente restituisce errore ma utente viene salvato nel DB; dipendente loggato riceve "errore di connessione al server" su ogni endpoint.

### Prompt
> In `EmployeesController.CreateEmployee`, `Employee.Email` viene assegnato come `string.Empty` quando non fornito. L'indice unico `(CompanyId, Email)` su `Employees` senza filtro causa `duplicate key` MySQL al secondo dipendente senza email. `UserRepository.AddAsync` viene chiamato prima e fa `SaveChangesAsync` separato, quindi il `User` viene committato anche se poi `EmployeeRepository.AddAsync` fallisce. Il dipendente con `User` ma senza `Employee` può autenticarsi (JWT valido) ma riceve 404 da `api/dashboard/employee-summary` (che cerca `Employee` per `UserId`); `GetFromJsonAsync` lancia `HttpRequestException` su 404, catturato come "Impossibile connettersi al server". Fix: rendere `Employee.Email` nullable, aggiungere filtro all'indice unico, aggiornare `CreateEmployee` e `UpdateEmployee` ad usare null per email vuota, creare migrazione.

### Output utile
- `Turnify.Core/Models/Employee.cs`: `Email` cambiato da `string` a `string?`
- `TurnifyDbContext.cs`: aggiunto `.HasFilter("`Email` IS NOT NULL AND `Email` != ''")` all'indice unico Employee
- `EmployeesController.cs`: `CreateEmployee` e `UpdateEmployee` usano `string.IsNullOrWhiteSpace ? null : email`
- `AuthService.cs`: guard null su `adminUser.Email` prima di `ExistsByEmailAsync`
- `TurnifyDbContextModelSnapshot.cs`: aggiornato `IsRequired` rimosso + filtro indice
- `20260506000000_FixEmployeeEmailNullable.cs`: nuova migrazione (ALTER COLUMN + DROP INDEX + UPDATE + CREATE UNIQUE INDEX filtrato)

### Decisione presa
Accettato integralmente

### Motivazione
Build 0 errori 0 warning. Causa confermata da ispezione del codice: unique index senza filtro su colonna non nullable assegnata a stringa vuota per default.

## Prompt 45

### Data
2026-05-06

### Strumento
Claude Code

### Obiettivo
Bugfix: la pagina di registrazione azienda mostra sempre "esiste già un'azienda con quella mail o slug" anche con DB vuoto.

### Prompt
> In `RegisterViewModel.cs`, il branch `else` di `RegisterAsync` mostra un messaggio hardcoded per qualsiasi risposta non-2xx (400 validazione, 409 conflict, 500 server error). Sostituire il messaggio statico con un parser del body della risposta HTTP: per 409 mostrare messaggio fisso di duplicato, per 400 estrarre i messaggi da `ValidationProblemDetails.errors`, per altri codici estrarre `detail` o `title` da `ProblemDetails`, con fallback sul codice HTTP.

### Output utile
- `RegisterViewModel.cs`: aggiunto metodo `GetErrorMessageAsync` che parsifica il body della risposta (validazione FluentValidation, ProblemDetails), con gestione specifica per 409 Conflict; rimosso messaggio hardcoded fuorviante

### Decisione presa
Accettato integralmente

### Motivazione
Il messaggio "esiste già un'azienda" appariva per qualsiasi errore API, inclusi i 400 di validazione (slug con maiuscole, password debole). Il fix permette di vedere l'errore reale.

---

## Prompt 44

### Data
2026-05-06

### Strumento
Claude Code

### Obiettivo
Bugfix: il toggle Admin/Manager ↔ Dipendente nella LoginPage non aggiorna visivamente la selezione quando si clicca su "Dipendente".

### Prompt
> In `LoginPage.xaml`, i `DataTrigger` sul toggle role (Admin/Manager vs Dipendente) non eseguono il revert corretto quando la condizione diventa `False`. Il tab Admin è evidenziato all'avvio (IsAdminMode=True); cliccando Dipendente la UI non aggiorna il background né il colore del testo. Aggiungere trigger espliciti `Value="False"` su tutti e 4 gli elementi (2 Border + 2 Label) per forzare il reset del colore/sfondo senza affidarsi al revert automatico di MAUI.

### Output utile
- `LoginPage.xaml`: aggiunti 4 `DataTrigger` `Value="False"` nel toggle mode (Border Admin, Label Admin, Border Dipendente, Label Dipendente)

### Decisione presa
Accettato integralmente

### Motivazione
Bug noto di .NET MAUI: quando un DataTrigger è True al momento del binding iniziale, il runtime non salva correttamente il valore "precedente" e non riesce a fare il revert. L'aggiunta del trigger inverso Value=False risolve il problema senza modificare il ViewModel o introdurre converter.

---

## Prompt 43

### Data
2026-05-05

### Strumento
Claude Code

### Obiettivo
Convertire `VacationListPage.xaml` e `NotificationsPage.xaml` in XAML Tropic Burst a partire dagli HTML Stitch in `new-ui/redesign2/`.

### Prompt
> Leggere i file HTML in `new-ui/redesign2/` (ferie_e_permessi_admin, nuova_richiesta_ferie, notifiche) e convertirli in XAML MAUI preservando tutti i binding ViewModel esistenti. Applicare: gradient header `HeaderGradientStart→HeaderGradientEnd`, filter chips con DataTrigger solo per stato attivo (fix pattern Value=False), card con left bar `StripColor`, bottom sheet nuova richiesta, badge `UnreadCount` nel header notifiche, `Shell.NavBarIsVisible=False`.

### Output utile
- `VacationListPage.xaml`: gradient header con "+ Richiedi" pill (employee), 4 filter chip con DataTrigger singolo (solo `Value=active`), card SwipeView con left bar StripColor, bottom sheet overlay `IsFormVisible`, tutti i binding preservati
- `NotificationsPage.xaml`: gradient header con badge `PrimaryLight`/`Primary` per unread count, "Segna tutte lette" white link, card con `BackgroundColor` binding, icon circle `PrimaryLight`, unread dot Ellipse, `Shell.NavBarIsVisible=False`

### Decisione presa
Accettato integralmente

### Motivazione
Struttura XAML conforme al pattern delle altre pagine già convertite; DataTrigger pattern corretto (solo Value=True) applicato anche ai filter chip per evitare il bug del toggle.

---

## Prompt 42

### Data
2026-05-05

### Strumento
Claude Code

### Obiettivo
Eseguire iterazione 15: aggiornare `Colors.xaml` con palette Tropic Burst e convertire 6 pagine XAML da HTML Stitch, sostituendo tutte le emoji con asset icona PNG.

### Prompt
> Eseguire tutti i TASK dell'iterazione 15: aggiornare `Colors.xaml` con i token Tropic Burst (primary `#006948`, header gradient `#064E3B`→`#115E59`, surface scale MD3, KPI colors); convertire `LoginPage`, `DashboardPage`, `EmployeeDashboardPage`, `EmployeeListPage`, `ProfilePage` da HTML Stitch in XAML MAUI preservando tutti i binding ViewModel; aggiornare `ShiftCalendarPage` (color-only: `Navy`→`Primary`). Nessuna modifica ai ViewModel, `x:DataType` su ogni View, nessuna emoji nei file convertiti.

### Output utile
- `Colors.xaml`: token Tropic Burst, MD3 surface scale, KPI colors, stili PrimaryButton/OutlineButton, fix typo `#BCCAC0` e `#FFDAD6`
- `LoginPage.xaml`: hero gradient verticale, bottom sheet arrotondato, mode toggle pill, shadow smeraldo su CTA
- `DashboardPage.xaml`: gradient header orizzontale, 4 KPI card con SolidColorBrush + Shadow colorata, icone PNG
- `EmployeeDashboardPage.xaml`: greeting header, hero card Primary, 3 quick actions TertiaryContainer/PrimaryContainer/SecondaryContainer, icone PNG
- `EmployeeListPage.xaml`: gradient header, search bar con search.png, avatar PrimaryContainer, add card dashed Primary
- `ProfilePage.xaml`: gradient hero HeaderGradientStart→Secondary, badge edit-pencil.png, tutte le righe settings con Image Source
- `ShiftCalendarPage.xaml`: 4 occorrenze `Navy`→`Primary` (FAB, toggle Dipendenti, toggle Giorno, bottone Uscita)

### Decisione presa
Accettato integralmente

### Motivazione
Tutte le pagine convertite compilano senza modifiche ai ViewModel; i binding restano invariati. TASKs 2/8/10/11 rimandati perché mancano HTML Stitch per VacationList/Notifications/Onboarding e gli asset icona vanno scaricati manualmente.

---

## Prompt 41

### Data
2026-05-05

### Strumento
Claude Code

### Obiettivo
Pianificare iterazione 15: conversione HTML → XAML dei layout generati da Google Stitch con applicazione della palette Tropic Burst all'app mobile.

### Prompt
> Preparare il file `docs/iterations/it-15-ui-redesign.md` seguendo il template delle 14 iterazioni precedenti. L'iterazione deve documentare il flusso: lettura file HTML da `new-ui/`, conversione in XAML MAUI, aggiornamento `Colors.xaml` con token Tropic Burst, aggiunta asset icona PNG/SVG in `Resources/Images/`, sostituzione delle 9 pagine principali. Nessuna modifica ai ViewModel. Commit sul branch `redesign-ui`.

### Output utile
- `docs/iterations/it-15-ui-redesign.md`: 11 TASK documentati (Colors.xaml, asset icone, LoginPage, DashboardPage, EmployeeDashboardPage, ShiftCalendarPage, EmployeeListPage, VacationListPage, ProfilePage, NotificationsPage, OnboardingPage), regole obbligatorie MAUI, lista completa file da creare/modificare, output atteso

### Decisione presa
Accettato integralmente

### Motivazione
Piano pronto per procedere TASK per TASK man mano che l'utente porta i file HTML da Stitch.

---

## Prompt 40

### Data
2026-05-05

### Strumento
Claude Code

### Obiettivo
Creare un nuovo branch `redesign-ui` e generare le specifiche di redesign UI per Google Stitch con nuova palette colorata e icone reali al posto delle emoji.

### Prompt
> Creare branch `redesign-ui`. Generare cartella `new-ui/` nella root con file markdown di specifiche da passare a Google Stitch per ridisegnare la UI dell'app mobile Turnify. Requisiti: design molto più colorato rispetto alla versione attuale (navy/beige), icone come asset PNG/SVG reali (non emoji), proposta di palette cromatica con scelta utente. Palette scelta: "Tropic Burst" — primary `#059669` (verde smeraldo), accent `#FBBF24` (giallo dorato), danger `#F43F5E` (corallo), info `#0EA5E9`, background `#F0FDF4`, header gradient `#064E3B` → `#0F766E`. Specifiche per: LoginPage, DashboardPage, EmployeeDashboardPage, ShiftCalendarPage, EmployeeListPage, VacationListPage, ProfilePage, NotificationsPage, OnboardingPage.

### Output utile
- Branch `redesign-ui` creato
- `new-ui/stitch-spec.md`: specifiche complete con token colore, tipografia, componenti globali (button, card, input, chip, tab bar), specifiche per 9 schermate, lista completa di 26 asset icona con descrizione, linee guida animazioni, griglia spaziatura, tabella comparativa vs design v2

### Decisione presa
Accettato integralmente

### Motivazione
Specifica completa e pronta per essere incollata in Google Stitch. Palette Tropic Burst confermata dall'utente tra 5 proposte.

---

## Prompt 39

### Data
2026-05-04

### Strumento
Claude Code

### Obiettivo
Fix crash e mancato caricamento della pagina Team (`EmployeeListPage`) dopo introduzione del caching SQLite

### Prompt
> Aggiungere `sqlite-net-pcl` al `.csproj` di `Turnify.Mobile` (mancante dopo it-14). Correggere il crash nella pagina Team causato da: (1) doppia chiamata concorrente a `LoadDataAsync()` generata da `OnSelectedBusinessChanged` scattato durante il caricamento iniziale dei business; (2) `_cache.GetAsync` fuori dal try/catch che, in caso di eccezione SQLite, propagava attraverso `async partial void OnSelectedBusinessChanged` crashando l'app. Fix: aggiungere flag `_suppressBusinessChanged` per bloccare il re-trigger durante l'assegnazione di `SelectedBusiness = Businesses[0]`; wrappare `_cache.GetAsync` in try/catch isolato.

### Output utile
- `Turnify.Mobile.csproj`: aggiunto `<PackageReference Include="sqlite-net-pcl" Version="1.9.172" />`
- `EmployeeListViewModel.cs`: aggiunto campo `_suppressBusinessChanged`; `OnSelectedBusinessChanged` controlla il flag prima di richiamare `LoadDataAsync`; `_cache.GetAsync` wrappato in try/catch standalone

### Decisione presa
Accettato integralmente

### Motivazione
Build 0 errori confermata. I due bug identificati (doppia chiamata + eccezione non catchata in async void) spiegano sia il mancato caricamento sia il crash.

---

## Prompt 38

### Data
2026-05-04

### Strumento
Claude Code

### Obiettivo
Fix errori di compilazione SQLite in Turnify.Mobile (6 errori: SQLiteAsyncConnection, TableAttribute, PrimaryKey, ecc.)

### Prompt
> Aggiungere il package NuGet `sqlite-net-pcl` al progetto `Turnify.Mobile` per risolvere i 6 errori di compilazione relativi ai tipi SQLite (`SQLiteAsyncConnection`, `TableAttribute`, `PrimaryKey`, ecc.) introdotti dall'iterazione it-14 (caching locale).

### Output utile
- `Turnify.Mobile.csproj`: aggiunto `<PackageReference Include="sqlite-net-pcl" Version="1.9.172" />`

### Decisione presa
Accettato integralmente

### Motivazione
Restore e build confermati senza errori.

---

## Prompt 37

### Data
2026-05-04

### Strumento
Claude Code

### Obiettivo
Rinominare i file iterazioni in `docs/iterations/` con suffisso descrittivo e aggiornare README e tag git

### Prompt
> Rinomina tutti i file in `docs/iterations/` con suffisso descrittivo (es. `it-01.md` → `it-01-bootstrap.md`), aggiorna `docs/iterations/README.md` con i nuovi nomi e la lista iterazioni Turnify, aggiorna eventuali riferimenti in `docs/plan.md` e `docs/prompt-log.md`, poi commit con messaggio `docs: rinomina file iterazioni con suffisso descrittivo`.

### Output utile
14 file rinominati via `git mv`. `README.md` in `docs/iterations/` riscritto con lista corretta per Turnify (era ancora con nomi BookScout). Nessun riferimento `.md` da aggiornare in `plan.md` o `prompt-log.md` (i riferimenti presenti sono dentro testo di prompt, non link).

### Decisione presa
Accettato integralmente

### Motivazione
Naming convention allineata ai tag git già creati (`it-01-backend-core`, ecc.) e alla convenzione richiesta.

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

## Prompt 17

### Data
2026-04-26

### Strumento
Claude Code

### Obiettivo
Creare il portale web admin completo in Next.js 14

### Prompt
> "Crea un portale web admin in Next.js 14 con TypeScript e Tailwind CSS nella cartella `src/Turnify.Web/`. Struttura: App Router con le pagine `/login`, `/dashboard` (overview), `/dashboard/employees` (tabella dipendenti), `/dashboard/businesses` (tabella attività), `/dashboard/shifts` (tabella turni con filtri), `/dashboard/vacations` (tabella ferie con approvazione). Crea `lib/api.ts` con wrapper `fetch` verso il backend Turnify all'URL configurabile da env. Crea `lib/auth.ts` per gestione autenticazione via cookie. Aggiungi `middleware.ts` che protegge tutte le route `/dashboard/*`. Crea `components/Sidebar.tsx` con navigazione. Configura `ecosystem.config.js` per PM2."

### Output utile
Progetto Next.js completo: 21 file creati, 1.153 righe. Tutte le pagine dashboard con tabelle dati, chiamata API all'avvio (`useEffect`), stati loading/error. `middleware.ts` (26 righe) con redirect `/login` se cookie assente. `Sidebar.tsx` (64 righe) con link attivi. `ecosystem.config.js` per PM2 Node 20.

### Decisione presa
Accettato con fix deploy immediato

### Motivazione
Il aggiornamento documentato il giorno dopo ("fix: corretto deploy Next.js su VPS con Node 20") indica incompatibilità rilevata solo al deploy su VPS: il portale funzionava in locale ma non su Node 20 in produzione, richiesto un aggiustamento alla configurazione.

---

## Prompt 18

### Data
2026-04-27

### Strumento
Claude Code

### Obiettivo
Aggiungere reportistica CSV, reset password email, dashboard dipendente e rate limiter

### Prompt
> "Aggiungi le funzionalità mancanti per la produzione. 1) Reports: `ReportsController` con `GET /api/reports/hours?from=&to=` e `GET /api/reports/attendance?from=&to=` che restituiscono CSV generato con `StringBuilder`. 2) Reset password: endpoint `POST /api/auth/request-password-reset` (genera token, invia email SMTP) e `POST /api/auth/reset-password` (verifica token, aggiorna password). Migrazione `AddPasswordResetToUser`. `SmtpEmailService`. 3) Mobile: `EmployeeDashboardPage` + VM per il dipendente, `AttendanceHistoryPage` + VM con lista presenze, `ForgotPasswordPage` + VM. 4) Rate limiter sliding window per-IP in `Program.cs`: 10 req/min su `/auth`, 120 req/min globale."

### Output utile
`ReportsController.cs` (109 righe), `SmtpEmailService.cs` (37 righe), migrazione `AddPasswordResetToUser`, `EmployeeDashboardViewModel.cs` (118 righe), `AttendanceHistoryViewModel.cs` (135 righe), `ForgotPasswordViewModel.cs` (57 righe) + View XAML corrispondenti. Rate limiter con `SlidingWindowRateLimiter` in `Program.cs`. 1.662 righe nette aggiunte.

### Decisione presa
Modificato — rate limiter corretto manualmente

### Motivazione
Il aggiornamento documentato ("fix: rate limiter per-IP") modifica immediatamente il rate limiter: la prima versione generata usava un limite globale condiviso tra tutti gli IP invece di partizionare per `RemoteIpAddress`. Fix necessario per rendere il rate limiting efficace come protezione.

---

## Prompt 19

### Data
2026-04-28

### Strumento
Claude Code

### Obiettivo
Aggiungere FluentValidation su tutti gli endpoint critici dell'API

### Prompt
> "Aggiungi FluentValidation al progetto API. Installa `FluentValidation.AspNetCore`, registra con `AddFluentValidationAutoValidation` e `AddValidatorsFromAssemblyContaining<LoginRequestValidator>`. Crea validator in `Turnify.Api/Validators/` per: `LoginRequest` (email required + formato, password minLength 6), `RegisterRequest` (email, password, companyName required + lunghezze), `CreateShiftRequest` (StartTime < EndTime, EmployeeId > 0), `UpdateShiftRequest`, `CreateVacationRequest` (StartDate <= EndDate, tipo valido), `CreateRecurringShiftsRequest` (weekCount > 0), `ReportErrorRequest` (message required, maxLength 2000)."

### Output utile
7 file validator creati (161–207 righe totali), `Program.cs` aggiornato con registrazione FluentValidation. Da questo momento tutti gli endpoint con input invalido restituiscono automaticamente 400 con `ValidationProblemDetails` che elenca i campi errati.

### Decisione presa
Accettato integralmente

### Motivazione
I 7 validator hanno naming e struttura uniforme (`AbstractValidator<T>`, `RuleFor(x => x.Field).NotEmpty.MaximumLength`), tipica output AI. Nessuna correzione successiva documentata sulle regole di validazione.

---

## Prompt 20

### Data
2026-04-28

### Strumento
Claude Code

### Obiettivo
Raccolta errori client mobile con ErrorLogsController e ErrorReporterService

### Prompt
> "Implementa un sistema di error reporting client→server. Backend: modello `AppErrorLog` con campi `Message`, `StackTrace`, `ScreenName`, `AppVersion`, `Platform`, `OccurredAt`. Migrazione `AddAppErrorLogs`. `IAppErrorLogRepository` e `AppErrorLogRepository`. `ErrorLogsController` con `POST /api/errorlogs` (pubblico, rate-limited a 20 req/min per IP) per ricevere errori e `GET /api/errorlogs` (solo admin). Mobile: `ErrorReporterService` singleton con `static Current` e metodo `ReportAsync(Exception ex, string screenName)` che serializza e invia in background senza bloccare l'UI. Aggiungi la chiamata a `ErrorReporterService.Current?.ReportAsync(ex)` in ogni catch generico dei ViewModel."

### Output utile
`ErrorLogsController.cs` (97 righe), `AppErrorLog.cs` (19 righe), `AppErrorLogRepository.cs` (54 righe), migrazione `AddAppErrorLogs` (62 righe), `ErrorReporterService.cs` (68 righe). Ogni ViewModel esistente aggiornato con `ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(XxxViewModel))`.

### Decisione presa
Accettato integralmente

### Motivazione
Il pattern `ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(ViewModel))` è identico in tutti i ViewModel, tipico di una generazione sistematica AI su tutti i file in una singola sessione.

---

## Prompt 21

### Data
2026-04-28

### Strumento
Claude Code

### Obiettivo
Aggiungere certificate pinning Android e configurazione network security

### Prompt
> "Aggiungi certificate pinning per Android nel progetto MAUI. Crea `CertificatePinningHandler : DelegatingHandler` che intercetta ogni richiesta HTTPS, verifica il thumbprint SHA-256 del certificato del server contro un valore atteso in configurazione, e lancia eccezione se non corrisponde. Crea `Platforms/Android/Resources/xml/network_security_config.xml` con la configurazione di rete Android (clear text disabilitato, pin del certificato). Aggiorna `AndroidManifest.xml` con `android:networkSecurityConfig`. Registra il handler nella pipeline HTTP in `MauiProgram.cs` dopo `AuthDelegatingHandler`."

### Output utile
`CertificatePinningHandler.cs` (57 righe), `network_security_config.xml` (20 righe), `AndroidManifest.xml` aggiornato (+2 righe), `MauiProgram.cs` aggiornato per la pipeline HTTP.

### Decisione presa
Accettato integralmente

### Motivazione
I file sono stati aggiunti in unico blocco nell'aggiornamento documentato senza fix successivi. La struttura `DelegatingHandler` è coerente con `AuthDelegatingHandler` già presente.

---

## Prompt 22

### Data
2026-04-28

### Strumento
Claude Code

### Obiettivo
Scrivere integration test con WebApplicationFactory per AuthController e ShiftsController

### Prompt
> "Scrivi integration test con `WebApplicationFactory<Program>` in `Turnify.Tests/Integration/`. Crea `TurnifyWebFactory` che sovrascrive il DbContext con un database di test isolato. Crea `IntegrationTestBase` con metodi helper per autenticazione (registra + login, ottieni JWT). Scrivi `AuthControllerIntegrationTests` (test: registrazione valida → 201, email duplicata → 409, login credenziali corrette → 200 + JWT, login password errata → 401, accesso endpoint protetto con token valido → 200, senza token → 401). Scrivi `ShiftsControllerIntegrationTests` (test: CRUD turni autenticato, input non valido → 400 con ValidationProblemDetails, accesso senza autorizzazione → 403)."

### Output utile
`TurnifyWebFactory.cs` (53 righe), `IntegrationTestBase.cs` (74 righe), `AuthControllerIntegrationTests.cs` (203 righe), `ShiftsControllerIntegrationTests.cs` (288 righe). Aggiunto `Microsoft.AspNetCore.Mvc.Testing` al `.csproj`. Dichiarato `public partial class Program { }` in `Program.cs` per esporre il punto di entry alla factory.

### Decisione presa
Accettato integralmente

### Motivazione
Il blocco `public partial class Program { }` aggiunto in fondo a `Program.cs` è il pattern standard richiesto da `WebApplicationFactory` — la sua presenza conferma che il prompt specificava esplicitamente l'uso di `WebApplicationFactory` e il generatore ha aggiunto il markup necessario.

---

## Prompt 23

### Data
2026-04-28

### Strumento
Claude Code

### Obiettivo
Aggiungere pagina log errori nel portale web e login riservato ai datori di lavoro

### Prompt
> "Aggiungi nel portale Next.js due funzionalità. 1) Pagina `/dashboard/error-logs`: tabella degli errori ricevuti dall'app mobile con colonne data, schermata, messaggio, piattaforma, versione app. Chiamata a `GET /api/errorlogs`. Aggiungi voce nella Sidebar. 2) Login riservato ai datori di lavoro: crea `/admin/login` come pagina dedicata, aggiorna `middleware.ts` per reindirizzare `/login` a `/admin/login`. L'accesso al portale web è consentito solo ad admin/employer, non ai dipendenti."

### Output utile
`app/dashboard/error-logs/page.tsx` (217 righe) con tabella, filtri e gestione errori. `app/admin/login/page.tsx` creato. `Sidebar.tsx` aggiornato (+23 righe). `middleware.ts` aggiornato. `lib/auth.ts` hardening (+6 righe).

### Decisione presa
Accettato con fix immediato

### Motivazione
Il aggiornamento documentato nella stessa fase di verifica corregge un crash nella pagina `error-logs`: il codice usava `[...new Set(...)]` non supportato uniformemente dal target browser configurato; sostituito con `Array.from(new Set(...))`.

---

## Prompt 24

### Data
2026-04-28

### Strumento
Claude Code

### Obiettivo
Aggiungere ChangePasswordPage e ReportsPage mobile

### Prompt
> "Aggiungi due pagine al mobile dipendente. 1) `ChangePasswordPage.xaml` con `ChangePasswordViewModel`: form con campo password attuale, nuova password, conferma nuova; validazione lato client (nuova == conferma), chiamata a `POST /api/users/change-password`. 2) `ReportsPage.xaml` con `ReportsViewModel`: date picker da/a con default mese corrente, pulsanti 'Scarica ore turni' e 'Scarica presenze' che chiamano `GET /api/reports/hours` e `GET /api/reports/attendance`, salvano il CSV in `FileSystem.CacheDirectory` e aprono la condivisione OS con `Share.RequestAsync`. Gestisci errori di rete e timeout separatamente."

### Output utile
`ChangePasswordPage.xaml` + `ChangePasswordViewModel.cs`, `ReportsPage.xaml` + `ReportsViewModel.cs`. `ReportsViewModel` (58 righe) con `DownloadHoursCommand` e `DownloadAttendanceCommand`, gestione separata di `HttpRequestException`, `TaskCanceledException` ed `Exception` generico (quest'ultimo inviato a `ErrorReporterService`).

### Decisione presa
Accettato integralmente

### Motivazione
Il pattern di gestione errori in `ReportsViewModel` (tre blocchi catch distinti con messaggi diversi + `ErrorReporterService.Current?.ReportAsync`) è identico a quello degli altri ViewModel dell'iterazione 08, confermando la generazione nella stessa sessione.

---

## Prompt 25

### Data
2026-04-29

### Strumento
Claude Code

### Obiettivo
Aggiungere autenticazione dipendente con username invece di email

### Prompt
> "Cambia il meccanismo di login per i dipendenti: invece di usare l'email (che può non essere nota all'azienda), usa uno username scelto dall'admin. Aggiungi il campo `Username` (nullable string) al modello `User`. Crea la migrazione `AddUsernameToUser` con un indice univoco filtrato su `(CompanyId, Username) WHERE Username IS NOT NULL` in modo che: due dipendenti della stessa azienda non possano avere lo stesso username, ma utenti senza username (admin) non violino il vincolo. Aggiorna `AuthController`: se il body contiene `Username` cerca per `(CompanyId, Username)`, altrimenti cerca per `Email`. Aggiorna `LoginViewModel` mobile per inviare username."

### Output utile
`User.cs` aggiornato (+1 campo `Username`), `TurnifyDbContext.cs` con indice filtrato (`.HasFilter("`Username` IS NOT NULL")`), migrazione `AddUsernameToUser`, `AuthController.cs` e `UsersController.cs` aggiornati, `LoginViewModel.cs` aggiornato.

### Decisione presa
Accettato integralmente

### Motivazione
La scelta specifica di `HasFilter` con sintassi MySQL backtick (`` `Username` IS NOT NULL ``) invece della sintassi generica indica conoscenza del provider Pomelo MySQL: coerente con il resto del `TurnifyDbContext` che usa la stessa sintassi per tutti i filtri.

---

## Prompt 26

### Data
2026-04-30

### Strumento
Claude Code

### Obiettivo
Coprire con test automatici tutti i casi backend-testabili presenti in `docs/test-matrix.md`

### Prompt
> "Fai in modo che tutti i test documentati su `test-matrix.md` siano testabili dai test automatici di `Turnify.Tests`. Per ogni caso con esito ⬜ che sia backend-testabile (endpoint HTTP reale, validatore FluentValidation, logica controller), genera un test di integrazione in `WebApplicationFactory` con `AuthenticateAs`, `SeedAsync`/`GetDb`, e asserzione `FluentAssertions`. Usa DB in-memory isolato per classe. Escludi i casi che richiedono test UI su dispositivo fisico."

### Output utile
4 nuovi file di integration test creati: `AttendanceControllerIntegrationTests.cs` (9 test: ATT-01..07, EDGE-02, EDGE-09), `VacationRequestsControllerIntegrationTests.cs` (11 test: VAC-01..10, EDGE-05), `EmployeesControllerIntegrationTests.cs` (10 test: EMP-04, EMP-06 e correlati), `ErrorLogsControllerIntegrationTests.cs` (7 test: ERR-01..03, EDGE-07). `AuthControllerIntegrationTests.cs` esteso con 8 test aggiuntivi (AUTH-04, AUTH-05, AUTH-07, AUTH-08, REG-04..07). `ShiftsControllerIntegrationTests.cs` esteso con 9 test aggiuntivi (SHIFT-03..07, SHIFT-10..11, EDGE-04, EDGE-06). `test-matrix.md` aggiornato con esiti 🔁 per tutti i casi coperti.

### Decisione presa
Accettato integralmente

### Motivazione
Ogni test è stato scritto dopo lettura diretta del controller (per il comportamento reale) e del validator FluentValidation (per i tipi DTO effettivi). Casi apparentemente validabili dal validator ma vincolati a inline controller logic (VAC-03 TotalDays=0, VAC-05 Reason>500) sono stati esclusi perché il controller usa `CreateVacationRequestInput` (tipo inline) invece di `CreateVacationRequest` (DTO validato da FluentValidation).

---

## Prompt 27

### Data
2026-04-29

### Strumento
Claude Code

### Obiettivo
Generare `docs/demo-script.md` — script eseguibile 10-12 min basato esclusivamente su funzionalità reali del progetto

### Prompt
> "Genera `docs/demo-script.md` basandoti SOLO sulle funzionalità reali del progetto. Formato obbligatorio: durata prevista, obiettivo, sequenza in 7 sezioni (introduzione, specifica iniziale, architettura, uso AI, demo app, testing, conclusione). La demo app deve seguire ONLY il flusso reale sull'app Android. Non inventare feature non presenti."

### Output utile
`docs/demo-script.md` creato (~200 righe). Flusso demo reale: GDPR consent → login admin → dashboard (approvazione ferie) → calendario (crea turno con RepeatWeeks=2) → crea dipendente con username → logout → login dipendente → check-in → richiesta ferie → export CSV. Limiti reali documentati: refresh token `NotImplementedException`, FCM `GetDeviceTokenAsync` sempre null, ManageDataPage XAML mancante, pin scadenza 2027-04-28. Uso AI documentato tramite pattern osservabili: (8 modelli in 1 aggiornamento), (7 XAML in 1 aggiornamento), pattern 4-catch uniforme. Note pre-demo incluse (health check, account pre-creati).

### Decisione presa
Accettato integralmente

### Motivazione
Ogni passo del flusso demo corrisponde a endpoint e ViewModel reali letti nel codice. I limiti citati sono rilevati direttamente da `AuthService` (`NotImplementedException`), `MobilePushService` (`return null`), e `AppShell.RegisterAllRoutes` (ManageDataPage registrata senza XAML).



---

## Prompt 28

### Data
2026-04-30

### Strumento
Claude Code

### Obiettivo
Applicare il redesign premium delle pagine XAML .NET MAUI da un bundle HTML/XAML generato con Claude Design

### Prompt
> "Fetch design bundle da URL Anthropic Design (`F3NkaCxRJxfXSspcKIBtNA`, file `Turnify Redesign.html`), leggi il README del bundle, converti il design da HTML a XAML applicabile in .NET MAUI e applica le nuove pagine. Operare sul branch `develop`."

### Output utile
Bundle decompresso (tar.gz, 415KB). Estratti: `Colors.xaml` (nuovo design system v2), 22 pagine XAML ridisegnate. Palette: `Navy #0F1629`, `Primary #3B5BDB` (accent indigo), `Background #EDEAE5`. Font: Plus Jakarta Sans (5 weight: Regular/Medium/SemiBold/Bold/ExtraBold), alias `PJSReg`/`PJSMed`/`PJSSemi`/`PJSBold`/`PJSXBold`. Stili globali: `PrimaryButton`, `OutlineButton`, `DangerButton`, `FieldBorder`, `FieldEntry`, `CardBorder`, `SectionLabel`, `HeadingLabel`. File copiati: `Resources/Styles/Colors.xaml` + 22 `Views/*.xaml`. `MauiProgram.cs` aggiornato con 5 `AddFont`. Commit su branch `develop`: `02faa41`.

### Decisione presa
Accettato integralmente

### Motivazione
I file XAML nel bundle erano già pronti per .NET MAUI (generati dall'AI design tool con binding e struttura compatibile). Sostituzione diretta senza riscrittura manuale. Nessuna modifica ai code-behind `.xaml.cs` richiesta.

---

## Prompt 29

### Data
2026-04-30

### Strumento
Claude Code

### Obiettivo
Implementare i task dell'iterazione 10: pattern UX add-card nelle liste, endpoint report ore dipendenti con breakdown, calendario avanzato con 3 viste (Employee/Week/Day)

### Prompt
> "Implementa `it-10.md`: (1) `BusinessListPage` e `EmployeeListPage` — rimuovi bottoni creazione esistenti, aggiungi card tratteggiata in fondo lista con `CreateBusinessCommand`/`CreateEmployeeCommand`; (2) backend `GET /api/reports/employee-hours?from&to&groupBy=week|month&employeeId` con DTO `EmployeeHoursReportDto`+`HoursBreakdownDto`, logica su `Shift.StartTime`/`EndTime`; mobile `EmployeeReportsPage` + `EmployeeReportsViewModel` con filtri date/groupBy, accesso da `ProfilePage` admin; (3) `ShiftCalendarViewModel` — enum `CalendarViewMode`, `SelectedViewMode`, `ChangeViewModeCommand`, `BuildWeekSlots`/`BuildDaySlots`, classe `TimeSlot`; `ShiftCalendarPage` — switch 3 pulsanti, Week View griglia oraria, Day View lista verticale."

### Output utile
Task 1: rimosso header button da `BusinessListPage`, rimosso FAB da `EmployeeListPage`, aggiunte card tratteggiate con `StrokeDashArray="6,4"` tramite `CollectionView.Footer`, comandi `CreateBusinessCommand`/`CreateEmployeeCommand`. Task 2: `EmployeeHoursReportDto.cs` (2 classi), endpoint `employee-hours` in `ReportsController` (~55 righe), `EmployeeReportsViewModel.cs` (~80 righe), `EmployeeReportsPage.xaml` (~130 righe), voce in `ProfilePage`, `GoToEmployeeReportsCommand` in `ProfileViewModel`, route+DI registrati. Task 3: enum `CalendarViewMode`, 8 nuove proprietà+comandi in `ShiftCalendarViewModel`, classi `TimeSlot`, `BuildWeekSlots`/`BuildDaySlots`; switch UI + Week View + Day View in `ShiftCalendarPage.xaml` (~120 righe aggiunte).

### Decisione presa
Accettato integralmente

### Motivazione
Ogni task segue i pattern MVVM già presenti nel progetto (RelayCommand, ObservableCollection, zero logica nel code-behind). Il footer CollectionView è il pattern MAUI standard per aggiungere elementi fissi in fondo a una lista. I view mode sono pilotati da binding booleani derivati dall'enum, compatibili con DataTrigger XAML.

---

## Prompt 30

### Data
2026-04-30

### Strumento
Claude Code

### Obiettivo
Diagnosticare e correggere il crash all'avvio dell'app Android

### Prompt
> "L'app crasha all'avvio. Analisi logcat Android: `XamlParseException: StaticResource not found for key White` in `App.InitializeComponent`. Individuare la chiave mancante e ripristinare la compilabilità."

### Output utile
Identificati due problemi distinti: (1) `ManageDataPage.xaml` mancante — esisteva solo il code-behind `.cs`, causando fallimento della `partial class`; creato file XAML shell e aggiunto al DI container in `MauiProgram.cs`. (2) `Styles.xaml` (default MAUI template) referenziava 16 chiavi colore (`White`, `Black`, `Gray100`–`Gray950`, `Magenta`, `MidnightBlue`, `OffBlack`, `PrimaryDark`, `PrimaryDarkText`, `Secondary`) rimosse quando `Colors.xaml` fu riscritto con il Design System v2; aggiunte tutte le chiavi mancanti come blocco separato in `Colors.xaml`. Build pulito, 0 errori.

### Decisione presa
Accettato integralmente

### Motivazione
La causa reale del crash era il blocco (2): confermato da logcat con stack trace esplicito `StaticResource not found for key White` in `App.InitializeComponent` → `ResourceDictionary.SetAndCreateSource`. Le chiavi aggiunte sono alias neutri che non interferiscono con il Design System v2 già in uso.

---

## Prompt 31

### Data
2026-05-01

### Strumento
Claude Code

### Obiettivo
Implementare l'iterazione 11 completa: gap architetturali e funzionali post-audit MVVM

### Prompt
> "Vai, fai tutto ciò che c'è nella iterazione 11, aggiorna plan.md." — Implementare i 7 deliverable: (1) refresh token automatico in `AuthDelegatingHandler` con `SemaphoreSlim` e retry su 401; (2) UI approvazione ferie (già presente: `VacationListPage` con SwipeView); (3) push notification su turni da `ShiftsController`; (4) `PreviousDayCommand`/`NextDayCommand` in `ShiftCalendarViewModel`; (5) conversione `ManageDataPage` da code-behind puro a XAML con `x:DataType="vm:GdprConsentViewModel"`; (6) `EmojiPickerViewModel` dedicato con `WeakReferenceMessenger` e record `EmojiSelectedMessage`; (7) badge "Ricorrente" + scope dialog (`?scope=single`/`?scope=following`) in `ShiftDetailPage` e relativo ViewModel.

### Output utile
File creati: `IAppNavigationService.cs`, `AppNavigationService.cs`, `Messages/EmojiSelectedMessage.cs`, `ViewModels/EmojiPickerViewModel.cs`. File modificati: `AuthDelegatingHandler.cs` (refresh token + retry), `LoginViewModel.cs`, `ProfileViewModel.cs`, `GdprConsentViewModel.cs`, `MauiProgram.cs` (registrazioni DI), `ShiftCalendarViewModel.cs` (PreviousDayCommand/NextDayCommand, rimozione WeekMode), `ShiftCalendarPage.xaml` (rimozione week view, fix button commands), `ManageDataPage.xaml` + `.xaml.cs` (conversione a XAML), `EmojiPickerPage.xaml` + `.xaml.cs` (x:DataType → EmojiPickerViewModel), `ShiftDetailViewModel.cs` (IsRecurring, scope dialog), `ShiftDetailPage.xaml` (badge ricorrente), `ShiftsController.cs` (push notification su CRUD turni), `docs/plan.md` (status → completata).

### Decisione presa
Accettato integralmente

### Motivazione
Tutti i task dell'iterazione 11 implementati in sequenza. Task 2 (UI ferie) era già presente; il resto era assente o parzialmente implementato.

---

## Prompt 32

### Data
2026-05-01

### Strumento
Claude Code

### Obiettivo
Pianificare l'iterazione 11 e preparare i documenti di piano

### Prompt
> "preparami la nuova iterazione e la nuova sezione di plan.md per apportare queste modifiche" — dopo l'analisi dei gap identificati (refresh token, UI ferie, push notification, Day View navigation, x:DataType, EmojiPickerViewModel, turni ricorrenti), creare `docs/iterations/it-11.md` con obiettivo + piano per i 7 task, e aggiungere la sezione `### Iterazione 11` in `docs/plan.md`.

### Output utile
Creato `docs/iterations/it-11.md` con 7 task dettagliati (problema, file da modificare, cosa fare). Aggiunta sezione `### Iterazione 11` in `docs/plan.md` con deliverable e Status: pianificata.

### Decisione presa
Accettato integralmente

### Motivazione
Formato corretto (Obiettivo + Piano, non retrospettiva) confermato dalla memory del progetto.

---

## Prompt 33

### Data
2026-05-01

### Strumento
Claude Code

### Obiettivo
Implementare l'iterazione 12 completa: sessione persistente, saldo ferie, onboarding via codice invito

### Prompt
> "vai fai tutto ciò che c'è nella iterazione 12, aggiorna plan.md e prompt-logs" — implementare i 3 deliverable: (1) `ISessionService`/`SessionService` per sessione persistente senza login ripetuto, verifica JWT + refresh all'avvio in `App.xaml.cs`; (2) `VacationBalanceController` con endpoint `GET /api/vacation-balance/{employeeId}` e `GET /api/vacation-balance/me`, saldo in `VacationEditPage` e `EmployeeDetailPage`; (3) modello `Invite` + `IInviteRepository` + `InviteRepository` + `InviteController` con generate/redeem/revoke, `AdminInvitesViewModel`/`AdminInvitesPage` (admin), `InviteCodeViewModel`/`InviteCodePage` (dipendente), voci in `ProfilePage`.

### Output utile
File creati: `ISessionService.cs`, `SessionService.cs`, `VacationBalanceController.cs`, `Invite.cs`, `IInviteRepository.cs`, `InviteRepository.cs`, `InviteController.cs`, `AdminInvitesViewModel.cs`, `AdminInvitesPage.xaml` + `.cs`, `InviteCodeViewModel.cs`, `InviteCodePage.xaml` + `.cs`, migrazione `20260501000000_AddPaidLeaveAndInvites.cs`. File modificati: `App.xaml.cs` (iniezione SessionService, async session check), `Employee.cs` (PaidLeaveDaysPerYear), `TurnifyDbContext.cs` (DbSet Invites), `Program.cs` (registrazione IInviteRepository), `MauiProgram.cs` (SessionService, AdminInvitesViewModel, InviteCodeViewModel, AdminInvitesPage, InviteCodePage), `VacationEditViewModel.cs` (balance loading), `VacationEditPage.xaml` (card saldo), `EmployeeDetailViewModel.cs` (balance loading), `EmployeeDetailPage.xaml` (sezione saldo), `ProfileViewModel.cs` (GoToInvitesCommand, GoToInviteCodeCommand), `ProfilePage.xaml` (voci invito admin e employee), `AppShell.xaml.cs` (route AdminInvitesPage e InviteCodePage), `OnboardingViewModel.cs` (fix IAppNavigationService).

### Decisione presa
Accettato integralmente

### Motivazione
Tutti i task dell'iterazione 12 implementati. SessionService usa decodifica JWT Base64 per check expiry senza librerie aggiuntive. Fix bonus: OnboardingViewModel ancora usava Application.Current, ora corretto.

---

## Prompt 35

### Data
2026-05-04

### Strumento
Claude Code

### Obiettivo
Bugfix deploy VPS: risoluzione errore "credenziali non valide" causato da configurazione AllowedHosts e migrazioni mancanti sul DB di produzione

### Prompt
> Diagnosi e fix di "credenziali non valide" su app mobile: (1) rimozione `LetterSpacing` non supportato su `Label` MAUI in `AdminInvitesPage.xaml`; (2) aggiunta `.Trim()` su `Email` in `LoginViewModel.LoginAsync`; (3) fix VPS: `AllowedHosts` non includeva wildcard in `appsettings.Production.json`, servizio bloccato da porta occupata da processo zombie; (4) applicazione manuale migrazioni MySQL mancanti: `AddPaidLeaveAndInvites` (tabella `Invites`, colonna `PaidLeaveDaysPerYear`), `AddShiftSwapRequests`, `AddVacationDaysAndAvatar` (colonna `AvatarEmoji` in `Users`).

### Output utile
`AdminInvitesPage.xaml` riga 67: rimossa proprietà `LetterSpacing`. `LoginViewModel.cs` riga 87: `Email.Trim()`. VPS: `appsettings.Production.json` aggiornato con `AllowedHosts: "*"`. DB: colonne e tabelle aggiunte manualmente via MySQL.

### Decisione presa
Accettato integralmente

### Motivazione
Login funzionante confermato da curl su `https://samuconfa.it/turnify/api/auth/login`.

---

## Prompt 36

### Data
2026-05-04

### Strumento
Claude Code

### Obiettivo
Implementare l'iterazione 14 completa: caching locale SQLite con pattern stale-while-revalidate su tutti i ViewModel principali, banner UI per dati non aggiornati

### Prompt
> Implementare `ICacheService` + `CacheService` (SQLite, TTL, SemaphoreSlim, System.Text.Json) e `CacheKeys.cs`. Aggiungere `IsStale`/`HasStaleWarning` a `BaseViewModel`. Applicare pattern stale-while-revalidate a `EmployeeListViewModel`, `DashboardViewModel`, `ShiftCalendarViewModel`, `ProfileViewModel`, `ShiftSwapsViewModel`. Aggiungere invalidazione cache su mutazioni in `ShiftDetailViewModel` (save/delete) e `ShiftSwapsViewModel` (respond). Aggiungere `InvalidateAllAsync` al logout in `ProfileViewModel`. Registrare `ICacheService` come Singleton in `MauiProgram.cs`. Creare componente `StaleDataBanner.xaml` (ContentView, binding `HasStaleWarning`, `RefreshCommand`). Aggiungere il banner a `DashboardPage.xaml`, `ShiftCalendarPage.xaml`, `ShiftSwapsPage.xaml`, `EmployeeListPage.xaml`, `ProfilePage.xaml`.

### Output utile
4 nuovi file: `ICacheService.cs`, `CacheService.cs`, `CacheKeys.cs`, `StaleDataBanner.xaml` + `.xaml.cs`. Modificati: `BaseViewModel.cs`, 5 ViewModel con stale-while-revalidate, `ShiftDetailViewModel.cs`, `MauiProgram.cs`, 5 XAML page con banner.

### Decisione presa
Accettato integralmente

### Motivazione
Tutti i deliverable dell'iterazione 14 implementati secondo il piano. Pattern uniforme su tutti i ViewModel interessati.

---

## Prompt 34

### Data
2026-05-01

### Strumento
Claude Code

### Obiettivo
Implementare l'iterazione 13 completa: scambio turni, copertura dashboard admin, disponibilità dipendente in calendario

### Prompt
> "fai la 13 aggiornando plan e prompt log e sincronizzando develop e main" — implementare: (1) backend `ShiftSwapRequest` model + `IShiftSwapRepository` + `ShiftSwapRepository` + `ShiftSwapsController` (GET/POST/PUT peer-accept/peer-reject/admin-approve/admin-reject) con push notification a ogni step; endpoint `GET /api/shifts/coverage` in `ShiftsController`; endpoint `GET /api/employees/{id}/availability` in `EmployeesController`; (2) mobile TASK 1: `ShiftSwapsViewModel` + `ShiftSwapsPage.xaml` (lista scambi con azioni peer/admin), `ShiftSwapRequestViewModel` + `ShiftSwapRequestPage.xaml` (form proposta), `ProposeSwapCommand` + `CanProposeSwap` in `ShiftDetailViewModel`, bottone "Proponi scambio turno" in `ShiftDetailPage.xaml`; (3) mobile TASK 2: `CoverageDay` DTO + `WeeklyCoverage` collection in `DashboardViewModel`, sezione 7-card copertura in `DashboardPage.xaml`; (4) mobile TASK 3: `ApplyAvailabilityAsync` in `ShiftCalendarViewModel` che carica availability per ogni dipendente e marca celle `IsUnavailable`, `AvailabilityDto` DTO, `IsUnavailable` in `DayCell` con colore rosso chiaro; (5) registrazione route e DI; (6) voce "Scambi turno" in `ProfilePage.xaml` per admin e dipendenti.

### Output utile
Backend (già in precedente sessione): `ShiftSwapRequest.cs`, `IShiftSwapRepository.cs`, `ShiftSwapRepository.cs`, `ShiftSwapsController.cs`, migrazione `20260501100000_AddShiftSwapRequests.cs`, `GET /api/shifts/coverage`, `GET /api/employees/{id}/availability`. Mobile: `ShiftSwapsViewModel.cs`, `ShiftSwapsPage.xaml` + `.cs`, `ShiftSwapRequestViewModel.cs` (già), `ShiftSwapRequestPage.xaml` + `.cs` (già). Modificati: `ShiftDetailViewModel.cs` (CanProposeSwap, ProposeSwapCommand), `ShiftDetailPage.xaml` (bottone scambio), `DashboardViewModel.cs` (CoverageDay, WeeklyCoverage, IsAdmin, LoadCoverageAsync), `DashboardPage.xaml` (sezione copertura settimanale), `ShiftCalendarViewModel.cs` (ApplyAvailabilityAsync, AvailabilityDto, DayCell.IsUnavailable), `MauiProgram.cs` (ShiftSwapsViewModel, ShiftSwapRequestViewModel, ShiftSwapsPage, ShiftSwapRequestPage), `AppShell.xaml.cs` (route ShiftSwapsPage e ShiftSwapRequestPage), `ProfileViewModel.cs` (GoToShiftSwapsCommand), `ProfilePage.xaml` (voci scambi turno admin e dipendente).

### Decisione presa
Accettato integralmente

### Motivazione
Tutti i deliverable dell'iterazione 13 implementati. Disponibilità calendario usa colore rosso chiaro (#FCA5A5) per celle non disponibili senza turno. Copertura dashboard caricata solo per admin tramite flag IsAdmin da Preferences.

