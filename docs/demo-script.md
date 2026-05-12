# Script demo finale

## Durata prevista
10–12 minuti

## Obiettivo
Presentare Turnify come progetto reale: problema affrontato, scelte architetturali, uso dell'AI e dimostrazione live dei flussi sull'app Android.

---

## Sequenza demo

---

### 1. Introduzione (1 min)

**Cosa dire:**

> "Turnify è un'applicazione per la gestione turni di piccole imprese italiane — bar, ristoranti, negozi. Il problema reale che risolve è che queste realtà gestiscono i turni tramite messaggi WhatsApp, carta o voce: nessuna tracciabilità delle presenze, nessun flusso strutturato per le ferie. Turnify centralizza tutto in un'unica piattaforma con ruoli distinti tra titolare e dipendente."

**Stack reale:**
- App mobile: **.NET MAUI 10**, target primario Android (API 21+)
- Backend: **ASP.NET Core 10**, database **MySQL** via EF Core Pomelo
- Portale web: **Next.js 14**, solo per admin
- Autenticazione: **JWT** con ruoli Admin / Employee / Manager

---

### 2. Specifica iniziale (1 min)

**Cosa dire:**

> "Prima di scrivere una riga di codice ho definito la specifica in `docs/spec.md`. Il MVP comprende:"

**Feature reali da citare:**
- F1: autenticazione JWT differenziata — admin con email, dipendente con username (univoco per azienda)
- F4/F5: pianificazione turni singoli e ricorrenti + calendario settimanale
- F6: timbratura presenze: check-in/check-out dal mobile; il backend registra timestamp UTC; 409 se già timbrato oggi
- F7: flusso richiesta ferie — dipendente crea, admin approva/rifiuta
- F8/F9: dashboard separata per admin e dipendente
- F12: export report CSV (ore turni + presenze) con selezione intervallo date

**Cosa non mostrare:** funzionalità non implementate come ManageDataPage (registrata in AppShell ma il file XAML non esiste nel repository) o push FCM (non integrato: `GetDeviceTokenAsync` restituisce sempre `null`).

---

### 3. Architettura (2 min)

**Cosa dire:**

> "Il progetto usa Clean Architecture a 4 layer, separati in progetti distinti nella stessa soluzione .NET."

**Layer reali (aprire la solution in VS o mostrare la struttura cartelle):**

```
Turnify.Core          → modelli di dominio + interfacce (zero dipendenze esterne)
Turnify.Infrastructure → EF Core, repository, service concreti (MySQL via Pomelo)
Turnify.Api           → ASP.NET Core 10, 13 controller, FluentValidation, rate limiting
Turnify.Mobile        → .NET MAUI, MVVM, Shell navigation
Turnify.Tests         → xUnit, 122 test (unit + integration con WebApplicationFactory)
Turnify.Web           → Next.js 14, portale admin
```

**Pattern MVVM nel mobile — cosa mostrare nel codice:**

Aprire `ViewModels/DashboardViewModel.cs`:
- `BaseViewModel : ObservableObject` con `[ObservableProperty] bool IsBusy`
- `[ObservableProperty]` e `[RelayCommand]` via CommunityToolkit.Mvvm 8.4.2 (source generators)
- Zero logica nel code-behind: il `.xaml.cs` contiene solo il costruttore con DI

**Navigazione reale:**

> "L'app usa Shell come root. `AppShell.xaml.cs` configura le tab dinamicamente in base al ruolo: `ConfigureForRole(isAdmin: true)` rimuove la tab dipendente, `ConfigureForRole(isAdmin: false)` rimuove le tab admin. Le route (27 totali) sono registrate con `Routing.RegisterRoute`."

**Sicurezza reale:**

