# Iterazione 12

## Data
2026-05-01

## Obiettivo
Migliorare l'esperienza utente fondamentale: sessione persistente (nessun login ripetuto), saldo ferie residue, onboarding dipendenti via codice invito.

Questi tre task hanno in comune che richiedono modifiche sia al backend (API) che al mobile e sono prerequisiti per funzionalità più avanzate dell'iterazione 13.

---

## Regole obbligatorie (NON violare)

- NON inserire logica nei code-behind (`.xaml.cs`)
- usare solo MVVM (ViewModel + binding)
- riutilizzare componenti UI e stili esistenti (`Styles.xaml`, `Colors.xaml`)
- NON rompere funzionalità esistenti
- ogni nuovo ViewModel deve esporre `IsBusy`, `HasData`, `IsEmptyState`, `ErrorMessage`

---

# TASK 1 — Sessione Persistente (Nessun Login Ripetuto)

## Problema
Ogni volta che l'app viene riaperta mostra la schermata di login, anche se l'utente ha già effettuato l'accesso in precedenza. Il refresh token è già gestito su 401, ma all'avvio dell'app non viene verificato se esiste una sessione valida: l'utente viene sempre mandato al login.

## Comportamento atteso
- Se l'utente ha già fatto login e il refresh token è ancora valido (non scaduto), all'apertura dell'app viene portato direttamente alla schermata principale senza dover inserire le credenziali.
- Se il refresh token è scaduto o assente, viene mostrata normalmente la schermata di login.
- L'utente può sempre fare logout manualmente.

## File da modificare
- `Turnify.Mobile/AppShell.xaml.cs` — logica di avvio che decide la route iniziale
- `Turnify.Mobile/Services/SessionService.cs` (da creare) — controlla se esiste una sessione valida
- `Turnify.Mobile/MauiProgram.cs` — registrare `SessionService`

## Cosa fare

### SessionService (da creare)
```csharp
public interface ISessionService
{
    Task<bool> HasValidSessionAsync();
    Task<string?> TryRestoreTokenAsync(); // tenta refresh se access token scaduto
}
```
- `HasValidSessionAsync()`:
  1. Legge `jwt_token` da `SecureStorage`; se assente → false
  2. Decodifica il JWT (senza validazione firma — solo Base64 del payload) per leggere `exp`
  3. Se `exp` > now + 30s → true (token ancora valido)
  4. Altrimenti tenta `TryRestoreTokenAsync()` → POST `/api/auth/refresh` con `refresh_token`
  5. Se rinnovo OK → salva nuovi token → true; altrimenti → false
- `TryRestoreTokenAsync()`: stesso flow di `AuthDelegatingHandler.TryRefreshAsync`, estratto in un service condiviso per evitare duplicazione

### AppShell — avvio
- In `CreateShell()` / costruttore, prima di impostare la route iniziale:
  1. Chiamare `ISessionService.HasValidSessionAsync()`
  2. Se true: leggere `user_role` da `SecureStorage`, chiamare `IAppNavigationService.NavigateToShellAsync(isAdmin, "Main")`
  3. Se false: route iniziale = `"Login"`

### Preferenze utente
- Il flag `has_valid_session` in `Preferences` diventa secondario — la fonte di verità è `SecureStorage` + `SessionService`
- `ClearSession()` in `AuthDelegatingHandler` deve continuare a pulire tutto

## Note
- Non usare biometria (troppo complesso, non richiesto)
- La decodifica del JWT lato client è solo per leggere la scadenza, non per validare la firma

---

# TASK 2 — Saldo Ferie Residue

## Problema
`VacationRequest` registra le richieste ma non esiste un calcolo del saldo ore/giorni disponibili per dipendente. Il dipendente non sa quante ferie ha ancora e l'admin non può pianificare consapevolmente.

## Comportamento atteso
- In `VacationEditPage` (quando il dipendente crea una richiesta): mostrare il saldo residuo della categoria scelta (es. "Hai ancora 8 giorni di ferie disponibili")
- In `EmployeeDetailPage` (lato admin): mostrare il saldo residuo per categoria

## Lato backend

### File da creare
- `Turnify.Api/Controllers/VacationBalanceController.cs`

### Endpoint
```
GET /api/vacation-balance/{employeeId}
```
Risposta:
```json
{
  "holiday":    { "total": 26, "used": 10, "remaining": 16 },
  "paidLeave":  { "total": 8,  "used": 3,  "remaining": 5  },
  "sickLeave":  { "total": 0,  "used": 2,  "remaining": 0  }
}
```
- `total`: ore/giorni annui configurati sull'`Employee` (campo da aggiungere: `HolidayDaysPerYear`, `PaidLeaveDaysPerYear`)
- `used`: somma dei giorni delle `VacationRequest` con stato `Approved` nell'anno corrente per quella categoria
- `remaining`: `total - used`, floor a 0

