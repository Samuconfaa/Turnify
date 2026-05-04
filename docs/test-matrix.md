# Matrice di test

> Test derivati esclusivamente da funzionalità realmente implementate, regole FluentValidation reali,
> comportamenti dei controller e bug documentati nella matrice tecnica.
>
> **Legenda esito:** ✅ Verificato | ❌ Bug noto | ⬜ Da testare manualmente | 🔁 Coperto da test automatici

---

## Test funzionali

### AUTH — Autenticazione

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| AUTH-01 | Auth | Login admin con email e password corrette | `POST /api/auth/login` con email+password validi | 200 + JWT con claims `sub`, `email`, `role=Admin`, `companyId` | 🔁 | `AuthControllerIntegrationTests` |
| AUTH-02 | Auth | Login admin con password errata | Email corretta, password sbagliata | 401 | 🔁 | `AuthControllerIntegrationTests` |
| AUTH-03 | Auth | Login admin con email non esistente | Email sconosciuta | 401 | 🔁 | |
| AUTH-04 | Auth | Login dipendente con username corretto | `POST /api/auth/login` con username+password validi (ruolo Employee) | 200 + JWT con `role=Employee` | 🔁 | `AuthControllerIntegrationTests` |
| AUTH-05 | Auth | Login dipendente con username errato | Username non esistente per quella azienda | 401 | 🔁 | `AuthControllerIntegrationTests` |
| AUTH-06 | Auth | Login con email malformata | `"email": "nonsoemail"` | 400 con `ValidationProblemDetails` — "Formato email non valido." | 🔁 | `LoginRequestValidator.EmailAddress` |
| AUTH-07 | Auth | Login con password < 6 caratteri | `"password": "abc"` | 400 — "La password deve essere di almeno 6 caratteri." | 🔁 | `AuthControllerIntegrationTests` |
| AUTH-08 | Auth | Login con campi vuoti | Body `{}` | 400 — "L'email è obbligatoria.", "La password è obbligatoria." | 🔁 | `AuthControllerIntegrationTests` |
| AUTH-09 | Auth | Rate limit su endpoint auth | 11 richieste rapide a `POST /api/auth/login` dallo stesso IP | 429 dopo la decima — risposta con messaggio leggibile | ⬜ | SlidingWindow 10 req/min per-IP in `Program.cs` |
| AUTH-10 | Auth | Accesso endpoint protetto senza token | `GET /api/shifts` senza header `Authorization` | 401 | 🔁 | `ShiftsControllerIntegrationTests` |
| AUTH-11 | Auth | Accesso endpoint protetto con token valido | `GET /api/shifts` con `Authorization: Bearer <jwt>` | 200 | 🔁 | `ShiftsControllerIntegrationTests` |

---

### REG — Registrazione azienda

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| REG-01 | Registrazione | Registrazione azienda completa valida | `POST /api/auth/register` con CompanyName, CompanySlug, CompanyEmail, AdminEmail, AdminPassword validi | 201 + JWT | 🔁 | `AuthControllerIntegrationTests` |
| REG-02 | Registrazione | Email admin già registrata | AdminEmail già presente nel DB | 409 Conflict | ✅ | Fix — era 500, ora 409 |
| REG-03 | Registrazione | CompanySlug con caratteri non validi | Slug con spazi o maiuscole, es. `"My Company"` | 400 — "Lo slug può contenere solo lettere minuscole, numeri e trattini." | 🔁 | `AuthControllerIntegrationTests` |
| REG-04 | Registrazione | Password admin < 8 caratteri | `AdminPassword: "Ab1234"` (6 caratteri) | 400 — "La password admin deve essere di almeno 8 caratteri." | 🔁 | `AuthControllerIntegrationTests` |
| REG-05 | Registrazione | Password admin senza maiuscole | `AdminPassword: "password1"` | 400 — "La password deve contenere almeno una lettera maiuscola." | 🔁 | `AuthControllerIntegrationTests` |
| REG-06 | Registrazione | Password admin senza numeri | `AdminPassword: "Password"` | 400 — "La password deve contenere almeno un numero." | 🔁 | `AuthControllerIntegrationTests` |
| REG-07 | Registrazione | CompanyName vuoto | `CompanyName: ""` | 400 — "Il nome azienda è obbligatorio." | 🔁 | `AuthControllerIntegrationTests` |