- Certificate pinning Android (`network_security_config.xml`, pin su `samuconfa.it`, scadenza 2027-04-28)
- `AuthDelegatingHandler`: inietta JWT su ogni richiesta; su 401 cancella sessione e rimanda al login (no refresh automatico)
- Rate limiting: 10 req/min per IP su `/auth`, 120 req/min globale
- `DotNetEnv`: credenziali (JWT secret, connection string) non nel repository

---

### 4. Uso dell'AI (1,5 min)

**Cosa dire:**

> "Ho usato Claude Code come pair programmer per tutto il progetto, non solo per generare codice ma anche per pianificare le iterazioni e mantenere la documentazione aggiornata. Lo sviluppo si è svolto in 9 iterazioni in 9 giorni (dal 21 al 29 aprile), partendo da zero fino al deploy su VPS."

**Esempi concreti osservabili nel codice e nella documentazione:**

- **aggiornamento documentato**: 8 classi di dominio + enum generati in un unico blocco di lavoro (193 righe, 8 file) — riconoscibile come output AI per la struttura uniforme e la coerenza del naming
- **aggiornamento documentato**: 7 pagine XAML completamente riscritte con il nuovo design system in un unico blocco di lavoro (~2.000 righe di XAML) — scala non raggiungibile manualmente in un turno
- **Pattern 4-catch identico** in tutti i 23 ViewModel: `HttpRequestException(TooManyRequests)` → `HttpRequestException` → `TaskCanceledException` → `Exception` con `ErrorReporterService.Current?.ReportAsync(...)` — uniformità che rispecchia un template generato e applicato sistematicamente
- **Iterazione 5**: UI completamente ridisegnata + `AttendanceController` + 475 righe di test `VacationServiceTests.cs` in un'unica sessione

**Cosa non ha fatto l'AI da solo:**
- Fix migrazione `AddEmployeeAvailableDays` (file `Designer.cs` mancante: corretto manualmente)
- Fix scroll `LoginPage` su schermi piccoli
- Indice filtrato `IS NOT NULL` per il vincolo username per azienda (scelta tecnica MySQL-specifica)

---

### 5. Demo app (4 min)

> Prerequisiti: device Android connesso o emulatore con app installata e backend raggiungibile su `https://samuconfa.it/turnify/`.

---

#### 5.1 Primo avvio — GDPR (15 sec)

**Azione:** aprire l'app per la prima volta (o dopo aver cancellato le Preferences).

**Cosa si vede:** `GdprConsentPage` — checkbox obbligatorio per la privacy policy, facoltativo per marketing.

**Cosa dire:** "Al primo avvio l'app mostra obbligatoriamente il consenso GDPR prima di qualsiasi altra schermata. Il flag viene salvato in `Preferences.Default` con versione `1.0`. Se la versione cambia l'utente viene ripresentato al consenso."

**Azione:** attivare il toggle privacy → toccare "Accetta e continua" → arriva alla Login.

---

#### 5.2 Login admin (20 sec)

**Azione:** inserire email e password dell'account admin → toccare "Accedi".

**Cosa si vede:** tab admin con Dashboard, ShiftCalendar, VacationList, Notifications, Profile. La tab EmployeeDashboard non è presente.

**Cosa dire:** "Il login admin usa email. Il JWT ricevuto contiene il claim `role=Admin`. `AppShell.ConfigureForRole(isAdmin: true)` rimuove la tab dipendente e mantiene le tab gestionali."

---

#### 5.3 Dashboard admin (30 sec)

**Cosa si vede:** contatori in cima (dipendenti totali, turni questa settimana, ferie pendenti, ore pianificate), lista turni di oggi, lista richieste ferie pendenti con pulsanti Approva/Rifiuta.

**Azione:** toccare "Approva" su una richiesta ferie pendente.

**Cosa dire:** "Il dashboard chiama `GET api/dashboard/summary`. I `DashboardShiftDto` mostrano nome dipendente, orario e ruolo. L'approvazione chiama `PUT api/vacation-requests/{id}/approve` con body `{ note: '' }` e rimuove la card dalla lista senza ricaricare tutto."

