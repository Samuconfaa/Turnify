# Progettazione Database — Turnify

**Versione:** 1.0  
**DBMS target:** MySQL 
**Approccio:** Code-First con Entity Framework Core  

---

## Panoramica Schema

```
Companies ──< Employees ──< Shifts
              │              │
              │              └──< AttendanceLogs
              │
              └──< VacationRequests
              │
              └──< Notifications

Users ──────── (auth)
  │
  └── Employees (relazione 1:1 per dipendenti con account)

Roles ───────── (assegnati a Users tramite UserRoles)
```

---

## Tabelle

---

### Users

**Scopo:** Gestisce l'identità di tutti gli utenti del sistema (admin e dipendenti). Separato da `Employees` per permettere account senza profilo dipendente (es. Super Admin).

| Campo | Tipo | Note |
|---|---|---|
| `Id` | INT (PK, auto-increment) | Identificatore univoco |
| `Email` | VARCHAR(255) | Univoco, usato per login |
| `PasswordHash` | VARCHAR(255) | BCrypt hash — mai in chiaro |
| `Role` | ENUM | `SuperAdmin`, `CompanyAdmin`, `Employee` |
| `CompanyId` | INT (FK → Companies) | NULL per SuperAdmin |
| `IsActive` | BOOLEAN | Soft delete / disattivazione account |
| `LastLoginAt` | TIMESTAMP | Ultimo accesso |
| `CreatedAt` | TIMESTAMP | Data creazione account |
| `UpdatedAt` | TIMESTAMP | Ultima modifica |

**Relazioni:** Un User può essere associato a un solo Employee (1:1 opzionale)

**Indici:** `Email` (UNIQUE), `CompanyId`

---

### Companies

**Scopo:** Rappresenta un'azienda cliente di Turnify. È il tenant root — ogni dato di business è collegato a una Company.

| Campo | Tipo | Note |
|---|---|---|
| `Id` | INT (PK) | |
| `Name` | VARCHAR(255) | Nome attività (es. "Pizzeria Roma") |
| `Slug` | VARCHAR(100) | URL-friendly, univoco (es. "pizzeria-roma") |
| `Email` | VARCHAR(255) | Email di contatto aziendale |
| `Phone` | VARCHAR(20) | Telefono |
| `Address` | VARCHAR(500) | Sede |
| `LogoUrl` | VARCHAR(500) | URL logo caricato |
| `BusinessType` | VARCHAR(100) | Es. "Ristorante", "Bar", "Palestra" |
| `IsActive` | BOOLEAN | Account attivo/sospeso |
| `SubscriptionPlan` | VARCHAR(50) | `Free`, `Basic`, `Pro` (per futuro SaaS) |
| `CreatedAt` | TIMESTAMP | |
| `UpdatedAt` | TIMESTAMP | |

**Relazioni:** Una Company ha molti Employees, molti Shifts, molte VacationRequests

**Indici:** `Slug` (UNIQUE)

---

### Employees

**Scopo:** Profilo lavorativo del dipendente all'interno di un'azienda. Separato da Users per poter avere dipendenti "offline" (senza account app) e per contenere dati HR senza mischiare con auth.

| Campo | Tipo | Note |
|---|---|---|
| `Id` | INT (PK) | |
| `CompanyId` | INT (FK → Companies) | Multi-tenancy |
| `UserId` | INT (FK → Users, nullable) | NULL se dipendente senza account |
| `FirstName` | VARCHAR(100) | |
| `LastName` | VARCHAR(100) | |
| `Email` | VARCHAR(255) | Contatto personale |
| `Phone` | VARCHAR(20) | |
| `Role` | VARCHAR(100) | Ruolo in azienda (es. "Cameriere", "Cuoco") |
| `ContractType` | ENUM | `FullTime`, `PartTime`, `Casual` |
| `WeeklyHours` | DECIMAL(4,1) | Ore contrattuali settimanali |
| `HireDate` | DATE | Data assunzione |
| `IsActive` | BOOLEAN | Dipendente attivo o archiviato |
| `Notes` | TEXT | Note interne manager |
| `CreatedAt` | TIMESTAMP | |
| `UpdatedAt` | TIMESTAMP | |

**Relazioni:** Un Employee appartiene a una Company, può avere molti Shifts, molte VacationRequests

**Indici:** `CompanyId`, `UserId`, `(CompanyId, Email)` UNIQUE

---

### Shifts

**Scopo:** Ogni turno di lavoro assegnato a un dipendente. È la tabella centrale del business logic.

| Campo | Tipo | Note |
|---|---|---|
| `Id` | INT (PK) | |
| `CompanyId` | INT (FK → Companies) | Multi-tenancy (ridondante ma utile per performance) |
| `EmployeeId` | INT (FK → Employees) | Dipendente assegnato |
| `StartTime` | TIMESTAMP | Inizio turno (UTC) |
| `EndTime` | TIMESTAMP | Fine turno (UTC) |
| `Label` | VARCHAR(100) | Es. "Apertura", "Chiusura", "Turno Pranzo" |
| `Note` | TEXT | Note specifiche del turno |
| `Status` | ENUM | `Scheduled`, `Confirmed`, `Cancelled`, `Completed` |
| `IsRecurring` | BOOLEAN | Fa parte di una serie ricorrente |
| `RecurringGroupId` | INT (nullable) | Raggruppa turni ricorrenti |
| `CreatedByUserId` | INT (FK → Users) | Chi ha creato il turno |
| `CreatedAt` | TIMESTAMP | |
| `UpdatedAt` | TIMESTAMP | |