---

### SHIFT — Gestione turni

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| SHIFT-01 | Turni | Creazione turno singolo valido | `POST /api/shifts` con EmployeeId > 0, EndTime > StartTime, durata ≤ 24h | 201 — turno creato | 🔁 | `ShiftsControllerIntegrationTests` |
| SHIFT-02 | Turni | EndTime ≤ StartTime | `StartTime: "2026-05-01T09:00"`, `EndTime: "2026-05-01T08:00"` | 400 — "L'orario di fine deve essere successivo all'orario di inizio." | 🔁 | `CreateShiftRequestValidator.GreaterThan(x => x.StartTime)` |
| SHIFT-03 | Turni | Durata turno > 24 ore | EndTime - StartTime > 24h | 400 — "Un turno non può durare più di 24 ore." | 🔁 | `ShiftsControllerIntegrationTests` |
| SHIFT-04 | Turni | EmployeeId = 0 o negativo | `EmployeeId: 0` | 400 — "EmployeeId deve essere un valore positivo." | 🔁 | `ShiftsControllerIntegrationTests` |
| SHIFT-05 | Turni | Label > 100 caratteri | `Label` con 101 caratteri | 400 — "L'etichetta non può superare 100 caratteri." | 🔁 | `ShiftsControllerIntegrationTests` |
| SHIFT-06 | Turni | Note > 500 caratteri | `Note` con 501 caratteri | 400 — "La nota non può superare 500 caratteri." | 🔁 | `ShiftsControllerIntegrationTests` |
| SHIFT-07 | Turni | Modifica turno: EndTime ≤ StartTime | `PUT /api/shifts/{id}` con orari invertiti | 400 — "L'orario di fine deve essere successivo all'orario di inizio." | 🔁 | `ShiftsControllerIntegrationTests` |
| SHIFT-08 | Turni | Dipendente tenta di creare un turno | `POST /api/shifts` con JWT ruolo Employee | 403 | 🔁 | `[Authorize(Roles = "Admin")]` o controllo ruolo nel controller |
| SHIFT-09 | Turni | Creazione turni ricorrenti: weeks valide | `POST /api/shifts/recurring` con `Weeks: 4` | 201 — N turni creati (uno per settimana) | 🔁 | `ShiftsControllerIntegrationTests` |
| SHIFT-10 | Turni | Creazione turni ricorrenti: Weeks = 0 | `Weeks: 0` | 400 — "Il numero di settimane deve essere compreso tra 1 e 52." | 🔁 | `ShiftsControllerIntegrationTests` |
| SHIFT-11 | Turni | Creazione turni ricorrenti: Weeks = 53 | `Weeks: 53` | 400 — "Il numero di settimane deve essere compreso tra 1 e 52." | 🔁 | `ShiftsControllerIntegrationTests` |
| SHIFT-12 | Turni | Calendario mobile: turni caricati | Admin apre `ShiftCalendarPage` | Turni del periodo corrente visibili, caricamento con `IsBusy` | ⬜ | `ShiftCalendarViewModel.LoadShiftsAsync` |
| SHIFT-13 | Turni | Calendario mobile: dettaglio turno | Tap su turno nel calendario | Navigazione a `ShiftDetailPage` con dati corretti | ⬜ | Route registrata in `AppShell` |

---

### ATT — Timbratura presenze

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| ATT-01 | Presenze | Check-in prima del giorno | Dipendente chiama `POST /api/attendance/checkin` senza check-in attivo | 201 — `AttendanceLog` creato con `CheckInTime = DateTime.UtcNow`, `CheckOutTime = null` | 🔁 | `AttendanceControllerIntegrationTests` |
| ATT-02 | Presenze | Check-in doppio senza checkout | Dipendente chiama `checkin` due volte consecutive | 409 Conflict — `{ "message": "Sei già entrato oggi." }` | 🔁 | `AttendanceControllerIntegrationTests` |
| ATT-03 | Presenze | Check-out dopo check-in | Dipendente chiama `POST /api/attendance/checkout` dopo check-in | `CheckOutTime` aggiornato nella riga esistente | 🔁 | `AttendanceControllerIntegrationTests` |
| ATT-04 | Presenze | Stato presenze di oggi | `GET /api/attendance/today` con check-in attivo | `{ "isCheckedIn": true, "checkInTime": "...", "checkOutTime": null }` | 🔁 | `AttendanceControllerIntegrationTests` |
| ATT-05 | Presenze | Stato presenze di oggi senza check-in | `GET /api/attendance/today` prima del check-in | `{ "isCheckedIn": false, "checkInTime": null, "checkOutTime": null }` | 🔁 | `AttendanceControllerIntegrationTests` |
| ATT-06 | Presenze | Storico presenze mobile: orari in locale | `AttendanceHistoryPage` mostra storico | Timestamp visualizzati in ora locale (non UTC) | ✅ | Fix bug UTC — `DateTime.SpecifyKind(..., Utc).ToLocalTime` |
| ATT-07 | Presenze | Check-in senza dipendente associato | User senza record `Employee` chiama `checkin` | 403 Forbid | 🔁 | `AttendanceControllerIntegrationTests` |