### Modello da modificare
- `Turnify.Core/Models/Employee.cs`: aggiungere `int HolidayDaysPerYear = 26`, `int PaidLeaveDaysPerYear = 8`
- `Turnify.Infrastructure/Migrations`: aggiungere migration per i nuovi campi

## Lato mobile

### File da creare
- `Turnify.Mobile/Services/VacationBalanceService.cs`

### File da modificare
- `Turnify.Mobile/ViewModels/VacationEditViewModel.cs` — caricare e mostrare il saldo
- `Turnify.Mobile/Views/VacationEditPage.xaml` — sezione saldo visibile
- `Turnify.Mobile/ViewModels/EmployeeDetailViewModel.cs` — caricare saldo dipendente
- `Turnify.Mobile/Views/EmployeeDetailPage.xaml` — sezione saldo visibile (solo admin)

### UI VacationEditPage
- Dopo la selezione del tipo richiesta: card compatta con saldo residuo
  - Es.: `"🏖️ Ferie — 16 giorni rimanenti su 26"`
- Se saldo = 0: label warning "Saldo esaurito — la richiesta verrà comunque inoltrata"

---

# TASK 3 — Onboarding Dipendenti via Codice Invito

## Problema
Non esiste un flusso per aggiungere un dipendente a un'azienda. Attualmente l'admin deve creare manualmente l'account del dipendente, il che richiede accesso al database o a un pannello non mobile.

## Comportamento atteso
- L'admin genera un codice invito dalla app (es. `TURN-X7K2`)
- Il dipendente installa l'app, si registra normalmente, poi inserisce il codice invito nella schermata di onboarding
- Il codice associa il dipendente all'azienda dell'admin

## Lato backend

### File da creare
- `Turnify.Api/Controllers/InviteController.cs`
- `Turnify.Core/Models/Invite.cs`
- `Turnify.Infrastructure/Repositories/InviteRepository.cs`

### Modello `Invite`
```csharp
public class Invite
{
    public int Id { get; set; }
    public string Code { get; set; }         // es. "TURN-X7K2"
    public int CompanyId { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime ExpiresAt { get; set; }  // 7 giorni
    public bool IsUsed { get; set; }
    public int? UsedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### Endpoint
```
POST /api/invites            → genera codice (admin only)
GET  /api/invites            → lista codici attivi (admin only)
POST /api/invites/redeem     → riscatta codice { "code": "TURN-X7K2" } (utente autenticato non ancora associato)
DELETE /api/invites/{id}     → revoca codice (admin only)
```
- La generazione produce un codice alfanumerico di 8 caratteri (es. `TURN-X7K2`)
- `POST /api/invites/redeem` crea un record `Employee` associando `UserId` all'azienda del codice invito, poi marca il codice come usato

## Lato mobile

### File da creare
- `Turnify.Mobile/Views/InviteCodePage.xaml` + `.xaml.cs`
- `Turnify.Mobile/ViewModels/InviteCodeViewModel.cs`
- `Turnify.Mobile/Views/AdminInvitesPage.xaml` + `.xaml.cs`
- `Turnify.Mobile/ViewModels/AdminInvitesViewModel.cs`

### Flusso dipendente
- Dopo la registrazione, `OnboardingPage` mostra un campo "Hai un codice invito?" con pulsante "Inserisci codice"
- `InviteCodePage`: campo testo (maiuscolo automatico), pulsante "Attiva" → chiama `POST /api/invites/redeem` → se OK naviga a Main

### Flusso admin
- In `ProfilePage` o `TeamPage`: pulsante "Invita dipendente"
- `AdminInvitesPage`: lista codici attivi con data scadenza, pulsante "Genera nuovo codice", pulsante "Revoca" su ogni codice
- Tappando un codice: mostra dialog con il codice da condividere (e pulsante "Copia")

---

# OUTPUT ATTESO

- All'apertura dell'app, se la sessione è valida, l'utente accede direttamente alla schermata principale senza inserire credenziali
- Il dipendente vede il saldo ferie residuo prima di inviare una richiesta
- L'admin vede il saldo ferie di ogni dipendente nella scheda dettaglio
- L'admin può generare e revocare codici invito dalla app
- Il dipendente può associarsi a un'azienda inserendo il codice ricevuto dall'admin
- Tutto compilabile, zero logica nei code-behind, `x:DataType` su ogni nuova View
