# Iterazione 10

## Obiettivo
Implementare:
1. nuovo pattern UX per aggiunta elementi in liste (attività e team),
2. sistema completo di report ore per dipendente,
3. estensione avanzata del calendario con viste multiple e gestione copertura turni.

---

## Regole obbligatorie (NON violare)

- NON inserire logica nei code-behind (`.xaml.cs`)
- usare solo MVVM (ViewModel + binding)
- riutilizzare componenti UI esistenti dove possibile
- mantenere stile coerente con `Styles.xaml` e `Colors.xaml`
- NON rompere funzionalità esistenti

---

# TASK 1 — UX Liste (Attività e Team)

## File da modificare
- Turnify.Mobile/Views/BusinessListPage.xaml
- Turnify.Mobile/Views/EmployeeListPage.xaml

## Cosa fare

1. Rimuovere eventuali bottoni “+” o elementi UI esistenti per creazione.

2. Aggiungere in fondo alla lista una nuova card cliccabile con queste caratteristiche:
   - stessa altezza e larghezza delle card esistenti
   - sfondo: grigio chiaro
   - bordo: tratteggiato, colore più scuro
   - angoli arrotondati uguali alle altre card

3. Contenuto:
   - BusinessListPage → "Aggiungi un'attività"
   - EmployeeListPage → "Aggiungi un utente"

4. Comportamento:
   - binding a comando nel ViewModel
   - navigazione:
     - attività → BusinessDetailPage
     - utente → EmployeeDetailPage

## File ViewModel da modificare
- BusinessListViewModel.cs
- EmployeeListViewModel.cs

## Aggiungere:
- comando:
  - `CreateBusinessCommand`
  - `CreateEmployeeCommand`

---

# TASK 2 — Report Ore Dipendenti (Backend + Mobile)

## Backend

### File da modificare
- Turnify.Api/Controllers/ReportsController.cs

### Aggiungere endpoint:

GET /api/reports/employee-hours

### Parametri:
- from (DateTime)
- to (DateTime)
- groupBy = "week" | "month"
- employeeId (opzionale)

---

### Creare DTO

Turnify.Api/DTOs/EmployeeHoursReportDto.cs

Struttura:

- EmployeeId
- EmployeeName
- TotalHours
- List<Breakdown>

Breakdown:
- Period (string)
- Hours (double)

---

### Logica:
- usare dati da Shift
- considerare solo turni validi
- calcolare ore = EndTime - StartTime
- raggruppare:
  - week → per settimana
  - month → per mese

---

## Mobile

### Creare file:

- Turnify.Mobile/Views/EmployeeReportsPage.xaml
- Turnify.Mobile/ViewModels/EmployeeReportsViewModel.cs

---

### ViewModel deve avere:

- lista report
- filtro date (From / To)
- filtro groupBy (week/month)
- comando:
  - LoadReportsCommand

---

### UI deve mostrare:

Per ogni dipendente:
- nome
- totale ore
- lista breakdown (espandibile)

---

### Navigazione

Modificare:
- ProfilePage.xaml

Aggiungere accesso a:
- EmployeeReportsPage (solo admin)

---

# TASK 3 — Calendario Avanzato

## NON rompere calendario esistente

---

## File da modificare

- ShiftCalendarViewModel.cs
- ShiftCalendarPage.xaml

---

## Aggiungere enum:

```csharp
public enum CalendarViewMode
{
    Employee,
    Week,
    Day
}
```

---

## ViewModel

Aggiungere:

- SelectedViewMode
- SelectedDate
- comando:
  - ChangeViewModeCommand

---

## Logica calendario

### Per Week e Day:

1. Recuperare:
- orari attività (Business)

2. Generare slot orari (es: ogni ora)

3. Per ogni slot:
- se fuori orario → stato "Chiuso"
- se dentro:
  - lista dipendenti assegnati

---

## STRUTTURA DATI OBBLIGATORIA

Usare:

- Slot:
  - Time
  - List<Employee>

---

## UI

### Aggiungere switch vista:
- Employee / Week / Day

---

### Week View:
- griglia giorni × ore
- ogni cella:
  - lista dipendenti
  - evidenziazione copertura

---

### Day View:
- lista verticale
- ogni riga:
  - orario
  - dipendenti assegnati

---

## Migliorie UI
- aumentare dimensione calendario
- migliorare padding e spacing

---

# OUTPUT ATTESO

- codice compilabile
- nessun warning
- nessuna logica nei code-behind
- navigazione funzionante
- UI coerente con design esistente

---


# IMPORTANTE

Se una parte non è chiara:
- NON inventare
- riutilizzare pattern già presenti nel progetto

---

## Nota metodologica

Al termine di questa iterazione, il prompt utilizzato per la richiesta deve essere salvato in `docs/prompt-log.md` secondo le regole di tracciabilità del progetto.
