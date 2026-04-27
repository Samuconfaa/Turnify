# Iterazione 01

## Obiettivo
Implementare:
1. struttura iniziale della soluzione Turnify,
2. dominio applicativo condiviso,
3. backend core con database MySQL,
4. autenticazione JWT,
5. primi endpoint per turni e ferie.

---

## Regole obbligatorie (NON violare)

- mantenere separazione tra `Turnify.Core`, `Turnify.Infrastructure` e `Turnify.Api`
- NON inserire logica di business nei controller
- usare repository e service dedicati
- usare DTO per input/output API
- non salvare credenziali reali nei file di configurazione
- usare metodi asincroni per accesso dati e servizi
- mantenere naming coerente con il progetto

---

# TASK 1 - Soluzione multi-progetto

## File/aree da creare
- `src/Turnify.slnx`
- `src/Turnify.Core`
- `src/Turnify.Infrastructure`
- `src/Turnify.Api`
- `src/Turnify.Mobile`
- `src/Turnify.Tests`

## Cosa fare

1. Creare la solution .NET con progetti separati.
2. Impostare i riferimenti:
   - `Turnify.Api` dipende da `Turnify.Core` e `Turnify.Infrastructure`
   - `Turnify.Infrastructure` dipende da `Turnify.Core`
   - `Turnify.Tests` può testare API, Core e Infrastructure
3. Lasciare `Turnify.Core` senza dipendenze esterne non necessarie.

---

# TASK 2 - Modelli di dominio

## File da creare
- `Turnify.Core/Models/User.cs`
- `Turnify.Core/Models/Company.cs`
- `Turnify.Core/Models/Employee.cs`
- `Turnify.Core/Models/Shift.cs`
- `Turnify.Core/Models/VacationRequest.cs`
- `Turnify.Core/Models/AttendanceLog.cs`
- `Turnify.Core/Models/Notification.cs`
- `Turnify.Core/Models/Enums.cs`

## Cosa fare

1. Definire le entità principali per aziende, utenti, dipendenti, turni, ferie, presenze e notifiche.
2. Aggiungere proprietà di audit dove utili (`CreatedAt`, `UpdatedAt`).
3. Definire enum per ruoli, stato ferie, tipo ferie, tipo contratto e stato turno.
4. Preparare i modelli per EF Core senza introdurre logica UI o API.

---

# TASK 3 - Interfacce Core

## File da creare
- `Turnify.Core/Interfaces/Repositories/IUserRepository.cs`
- `Turnify.Core/Interfaces/Repositories/ICompanyRepository.cs`
- `Turnify.Core/Interfaces/Repositories/IShiftRepository.cs`
- `Turnify.Core/Interfaces/Repositories/IVacationRepository.cs`
- `Turnify.Core/Interfaces/Services/IAuthService.cs`
- `Turnify.Core/Interfaces/Services/IShiftService.cs`
- `Turnify.Core/Interfaces/Services/IVacationService.cs`
- `Turnify.Core/Interfaces/Services/INotificationService.cs`

## Cosa fare

1. Esporre contratti asincroni con `CancellationToken`.
2. Usare nomi espliciti e metodi coerenti (`GetByIdAsync`, `CreateAsync`, `UpdateAsync`, `DeleteAsync`).
3. Separare repository da service.
4. Non far dipendere le interfacce da ASP.NET Core.

---

# TASK 4 - Database e Infrastructure

## File da creare/modificare
- `Turnify.Infrastructure/Data/TurnifyDbContext.cs`
- `Turnify.Infrastructure/Data/TurnifyDbContextDesignTimeFactory.cs`
- `Turnify.Infrastructure/Repositories/*Repository.cs`
- `Turnify.Infrastructure/Services/AuthService.cs`
- `Turnify.Infrastructure/Services/ShiftService.cs`
- `Turnify.Infrastructure/Services/VacationService.cs`
- migrazioni EF Core iniziali

## Cosa fare

1. Configurare EF Core con provider MySQL/Pomelo.
2. Aggiungere `DbSet` per tutte le entità principali.
3. Configurare relazioni, indici e vincoli minimi.
4. Implementare repository concreti.
5. Implementare service senza conoscere HTTP.

---

# TASK 5 - API core

## File da creare/modificare
- `Turnify.Api/Program.cs`
- `Turnify.Api/Controllers/AuthController.cs`
- `Turnify.Api/Controllers/ShiftsController.cs`
- `Turnify.Api/Controllers/VacationRequestsController.cs`
- `Turnify.Api/DTOs/*`
- `Turnify.Api/appsettings.json`

## Cosa fare

1. Registrare DbContext, repository e service nel container DI.
2. Configurare JWT Bearer.
3. Aggiungere endpoint:
   - health check
   - registrazione/login
   - CRUD turni
   - creazione e consultazione richieste ferie
4. Usare DTO e risposte HTTP coerenti.
5. Attivare Swagger solo in development.

---

# OUTPUT ATTESO

- soluzione compilabile
- struttura backend pulita
- dominio riutilizzabile dal mobile
- database configurato
- autenticazione JWT funzionante
- endpoint base disponibili
- nessun segreto reale nel repository

---

## Nota metodologica

Al termine di questa iterazione, il prompt utilizzato per la richiesta deve essere salvato in `docs/prompt-log.md` secondo le regole di tracciabilità del progetto.
