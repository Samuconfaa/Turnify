# Iterazione 07

## Obiettivo
Implementare:
1. readiness produzione lato API,
2. reportistica CSV,
3. ruolo dipendente completo,
4. dashboard dipendente,
5. storico presenze,
6. email reset password,
7. rate limiting e gestione errori HTTP più chiara.

---

## Regole obbligatorie (NON violare)

- proteggere endpoint sensibili con autorizzazione
- separare flussi admin e dipendente
- generare CSV dal backend senza logica client duplicata
- usare rate limit per endpoint sensibili
- non esporre stack trace in produzione
- mantenere ViewModel mobile senza logica nei code-behind
- gestire sessione scaduta e troppi tentativi

---

# TASK 1 - Reportistica CSV

## File da modificare/creare
- `Turnify.Api/Controllers/ReportsController.cs`
- DTO/report helpers se necessari
- `Turnify.Mobile/Views/ReportsPage.xaml`
- `Turnify.Mobile/ViewModels/ReportsViewModel.cs`

## Cosa fare

1. Aggiungere endpoint CSV ore pianificate.
2. Aggiungere endpoint CSV presenze.
3. Accettare intervallo `from`/`to`.
4. Restituire intestazione anche se non ci sono dati.
5. Scaricare file da mobile e condividerlo tramite API di sistema.
6. Validare date lato client e lato server.

---

# TASK 2 - Ruolo dipendente e dashboard

## File da modificare/creare
- `Turnify.Mobile/Views/EmployeeDashboardPage.xaml`
- `Turnify.Mobile/ViewModels/EmployeeDashboardViewModel.cs`
- `Turnify.Mobile/AppShell.xaml`
- `Turnify.Mobile/AppShell.xaml.cs`
- endpoint backend necessari

## Cosa fare

1. Separare tab admin e tab dipendente.
2. Mostrare dashboard dipendente con turno del giorno e stato presenza.
3. Consentire check-in/check-out da dashboard dipendente.
4. Impedire accesso a pagine admin ai dipendenti.
5. Gestire reload corretto dopo login/logout.

---

# TASK 3 - Storico presenze

## File da modificare/creare
- `Turnify.Api/Controllers/AttendanceController.cs`
- `Turnify.Mobile/Views/AttendanceHistoryPage.xaml`
- `Turnify.Mobile/ViewModels/AttendanceHistoryViewModel.cs`

## Cosa fare

1. Esporre storico presenze del dipendente autenticato.
2. Filtrare per mese/intervallo.
3. Convertire timestamp UTC in orario locale nel mobile.
4. Mostrare durata turno.
5. Gestire lista vuota.

---

# TASK 4 - Reset password via email

## File da modificare/creare
- `Turnify.Core/Interfaces/Services/IEmailService.cs`
- `Turnify.Infrastructure/Services/SmtpEmailService.cs`
- `Turnify.Api/Controllers/AuthController.cs`
- `Turnify.Mobile/Views/ForgotPasswordPage.xaml`
- `Turnify.Mobile/ViewModels/ForgotPasswordViewModel.cs`

## Cosa fare

1. Aggiungere richiesta reset password.
2. Generare token sicuro e scadenza.
3. Inviare email tramite servizio SMTP.
4. Non rivelare se una email esiste.
5. Collegare pagina mobile forgot password.

---

# TASK 5 - Rate limiting e errori HTTP

## File da modificare
- `Turnify.Api/Program.cs`
- `Turnify.Api/Controllers/AuthController.cs`
- ViewModel mobile principali
- `Turnify.Mobile/Services/AuthDelegatingHandler.cs`

## Cosa fare

1. Applicare rate limit per-IP su auth e error logs.
2. Restituire 409 per email admin duplicata.
3. Mostrare loading visibile durante login.
4. Gestire 429 con messaggio dedicato.
5. Gestire 401 riportando l'utente al login.

---

# OUTPUT ATTESO

- report CSV scaricabili
- dashboard dipendente completa
- storico presenze consultabile
- reset password predisposto
- rate limit efficace
- errori HTTP più chiari nel mobile
- ruoli admin/dipendente separati

---

## Nota metodologica

Al termine di questa iterazione, il prompt utilizzato per la richiesta deve essere salvato in `docs/prompt-log.md` secondo le regole di tracciabilità del progetto.