---

### VAC — Ferie e permessi

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| VAC-01 | Ferie | Crea richiesta ferie valida | `POST /api/vacation-requests` con date valide, TotalDays > 0 | 201 — richiesta in stato `Pending` | 🔁 | `VacationRequestsControllerIntegrationTests` |
| VAC-02 | Ferie | EndDate < StartDate | `EndDate: "2026-05-01"`, `StartDate: "2026-05-10"` | 400 — "La data di fine non può essere precedente alla data di inizio." | 🔁 | `VacationRequestsControllerIntegrationTests` |
| VAC-03 | Ferie | TotalDays = 0 | `TotalDays: 0` | 400 — "Il numero di giorni deve essere maggiore di zero." | ⬜ | Non testabile: il controller usa `CreateVacationRequestInput` (tipo inline), non `CreateVacationRequest` (DTO con validator). Il controller clamps `TotalDays` a 1 senza rifiutare. |
| VAC-04 | Ferie | TotalDays > 365 | `TotalDays: 366` | 400 — "Non è possibile richiedere più di 365 giorni consecutivi." | 🔁 | `VacationRequestsControllerIntegrationTests` (inline: `(EndDate - StartDate).TotalDays > 365`) |
| VAC-05 | Ferie | Reason > 500 caratteri | `Reason` con 501 caratteri | 400 — "Il motivo non può superare 500 caratteri." | ⬜ | Non testabile: nessun validator applicato all'input inline del controller. |
| VAC-06 | Ferie | Admin approva richiesta Pending | `PUT /api/vacation-requests/{id}/approve` | Stato aggiornato a `Approved` | 🔁 | `VacationRequestsControllerIntegrationTests` |
| VAC-07 | Ferie | Admin rifiuta richiesta Pending | `PUT /api/vacation-requests/{id}/reject` con nota | Stato aggiornato a `Rejected` | 🔁 | `VacationRequestsControllerIntegrationTests` |
| VAC-08 | Ferie | Form mobile: EndDate < StartDate | Dipendente imposta date con fine precedente inizio | Messaggio — "La data di fine deve essere dopo la data di inizio." | ✅ | Validazione lato client in `ReportsViewModel` — stessa logica in `VacationEditViewModel` (fix ) |
| VAC-09 | Ferie | Dipendente vede solo proprie richieste | Dipendente chiama `GET /api/vacation-requests` | Solo le proprie richieste, non quelle dei colleghi | 🔁 | `VacationRequestsControllerIntegrationTests` |
| VAC-10 | Ferie | Tipo ferie: tutti i valori validi | Richiesta con Type `Holiday`, `PaidLeave`, `UnpaidLeave`, `SickLeave` | 201 per ognuno | 🔁 | `VacationRequestsControllerIntegrationTests` |

---

