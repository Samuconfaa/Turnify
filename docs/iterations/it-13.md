# Iterazione 13

## Data
2026-05-01

## Obiettivo
Pianificazione avanzata: scambio turni tra dipendenti, dashboard admin con copertura settimanale, disponibilità dipendenti visibile nel calendario turni.

Questi task costruiscono sopra le fondamenta dell'iterazione 12 e riguardano principalmente l'esperienza di pianificazione per l'admin e l'autonomia del dipendente.

---

## Regole obbligatorie (NON violare)

- NON inserire logica nei code-behind (`.xaml.cs`)
- usare solo MVVM (ViewModel + binding)
- riutilizzare componenti UI e stili esistenti (`Styles.xaml`, `Colors.xaml`)
- NON rompere funzionalità esistenti
- ogni nuovo ViewModel deve esporre `IsBusy`, `HasData`, `IsEmptyState`, `ErrorMessage`

---

# TASK 1 — Scambio Turni tra Dipendenti

## Problema
Non esiste un flusso per cui un dipendente proponga di scambiare il proprio turno con un collega. L'unica opzione attuale è chiedere verbalmente all'admin di spostare i turni manualmente.

## Comportamento atteso
- Il dipendente apre un suo turno e vede il pulsante "Proponi scambio"
- Sceglie il collega con cui scambiare e invia la proposta
- Il collega riceve una notifica push e può accettare o rifiutare dalla app
- L'admin vede tutte le proposte pendenti e può approvare o bloccare lo scambio
- Solo dopo l'approvazione admin i turni vengono effettivamente scambiati

## Lato backend

### File da creare
- `Turnify.Core/Models/ShiftSwapRequest.cs`
- `Turnify.Api/Controllers/ShiftSwapsController.cs`
- `Turnify.Infrastructure/Repositories/ShiftSwapRepository.cs`

### Modello `ShiftSwapRequest`
```csharp
public class ShiftSwapRequest
{
    public int Id { get; set; }
    public int RequestingEmployeeId { get; set; }  // chi propone
    public int RequestedEmployeeId { get; set; }   // con chi vuole scambiare
    public int ShiftAId { get; set; }              // turno del richiedente
    public int ShiftBId { get; set; }              // turno del collega
    public SwapStatus Status { get; set; }         // Pending, AcceptedByPeer, RejectedByPeer, ApprovedByAdmin, RejectedByAdmin, Executed
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
// Enum SwapStatus va in Enums.cs
```

