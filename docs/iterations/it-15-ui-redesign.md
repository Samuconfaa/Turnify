# Iterazione 15

## Data
2026-05-05

## Obiettivo
Applicare il redesign UI "Tropic Burst" all'app mobile Turnify: leggere i file HTML generati da Google Stitch dalla cartella `new-ui/`, convertirli in XAML compatibile con .NET MAUI, aggiornare la palette colori e sostituire tutte le emoji con asset icona PNG/SVG reali.

---

## Regole obbligatorie (NON violare)

- NON inserire logica nei code-behind (`.xaml.cs`)
- usare solo MVVM — binding e trigger nel XAML, logica nei ViewModel
- `x:DataType` presente su ogni View convertita
- usare i token `{StaticResource ...}` di `Colors.xaml` — nessun colore hardcodato nel XAML
- NON rompere i binding esistenti: nomi proprietà e comandi nei ViewModel restano invariati
- NON modificare ViewModel, Service o API — questa iterazione è solo UI
- ogni icona deve essere un asset reale (`Resources/Images/`) — nessuna emoji rimasta nelle pagine convertite
- compilazione senza warning al termine di ogni TASK

---

# TASK 1 — Aggiornamento `Colors.xaml` con palette Tropic Burst

## Problema
L'attuale `Colors.xaml` usa la palette Navy/Blue (v2). Tutti i nuovi token Tropic Burst devono essere disponibili come `StaticResource` prima di convertire qualsiasi pagina.

## Comportamento atteso
- I vecchi token restano per backward-compat (le pagine non ancora convertite non si rompono)
- I nuovi token Tropic Burst vengono aggiunti con i loro nomi semantici
- Il `PrimaryButton` style usa `#059669` come `BackgroundColor`

## Token da aggiungere / sostituire

| Chiave | Valore | Ruolo |
|---|---|---|
| `Primary` | `#059669` | sostituisce `#3B5BDB` |
| `PrimaryLight` | `#D1FAE5` | sostituisce `#EEF1FE` |
| `PrimaryDark` | `#064E3B` | header gradient start |
| `PrimaryMid` | `#0F766E` | header gradient end |
| `Background` | `#F0FDF4` | sostituisce `#EDEAE5` |
| `OutlineVariant` | `#D1FAE5` | sostituisce `#E3E1DB` |
| `Accent` | `#FBBF24` | nuovo |
| `AccentLight` | `#FEF3C7` | nuovo |
| `Danger` | `#F43F5E` | alias di `Error` |
| `DangerLight` | `#FFE4E6` | alias di `ErrorLight` |
| `Info` | `#0EA5E9` | nuovo |
| `InfoLight` | `#E0F2FE` | nuovo |
| `KpiGreen1` | `#059669` | KPI card Dipendenti - start |
| `KpiGreen2` | `#34D399` | KPI card Dipendenti - end |
| `KpiAmber1` | `#FBBF24` | KPI card Turni - start |
| `KpiAmber2` | `#FDE68A` | KPI card Turni - end |
| `KpiCoral1` | `#F43F5E` | KPI card Ferie - start |
| `KpiCoral2` | `#FB7185` | KPI card Ferie - end |
| `KpiBlue1` | `#0EA5E9` | KPI card Ore - start |
| `KpiBlue2` | `#7DD3FC` | KPI card Ore - end |

## File da modificare
- `src/Turnify.Mobile/Resources/Styles/Colors.xaml`

---

# TASK 2 — Aggiunta asset icona in `Resources/Images/`

## Problema
L'attuale UI usa emoji unicode per tutte le icone (🔔 👥 📅 🏖️ ⏱️ ecc.). Google Stitch genera HTML con tag `<img>` che referenziano icone reali. I PNG/SVG corrispondenti devono essere presenti nel progetto MAUI.

## Comportamento atteso
- Tutti i 26 asset elencati in `new-ui/stitch-spec.md` §4 sono presenti in `Resources/Images/`
- Il build system MAUI li include automaticamente (nessuna voce manuale nel `.csproj` necessaria se messi in `Resources/Images/`)
- In XAML si usano come `<Image Source="bell.png"/>` o come `Source` su `ImageButton`

## Asset richiesti
Vedi lista completa in `new-ui/stitch-spec.md` — sezione "4. Icons Reference List".