### EMP — Gestione dipendenti

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| EMP-01 | Dipendenti | Lista dipendenti admin | Admin apre `EmployeeListPage` | Lista caricata con dati reali dall'API | ⬜ | `EmployeeListViewModel.LoadAsync` |
| EMP-02 | Dipendenti | Ricerca dipendente per nome | Admin digita nella `SearchBar` | Lista filtrata in real-time per FirstName/LastName | ⬜ | Filtro LINQ in `EmployeeListViewModel` |
| EMP-03 | Dipendenti | Dettaglio dipendente | Tap su dipendente | Navigazione a `EmployeeDetailPage` con dati completi | ⬜ | |
| EMP-04 | Dipendenti | Dipendente tenta accesso lista dipendenti | `GET /api/employees` con JWT ruolo Employee | 403 | 🔁 | `EmployeesControllerIntegrationTests` |
| EMP-05 | Dipendenti | Disponibilità giorni lavorativi | `AvailabilityPage` — toggle giorni | `AvailableDays` salvato come CSV `"1,2,3,4,5"` | ⬜ | `AvailabilityViewModel` serializza in CSV |
| EMP-06 | Dipendenti | Admin di azienda A accede dipendenti azienda B | Manipolazione JWT o query param | Solo dipendenti della propria azienda restituiti | 🔁 | `EmployeesControllerIntegrationTests` |

---

### BIZ — Gestione attività

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| BIZ-01 | Attività | Lista attività | Admin apre `BusinessListPage` | Attività della propria azienda caricate | ⬜ | `BusinessListViewModel` |
| BIZ-02 | Attività | Aggiornamento orari apertura | Admin modifica `OpeningTime`/`ClosingTime` in `BusinessOpeningHoursPage` | Orari salvati via `PUT /api/businesses/{id}/opening-hours` | ⬜ | `BusinessOpeningHoursViewModel` |

---

### DASH — Dashboard

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| DASH-01 | Dashboard | Dashboard admin caricata | Admin apre app → `DashboardPage` | Dati reali da `GET /api/dashboard/summary` visibili | ⬜ | `DashboardViewModel` |
| DASH-02 | Dashboard | Dashboard dipendente caricata | Dipendente apre app → `EmployeeDashboardPage` | Turni personali e presenze recenti caricati | ✅ | Fix accesso in — era bloccata da controllo ruolo errato |
| DASH-03 | Dashboard | Tab admin NON visibili al dipendente | Login con credenziali dipendente | Tab "Dashboard admin" e "Team" assenti dalla tab bar | ✅ | `AppShell.ConfigureForRole(isAdmin: false)` rimuove `DashboardTab` e `TeamTab` |
| DASH-04 | Dashboard | Tab dipendente NON visibili all'admin | Login con credenziali admin | Tab "Employee Dashboard" assente dalla tab bar | ⬜ | `AppShell.ConfigureForRole(isAdmin: true)` rimuove `EmployeeDashboardTab` |

---

### PROF — Profilo e account

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| PROF-01 | Profilo | Profilo caricato con dati reali | Apri `ProfilePage` | Email, nome azienda, ruolo da `GET /api/users/me` | ⬜ | `ProfileViewModel.LoadAsync` |
| PROF-02 | Profilo | Selezione avatar emoji | Tap sull'avatar → `EmojiPickerPage` → selezione emoji | Emoji salvata sul profilo, visibile nel `ProfilePage` | ⬜ | `EmojiPickerPage` → `ProfileViewModel` |
| PROF-03 | Profilo | Cambio password con dati corretti | `ChangePasswordPage`: password attuale corretta + nuova password valida | 200 — password aggiornata | ⬜ | `ChangePasswordViewModel.ChangePasswordCommand` |

---

### REP — Reportistica CSV

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| REP-01 | Report | Download ore turni con intervallo valido | `ReportsPage`: from < to, tap "Scarica ore turni" | File CSV scaricato in `CacheDirectory`, aperta condivisione OS | ⬜ | `ReportsViewModel.DownloadHoursAsync` |
| REP-02 | Report | Download presenze con intervallo valido | Tap "Scarica presenze" | File CSV `presenze_YYYY-MM-DD_YYYY-MM-DD.csv` condiviso | ⬜ | `ReportsViewModel.DownloadAttendanceAsync` |
| REP-03 | Report | EndDate < StartDate nel form report | Imposta `ToDate` precedente a `FromDate` | Messaggio — "La data di fine deve essere dopo la data di inizio." — nessuna chiamata API | ⬜ | Validazione lato client in `ReportsViewModel` prima della chiamata |
| REP-04 | Report | Download report: errore di rete | Server irraggiungibile | Messaggio — "Errore di connessione al server." | ⬜ | `catch (HttpRequestException)` in `ReportsViewModel` |
| REP-05 | Report | Download report: timeout | Risposta > timeout configurato | Messaggio — "Richiesta scaduta. Riprova." | ⬜ | `catch (TaskCanceledException)` in `ReportsViewModel` |

