# Iterazione 11

## Data
2026-05-01

## Obiettivo
Correggere i gap architetturali e funzionali emersi dall'audit del progetto:
1. refresh token automatico su 401 (sessione persistente),
2. UI approvazione ferie lato admin,
3. push notification sui cambi turno,
4. navigazione Day View corretta (giorno per giorno),
5. verifica e fix `x:DataType` su tutte le View,
6. ViewModel dedicato per EmojiPickerPage,
7. gestione turni ricorrenti nella ShiftDetailPage (modifica singolo vs tutti).

---

## Regole obbligatorie (NON violare)

- NON inserire logica nei code-behind (`.xaml.cs`)
- usare solo MVVM (ViewModel + binding)
- riutilizzare componenti UI e stili esistenti (`Styles.xaml`, `Colors.xaml`)
- NON rompere funzionalità esistenti
- ogni nuovo ViewModel deve esporre `IsBusy`, `HasData`, `IsEmptyState`, `ErrorMessage`

---

# TASK 1 — Refresh Token Automatico

## Problema
`AuthDelegatingHandler` inietta il JWT ma non gestisce la scadenza: su 401 l'app mostra un errore invece di rinnovare silenziosamente la sessione.

## File da modificare
- `Turnify.Mobile/Services/AuthDelegatingHandler.cs`

## File da creare
- nessuno (la logica di refresh è già nell'`AuthService` backend)

## Cosa fare

1. In `SendAsync`, intercettare la risposta 401.
2. Tentare il rinnovo chiamando `POST /api/auth/refresh` con il refresh token da `SecureStorage` (`refresh_token`).
3. Se il rinnovo ha successo:
   - salvare il nuovo access token in `SecureStorage` (`jwt_token`)
   - salvare il nuovo refresh token in `SecureStorage` (`refresh_token`)
   - ripetere la richiesta originale con il nuovo token
4. Se il rinnovo fallisce (401/403):
   - cancellare i token da `SecureStorage` e `Preferences`
   - reindirizzare al login tramite `IAppNavigationService.NavigateToShellAsync(false, "Login")`
5. Usare un flag booleano per evitare loop di refresh (`_isRefreshing`).

## DTO necessario
```csharp
// risposta di /api/auth/refresh
{ accessToken: string, refreshToken: string }
```

---

# TASK 2 — Approvazione Ferie Lato Admin (Mobile)

## Problema
Il backend gestisce il flusso approvazione/rifiuto ma non esiste una UI mobile per l'admin.

## File da creare
- `Turnify.Mobile/Views/VacationApprovalsPage.xaml`
- `Turnify.Mobile/Views/VacationApprovalsPage.xaml.cs`
- `Turnify.Mobile/ViewModels/VacationApprovalsViewModel.cs`

## File da modificare
- `Turnify.Mobile/AppShell.xaml.cs` — registrare la route
- `Turnify.Mobile/MauiProgram.cs` — registrare ViewModel e Page
- `Turnify.Mobile/Views/DashboardPage.xaml` — aggiungere accesso rapido (solo admin)
- `Turnify.Mobile/ViewModels/DashboardViewModel.cs` — aggiungere comando navigazione

## Cosa fare

### ViewModel
- `LoadApprovalsCommand`: carica `GET /api/vacation-requests?status=Pending`
- `ApproveCommand(int id)`: chiama `PUT /api/vacation-requests/{id}/approve`
- `RejectCommand(int id)`: chiama `PUT /api/vacation-requests/{id}/reject` con motivo opzionale
- Lista `PendingRequests: ObservableCollection<VacationRequestDto>`
- Proprietà di stato: `IsBusy`, `HasData`, `IsEmptyState`, `ErrorMessage`

### UI
- Lista richieste pendenti: nome dipendente, tipo (ferie/permesso), date, note
- Per ogni elemento: pulsante "Approva" (verde) e "Rifiuta" (rosso)
- Empty state se nessuna richiesta pendente
- Refresh via `RefreshView`

---

# TASK 3 — Push Notification su Cambi Turno

## Problema
FCM è integrato ma il backend non invia push quando un admin crea/modifica/elimina un turno.

## File da modificare
- `Turnify.Api/Controllers/ShiftsController.cs` — aggiungere invio push su POST, PUT, DELETE
- `Turnify.Infrastructure/Services/FcmPushNotificationService.cs` — verificare metodo `SendToUserAsync(int userId, string title, string body)`

## Cosa fare

1. In `ShiftsController`, dopo ogni operazione su turno che va a buon fine:
   - recuperare `employeeId` del turno
   - chiamare `INotificationService.SendToUserAsync(employeeId, title, body)` con messaggi appropriati:
     - creazione → "Nuovo turno assegnato" / "Hai un nuovo turno il {data}"
     - modifica → "Turno aggiornato" / "Il tuo turno del {data} è stato modificato"
     - eliminazione → "Turno rimosso" / "Il turno del {data} è stato cancellato"
2. Gestire il caso in cui il dipendente non abbia device token registrato (non è un errore bloccante).
3. NON bloccare la risposta HTTP in attesa dell'esito push (fire-and-forget accettabile solo qui, con log dell'eventuale errore).

