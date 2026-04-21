# API Design — Turnify REST API

**Versione:** 1.0  
**Base URL:** `https://api.turnify.it/v1`  
**Formato:** JSON  
**Autenticazione:** JWT Bearer Token  

---

## Convenzioni

- Tutte le route usano **kebab-case** e **nomi plurali** per le risorse
- I parametri di path usano `{id}` intero
- Le date sono in formato **ISO 8601 UTC**: `2024-06-15T14:30:00Z`
- Gli errori seguono **RFC 7807 Problem Details**
- I codici di stato HTTP seguono le convenzioni REST standard

### Struttura risposta errore
```json
{
  "type": "https://turnify.it/errors/not-found",
  "title": "Risorsa non trovata",
  "status": 404,
  "detail": "Il turno con ID 42 non esiste.",
  "traceId": "0HN3C2J..."
}
```

### Autenticazione
Tutti gli endpoint (eccetto `/auth/*`) richiedono:
```
Authorization: Bearer <access_token>
```

---

## Sezione 1 — Autenticazione

### POST `/auth/login`
Effettua il login e restituisce i token JWT.

**Autorizzazione:** Pubblica (nessun token richiesto)

**Input:**
```json
{
  "email": "mario@pizzeriaroma.it",
  "password": "SecurePass123!"
}
```