### Endpoint
```
POST   /api/shift-swaps                         → crea proposta (dipendente)
GET    /api/shift-swaps                         → lista richieste (admin: tutte; dipendente: sue)
PUT    /api/shift-swaps/{id}/peer-accept        → il collega accetta
PUT    /api/shift-swaps/{id}/peer-reject        → il collega rifiuta
PUT    /api/shift-swaps/{id}/admin-approve      → admin approva (esegue swap: scambia StartTime/EndTime)
PUT    /api/shift-swaps/{id}/admin-reject       → admin rifiuta
```
- `admin-approve` scambia `EmployeeId` tra i due turni (non le date: ciascuno prende il turno dell'altro)
- Invia push a entrambi i dipendenti al cambio di stato

## Lato mobile

### File da creare
- `Turnify.Mobile/Views/ShiftSwapRequestPage.xaml` + `.xaml.cs`
- `Turnify.Mobile/ViewModels/ShiftSwapRequestViewModel.cs`
- `Turnify.Mobile/Views/ShiftSwapsPage.xaml` + `.xaml.cs`
- `Turnify.Mobile/ViewModels/ShiftSwapsViewModel.cs`

### File da modificare
- `Turnify.Mobile/Views/ShiftDetailPage.xaml` — aggiungere pulsante "Proponi scambio" (visibile solo se `IsEmployee && IsEditMode`)
- `Turnify.Mobile/ViewModels/ShiftDetailViewModel.cs` — aggiungere `ProposeSwapCommand`

### Flusso dipendente (richiedente)
- `ShiftSwapRequestPage`: lista dei colleghi disponibili (Picker), mostra i loro turni nella stessa settimana (lista), conferma
- Dopo invio: messaggio di conferma, torna al calendario

### Flusso dipendente (collega invitato)
- Notifica push: "Scambio turno proposto da [Nome]"
- In `ShiftSwapsPage` (tab Notifiche o sezione dedicata): lista proposte ricevute con pulsanti "Accetta" / "Rifiuta"

### Flusso admin
- `ShiftSwapsPage` (solo admin): lista tutte le proposte accettate dal collega e in attesa di approvazione admin
- Per ogni proposta: dettaglio turni coinvolti, pulsanti "Approva" / "Blocca"

---

# TASK 2 — Dashboard Admin: Copertura Settimanale

## Problema
La dashboard admin mostra statistiche generiche. L'admin non ha una vista immediata di quali fasce orarie della settimana corrente sono scoperte (nessun dipendente assegnato).

## Comportamento atteso
- Una sezione "Copertura questa settimana" nella `DashboardPage` mostra, per ogni giorno della settimana, se la copertura è completa, parziale o assente
- Tappando un giorno scoperto, si apre `ShiftCalendarPage` filtrata su quel giorno

## Lato backend

### Endpoint (nuovo o da estendere)
```
GET /api/shifts/coverage?from={date}&to={date}
```
Risposta per ogni giorno nel range:
```json
[
  { "date": "2026-05-04", "totalShifts": 3, "coverageStatus": "Full" },
  { "date": "2026-05-05", "totalShifts": 0, "coverageStatus": "Empty" },
  { "date": "2026-05-06", "totalShifts": 1, "coverageStatus": "Partial" }
]
```
- `Full` = almeno N turni (configurabile, default: stessa media dei 4 lunedì precedenti)
- `Partial` = almeno 1 turno ma sotto la media
- `Empty` = 0 turni

## Lato mobile

### File da modificare
- `Turnify.Mobile/ViewModels/DashboardViewModel.cs` — aggiungere `LoadCoverageCommand`, `WeeklyCoverage: ObservableCollection<DayCoverageDto>`
- `Turnify.Mobile/Views/DashboardPage.xaml` — sezione copertura settimana (solo admin)

### UI
- 7 card orizzontali (una per giorno): nome giorno + indicatore colorato
  - Verde (`Success`) = Full
  - Arancione (`Warning`) = Partial
  - Rosso (`Error`) = Empty
- Tap su card → naviga a `ShiftCalendarPage` con `SelectedDate` impostata su quel giorno

---

# TASK 3 — Disponibilità Dipendente Visibile nel Calendario

## Problema
I dipendenti impostano la propria disponibilità settimanale in `AvailabilityPage`, ma questa informazione non è visibile all'admin quando pianifica i turni nel calendario. L'admin assegna turni senza sapere se il dipendente è disponibile in quella fascia.

## Comportamento atteso
- Nella vista "Per dipendente" del `ShiftCalendarPage`, quando l'admin seleziona un dipendente, le fasce orarie in cui il dipendente è disponibile sono evidenziate con un colore di sfondo tenue
- Le fasce in cui non è disponibile mostrano un'icona di avvertimento se l'admin tenta di creare un turno

## Lato backend

### Endpoint (nuovo)
```
GET /api/employees/{id}/availability
```
Risposta: disponibilità settimanale (già esiste il modello `Availability` — verificare)
```json
[
  { "dayOfWeek": 1, "startTime": "08:00", "endTime": "18:00" },
  { "dayOfWeek": 3, "startTime": "09:00", "endTime": "13:00" }
]
```

## Lato mobile

### File da modificare
- `Turnify.Mobile/ViewModels/ShiftCalendarViewModel.cs`
  - Aggiungere `EmployeeAvailability: ObservableCollection<AvailabilitySlot>`
  - Quando `SelectedEmployeeId` cambia: caricare disponibilità via `GET /api/employees/{id}/availability`
- `Turnify.Mobile/Views/ShiftCalendarPage.xaml`
  - Nella vista per dipendente: aggiungere overlay/indicatore di disponibilità sulle fasce orarie

### Modello lato mobile
```csharp
public class AvailabilitySlot
{
    public DayOfWeek Day { get; set; }
    public TimeSpan Start { get; set; }
    public TimeSpan End { get; set; }
    public bool IsAvailable { get; set; }
}
```

### UI
- Fascia disponibile: sfondo `#F0FDF4` (verde tenue) con label "✓ Disponibile"
- Fascia non disponibile: sfondo neutro, nessun indicatore (comportamento attuale)
- Se l'admin crea un turno in una fascia di non disponibilità: `DisplayAlert` "Attenzione: il dipendente non ha dichiarato disponibilità in questo orario. Vuoi continuare?" con opzioni "Sì" / "Annulla"

---

# PREREQUISITI (da iterazione 12)

- `SessionService` funzionante (sessione persistente)
- Codice invito funzionante (il dipendente è già associato all'azienda prima di usare il calendario)

---

# OUTPUT ATTESO

- I dipendenti possono proporre e gestire scambi turno dalla app
- L'admin vede in un colpo d'occhio quali giorni della settimana sono scoperti
- L'admin vede la disponibilità del dipendente mentre pianifica i turni
- Notifiche push inviate a tutti gli attori coinvolti nel flusso swap
- Tutto compilabile, zero logica nei code-behind, `x:DataType` su ogni nuova View

---

# File creati/modificati

**Creati:**
- `src/Turnify.Core/Models/ShiftSwapRequest.cs`
- `src/Turnify.Core/Models/Enums.cs` (SwapStatus enum aggiunto)
- `src/Turnify.Core/Interfaces/Repositories/IShiftSwapRepository.cs`
- `src/Turnify.Infrastructure/Repositories/ShiftSwapRepository.cs`
- `src/Turnify.Infrastructure/Migrations/20260501100000_AddShiftSwapRequests.cs`
- `src/Turnify.Api/Controllers/ShiftSwapsController.cs`
- `src/Turnify.Mobile/ViewModels/ShiftSwapsViewModel.cs`
- `src/Turnify.Mobile/Views/ShiftSwapsPage.xaml` + `.cs`
- `src/Turnify.Mobile/ViewModels/ShiftSwapRequestViewModel.cs`
- `src/Turnify.Mobile/Views/ShiftSwapRequestPage.xaml` + `.cs`

**Modificati:**
- `src/Turnify.Api/Controllers/ShiftsController.cs` — `GET /api/shifts/coverage`
- `src/Turnify.Api/Controllers/EmployeesController.cs` — `GET /api/employees/{id}/availability`
- `src/Turnify.Infrastructure/Data/TurnifyDbContext.cs` — DbSet ShiftSwapRequests
- `src/Turnify.Api/Program.cs` — DI ShiftSwapRepository
- `src/Turnify.Mobile/ViewModels/ShiftDetailViewModel.cs` — CanProposeSwap, ProposeSwapCommand
- `src/Turnify.Mobile/Views/ShiftDetailPage.xaml` — bottone "Proponi scambio"
- `src/Turnify.Mobile/ViewModels/DashboardViewModel.cs` — CoverageDay, WeeklyCoverage, IsAdmin, LoadCoverageAsync
- `src/Turnify.Mobile/Views/DashboardPage.xaml` — sezione copertura settimanale
- `src/Turnify.Mobile/ViewModels/ShiftCalendarViewModel.cs` — ApplyAvailabilityAsync, AvailabilityDto, DayCell.IsUnavailable
- `src/Turnify.Mobile/ViewModels/ProfileViewModel.cs` — GoToShiftSwapsCommand
- `src/Turnify.Mobile/Views/ProfilePage.xaml` — voci "Scambi turno" admin e dipendente
- `src/Turnify.Mobile/MauiProgram.cs` — registrazione VM e pagine swap
- `src/Turnify.Mobile/AppShell.xaml.cs` — route ShiftSwapsPage e ShiftSwapRequestPage
