# Iterazione 03

## Obiettivo
Implementare:
1. API utente e profilo,
2. gestione dipendenti per admin,
3. gestione attività/orari,
4. dashboard mobile con dati reali,
5. flusso mobile ferie completo,
6. routing Shell coerente per ruoli e pagine admin.

---

## Regole obbligatorie (NON violare)

- NON usare dati fake dove esiste un endpoint reale
- mantenere API multi-azienda tramite `CompanyId`
- validare ruolo e appartenenza aziendale lato server
- usare ViewModel per navigazione e stato UI
- non mettere logica nei code-behind
- gestire loading, error e empty state
- mantenere compatibilità Android nel layout MAUI

---

# TASK 1 - API profilo utente

## File da creare/modificare
- `Turnify.Api/Controllers/UsersController.cs`
- `Turnify.Api/Program.cs`
- `Turnify.Infrastructure/Repositories/UserRepository.cs`
- DTO necessari

## Cosa fare

1. Aggiungere endpoint `GET /api/users/me`.
2. Aggiungere endpoint cambio password.
3. Restituire solo dati dell'utente autenticato.
4. Non esporre hash password o dati sensibili.
5. Usare claims JWT per identificare utente e azienda.

---

# TASK 2 - Gestione dipendenti

## File da creare/modificare
- `Turnify.Api/Controllers/EmployeesController.cs`
- `Turnify.Core/Interfaces/Repositories/IEmployeeRepository.cs`
- `Turnify.Infrastructure/Repositories/EmployeeRepository.cs`
- `Turnify.Mobile/Views/EmployeeListPage.xaml`
- `Turnify.Mobile/Views/EmployeeDetailPage.xaml`
- `Turnify.Mobile/ViewModels/EmployeeListViewModel.cs`
- `Turnify.Mobile/ViewModels/EmployeeDetailViewModel.cs`

## Cosa fare

1. Implementare CRUD dipendenti lato API.
2. Filtrare sempre per azienda dell'utente autenticato.
3. Creare lista dipendenti mobile per admin.
4. Creare pagina dettaglio/creazione dipendente.
5. Gestire salvataggio, modifica e cancellazione.
6. Mostrare errori API in modo leggibile.

---

# TASK 3 - Attività e orari

## File da creare/modificare
- `Turnify.Core/Models/Business.cs`
- `Turnify.Api/Controllers/BusinessesController.cs`
- `Turnify.Infrastructure/Data/TurnifyDbContext.cs`
- `Turnify.Infrastructure/Repositories/BusinessRepository.cs`
- `Turnify.Mobile/Views/BusinessListPage.xaml`
- `Turnify.Mobile/Views/BusinessDetailPage.xaml`
- `Turnify.Mobile/Views/BusinessOpeningHoursPage.xaml`
- relativi ViewModel

## Cosa fare

1. Aggiungere modello attività/sede.
2. Collegare attività ad azienda.
3. Gestire orari di apertura e chiusura.
4. Esporre CRUD attività via API.
5. Aggiungere pagine mobile per lista, dettaglio e orari.

---

# TASK 4 - Dashboard e profilo con dati reali

## File da modificare
- `Turnify.Api/Controllers/DashboardController.cs`
- `Turnify.Infrastructure/Services/DashboardService.cs`
- `Turnify.Mobile/ViewModels/DashboardViewModel.cs`
- `Turnify.Mobile/ViewModels/ProfileViewModel.cs`
- `Turnify.Mobile/Views/DashboardPage.xaml`
- `Turnify.Mobile/Views/ProfilePage.xaml`

## Cosa fare

1. Sostituire dati statici con chiamate API.
2. Mostrare riepilogo turni, ferie e dipendenti.
3. Caricare profilo da `/api/users/me`.
4. Aggiungere stato vuoto quando non ci sono dati.
5. Gestire errori HTTP in modo coerente.

---

# TASK 5 - Ferie mobile complete

## File da modificare/creare
- `Turnify.Api/Controllers/VacationRequestsController.cs`
- `Turnify.Infrastructure/Services/VacationService.cs`
- `Turnify.Infrastructure/Repositories/VacationRepository.cs`
- `Turnify.Mobile/Views/VacationListPage.xaml`
- `Turnify.Mobile/Views/VacationEditPage.xaml`
- `Turnify.Mobile/ViewModels/VacationListViewModel.cs`
- `Turnify.Mobile/ViewModels/VacationEditViewModel.cs`

## Cosa fare

1. Supportare tipi ferie/permesso/malattia.
2. Aggiungere filtro per stato.
3. Consentire creazione richiesta ferie da mobile.
4. Consentire approvazione/rifiuto lato admin.
5. Validare date inizio/fine.
6. Aggiornare calendario e liste dopo modifiche.

---

# TASK 6 - Routing Shell e compatibilità Android

## File da modificare
- `Turnify.Mobile/AppShell.xaml`
- `Turnify.Mobile/AppShell.xaml.cs`
- `Turnify.Mobile/MauiProgram.cs`
- `Turnify.Mobile/Views/RegisterPage.xaml`
- `Turnify.Mobile/ViewModels/LoginViewModel.cs`

## Cosa fare

1. Registrare tutte le nuove route.
2. Reinizializzare Shell quando cambia ruolo.
3. Evitare tab admin visibili ai dipendenti.
4. Correggere layout che bloccano input su Android.
5. Aggiungere `AuthDelegatingHandler` per JWT automatico.

---

# OUTPUT ATTESO

- API admin complete per utenti, dipendenti, attività e ferie
- mobile admin collegato a dati reali
- ferie richiedibili e approvabili
- profilo e dashboard funzionanti
- navigazione coerente per ruolo
- nessuna logica significativa nei code-behind

---

## Nota metodologica

Al termine di questa iterazione, il prompt utilizzato per la richiesta deve essere salvato in `docs/prompt-log.md` secondo le regole di tracciabilità del progetto.