---

# TASK 4 — Navigazione Day View Corretta

## Problema
I pulsanti `‹` e `›` nella Day View usano `PreviousWeekCommand`/`NextWeekCommand` che spostano la settimana intera invece del singolo giorno.

## File da modificare
- `Turnify.Mobile/ViewModels/ShiftCalendarViewModel.cs`
- `Turnify.Mobile/Views/ShiftCalendarPage.xaml`

## Cosa fare

### ViewModel
- Aggiungere `PreviousDayCommand`: `SelectedDate = SelectedDate.AddDays(-1)` → ricostruire `DaySlots`
- Aggiungere `NextDayCommand`: `SelectedDate = SelectedDate.AddDays(1)` → ricostruire `DaySlots`
- `BuildDaySlots` deve usare `SelectedDate` (già lo fa) e ricaricare quando `SelectedDate` cambia

### XAML — Day View
- Sostituire `Command="{Binding PreviousWeekCommand}"` con `Command="{Binding PreviousDayCommand}"`
- Sostituire `Command="{Binding NextWeekCommand}"` con `Command="{Binding NextDayCommand}"`

---

# TASK 5 — Verifica e Fix `x:DataType` su Tutte le View

## Problema
La Definition of Done richiede `x:DataType` su ogni View XAML per binding type-safe a compile-time. Alcune pagine aggiunte nelle ultime iterazioni potrebbero non averlo.

## Cosa fare

1. Verificare ogni file `.xaml` in `Turnify.Mobile/Views/`:
   - se manca `x:DataType` nella `ContentPage`, aggiungerlo puntando al ViewModel corretto
   - se manca nei `DataTemplate` interni, aggiungerlo al tipo del modello corretto
2. Correggere eventuali binding non risolti a compile-time.

## Pagine da verificare prioritariamente
- `EmployeeReportsPage.xaml`
- `ManageDataPage.xaml`
- `VacationApprovalsPage.xaml` (nuova)
- `EmojiPickerPage.xaml`
- `AvailabilityPage.xaml`

---

# TASK 6 — ViewModel Dedicato per EmojiPickerPage

## Problema
`EmojiPickerPage` non ha un ViewModel dedicato: riceve il ViewModel del profilo passato lateralmente, violando MVVM.

## File da creare
- `Turnify.Mobile/ViewModels/EmojiPickerViewModel.cs`

## File da modificare
- `Turnify.Mobile/Views/EmojiPickerPage.xaml`
- `Turnify.Mobile/Views/EmojiPickerPage.xaml.cs`
- `Turnify.Mobile/MauiProgram.cs`
- `Turnify.Mobile/ViewModels/ProfileViewModel.cs` — rimuovere proprietà `AvailableEmojis` e `SelectedEmoji` se migrate

## Cosa fare

### EmojiPickerViewModel
- `AvailableEmojis`: array delle emoji disponibili (spostato da ProfileViewModel)
- `SelectedEmoji`: proprietà bindabile
- `ConfirmCommand`: salva l'emoji selezionata tramite `Preferences` e torna indietro con `Shell.Current.GoToAsync("..")`
- Comunicazione verso ProfileViewModel tramite `WeakReferenceMessenger` (CommunityToolkit) con un messaggio `EmojiSelectedMessage`

### ProfileViewModel
- Rimuovere `AvailableEmojis` e `SelectedEmoji`
- Registrarsi al messaggio `EmojiSelectedMessage` e chiamare `SetEmoji(emoji)` alla ricezione

---

# TASK 7 — Gestione Turni Ricorrenti in ShiftDetailPage

## Problema
Il backend supporta turni ricorrenti ma la UI non distingue turno singolo da ricorrente e non offre la scelta "modifica solo questo / modifica tutti i successivi".

## File da modificare
- `Turnify.Mobile/ViewModels/ShiftDetailViewModel.cs`
- `Turnify.Mobile/Views/ShiftDetailPage.xaml`

## File da modificare lato backend (se necessario)
- `Turnify.Api/Controllers/ShiftsController.cs` — verificare se PUT accetta parametro `scope=single|following`

## Cosa fare

### ViewModel
- Aggiungere proprietà `IsRecurring` (bool, caricata dal DTO turno)
- In `SaveCommand`, se `IsRecurring == true`, mostrare `DisplayActionSheetAsync` con opzioni:
  - "Solo questo turno"
  - "Questo e tutti i successivi"
- Passare la scelta come parametro alla chiamata API (es. query param `?scope=single` o `?scope=following`)

### XAML
- Aggiungere badge/label "Turno ricorrente" visibile solo se `IsRecurring == true`
- Nessuna modifica strutturale al layout

---

# OUTPUT ATTESO

- codice compilabile senza warning
- nessuna logica nei code-behind
- ogni nuova View con `x:DataType` corretto
- sessione persistente anche dopo scadenza token
- admin può approvare/rifiutare ferie da mobile
- dipendenti ricevono push su cambi turno
- Day View naviga giorno per giorno
- EmojiPickerPage isolata e indipendente
