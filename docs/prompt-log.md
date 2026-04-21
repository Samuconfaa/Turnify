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