---

### NOT — Notifiche

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| NOT-01 | Notifiche | Lista notifiche caricata | Apri `NotificationsPage` | Notifiche reali dall'API visualizzate | ⬜ | `NotificationsViewModel` |
| NOT-02 | Notifiche | Badge tab aggiornato | Cambia conteggio notifiche non lette | Badge numerico sulla tab Notifiche aggiornato in real-time | ⬜ | `WeakReferenceMessenger.Default.Send<ValueChangedMessage<int>>` in `AppShell` |

---

### GDPR — Consenso e onboarding

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| GDPR-01 | GDPR | Primo avvio: consenso richiesto | Avvio app su dispositivo senza consenso salvato | Navigazione a `GdprConsentPage` prima del login | ⬜ | `App.xaml.cs` controlla `Preferences` |
| GDPR-02 | GDPR | Secondo avvio: consenso già dato | Avvio app con consenso salvato in `Preferences` | Skip di `GdprConsentPage`, navigazione diretta a login | ⬜ | |
| GDPR-03 | GDPR | Onboarding al primo accesso post-consenso | Utente accetta GDPR, naviga verso onboarding | `OnboardingPage` multi-step visualizzata | ⬜ | Route `"Onboarding"` in `AppShell` |

---

### WEB — Portale web admin

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| WEB-01 | Web | Login admin su `/admin/login` | Credenziali admin valide | Cookie impostato, redirect a `/dashboard` | ⬜ | `lib/auth.ts` + `middleware.ts` |
| WEB-02 | Web | Accesso `/dashboard` senza cookie | Navigazione diretta a `/dashboard` | Redirect a `/admin/login` | ⬜ | `middleware.ts` |
| WEB-03 | Web | Pagina dipendenti web | Admin naviga a `/dashboard/employees` | Tabella dipendenti caricata da API | ⬜ | `app/dashboard/employees/page.tsx` |
| WEB-04 | Web | Pagina error logs web | Admin naviga a `/dashboard/error-logs` | Tabella errori app mobile caricata | ✅ | Fix — `Array.from(new Set(...))` invece di spread |

---

### ERR — Raccolta errori client

| ID | Area | Caso di test | Passi | Risultato atteso | Esito | Note |
|---|---|---|---|---|---|---|
| ERR-01 | Error reporting | Report errore valido | `POST /api/errorlogs` con tutti i campi obbligatori | 200 — log salvato nel DB | 🔁 | `ErrorLogsControllerIntegrationTests` |
| ERR-02 | Error reporting | Platform non valida | `"Platform": "Linux"` | 400 — "Platform deve essere Android, iOS, Windows o macOS." | 🔁 | `ErrorLogsControllerIntegrationTests` |
| ERR-03 | Error reporting | Message > 2000 caratteri | `Message` con 2001 caratteri | 400 — "Il messaggio di errore è obbligatorio." (max 2000) | 🔁 | `ErrorLogsControllerIntegrationTests` |
| ERR-04 | Error reporting | Rate limit error logs | 21 richieste rapide a `POST /api/errorlogs` dallo stesso IP | 429 alla ventunesima | ⬜ | Policy `errorlogs`: 20 req/min per-IP |
| ERR-05 | Error reporting | Eccezione non gestita nel mobile | Azione che genera `Exception` generico in ViewModel | Eccezione inviata silenziosamente a backend via `ErrorReporterService.Current?.ReportAsync` | ⬜ | Pattern in tutti i `catch (Exception ex)` dei ViewModel |

---

## Casi limite aggiuntivi

Derivati da validazioni reali nel codice e comportamenti specifici dei controller.