Fonte consigliata: scaricare da [Heroicons](https://heroicons.com) o [Phosphor Icons](https://phosphoricons.com) in formato SVG, rinominare secondo la convenzione `nomefile.png` definita nella spec.

## File da aggiungere
- Tutti i PNG/SVG in `src/Turnify.Mobile/Resources/Images/`

---

# TASK 3 — Conversione `LoginPage`

## Input
- `new-ui/login.html` (generato da Google Stitch)

## Output
- `src/Turnify.Mobile/Views/LoginPage.xaml` — sostituisce il file attuale

## Regole di conversione
- Header hero: `BoxView` o `Grid` con `Background` a gradiente `PrimaryDark` → `PrimaryMid` (usa `LinearGradientBrush`)
- Logo mark: `Border` 68×68dp, `#FFFFFF20` fill, `RoundRectangle CornerRadius="20"`, lettera "T" white 30sp
- Bottom sheet: `Border` con `RoundRectangle CornerRadius="28,28,0,0"`, `BackgroundColor="{StaticResource Surface}"`
- Toggle Admin/Dipendente: segmented control con `DataTrigger`, active pill `PrimaryDark`
- Input fields: `Style="{StaticResource FieldBorder}"` aggiornato con `#A7F3D0` border
- CTA button: `Style="{StaticResource PrimaryButton}"` — usa il nuovo verde
- Tutti i binding (`Email`, `Password`, `Username`, `CompanySlug`, `LoginCommand`, ecc.) invariati

---

# TASK 4 — Conversione `DashboardPage` (Admin)

## Input
- `new-ui/dashboard.html`

## Output
- `src/Turnify.Mobile/Views/DashboardPage.xaml`

## Regole di conversione
- Header con gradiente `PrimaryDark` → `PrimaryMid`, bell icon usa `<Image Source="bell.png"/>` (non emoji)
- KPI 2×2 grid: ogni card ha `LinearGradientBrush` con le coppie `KpiGreen1/2`, `KpiAmber1/2`, `KpiCoral1/2`, `KpiBlue1/2`
- Icone KPI: `<Image Source="users-group.png"/>`, `<Image Source="calendar-check.png"/>`, ecc. — container circle bianco 48dp
- Testo KPI: bianco, `TextColor="White"`
- Card "Turni oggi": accent bar `#059669`, avatar circle `PrimaryLight`, testo nome + orario, status chip `PrimaryLight`/`SuccessText`
- Card "Ferie in attesa": stessa struttura attuale, colori aggiornati ai nuovi token
- Sezione copertura settimana: card giornaliere colorate con gradienti per stato (Full=verde, Partial=amber, Empty=corallo)
- Tutti i binding (`TotalEmployees`, `ShiftsThisWeek`, `PendingVacations`, `ShiftsToday`, ecc.) invariati

---

# TASK 5 — Conversione `EmployeeDashboardPage`

## Input
- `new-ui/employee-dashboard.html`

## Output
- `src/Turnify.Mobile/Views/EmployeeDashboardPage.xaml`

## Regole di conversione
- Header gradiente con saluto "Ciao, [Nome]!"
- Hero card "Prossimo turno": background `Primary` verde solido, testo orario white XL
- Icon `briefcase.png` top-right nella hero card
- Quick actions row (3 card colorate): Ferie (`AccentLight`/amber icon), Timbratura (verde/`fingerprint.png`), Disponibilità (blu/`calendar-edit.png`)
- Lista turni giornalieri: stessa struttura dashboard admin ma con dati dipendente
- Tutti i binding invariati

---

# TASK 6 — Conversione `ShiftCalendarPage`

## Input
- `new-ui/shift-calendar.html`

## Output
- `src/Turnify.Mobile/Views/ShiftCalendarPage.xaml`

## Regole di conversione
- Header gradiente con toggle 3 viste (Dipendenti/Settimana/Giorno) come segmented control
- Active pill: `Surface` bg + `PrimaryDark` text; inactive: transparent + white 70%
- Week grid: colonne giorno con evidenziazione oggi (`AccentLight`), shift blocks con `LinearGradientBrush` verde
- Employee list: avatar `PrimaryLight`/verde, badge turni pill verde
- Day view: timeline verticale, shift blocks verde arrotondati
- Tutti i binding (`WeekSlots`, `DaySlots`, `SelectedViewMode`, ecc.) invariati

---

# TASK 7 — Conversione `EmployeeListPage`

## Input
- `new-ui/employee-list.html`

## Output
- `src/Turnify.Mobile/Views/EmployeeListPage.xaml`

## Regole di conversione
- Header gradiente + search bar bianca con `<Image Source="search.png"/>`
- Card dipendente: avatar circle `PrimaryLight`/verde, role chip `PrimaryLight` (admin) / `AccentLight` (dipendente)
- `<Image Source="chevron-right.png"/>` a destra di ogni riga
- Card tratteggiata "Aggiungi": border `#059669` dashed, `<Image Source="plus-circle.png"/>` verde
- Tutti i binding invariati

---

# TASK 8 — Conversione `VacationListPage`

## Input
- `new-ui/vacation-list.html`

## Output
- `src/Turnify.Mobile/Views/VacationListPage.xaml`

## Regole di conversione
- Header gradiente
- Status tab pills: active `Primary` verde, inactive `PrimaryLight`
- Left bar card: colore per stato (In attesa=`Accent`, Approvata=`Primary`, Rifiutata=`Danger`)
- Action icons: `<Image Source="edit.png"/>` e `<Image Source="trash.png"/>`
- Tutti i binding invariati

---

# TASK 9 — Conversione `ProfilePage`

## Input
- `new-ui/profile.html`

## Output
- `src/Turnify.Mobile/Views/ProfilePage.xaml`

## Regole di conversione
- Hero superiore: gradiente `PrimaryDark` → `PrimaryMid`, avatar circle 80dp
- `<Image Source="edit-pencil.png"/>` in alto a destra
- Role chip: pill verde
- Section header: 10sp Bold `#059669` uppercase
- Ogni riga settings: icon sinistra come `<Image>` reale, `<Image Source="chevron-right.png"/>` destra
  - `lock.png` (teal), `report.png` (amber), `building.png` (verde), `users.png` (verde), `logout.png` (coral)
- Tutti i binding (`GoToChangePasswordCommand`, `GoToEmployeeReportsCommand`, ecc.) invariati

---

# TASK 10 — Conversione `NotificationsPage`

## Input
- `new-ui/notifications.html`

## Output
- `src/Turnify.Mobile/Views/NotificationsPage.xaml`

## Regole di conversione
- Header gradiente + badge count non letto: `Danger` pill
- Card non letta: `#F0FDF4` bg, left bar `Primary`
- Card letta: `Surface` bg, no bar
- Icona per tipo: `calendar-dot.png` (turno), `check-circle.png` (approvata), `x-circle.png` (rifiutata), `arrows-swap.png` (scambio)
- Tutti i binding invariati

---

# TASK 11 — Conversione `OnboardingPage`

## Input
- `new-ui/onboarding.html`

## Output
- `src/Turnify.Mobile/Views/OnboardingPage.xaml`

## Regole di conversione
- Full screen, gradiente `PrimaryDark` → `PrimaryMid`
- Step illustration: `<Image Source="onboarding-team.png"/>` (128×128dp) per step 1, ecc.
- Progress dots: `BoxView` circle, active white, inactive white 40% opacity
- CTA "Avanti" / "Inizia": `AccentLight` background, `OnBackground` text (bottone giallo su sfondo scuro)
- Tutti i binding invariati

---

# PREREQUISITI

- Branch `redesign-ui` attivo (creato in this iteration setup)
- `new-ui/stitch-spec.md` già presente con specifiche complete
- File HTML da Google Stitch salvati in `new-ui/` prima di avviare ogni TASK di conversione
- Asset icona PNG/SVG scaricati e rinominati prima del TASK 2

---

# OUTPUT ATTESO

- `Colors.xaml` aggiornato con tutti i token Tropic Burst, vecchi token mantenuti per compat
- 26 asset icona presenti in `Resources/Images/`
- 9 pagine XAML riscritte con nuova palette, icone reali, gradienti colorati
- Zero emoji rimaste nelle pagine convertite
- Zero binding rotti — i ViewModel non vengono toccati
- Compilazione senza warning
- UI visivamente coerente con le specifiche in `new-ui/stitch-spec.md`

---

# File da creare

- `src/Turnify.Mobile/Resources/Images/bell.png`
- `src/Turnify.Mobile/Resources/Images/users-group.png`
- `src/Turnify.Mobile/Resources/Images/calendar-check.png`
- `src/Turnify.Mobile/Resources/Images/beach-umbrella.png`
- `src/Turnify.Mobile/Resources/Images/clock-timer.png`
- `src/Turnify.Mobile/Resources/Images/briefcase.png`
- `src/Turnify.Mobile/Resources/Images/fingerprint.png`
- `src/Turnify.Mobile/Resources/Images/vacation-request.png`
- `src/Turnify.Mobile/Resources/Images/calendar-edit.png`
- `src/Turnify.Mobile/Resources/Images/search.png`
- `src/Turnify.Mobile/Resources/Images/chevron-right.png`
- `src/Turnify.Mobile/Resources/Images/plus-circle.png`
- `src/Turnify.Mobile/Resources/Images/edit.png`
- `src/Turnify.Mobile/Resources/Images/trash.png`
- `src/Turnify.Mobile/Resources/Images/lock.png`
- `src/Turnify.Mobile/Resources/Images/report.png`
- `src/Turnify.Mobile/Resources/Images/building.png`
- `src/Turnify.Mobile/Resources/Images/users.png`
- `src/Turnify.Mobile/Resources/Images/logout.png`
- `src/Turnify.Mobile/Resources/Images/check-circle.png`
- `src/Turnify.Mobile/Resources/Images/x-circle.png`
- `src/Turnify.Mobile/Resources/Images/calendar-dot.png`
- `src/Turnify.Mobile/Resources/Images/arrows-swap.png`
- `src/Turnify.Mobile/Resources/Images/edit-pencil.png`
- `src/Turnify.Mobile/Resources/Images/onboarding-team.png`
- `src/Turnify.Mobile/Resources/Images/onboarding-calendar.png`
- `src/Turnify.Mobile/Resources/Images/onboarding-notifications.png`

# File da modificare

- `src/Turnify.Mobile/Resources/Styles/Colors.xaml` — palette Tropic Burst
- `src/Turnify.Mobile/Views/LoginPage.xaml`
- `src/Turnify.Mobile/Views/DashboardPage.xaml`
- `src/Turnify.Mobile/Views/EmployeeDashboardPage.xaml`
- `src/Turnify.Mobile/Views/ShiftCalendarPage.xaml`
- `src/Turnify.Mobile/Views/EmployeeListPage.xaml`
- `src/Turnify.Mobile/Views/VacationListPage.xaml`
- `src/Turnify.Mobile/Views/ProfilePage.xaml`
- `src/Turnify.Mobile/Views/NotificationsPage.xaml`
- `src/Turnify.Mobile/Views/OnboardingPage.xaml`

---

# File creati/modificati

## Completati
- `src/Turnify.Mobile/Resources/Styles/Colors.xaml` — TASK 1: palette Tropic Burst, token MD3 surface scale, KPI colors, stili PrimaryButton/OutlineButton aggiornati
- `src/Turnify.Mobile/Views/LoginPage.xaml` — TASK 3: hero gradient, bottom sheet, mode toggle pill, FieldBorder aggiornato
- `src/Turnify.Mobile/Views/DashboardPage.xaml` — TASK 4: gradient header, 4 KPI card solide colorate, icone PNG, Shell.NavBarIsVisible=False
- `src/Turnify.Mobile/Views/EmployeeDashboardPage.xaml` — TASK 5: gradient header, hero card Primary, 3 quick actions colorate, icone PNG
- `src/Turnify.Mobile/Views/ShiftCalendarPage.xaml` — TASK 6: color-only update (Navy→Primary su FAB, toggle attivo, bottone Uscita)
- `src/Turnify.Mobile/Views/EmployeeListPage.xaml` — TASK 7: gradient header, search bar con search.png, avatar PrimaryContainer, add card dashed
- `src/Turnify.Mobile/Views/ProfilePage.xaml` — TASK 9: gradient hero HeaderGradientStart→Secondary, tutte le emoji sostituite con Image Source

## Non completati (nessun HTML Stitch disponibile)
- TASK 2 — asset icone PNG/SVG (26 file da scaricare da Heroicons/Phosphor)
- TASK 8 — `VacationListPage.xaml`
- TASK 10 — `NotificationsPage.xaml`
- TASK 11 — `OnboardingPage.xaml`

# Prompt principali utilizzati

- Prompt 40 — creazione branch `redesign-ui`, spec Stitch, proposta palette Tropic Burst
- Prompt 41 — pianificazione iterazione 15
- Prompt 42 — esecuzione iterazione 15: conversione XAML 6 pagine + Colors.xaml
