# Specifica del progetto

## Titolo del progetto
Turnify

## Descrizione sintetica
Applicazione cross-platform per la gestione turni di piccole e medie imprese italiane. Composta da un'app mobile .NET MAUI (dipendenti e admin), un portale web Next.js (solo admin/datori di lavoro) e un backend ASP.NET Core con database MySQL. Permette la pianificazione turni, la timbratura presenze, la gestione ferie e la reportistica CSV, con ruoli distinti tra titolari e dipendenti.

## Utente target
- **Admin / Titolare:** gestisce turni, dipendenti, attività e ferie da mobile o portale web. Tipicamente titolare di bar, ristorante, negozio, palestra (1–3 sedi, 3–50 dipendenti).
- **Dipendente:** consulta i propri turni, timbra ingresso/uscita, richiede ferie e scarica report dal proprio smartphone.

## Problema affrontato
Le piccole imprese gestiscono i turni tramite canali informali (messaggistica, carta, voce), senza tracciabilità delle presenze né flusso strutturato per le richieste di ferie. Turnify centralizza pianificazione, timbratura e comunicazione in un'unica piattaforma, con separazione netta tra le funzioni del titolare e quelle del dipendente.

## Obiettivi del progetto
- O1: Permettere al titolare di creare, modificare ed eliminare turni (singoli e ricorrenti) e di vederli in un calendario condiviso con il team.
- O2: Consentire al dipendente di timbrare entrata/uscita, richiedere ferie/permessi e consultare il proprio storico presenze dall'app mobile.
- O3: Fornire al titolare reportistica esportabile in CSV (ore pianificate e presenze effettive) e un portale web dedicato per la gestione amministrativa.

## Funzionalità obbligatorie
- F1: Autenticazione JWT con ruoli distinti — admin login con email, dipendente login con username
- F2: Registrazione azienda (Company) con creazione account admin
- F3: Gestione dipendenti: creazione, modifica, disattivazione, assegnazione ad attività (Business)
- F4: Pianificazione turni singoli e ricorrenti (settimanale/giornaliera) con stati Scheduled/InProgress/Completed/Cancelled
- F5: Calendario turni in-app (admin e dipendente) con dettaglio turno
- F6: Timbratura presenze: check-in e check-out dal mobile, storico per dipendente
- F7: Richiesta ferie con tipi (Holiday, PaidLeave, UnpaidLeave, SickLeave) e flusso approvazione admin (Pending → Approved/Rejected/Cancelled)
- F8: Dashboard admin con riepilogo (ore, presenze, ferie pendenti)
- F9: Dashboard dipendente separata con turni e presenze personali
- F10: Impostazione giorni disponibili per dipendente (AvailabilityPage)
- F11: Profilo utente con avatar emoji, cambio password, consenso GDPR
- F12: Export report CSV (ore pianificate e presenze) con selezione intervallo date
- F13: Portale web Next.js per admin: dashboard, dipendenti, attività, turni, ferie, log errori
- F14: Notifiche push via FCM con badge contatore sulla tab Notifiche
- F15: Raccolta e visualizzazione errori client (ErrorReporterService → ErrorLogsController → dashboard web)

## Funzionalità opzionali
- Gestione più attività (Business) per azienda con orari di apertura/chiusura
- Forgot password con reset via email SMTP
- Onboarding guidato al primo avvio
- Selezione emoji come avatar profilo (EmojiPickerPage)
- Gestione dati GDPR (ManageDataPage con export/cancellazione dati personali)