| ID | Caso limite | Origine | Comportamento verificato |
|---|---|---|---|
| EDGE-01 | Password login minLength 6, registrazione minLength 8 | `LoginRequestValidator` vs `RegisterRequestValidator` | Soglie diverse: una password di 7 caratteri è valida per il login ma non per la registrazione. Non è un bug, è una scelta esplicita nel codice. |
| EDGE-02 | Check-in doppio senza checkout | `AttendanceController.CheckIn` — `if (existing != null && existing.CheckOutTime == null)` | 409 con messaggio `"Sei già entrato oggi."` — il body del Conflict è un JSON con campo `message`, non un `ValidationProblemDetails` standard |
| EDGE-03 | Filtro indice `(CompanyId, Username) IS NOT NULL` | `TurnifyDbContext` — `.HasFilter("`Username` IS NOT NULL")` | Due dipendenti della stessa azienda non possono avere lo stesso username, ma due admin (senza username) nella stessa azienda sono permessi |
| EDGE-04 | Durata turno esattamente 24 ore | `CreateShiftRequestValidator` — `(end - req.StartTime).TotalHours <= 24` | 24 ore esatte: accettato. 24 ore e 1 minuto: 400. |
| EDGE-05 | TotalDays ferie esattamente 365 | `CreateVacationRequestValidator.LessThanOrEqualTo(365)` | 365 giorni: accettato. 366: 400. |
| EDGE-06 | Weeks turni ricorrenti: 1 e 52 | `CreateRecurringShiftsRequestValidator.InclusiveBetween(1, 52)` | 1 settimana: accettato. 52 settimane: accettato. 0 e 53: 400. |
| EDGE-07 | ReportError: StackTrace e ScreenName nullable | `ReportErrorRequestValidator` — `.When(x => x.StackTrace != null)` | I campi opzionali non vengono validati se `null`; se presenti, maxLength 10000 e 200 rispettivamente |
| EDGE-08 | Rate limiter globale 120 req/min per-IP | `Program.cs` — `GlobalLimiter` | Tutti gli endpoint, inclusi quelli non auth, sono soggetti al limite globale dopo il quale ricevono 429 |
| EDGE-09 | Dipendente senza record Employee | `AttendanceController` — `if (employee == null) return Forbid` | User con ruolo Employee ma senza `Employee` associato riceve 403 al check-in (non 404 o 401) |
| EDGE-10 | Report con intervallo date senza dati | `GET /api/reports/hours?from=2020-01-01&to=2020-01-02` | Server restituisce CSV con solo intestazione e nessuna riga dati. `ReportsViewModel` tratta come successo e condivide il file vuoto. |

---

## Bug trovati

Documentati dalla matrice tecnica e dalle verifiche di regressione.

| ID | Bug | Verifica/fix | Comportamento errato | Comportamento corretto |
|---|---|---|---|---|
| BUG-01 | Timestamp presenze mostrati in UTC invece dell'ora locale | Verifica regressione | `AttendanceHistoryPage` mostrava es. "08:00" per un check-in delle 10:00 (UTC+2) | `DateTime.SpecifyKind(..., Utc).ToLocalTime` — orario convertito al fuso del dispositivo |
| BUG-02 | `EmployeeDashboardPage` non accessibile ai dipendenti | | Un controllo ruolo errato nel ViewModel bloccava il caricamento per i dipendenti | Rimosso controllo errato — pagina caricata correttamente |
| BUG-03 | `RegisterPage.xaml` su Android: input bloccato | | `Frame` in MAUI su Android impediva l'inserimento di testo nei campi form | Sostituito `Frame` con `Border` |
| BUG-04 | Tab admin visibili al dipendente al login | | `AppShell` riutilizzata senza reinizializzazione → tab admin non rimosse per i dipendenti | Forzata creazione nuova istanza `AppShell` al login con `ConfigureForRole` |
| BUG-05 | Login layout non scrollabile su schermi piccoli | | `LoginPage.xaml` non aveva `ScrollView` → elementi tagliati su dispositivi con schermo < 5" | Aggiunto `ScrollView` wrapping |
| BUG-06 | Rate limiter globale invece che per-IP | | Il rate limiter condivideva il limite tra tutti gli IP — un solo IP non poteva saturarlo intenzionalmente | Riscritto con `RemoteIpAddress` come partition key |
| BUG-07 | Registrazione email duplicata → 500 invece di 409 | Verifica regressione | Eccezione MySQL non gestita per constraint email univoca restituiva HTTP 500 | Catturata `DbUpdateException` → `Conflict` 409 |
| BUG-08 | Pagina web error-logs crashava su alcuni browser | | `[...new Set(...)]` — spread operator su `Set` non supportato dal target browser | Sostituito con `Array.from(new Set(...))` |
| BUG-09 | Migrazione `AddEmployeeAvailableDays` non scoperta da EF CLI | | Migrazione manuale senza file `Designer.cs` → `dotnet ef` non la trovava | Aggiunto file `Designer.cs` companion |
| BUG-10 | Portale Next.js non si avviava su VPS Node 20 | | Incompatibilità configurazione Next.js 14 con Node 20 in produzione | Fix configurazione `next.config.ts` |
| BUG-11 | Validazione form ferie mobile assente | | `VacationEditPage` accettava EndDate < StartDate senza errore | Aggiunta validazione lato client in ViewModel |