---

#### 5.4 Calendario turni — creazione (60 sec)

**Azione:** toccare la tab ShiftCalendar.

**Cosa si vede:** griglia settimanale (Lun–Dom) con turni colorati per dipendente. Badge "Oggi" evidenziato in verde.

**Azione:** toccare il pulsante + in alto a destra.

**Cosa si vede:** `ShiftDetailPage` — picker dipendente, data, orario inizio/fine, etichetta, nota, stepper "Ripeti per N settimane".

**Azione:** selezionare dipendente, impostare orario 09:00–17:00, scrivere etichetta "Apertura", impostare RepeatWeeks = 2 → toccare "Salva".

**Cosa dire:** "Con `RepeatWeeks = 2` il ViewModel esegue 3 `POST api/shifts`: il turno originale e 2 copie sfalsate di 7 e 14 giorni. Il campo `isRecurring: true` distingue le copie. In caso di conflitto orario il server risponde 409 e il ViewModel salta il turno senza interrompere il batch."

**Azione:** tornare al calendario → navigare alla settimana successiva → mostrare il turno copiato.

---

#### 5.5 Gestione dipendenti — creazione (30 sec)

**Azione:** toccare la tab Team → toccare +.

**Cosa si vede:** `EmployeeDetailPage` — campi nome, cognome, **username** (obbligatorio), email (opzionale), password temporanea, tipo contratto (FullTime/PartTime/Apprendistato/Tempo determinato/A chiamata), sede, ruolo account (Dipendente/Manager).

**Cosa dire:** "I dipendenti non usano email per accedere: usano username, che deve essere univoco all'interno dell'azienda. Il vincolo è garantito sia lato API (400 se duplicato) sia a livello DB (indice univoco filtrato su `CompanyId + Username WHERE Username IS NOT NULL`). La password temporanea viene comunicata fisicamente al dipendente."

**Azione:** compilare il form → Salva → mostrare l'alert con le credenziali da comunicare.

---

#### 5.6 Login dipendente (20 sec)

**Azione:** andare in Profile → toccare Logout → nella LoginPage toccare "Sono un dipendente".

**Cosa si vede:** il form cambia: appare il campo "Nome azienda" (slug), scompare Email e appare Username.

**Azione:** inserire slug azienda, username e password del dipendente creato → Accedi.

**Cosa si vede:** tab dipendente: EmployeeDashboard, ShiftCalendar, VacationList, Notifications, Profile. Nessuna tab Team o Dashboard admin.

**Cosa dire:** "Il login dipendente chiama `POST api/auth/employee-login` con `{ companySlug, username, password }`. Lo slug identifica il tenant, l'username identifica il dipendente all'interno dell'azienda."

---

#### 5.7 Check-in dipendente (30 sec)

**Azione:** toccare la tab ShiftCalendar.

**Cosa si vede:** calendario con i propri turni + sezione timbratura in basso: stato "Non hai ancora timbrato oggi", pulsante "Timbra entrata".

**Azione:** toccare "Timbra entrata".

**Cosa si vede:** lo stato cambia a "Entrato alle HH:MM". Il pulsante diventa "Timbra uscita".

**Cosa dire:** "Il check-in chiama `POST api/attendance/checkin` con body `{ shiftId: null }`. Il backend registra `CheckInTime` in UTC e verifica che non esista già un `AttendanceLog` aperto per oggi (409 se doppio check-in). Il ViewModel visualizza l'orario con `.ToLocalTime`."

**Azione:** toccare "Timbra uscita" → stato aggiornato con entrata e uscita.

---

#### 5.8 Richiesta ferie (20 sec)

**Azione:** toccare la tab VacationList → +.

**Cosa si vede:** `VacationEditPage` — picker tipo (Ferie/Permesso Pagato/Malattia/Permesso Non Pagato), date inizio/fine, campo motivo.

**Azione:** compilare → Salva.

