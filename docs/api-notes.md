# Note API — Turnify Mobile

## API principale

| Proprietà | Valore |
|---|---|
| Client HTTP | `IHttpClientFactory`, named client `"TurnifyApi"` |
| Base URL | `https://samuconfa.it/turnify/` |
| Timeout client | 30 secondi |
| Formato richiesta | `application/json` (via `PostAsJsonAsync` / `PutAsJsonAsync`) |
| Autenticazione | `Authorization: Bearer <jwt>` iniettato da `AuthDelegatingHandler` su ogni richiesta |
| Client auth separato | `AuthService` usa un secondo named client senza `AuthDelegatingHandler`; usato solo per `login`, `employee-login`, `forgot-password`, `reset-password` |

La base URL è configurata come costante `API_BASE` in `MauiProgram.cs`. Tutti gli endpoint nel codice usano path relativi (es. `"api/shifts"`), risolti rispetto a questa base.

---

## Endpoints

### Autenticazione

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| POST | `api/auth/register` | Pubblico | `{ companyName, companySlug, companyEmail, adminEmail, adminPassword }` | 409 se slug o email già esistente |
| POST | `api/auth/login` | Pubblico | `{ email, password }` | Rate limit 10 req/min per IP; 429 su superamento |
| POST | `api/auth/employee-login` | Pubblico | `{ companySlug, username, password }` | Rate limit 10 req/min per IP; 429 su superamento |
| POST | `api/auth/forgot-password` | Pubblico | `{ email }` | Risposta sempre 200 (non rivela se l'email esiste) |
| POST | `api/auth/reset-password` | Pubblico | `{ token, newPassword }` | `token` ricevuto via email SMTP |
| POST | `api/auth/logout` | Admin/Employee | nessun body | Fire-and-forget da `ProfileViewModel`; errori ignorati |

### Dashboard

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| GET | `api/dashboard/summary` | Admin | — | Riepilogo giornaliero con turni, ferie pendenti e contatori |
| GET | `api/dashboard/employee-summary` | Employee | — | Riepilogo personale dipendente |

### Turni

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| GET | `api/shifts` | Admin/Employee | `?from=<ISO8601-UTC>&to=<ISO8601-UTC>&pageSize=200` | Risposta paginata `{ data, total }`; usato anche per copia-settimana |
| GET | `api/shifts/{id}` | Admin | — | Dettaglio singolo turno; usato in `ShiftDetailViewModel` per edit |
| POST | `api/shifts` | Admin | `{ employeeId, startTime, endTime, label, note, status: 0, isRecurring }` | 409 se conflitto orario; `startTime`/`endTime` in UTC |
| PUT | `api/shifts/{id}` | Admin | `{ employeeId, startTime, endTime, label, note, status, isRecurring }` | — |
| DELETE | `api/shifts/{id}` | Admin | — | — |

### Richieste ferie

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| GET | `api/vacation-requests` | Admin/Employee | `?pageSize=200[&status=Pending\|Approved\|Rejected]` | Backend filtra per ruolo dal JWT |
| GET | `api/vacation-requests/approved` | Admin/Employee | `?from=<date>&to=<date>` | Usato nel calendario per evidenziare giorni di ferie approvate |
| POST | `api/vacation-requests` | Employee | `{ employeeId, type, startDate, endDate, totalDays, reason }` | `totalDays` calcolato lato client escludendo weekend |
| PUT | `api/vacation-requests/{id}` | Admin | `{ type, startDate, endDate, totalDays, reason, status }` | Solo admin può modificare lo `status` |
| PUT | `api/vacation-requests/{id}/approve` | Admin | `{ note }` | — |
| PUT | `api/vacation-requests/{id}/reject` | Admin | `{ note }` | — |
| DELETE | `api/vacation-requests/{id}` | Employee | — | — |

### Presenze

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| GET | `api/attendance/today` | Employee | — | Stato timbratura odierna |
| POST | `api/attendance/checkin` | Employee | `{ shiftId?: int }` | 409 se già timbrato oggi (`"Sei già entrato oggi."`) |
| POST | `api/attendance/checkout` | Employee | `{}` | — |
| GET | `api/attendance/monthly-summary` | Employee | `?year=<int>&month=<int>` | Sommario mensile; usato in `AttendanceHistoryViewModel` |
| GET | `api/attendance/history` | Employee | `?from=<date>&to=<date>&pageSize=100` | Storico paginato |

### Dipendenti

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| GET | `api/employees` | Admin | `[?businessId=<int>]` | Tutti i dipendenti dell'azienda; filtro sede opzionale |
| GET | `api/employees/{id}` | Admin | — | — |
| POST | `api/employees` | Admin | `{ firstName, lastName, username, email?, phone, role, accountRole, contractType, weeklyHours, businessId?, isActive, password }` | 400 se username già in uso nella stessa azienda |
| PUT | `api/employees/{id}` | Admin | stesso schema POST (password esclusa nel body) | — |
| PUT | `api/employees/{id}/password` | Admin | `{ newPassword }` | Reset password da parte dell'admin |
| DELETE | `api/employees/{id}` | Admin | — | Soft delete (disattiva, non cancella) |
| GET | `api/employees/me/availability` | Employee | — | Giorni disponibili del dipendente corrente |
| PUT | `api/employees/me/availability` | Employee | `{ availableDays: "<CSV 0-6>" }` | Es. `"1,2,3,4,5"` = Lun-Ven; `0` = domenica |

### Attività (Business)

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| GET | `api/businesses` | Admin | — | Usato anche da `ProfileViewModel` per mostrare il nome sede |
| GET | `api/businesses/{id}` | Admin | — | — |
| POST | `api/businesses` | Admin | `{ name, businessType, address, phone, isActive }` | — |
| PUT | `api/businesses/{id}` | Admin | stesso schema POST | — |
| DELETE | `api/businesses/{id}` | Admin | — | — |
| GET | `api/businesses/{id}/opening-hours` | Admin | — | Restituisce `Dictionary<string, { isOpen, open?, close? }>` |
| PUT | `api/businesses/{id}/opening-hours` | Admin | stesso dictionary | — |

### Utente corrente

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| GET | `api/users/me` | Admin/Employee | — | Profilo base; shape diversa per `ProfileViewModel` vs `VacationListViewModel` (vedi Problemi) |
| PUT | `api/users/me/avatar-emoji` | Admin/Employee | `{ avatarEmoji }` | Fire-and-forget; errori ignorati |
| PUT | `api/users/me/password` | Admin/Employee | `{ currentPassword, newPassword }` | 400 se password attuale errata; client tratta 400 come "Password attuale non corretta." |
| GET | `api/users/me/export-data` | Admin/Employee | — | GDPR Art. 20; aperto via `Browser.OpenAsync`, non `HttpClient` |
| POST | `api/users/me/request-deletion` | Admin/Employee | nessun body | GDPR Art. 17; cancella sessione locale dopo 200 |

### Notifiche

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| GET | `api/notifications` | Admin/Employee | `?pageSize=50` | — |
| PUT | `api/notifications/{id}/read` | Admin/Employee | — | Fire-and-forget; errori ignorati |
| PUT | `api/notifications/read-all` | Admin/Employee | — | Fire-and-forget; errori ignorati |

### Report

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| GET | `api/reports/hours` | Admin/Employee | `?from=yyyy-MM-dd&to=yyyy-MM-dd` | Risposta: bytes CSV; intestazione CSV presente anche se intervallo vuoto |
| GET | `api/reports/attendance` | Admin/Employee | `?from=yyyy-MM-dd&to=yyyy-MM-dd` | Risposta: bytes CSV |

### Token dispositivo (FCM)

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| POST | `api/device-tokens` | Admin/Employee | `{ token, platform }` | Registrazione token FCM al login; saltato se token invariato (confronto `SecureStorage`) |
| DELETE | `api/device-tokens` | Admin/Employee | body: `{ token, platform }` | Via `HttpRequestMessage` manuale — `DeleteAsync` non supporta body |

### Log errori

| Metodo | Path | Scope | Parametri richiesta | Note |
|---|---|---|---|---|
| POST | `api/errorlogs` | Pubblico | `{ deviceId, platform, appVersion, errorType, message, stackTrace?, screenName?, occurredAt }` | Rate limit 20 req/min; fire-and-forget; mai lancia eccezioni |

---

## Formato risposta

### Login / Employee login
```json
{ "accessToken": "...", "refreshToken": "..." }
```

### Dashboard summary (admin) — `DashboardSummaryDto`
```json
{
  "totalEmployees": 5,
  "shiftsThisWeek": 12,
  "pendingVacations": 2,
  "totalHoursScheduled": 48.0,
  "shiftsToday": [
    { "id": 1, "employeeName": "Mario Rossi", "startTime": "2026-04-29T08:00:00Z", "endTime": "2026-04-29T16:00:00Z", "role": "Cassiere", "status": "Scheduled" }
  ],
  "pendingRequests": [
    { "id": 3, "employeeName": "Luca Bianchi", "startDate": "2026-05-01T00:00:00Z", "endDate": "2026-05-05T00:00:00Z", "type": "Holiday" }
  ]
}
```

### Dashboard employee summary — `EmployeeSummaryDto`
```json
{
  "nextShift": { "id": 5, "startTime": "2026-04-30T08:00:00Z", "endTime": "2026-04-30T16:00:00Z", "label": "Apertura", "note": "" },
  "vacationDaysUsedThisYear": 3,
  "vacationDaysAllowed": 20,
  "pendingVacationRequests": 1,
  "isCheckedInToday": false,
  "todayCheckIn": null,
  "todayCheckOut": null,
  "hoursWorkedThisMonth": 72.5,
  "hoursScheduledThisWeek": 40.0
}
```

### Turni lista paginata — `ShiftListResponse`
```json
{
  "data": [
    { "id": 1, "employeeId": 2, "employeeName": "Mario Rossi", "startTime": "...", "endTime": "...", "label": "Mattina", "status": "Scheduled" }
  ],
  "total": 1
}
```

### Turno dettaglio — `ShiftApiDto`
```json
{ "id": 1, "employeeId": 2, "startTime": "...", "endTime": "...", "label": "Mattina", "note": "" }
```

### Vacation requests lista — `VacationRequestDto[]`
```json
[{
  "id": 1, "employeeId": 2, "employeeName": "Mario Rossi",
  "type": "Holiday", "status": "Pending",
  "startDate": "2026-05-01T00:00:00Z", "endDate": "2026-05-05T00:00:00Z",
  "totalDays": 5, "reason": "Vacanze estive", "reviewNote": null, "reviewedAt": null
}]
```

### Vacation requests approvate (calendario) — `ApprovedVacationDto[]`
```json
[{ "employeeId": 2, "employeeName": "Mario Rossi", "startDate": "...", "endDate": "...", "type": "Holiday" }]
```

### Attendance today — `AttendanceTodayDto`
```json
{ "isCheckedIn": true, "checkInTime": "2026-04-29T07:00:00Z", "checkOutTime": null }
```

### Attendance history paginata
```json
{
  "data": [
    { "id": 1, "checkInTime": "2026-04-28T07:00:00Z", "checkOutTime": "2026-04-28T15:30:00Z", "hoursWorked": 8.5, "checkInMethod": "App", "notes": "" }
  ],
  "total": 10
}
```

### Attendance monthly summary — `MonthlySummaryDto`
```json
{ "year": 2026, "month": 4, "daysWorked": 18, "totalHours": 153.0 }
```

### Employees lista — `EmployeeListDto[]`
```json
[{
  "id": 1, "firstName": "Mario", "lastName": "Rossi",
  "email": "mario@example.com", "role": "Cassiere",
  "contractType": "FullTime", "isActive": true, "businessId": 1
}]
```

### Employee dettaglio — `EmployeeDetailDto`
```json
{
  "id": 1, "firstName": "Mario", "lastName": "Rossi",
  "username": "mario.rossi", "email": "mario@example.com",
  "phone": "", "role": "Cassiere", "accountRole": "Employee",
  "contractType": "FullTime", "weeklyHours": 40,
  "isActive": true, "businessId": 1, "password": ""
}
```

### Availability — `AvailabilityDto`
```json
{ "availableDays": "1,2,3,4,5" }
```

### Businesses lista — `BusinessDto[]`
```json
[{ "id": 1, "name": "Bar Centro", "businessType": "Bar", "address": "Via Roma 1", "phone": "", "isActive": true }]
```

### Business opening hours — `Dictionary<string, DayScheduleDto>`
```json
{
  "monday":    { "isOpen": true,  "open": "08:00", "close": "22:00" },
  "tuesday":   { "isOpen": true,  "open": "08:00", "close": "22:00" },
  "wednesday": { "isOpen": true,  "open": "08:00", "close": "22:00" },
  "thursday":  { "isOpen": true,  "open": "08:00", "close": "22:00" },
  "friday":    { "isOpen": true,  "open": "08:00", "close": "22:00" },
  "saturday":  { "isOpen": false, "open": null,    "close": null    },
  "sunday":    { "isOpen": false, "open": null,    "close": null    }
}
```

### Users/me — `UserMeResponse`
```json
{ "email": "admin@example.com", "role": "Admin", "firstName": "Admin", "lastName": "Turnify", "avatarEmoji": "☕" }
```
> `VacationListViewModel` usa lo stesso endpoint ma deserializza solo `{ id, employeeId }`.

### Notifications — `NotificationsResponse`
```json
{
  "data": [{ "id": 1, "type": "Info", "isRead": false, "userId": 5 }],
  "unreadCount": 3
}
```

### Report CSV
Risposta raw `text/csv`. Intestazione CSV sempre presente anche se l'intervallo non ha dati. Salvato in `FileSystem.CacheDirectory` come `<prefisso>_<from>_<to>.csv` e condiviso via `Share.RequestAsync`.

---

## Limiti noti

| Endpoint | Limite |
|---|---|
| `POST api/auth/login`, `api/auth/employee-login` | 10 req/min per IP (sliding window) |
| `POST api/errorlogs` | 20 req/min per IP |
| Tutti gli altri | 120 req/min globale |

- **Timeout**: 30 secondi per ogni richiesta (configurato in `MauiProgram.cs`).
- **Paginazione**: `pageSize=200` per turni e ferie, `pageSize=50` per notifiche, `pageSize=100` per storico presenze. Nessun paging progressivo: l'app carica tutto in una sola chiamata.
- **Formato date**: `ISO 8601 UTC` (`yyyy-MM-ddTHH:mm:ssZ`) per turni e presenze; `yyyy-MM-dd` per i report. I ViewModel chiamano `.ToLocalTime` prima del display.
- **`DELETE api/device-tokens`** invia un body JSON in una richiesta DELETE via `HttpRequestMessage` manuale — comportamento non standard, necessario perché `HttpClient.DeleteAsync` non accetta un body.

---

## Problemi riscontrati

- **Token refresh assente**: `AuthDelegatingHandler` su risposta 401 cancella la sessione e rimanda al login senza tentare refresh. `AuthService.RefreshTokenAsync` lancia `NotImplementedException`.
- **`RegisterCompanyAsync` e `LogoutAsync` non implementati in `AuthService`**: entrambi lanciano `NotImplementedException`. Il logout è gestito direttamente da `ProfileViewModel` con `POST api/auth/logout` fire-and-forget + pulizia manuale di `SecureStorage` e `Preferences`.
- **FCM non attivo**: `MobilePushService.GetDeviceTokenAsync` restituisce sempre `null` (Firebase non integrato). La registrazione del token (`POST api/device-tokens`) non viene mai eseguita.
- **`api/users/me` con shape ambigua**: `ProfileViewModel` si aspetta `{ email, role, firstName, lastName, avatarEmoji }`; `VacationListViewModel` usa lo stesso endpoint per ottenere `{ id, employeeId }`. Il backend restituisce probabilmente il DTO completo e ciascun ViewModel deserializza solo i campi necessari, ma non esiste un DTO condiviso nel codice mobile.
- **`api/users/me/export-data`** è aperto via `Browser.OpenAsync` invece di `HttpClient.GetAsync`: il JWT non viene inviato nell'header della richiesta browser. Se l'endpoint richiede autenticazione, l'esportazione restituirà 401 silenziosamente.

---

## Mock data

Nessuna. Tutti i dati mostrati nell'app provengono da chiamate reali al backend. Non esistono dati statici, stub o file JSON locali nel progetto.