---

## Test automatici presenti

| Suite | File | Copertura |
|---|---|---|
| Unit — AuthService | `Tests/Services/AuthServiceTests.cs` | Registrazione, login, JWT claims, password errata |
| Unit — ShiftService | `Tests/Services/ShiftServiceTests.cs` | Creazione turno, recupero per azienda |
| Unit — ShiftService (ricorrenza) | `Tests/Services/ShiftRecurringTests.cs` | Generazione turni ricorrenti |
| Unit — VacationService | `Tests/Services/VacationServiceTests.cs` | Creazione, approvazione, rifiuto, cancellazione, validazioni date (475 righe) |
| Unit — DashboardService | `Tests/Services/DashboardServiceTests.cs` | Aggregazioni dashboard |
| Repository — Shift | `Tests/Repositories/ShiftRepositoryTests.cs` | CRUD repository |
| Repository — User | `Tests/Repositories/UserRepositoryTests.cs` | Lookup per email/username |
| Repository — Vacation | `Tests/Repositories/VacationRepositoryTests.cs` | Filtri per stato |
| Repository — Attendance | `Tests/Repositories/AttendanceRepositoryTests.cs` | Check-in/out query |
| Repository — DeviceToken | `Tests/Repositories/DeviceTokenRepositoryTests.cs` | Registrazione token FCM |
| Middleware | `Tests/Middleware/GlobalExceptionMiddlewareTests.cs` | Catch eccezione → JSON errore |
| Integration — Auth | `Tests/Integration/AuthControllerIntegrationTests.cs` | Register, login email, login dipendente (username), logout, validator (password, slug, companyName) |
| Integration — Shifts | `Tests/Integration/ShiftsControllerIntegrationTests.cs` | CRUD, autorizzazioni, validator (durata, EmployeeId, Label, Note), ricorrenti (Weeks 0/53/1/52/4), EDGE-04, EDGE-06 |
| Integration — Attendance | `Tests/Integration/AttendanceControllerIntegrationTests.cs` | Check-in, check-out, doppio check-in (409), today state, history, monthly summary, utente senza Employee (403) |
| Integration — Vacation Requests | `Tests/Integration/VacationRequestsControllerIntegrationTests.cs` | Crea, approva, rifiuta, elimina, filtro stato, isolamento dipendente, tutti i tipi, boundary 365gg (EDGE-05) |
| Integration — Employees | `Tests/Integration/EmployeesControllerIntegrationTests.cs` | Lista admin/dipendente (403), multi-tenant (EMP-06), crea (201/400), soft delete, disponibilità |
| Integration — Error Logs | `Tests/Integration/ErrorLogsControllerIntegrationTests.cs` | Report valido, non autenticato (401), platform non valida, message >2000, nullable fields (EDGE-07), tutte le platform |

**Totale stimato dopo l'aggiunta:** ~170 test.

---

## Esito complessivo

**Test automatici (backend):** 122 test — suite completa su service, repository, middleware e integration test. Forniscono confidenza sul comportamento API.

**Test manuali UI (mobile):** la maggior parte dei casi in questa matrice (⬜) richiede test su dispositivo fisico Android. Non esistono test UI automatizzati nel progetto.

**Test portale web:** nessuna suite automatica. Il portale Next.js è coperto solo da verifica manuale.

**Bug risolti prima della distribuzione:** 11 bug documentati nella matrice tecnica e corretti nel codice attuale. I più critici (UTC presenze, tab ruolo errate, rate limiter non per-IP) sono stati risolti nell'iterazione 07-08.

**Aree non coperte da test automatici:**
- `FcmPushNotificationService` — nessun test; failure silenziosa se la chiave FCM è errata
- `SmtpEmailService` — nessun test; reset password dipende da configurazione SMTP esterna
- `CertificatePinningHandler` — solo test manuale su dispositivo Android reale
- Portale web Next.js — nessuna suite test