**Cosa dire:** "Il `totalDays` viene calcolato lato client escludendo sabato e domenica. La richiesta appare in stato Pending nella lista admin."

---

#### 5.9 Export report CSV (15 sec)

**Azione:** toccare la tab Profile → Reports.

**Cosa si vede:** `ReportsPage` — due pulsanti (Ore turni / Presenze) con date picker.

**Azione:** scegliere il mese corrente → toccare "Scarica ore turni".

**Cosa si vede:** il sistema di condivisione Android si apre con il file CSV.

**Cosa dire:** "Il file viene scaricato da `GET api/reports/hours?from=yyyy-MM-dd&to=yyyy-MM-dd`, salvato temporaneamente in `FileSystem.CacheDirectory` e condiviso via `Share.RequestAsync`. L'intestazione CSV è sempre presente anche se l'intervallo non ha dati."

---

### 6. Testing (1 min)

**Cosa dire:**

> "Il backend ha 232 test automatici organizzati in due categorie."

**Test reali:**

| Categoria | Tecnologia | Esempi reali |
|---|---|---|
| Unit test service | xUnit, Moq | `VacationServiceTests.cs` (475 righe): creazione richiesta, approvazione, rifiuto, cancellazione, validazione date |
| Unit test service | xUnit, Moq | `ShiftServiceTests.cs`: creazione turno, conflitto orario, ricorrenza |
| Integration test | xUnit, `WebApplicationFactory` | Controller endpoint (auth, shifts, vacations, attendance) su DB in-memory o reale |

**Cosa non è testato:**
- UI MAUI: nessun test automatico (verificata manualmente su device Android)
- Portale web Next.js: nessuna test suite
- FCM: `FcmPushNotificationService` non ha test; failure silenziosa se la chiave è errata

**Coverage reale:** 232 test passano sulla build di rilascio (0 failure). Nessun dato di code coverage nel repository.

---

### 7. Conclusione (1 min)

**Cosa dire:**

> "Il progetto nella sua forma attuale è un MVP funzionante deployato su VPS. Questi sono i limiti reali."

**Limiti reali (presenti nel codice):**

- **Nessun refresh token**: su 401 l'app riporta al login; `AuthService.RefreshTokenAsync` lancia `NotImplementedException`
- **FCM non attivo**: `GetDeviceTokenAsync` restituisce `null` — le notifiche push non arrivano al device
- **Timbratura senza verifica posizione**: il check-in non valida la posizione GPS; un dipendente può timbrare da casa
- **Nessun test UI**: i flussi mobili sono verificati solo manualmente su Android
- **ManageDataPage**: registrata nell'AppShell ma il file XAML non esiste nel repository
- **Certificate pinning**: pin scadenza 2027-04-28 su `samuconfa.it`; da rinnovare prima della scadenza

**Possibili miglioramenti realistici:**

- Implementare il refresh token (il campo `refresh_token` esiste già nel DB e viene salvato in `SecureStorage`)
- Integrare Firebase (`Plugin.Firebase.CloudMessaging`): il `MobilePushService` è già pronto, manca solo il token reale
- Aggiungere validazione GPS al check-in (coordinate confrontate con la sede `Business.Address`)
- Separare i DTO inline dai ViewModel in file condivisi (`Shared/Dtos/`) per eliminare le duplicazioni (es. `BusinessItemDto` definita in 3 ViewModel diversi)
- Aggiungere test MAUI con `UITest` o `Appium`

---

## Note pre-demo

- Verificare che `https://samuconfa.it/turnify/health` risponda 200 prima di iniziare
- Avere già un account admin e almeno un dipendente creati sul server di produzione
- Il device Android deve avere l'app installata con `allowBackup="false"` — non è possibile ripristinare dati da backup
- Se si mostra il portale web: `https://samuconfa.it/admin/login` — solo admin possono accedere; i dipendenti ricevono errore esplicito