**Regole di business:**
- Non possono esistere due turni sovrapposti per lo stesso `EmployeeId`
- `EndTime` deve essere > `StartTime`
- `CompanyId` deve corrispondere all'azienda dell'employee

**Indici:** `CompanyId`, `EmployeeId`, `(EmployeeId, StartTime)`, `StartTime`

---

### VacationRequests

**Scopo:** Gestisce il flusso di richiesta e approvazione di ferie, permessi e assenze.

| Campo | Tipo | Note |
|---|---|---|
| `Id` | INT (PK) | |
| `CompanyId` | INT (FK → Companies) | |
| `EmployeeId` | INT (FK → Employees) | Chi fa la richiesta |
| `Type` | ENUM | `Vacation`, `SickLeave`, `PersonalLeave`, `Other` |
| `StartDate` | DATE | Inizio periodo richiesto |
| `EndDate` | DATE | Fine periodo richiesto |
| `TotalDays` | INT | Calcolato: giorni lavorativi coinvolti |
| `Reason` | TEXT | Motivazione (opzionale) |
| `Status` | ENUM | `Pending`, `Approved`, `Rejected`, `Cancelled` |
| `ReviewedByUserId` | INT (FK → Users, nullable) | Chi ha approvato/rifiutato |
| `ReviewNote` | TEXT | Nota dell'admin |
| `ReviewedAt` | TIMESTAMP | Quando è stata processata |
| `CreatedAt` | TIMESTAMP | |
| `UpdatedAt` | TIMESTAMP | |

**Indici:** `CompanyId`, `EmployeeId`, `Status`, `(EmployeeId, StartDate)`

---

### Notifications

**Scopo:** Storico notifiche inviate e loro stato di lettura. Permette in-app notification center.

| Campo | Tipo | Note |
|---|---|---|
| `Id` | INT (PK) | |
| `CompanyId` | INT (FK → Companies) | |
| `RecipientUserId` | INT (FK → Users) | Destinatario |
| `Type` | ENUM | `ShiftCreated`, `ShiftModified`, `ShiftCancelled`, `VacationApproved`, `VacationRejected`, `General` |
| `Title` | VARCHAR(200) | Titolo notifica |
| `Body` | TEXT | Testo della notifica |
| `IsRead` | BOOLEAN | Letta dall'utente |
| `ReadAt` | TIMESTAMP | Quando è stata letta |
| `EntityType` | VARCHAR(50) | Es. "Shift", "VacationRequest" (per deep link) |
| `EntityId` | INT | ID entità collegata (per navigazione) |
| `CreatedAt` | TIMESTAMP | |

**Indici:** `RecipientUserId`, `(RecipientUserId, IsRead)`, `CreatedAt`

---

### AttendanceLogs

**Scopo:** Traccia la presenza effettiva (check-in/check-out). Nella v1.0 è alimentata manualmente o da integrazione futura GPS; confronta il turno previsto vs quello effettivo.

| Campo | Tipo | Note |
|---|---|---|
| `Id` | INT (PK) | |
| `CompanyId` | INT (FK → Companies) | |
| `EmployeeId` | INT (FK → Employees) | |
| `ShiftId` | INT (FK → Shifts, nullable) | Turno di riferimento |
| `CheckInTime` | TIMESTAMP | Timbratura entrata (UTC) |
| `CheckOutTime` | TIMESTAMP | Timbratura uscita (UTC) |
| `CheckInMethod` | ENUM | `Manual`, `GPS`, `QRCode` |
| `CheckInLatitude` | DECIMAL(9,6) | Per verifica GPS (futuro) |
| `CheckInLongitude` | DECIMAL(9,6) | |
| `Notes` | TEXT | Note specifiche |
| `CreatedAt` | TIMESTAMP | |

**Indici:** `CompanyId`, `EmployeeId`, `ShiftId`, `CheckInTime`

---

### Roles *(semplificato — gestito via ENUM in Users)*

Per la v1.0 i ruoli sono gestiti come ENUM nel campo `Users.Role`:
- `SuperAdmin` — accesso piattaforma completo
- `CompanyAdmin` — gestione completa della propria azienda
- `Employee` — accesso in sola lettura turni propri + richiesta ferie

Una gestione ruoli granulare con tabella `Roles` e `UserRoles` (N:N) è prevista per la v2.0.

---

## Relazioni Riepilogative

| Da | A | Tipo | Nota |
|---|---|---|---|
| Companies | Employees | 1:N | Un'azienda ha molti dipendenti |
| Companies | Shifts | 1:N | Multi-tenancy |
| Companies | VacationRequests | 1:N | Multi-tenancy |
| Employees | Users | 1:1 opzionale | Dipendente può avere account |
| Employees | Shifts | 1:N | Dipendente ha molti turni |
| Employees | VacationRequests | 1:N | |
| Employees | AttendanceLogs | 1:N | |
| Shifts | AttendanceLogs | 1:1 opzionale | Log presenza per turno |
| Users | Notifications | 1:N | Utente riceve notifiche |

---

## Considerazioni su Timezone

- Tutti i campi `TIMESTAMP` sono salvati in **UTC**
- La conversione al fuso orario locale avviene **lato client** (app mobile)
- Il backend restituisce sempre UTC nelle risposte API
- Il frontend converte usando il timezone del device o dell'azienda (salvato in Companies)
