# Iterazione 09

## Obiettivo
Implementare:
1. login dipendente tramite username,
2. separazione chiara tra login admin e login dipendente,
3. vincolo username per azienda,
4. aggiornamento API utenti/dipendenti,
5. adeguamento UI mobile login e gestione dipendente.

---

## Regole obbligatorie (NON violare)

- admin continua a usare email
- dipendente usa username e nome azienda/slug
- username univoco solo dentro la stessa azienda
- non rendere obbligatoria email per dipendenti
- validare input lato server
- mantenere compatibilità con utenti admin esistenti
- non esporre dati di altre aziende

---

# TASK 1 - Modello e database

## File da modificare/creare
- `Turnify.Core/Models/User.cs`
- `Turnify.Infrastructure/Data/TurnifyDbContext.cs`
- migrazione `AddUsernameToUser`
- snapshot modello EF Core

## Cosa fare

1. Aggiungere `Username` nullable a `User`.
2. Creare indice univoco su `CompanyId + Username`.
3. L'indice deve ignorare username null.
4. Non rompere login admin basato su email.
5. Aggiornare configurazione EF Core.

---

# TASK 2 - Repository e service auth

## File da modificare
- `Turnify.Core/Interfaces/Repositories/IUserRepository.cs`
- `Turnify.Infrastructure/Repositories/UserRepository.cs`
- `Turnify.Core/Interfaces/Services/IAuthService.cs`
- `Turnify.Infrastructure/Services/AuthService.cs`

## Cosa fare

1. Aggiungere lookup utente per username e azienda.
2. Aggiungere metodo login dipendente.
3. Mantenere login admin separato.
4. Generare JWT con claim ruolo e azienda.
5. Restituire errore coerente se credenziali non valide.

---

# TASK 3 - API auth e utenti

## File da modificare
- `Turnify.Api/Controllers/AuthController.cs`
- `Turnify.Api/Controllers/UsersController.cs`
- `Turnify.Api/Controllers/EmployeesController.cs`
- DTO richiesti
- validator richiesti

## Cosa fare

1. Aggiungere endpoint login dipendente.
2. Accettare `companySlug`, `username`, `password`.
3. Esporre username nei DTO dipendente dove serve.
4. Validare duplicati dentro la stessa azienda.
5. Non restituire dati sensibili.

---

# TASK 4 - Mobile login dipendente

## File da modificare
- `Turnify.Mobile/Views/LoginPage.xaml`
- `Turnify.Mobile/ViewModels/LoginViewModel.cs`
- `Turnify.Mobile/Services/AuthService.cs`

## Cosa fare

1. Aggiungere switch/modalità admin-dipendente.
2. In modalità admin mostrare email/password.
3. In modalità dipendente mostrare azienda, username e password.
4. Chiamare endpoint corretto in base alla modalità.
5. Navigare alla Shell corretta in base al ruolo.
6. Mostrare messaggi errore chiari.

---

# TASK 5 - Gestione dipendente admin

## File da modificare
- `Turnify.Mobile/Views/EmployeeDetailPage.xaml`
- `Turnify.Mobile/ViewModels/EmployeeDetailViewModel.cs`
- backend dipendenti se necessario

## Cosa fare

1. Aggiungere campo username nel form dipendente.
2. Rendere username obbligatorio per account dipendente.
3. Consentire email opzionale.
4. Mostrare credenziali iniziali dopo creazione.
5. Gestire errore username duplicato.

---

# OUTPUT ATTESO

- admin accede con email
- dipendente accede con username + azienda
- username univoco per azienda
- dipendenti senza email gestiti correttamente
- JWT coerente con ruolo
- mobile passa alla Shell corretta
- validazione duplicati funzionante

---

## Nota metodologica

Al termine di questa iterazione, il prompt utilizzato per la richiesta deve essere salvato in `docs/prompt-log.md` secondo le regole di tracciabilità del progetto.