## Requisiti non funzionali
- Architettura Clean Architecture a 4 layer: Core (dominio + interfacce), Infrastructure (EF Core + MySQL), Api (ASP.NET Core 10), Mobile (.NET MAUI 10)
- Pattern MVVM nel mobile: `ObservableObject` + `[ObservableProperty]` + `[RelayCommand]` via CommunityToolkit.Mvvm 8.4.2; zero logica nel code-behind
- Binding XAML type-safe con `x:DataType` su tutte le View
- Validazione input lato API centralizzata con FluentValidation (7 validator)
- Rate limiting per-IP sliding window: 10 req/min su `/auth`, 20 req/min su `/errorlogs`, 120 req/min globale
- Multi-tenancy: isolamento dati per `CompanyId` su ogni entità del dominio
- Certificate pinning su Android (`CertificatePinningHandler`)
- HTTPS obbligatorio in produzione; credenziali in variabili d'ambiente (DotNetEnv)
- JWT con validazione issuer, audience e lifetime; hash password con algoritmo non determinabile dal codice visionato (campo `PasswordHash` in User)
- Suite di test: unit test su service/repository + integration test con `WebApplicationFactory` (122 test totali)

## Schermate principali

**Mobile — Admin:**
- `LoginPage` — login con email
- `RegisterPage` — registrazione azienda
- `DashboardPage` — riepilogo admin
- `ShiftCalendarPage` — calendario turni (creazione, modifica, ricorrenza)
- `ShiftDetailPage` — dettaglio singolo turno
- `EmployeeListPage` — lista dipendenti con ricerca
- `EmployeeDetailPage` — profilo e dettaglio dipendente
- `BusinessListPage` / `BusinessDetailPage` / `BusinessOpeningHoursPage` — gestione attività
- `VacationListPage` / `VacationEditPage` — ferie (lista e form)
- `NotificationsPage` — notifiche con badge
- `ProfilePage` / `EmojiPickerPage` / `ManageDataPage` — profilo e impostazioni

**Mobile — Dipendente:**
- `LoginPage` — login con username
- `EmployeeDashboardPage` — dashboard personale
- `ShiftCalendarPage` — calendario (sola lettura dei propri turni)
- `AttendanceHistoryPage` — storico presenze con check-in/out
- `AvailabilityPage` — impostazione giorni disponibili
- `VacationListPage` / `VacationEditPage` — ferie personali
- `ReportsPage` — download CSV (ore e presenze) con scelta intervallo date
- `ChangePasswordPage` — cambio password
- `ForgotPasswordPage` — reset password via email

**Web admin (Next.js):**
- `/admin/login` — login riservato ai datori di lavoro
- `/dashboard` — overview aziendale
- `/dashboard/employees` — gestione dipendenti
- `/dashboard/businesses` — gestione attività
- `/dashboard/shifts` — gestione turni
- `/dashboard/vacations` — gestione ferie
- `/dashboard/error-logs` — log errori app mobile

## API esterne
- **Firebase FCM** — invio notifiche push ai dispositivi mobili (`FcmPushNotificationService`)
- **SMTP** — invio email per reset password (`SmtpEmailService`; server configurabile via `appsettings.json`)

## Dati locali
- **SecureStorage** (MAUI) — archiviazione del JWT access token e refresh token dopo il login
- **FileSystem.CacheDirectory** (MAUI) — salvataggio temporaneo del file CSV prima della condivisione tramite `Share.RequestAsync`
- **Preferences** (MAUI) — archiviazione locale di dati di sessione: ruolo utente in cache (`user_role_cached`), flag sessione attiva (`has_valid_session`), consenso GDPR (chiavi `CONSENT_GIVEN_KEY`, `CONSENT_VERSION_KEY`, `gdpr_marketing_accepted`, `gdpr_consent_date`). Non viene usato SQLite: tutti i dati applicativi persistenti sono sul backend MySQL.

## Vincoli
- Target mobile: Android (min API 21), iOS 15+, macOS Catalyst 15+, Windows 10 (19041+)
- Backend: .NET 10, MySQL (Pomelo EF Core); non compatibile con SQL Server senza migrazione provider
- Portale web: Next.js 14, Node 20+ richiesto in produzione (VPS con PM2)
- Login web riservato esclusivamente ai datori di lavoro (admin); dipendenti accedono solo da mobile
- I dipendenti si autenticano con username (non email); unicità garantita per `(CompanyId, Username)` a livello DB
- Separazione totale dei dati tra aziende: ogni query filtra per `CompanyId` estratto dal JWT