**Output (200):**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "dGhpcyBp...",
  "expiresIn": 900,
  "user": {
    "id": 1,
    "email": "mario@pizzeriaroma.it",
    "role": "CompanyAdmin",
    "companyId": 5
  }
}
```

**Errori:** 400 (input invalido), 401 (credenziali errate)

---

### POST `/auth/refresh`
Rinnova l'access token usando il refresh token.

**Autorizzazione:** Pubblica

**Input:**
```json
{ "refreshToken": "dGhpcyBp..." }
```

**Output (200):**
```json
{
  "accessToken": "eyJhbGci...",
  "expiresIn": 900
}
```

**Errori:** 401 (refresh token invalido o scaduto)

---

### POST `/auth/logout`
Invalida il refresh token corrente (revoca).

**Autorizzazione:** Autenticato

**Input:** nessuno (il refresh token viene estratto dal body o header)

**Output (204):** No content

---

### POST `/auth/register`
Registra una nuova azienda con il suo primo admin.

**Autorizzazione:** Pubblica

**Input:**
```json
{
  "company": {
    "name": "Pizzeria Roma",
    "businessType": "Ristorante",
    "email": "info@pizzeriaroma.it"
  },
  "admin": {
    "firstName": "Mario",
    "lastName": "Rossi",
    "email": "mario@pizzeriaroma.it",
    "password": "SecurePass123!"
  }
}
```

**Output (201):** stesso schema di `/auth/login`

---

## Sezione 2 — Utenti

### GET `/users/me`
Restituisce il profilo dell'utente autenticato.

**Autorizzazione:** Qualsiasi ruolo

**Output (200):**
```json
{
  "id": 1,
  "email": "mario@pizzeriaroma.it",
  "role": "CompanyAdmin",
  "companyId": 5,
  "lastLoginAt": "2024-06-15T10:00:00Z"
}
```

---

### PUT `/users/me/password`
Cambia la password dell'utente autenticato.

**Autorizzazione:** Qualsiasi ruolo

**Input:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Output (204):** No content

---

## Sezione 3 — Dipendenti

### GET `/employees`
Lista dipendenti dell'azienda corrente.

**Autorizzazione:** CompanyAdmin

**Query params:** `?isActive=true&page=1&pageSize=20&search=mario`

**Output (200):**
```json
{
  "data": [
    {
      "id": 10,
      "firstName": "Luigi",
      "lastName": "Verdi",
      "email": "luigi@example.com",
      "role": "Cameriere",
      "contractType": "FullTime",
      "weeklyHours": 40.0,
      "isActive": true
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 20
}
```

---

### POST `/employees`
Crea un nuovo dipendente nell'azienda.

**Autorizzazione:** CompanyAdmin

**Input:**
```json
{
  "firstName": "Luigi",
  "lastName": "Verdi",
  "email": "luigi@example.com",
  "phone": "+39 333 1234567",
  "role": "Cameriere",
  "contractType": "FullTime",
  "weeklyHours": 40.0,
  "hireDate": "2024-01-15"
}
```

**Output (201):** Oggetto Employee creato

---

### GET `/employees/{id}`
Dettaglio singolo dipendente.

**Autorizzazione:** CompanyAdmin o Employee (solo il proprio profilo)

**Output (200):** Oggetto Employee con tutti i campi

---

### PUT `/employees/{id}`
Aggiorna i dati di un dipendente.

**Autorizzazione:** CompanyAdmin

**Input:** Stessa struttura di POST (parziale accettato)

**Output (200):** Oggetto Employee aggiornato

---

### DELETE `/employees/{id}`
Archivia (soft delete) un dipendente. Non elimina i dati storici.

**Autorizzazione:** CompanyAdmin

**Output (204):** No content

---

## Sezione 4 — Turni

### GET `/shifts`
Lista turni con filtri.

**Autorizzazione:** CompanyAdmin (tutti), Employee (solo i propri)

**Query params:** `?employeeId=10&from=2024-06-01&to=2024-06-30&status=Scheduled`

**Output (200):**
```json
{
  "data": [
    {
      "id": 100,
      "employeeId": 10,
      "employeeName": "Luigi Verdi",
      "startTime": "2024-06-15T08:00:00Z",
      "endTime": "2024-06-15T16:00:00Z",
      "label": "Turno Pranzo",
      "status": "Scheduled",
      "note": null
    }
  ],
  "total": 45
}
```

---

### POST `/shifts`
Crea un nuovo turno.

**Autorizzazione:** CompanyAdmin

**Input:**
```json
{
  "employeeId": 10,
  "startTime": "2024-06-15T08:00:00Z",
  "endTime": "2024-06-15T16:00:00Z",
  "label": "Turno Pranzo",
  "note": "Copertura per Marco assente"
}
```

**Output (201):** Oggetto Shift creato

**Errori:** 409 (turno sovrapposto per lo stesso dipendente)

---

### GET `/shifts/{id}`
Dettaglio singolo turno.

**Autorizzazione:** CompanyAdmin o Employee assegnato

**Output (200):** Oggetto Shift completo

---

### PUT `/shifts/{id}`
Modifica un turno esistente.

**Autorizzazione:** CompanyAdmin

**Input:** Stessa struttura di POST

**Output (200):** Oggetto Shift aggiornato

---

### DELETE `/shifts/{id}`
Cancella o annulla un turno.

**Autorizzazione:** CompanyAdmin

**Query params:** `?softDelete=true` (imposta status = Cancelled invece di eliminare)

**Output (204):** No content

---

## Sezione 5 — Ferie e Permessi

### GET `/vacation-requests`
Lista richieste ferie.

**Autorizzazione:** CompanyAdmin (tutte), Employee (solo le proprie)

**Query params:** `?status=Pending&employeeId=10&year=2024`

**Output (200):**
```json
{
  "data": [
    {
      "id": 55,
      "employeeId": 10,
      "employeeName": "Luigi Verdi",
      "type": "Vacation",
      "startDate": "2024-07-01",
      "endDate": "2024-07-14",
      "totalDays": 10,
      "status": "Pending",
      "reason": "Vacanze estive",
      "createdAt": "2024-06-10T09:00:00Z"
    }
  ],
  "total": 3
}
```

---

### POST `/vacation-requests`
Crea una nuova richiesta di ferie.

**Autorizzazione:** Employee (per sé stesso), CompanyAdmin (per qualsiasi dipendente)

**Input:**
```json
{
  "type": "Vacation",
  "startDate": "2024-07-01",
  "endDate": "2024-07-14",
  "reason": "Vacanze estive"
}
```

**Output (201):** Oggetto VacationRequest creato

---

### PUT `/vacation-requests/{id}/approve`
Approva una richiesta di ferie.

**Autorizzazione:** CompanyAdmin

**Input:**
```json
{ "note": "Approvato. Ricorda di trovare un sostituto." }
```

**Output (200):** Oggetto VacationRequest aggiornato con status = Approved

---

### PUT `/vacation-requests/{id}/reject`
Rifiuta una richiesta di ferie.

**Autorizzazione:** CompanyAdmin

**Input:**
```json
{ "note": "Non possiamo coprire il turno in quelle date." }
```

**Output (200):** Oggetto VacationRequest con status = Rejected

---

### DELETE `/vacation-requests/{id}`
Annulla una richiesta (solo se ancora Pending).

**Autorizzazione:** Employee (propria richiesta), CompanyAdmin

**Output (204):** No content

---

## Sezione 6 — Dashboard e Statistiche

### GET `/dashboard/summary`
Panoramica rapida per l'admin.

**Autorizzazione:** CompanyAdmin

**Query params:** `?from=2024-06-01&to=2024-06-30`

**Output (200):**
```json
{
  "period": { "from": "2024-06-01", "to": "2024-06-30" },
  "totalEmployees": 12,
  "activeEmployees": 10,
  "totalShiftsScheduled": 180,
  "totalHoursScheduled": 720.5,
  "pendingVacationRequests": 3,
  "shiftsThisWeek": 45
}
```

---

### GET `/dashboard/hours-by-employee`
Ore lavorate per dipendente nel periodo.

**Autorizzazione:** CompanyAdmin

**Query params:** `?from=2024-06-01&to=2024-06-30`

**Output (200):**
```json
{
  "data": [
    {
      "employeeId": 10,
      "employeeName": "Luigi Verdi",
      "scheduledHours": 160.0,
      "actualHours": 158.5,
      "shiftsCount": 20
    }
  ]
}
```

---

## Sezione 7 — Notifiche

### GET `/notifications`
Lista notifiche dell'utente autenticato.

**Autorizzazione:** Qualsiasi ruolo

**Query params:** `?isRead=false&page=1&pageSize=20`

**Output (200):**
```json
{
  "data": [
    {
      "id": 200,
      "type": "ShiftCreated",
      "title": "Nuovo turno assegnato",
      "body": "Ti è stato assegnato un turno il 15 giugno dalle 8:00 alle 16:00.",
      "isRead": false,
      "createdAt": "2024-06-10T11:00:00Z",
      "entityType": "Shift",
      "entityId": 100
    }
  ],
  "unreadCount": 5
}
```

---

### PUT `/notifications/{id}/read`
Segna una notifica come letta.

**Autorizzazione:** Proprietario notifica

**Output (204):** No content

---

### PUT `/notifications/read-all`
Segna tutte le notifiche come lette.

**Autorizzazione:** Qualsiasi ruolo

**Output (204):** No content

---

## Riepilogo Autorizzazioni

| Endpoint | SuperAdmin | CompanyAdmin | Employee |
|---|---|---|---|
| Auth (login, register) | ✅ | ✅ | ✅ |
| GET /employees | ✅ | ✅ (propria azienda) | ❌ |
| POST/PUT/DELETE /employees | ✅ | ✅ | ❌ |
| GET /shifts | ✅ | ✅ (tutti) | ✅ (propri) |
| POST/PUT/DELETE /shifts | ✅ | ✅ | ❌ |
| GET /vacation-requests | ✅ | ✅ (tutti) | ✅ (proprie) |
| POST /vacation-requests | ✅ | ✅ | ✅ |
| Approve/Reject vacation | ✅ | ✅ | ❌ |
| GET /dashboard/* | ✅ | ✅ | ❌ |
| GET /notifications | ✅ | ✅ | ✅ |
