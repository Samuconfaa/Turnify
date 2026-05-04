# Iterazione 05

## Obiettivo
Implementare:
1. redesign completo dell'interfaccia mobile,
2. timbratura presenze,
3. disponibilità dipendenti,
4. turni ricorrenti,
5. allineamento MVVM e correzioni architetturali,
6. test automatici aggiuntivi.

---

## Regole obbligatorie (NON violare)

- NON inserire logica nei code-behind
- usare solo binding, command e ViewModel
- mantenere design system centralizzato in `Colors.xaml` e `Styles.xaml`
- garantire UI usabile su schermi piccoli
- gestire errori HTTP con messaggi chiari
- non rompere login e navigazione esistenti
- mantenere test backend compilabili

---

# TASK 1 - Redesign UI mobile

## File da modificare
- `Turnify.Mobile/Resources/Styles/Colors.xaml`
- `Turnify.Mobile/Resources/Styles/Styles.xaml`
- `Turnify.Mobile/Views/LoginPage.xaml`
- `Turnify.Mobile/Views/DashboardPage.xaml`
- `Turnify.Mobile/Views/ShiftCalendarPage.xaml`
- `Turnify.Mobile/Views/VacationListPage.xaml`
- `Turnify.Mobile/Views/NotificationsPage.xaml`
- `Turnify.Mobile/Views/ProfilePage.xaml`

## Cosa fare

1. Applicare palette coerente e moderna.
2. Uniformare card, bottoni, label e spacing.
3. Evitare colori hardcoded ripetuti.
4. Rendere pagine principali leggibili su Android.
5. Aggiungere `ScrollView` dove il contenuto può superare lo schermo.

---

# TASK 2 - Timbratura presenze

## Backend

### File da creare/modificare
- `Turnify.Core/Models/AttendanceLog.cs`
- `Turnify.Core/Interfaces/Repositories/IAttendanceRepository.cs`
- `Turnify.Infrastructure/Repositories/AttendanceRepository.cs`
- `Turnify.Api/Controllers/AttendanceController.cs`
- `Turnify.Api/Program.cs`

### Cosa fare

1. Aggiungere endpoint check-in.
2. Aggiungere endpoint check-out.
3. Impedire doppio check-in aperto nello stesso giorno.
4. Salvare timestamp UTC.
5. Restituire stato presenza del giorno.

## Mobile

### File da modificare/creare
- `Turnify.Mobile/Views/EmployeeDashboardPage.xaml`
- `Turnify.Mobile/ViewModels/EmployeeDashboardViewModel.cs`

### Cosa fare

1. Mostrare stato entrata/uscita.
2. Collegare pulsante check-in/check-out.
3. Convertire orari UTC in orario locale.
4. Gestire conflitto e rete assente.

---

# TASK 3 - Disponibilità dipendenti

## File da creare/modificare
- `Turnify.Mobile/Views/AvailabilityPage.xaml`
- `Turnify.Mobile/ViewModels/AvailabilityViewModel.cs`
- modello/migrazione per giorni disponibili

## Cosa fare

1. Consentire al dipendente di indicare giorni disponibili.
2. Salvare disponibilità nel backend.
3. Mostrare stato salvato/errore.
4. Non mescolare disponibilità con logica turni nel code-behind.

---

# TASK 4 - Turni ricorrenti

## File da modificare
- `Turnify.Mobile/ViewModels/ShiftCalendarViewModel.cs`
- `Turnify.Mobile/Views/ShiftDetailPage.xaml`
- `Turnify.Api/DTOs/CreateRecurringShiftsRequest.cs`
- `Turnify.Api/Validators/CreateRecurringShiftsRequestValidator.cs`
- `Turnify.Infrastructure/Services/ShiftService.cs`

## Cosa fare

1. Aggiungere campo `RepeatWeeks`.
2. Generare copie settimanali del turno.
3. Mantenere turno originale e copie distinguibili.
4. Gestire conflitti senza bloccare tutto il batch.
5. Validare input lato API.

---

# TASK 5 - Allineamento MVVM e error handling

## File da modificare
- ViewModel mobile principali
- code-behind delle pagine principali
- `Turnify.Mobile/Services/AuthDelegatingHandler.cs`

## Cosa fare

1. Spostare logica residua dai code-behind ai ViewModel.
2. Standardizzare `IsBusy`, `ErrorMessage`, `HasError`.
3. Migliorare gestione 401, 409, 429 e timeout.
4. Evitare duplicazioni grossolane.
5. Mantenere navigazione nel ViewModel.

---

# TASK 6 - Test automatici

## File da creare/modificare
- `Turnify.Tests/Services/VacationServiceTests.cs`
- `Turnify.Tests/Services/ShiftServiceTests.cs`
- test repository se necessari

## Cosa fare

1. Coprire regole ferie.
2. Coprire ricorrenza turni.
3. Coprire casi di errore principali.
4. Mantenere build senza warning.

---

# OUTPUT ATTESO

- UI mobile coerente e più rifinita
- check-in/check-out funzionante
- disponibilità dipendenti salvabile
- turni ricorrenti generabili
- MVVM rispettato
- test aggiuntivi presenti
- layout login usabile su schermi piccoli

---

## Nota metodologica

Al termine di questa iterazione, il prompt utilizzato per la richiesta deve essere salvato in `docs/prompt-log.md` secondo le regole di tracciabilità del progetto.