## Criteri di accettazione
- Un admin può creare un turno ricorrente e vederlo replicato nel calendario per le settimane successive
- Un dipendente può effettuare check-in e il sistema registra timestamp UTC; il check-out aggiorna la stessa riga `AttendanceLog`
- Una richiesta di ferie inviata da un dipendente appare in stato `Pending` nella lista admin; dopo approvazione lo stato diventa `Approved` per entrambi
- Il report CSV scaricato dall'app contiene le righe per l'intervallo date selezionato e viene condiviso tramite il sistema operativo
- Il login con email errata o password errata restituisce codice HTTP corretto (401), non un errore generico 500
- Un tentativo di registrazione con email admin già esistente restituisce 409 Conflict
- Superato il rate limit su `/auth` (10 req/min per IP) il server risponde 429 con messaggio leggibile
- L'AppShell rimuove le tab admin quando l'utente loggato è un dipendente e le ripristina per un admin

## Casi limite
- **Login dipendente con username inesistente o errato** — gestito in `AuthController`, restituisce 401
- **Check-in doppio senza check-out** — restituisce 409 Conflict con body `{ "message": "Sei già entrato oggi." }` (`AttendanceController.CheckIn` — controllo `existing != null && existing.CheckOutTime == null`)
- **Richiesta ferie con data fine antecedente alla data inizio** — validata lato mobile in `ReportsViewModel` (DateRange check); presenza di `CreateVacationRequestValidator` lato API
- **Token JWT scaduto** — `AuthDelegatingHandler` intercetta le risposte HTTP; comportamento di refresh non determinabile dal codice visionato (non trovato refresh automatico nel handler)
- **Report su intervallo senza dati** — il server restituisce CSV vuoto con intestazione; gestito come successo nel `ReportsViewModel`
- **Errore di rete durante operazione** — ogni ViewModel cattura `HttpRequestException` e `TaskCanceledException` con messaggi distinti; gli errori inattesi vengono inviati a `ErrorReporterService`
- **Errore applicazione non gestito** — `GlobalExceptionMiddleware` cattura tutte le eccezioni non trattate e restituisce risposta JSON uniforme

## Rischi principali
- **Dipendenza da MySQL in produzione** — il provider Pomelo è accoppiato; una migrazione a provider diverso richiederebbe refactoring del DbContext e delle migration
- **Timbratura senza verifica posizione** — il check-in avviene via app senza validazione GPS; un dipendente può timbrare da qualsiasi posizione
- **FCM non testato in integrazione** — `FcmPushNotificationService` non ha test nella suite attuale; failure silenziosa possibile se la chiave FCM è errata
- **Login dipendente con username** — introdotto nell'ultimo aggiornamento funzionale (29 apr); la migrazione `AddUsernameToUser` è manuale senza designer file generato automaticamente
- **Portale web senza test** — il progetto `Turnify.Web` non ha suite di test; la correttezza degli endpoint API chiamati da Next.js è verificata solo manualmente

## Versione MVP
Il progetto nella sua forma attuale costituisce un MVP funzionante che include:

- Backend ASP.NET Core 10 deployato su VPS (path base `/turnify`) con MySQL
- App mobile .NET MAUI per Android con autenticazione JWT differenziata per ruolo
- Flusso completo admin: registrazione azienda → gestione dipendenti → creazione turni (singoli e ricorrenti) → approvazione ferie → consultazione dashboard e report CSV
- Flusso completo dipendente: login con username → visualizzazione turni → timbratura → richiesta ferie → download report
- Portale web Next.js (admin-only) con le stesse funzionalità gestionali dell'app
- 122 test (unit + integrazione) su backend
