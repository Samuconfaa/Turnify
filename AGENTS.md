# AGENTS.md — Istruzioni per AI Assistant

Questo file guida qualsiasi AI assistant (Claude, Copilot, Cursor, ecc.) che lavora sul codebase di Turnify.
Leggi questo file prima di ogni sessione di lavoro sul progetto.

---

## Panoramica Progetto

Turnify è un'applicazione mobile per la gestione turni dei dipendenti, rivolta a PMI italiane.

- **Frontend:** .NET MAUI, pattern MVVM
- **Backend:** ASP.NET Core Web API, RESTful
- **Database:** PostgreSQL
- **Auth:** JWT
- **Hosting:** VPS Linux con Nginx

---

## Convenzioni di Naming

### Generale
- Usa **PascalCase** per classi, interfacce, metodi pubblici, proprietà
- Usa **camelCase** per variabili locali e parametri
- Usa **_camelCase** (underscore prefisso) per campi privati
- Usa **SCREAMING_SNAKE_CASE** per costanti
- Evita abbreviazioni non standard (es. `employeeId` non `empId`)

### Naming per Layer

| Layer | Convenzione | Esempi |
|---|---|---|
| ViewModel | `*ViewModel` | `ShiftListViewModel`, `LoginViewModel` |
| View (MAUI) | `*Page` o `*View` | `DashboardPage`, `ShiftCalendarView` |
| Model | sostantivi semplici | `Shift`, `Employee`, `VacationRequest` |
| Service (backend) | `*Service` | `ShiftService`, `AuthService` |
| Repository | `*Repository` | `ShiftRepository`, `UserRepository` |
| Controller | `*Controller` | `ShiftsController`, `AuthController` |
| DTO | `*Dto` o `*Request`/`*Response` | `ShiftDto`, `LoginRequest`, `TokenResponse` |
| Interface | `I*` | `IShiftService`, `IUserRepository` |

### Database
- Tabelle: **PascalCase plurale** (`Shifts`, `Employees`, `VacationRequests`)
- Colonne: **PascalCase** (`CreatedAt`, `EmployeeId`)
- Chiavi esterne: `{NomeEntità}Id` (es. `ShiftId`, `CompanyId`)
- Indici: `IX_{Tabella}_{Colonna}` (es. `IX_Shifts_EmployeeId`)

---

## Stile Codice

### Principi Generali
- **Chiarezza sopra la brevità** — il codice deve essere leggibile senza documentazione aggiuntiva
- **Metodi corti** — massimo 30 righe per metodo; se supera, refactoring
- **Responsabilità singola** — ogni classe fa una cosa sola (SRP)
- **Nessuna logica di business nei Controller** — tutta delegata ai Service
- **Nessuna logica di business nei ViewModel** — usa i Service/Use Case dedicati
- **Nessun magic number** — usa costanti con nome significativo

### C# Specifico
```csharp
// ✅ CORRETTO
public async Task<ShiftDto> GetShiftAsync(int shiftId, CancellationToken ct = default)
{
    var shift = await _shiftRepository.GetByIdAsync(shiftId, ct)
        ?? throw new NotFoundException($"Turno {shiftId} non trovato.");
    return _mapper.Map<ShiftDto>(shift);
}

// ❌ SBAGLIATO
public ShiftDto getshift(int id) {
    var s = repo.Get(id);
    return map(s);
}
```

- Usa `async/await` per tutte le operazioni I/O
- Usa `CancellationToken` nei metodi async pubblici
- Usa `record` per DTO immutabili
- Preferisci `IReadOnlyList<T>` a `List<T>` nelle interfacce pubbliche

---

## Pattern MVVM (Frontend MAUI)

Rispetta rigorosamente la separazione:

```
View (Page/XAML)
    ↕ binding
ViewModel (logica presentazione)
    ↕ chiamate
Service / Repository (dati)
    ↕
Model (entità dominio)
```

**Regole:**
- Le `Page` non contengono logica — solo binding e navigazione
- I `ViewModel` espongono `ObservableProperty` tramite CommunityToolkit.Mvvm
- Usa `[RelayCommand]` per i comandi, non implementare `ICommand` manualmente
- Usa `[ObservableProperty]` per le proprietà bindabili
- La navigazione avviene nel ViewModel tramite `INavigationService`

---

## Separazione delle Responsabilità

### Backend (3 layer)

| Layer | Responsabilità | NON deve fare |
|---|---|---|
| **Presentation** (Controller) | Riceve HTTP, valida input, chiama Service, restituisce risposta | Logica di business, accesso DB diretto |
| **Business** (Service) | Implementa le regole di dominio | Accesso DB diretto, conoscere HTTP |
| **Data** (Repository) | CRUD database, query | Regole di business, mappature DTO |

### Frontend (MVVM)
- **View** → presenta dati, cattura input utente
- **ViewModel** → stato UI, gestisce comandi, chiama Service
- **Model/Service** → dati e logica applicativa

---

## Sicurezza — Priorità Assoluta

Prima di consegnare qualsiasi funzionalità, verifica sempre:

- [ ] Input validato lato server (mai fidarsi del client)
- [ ] Autorizzazione verificata (non solo autenticazione)
- [ ] Nessuna informazione sensibile nei log
- [ ] Password mai in chiaro (usa BCrypt)
- [ ] JWT con scadenza breve (access: 15min, refresh: 7gg)
- [ ] SQL costruito solo tramite ORM/parametrizzato (mai string concat)
- [ ] Endpoint sensibili protetti da rate limiting
- [ ] HTTPS obbligatorio (nessun fallback HTTP)

---

## Commenti nel Codice

**Quando commentare:**
- Spiega il *perché*, non il *cosa* (il codice spiega già il cosa)
- Documenta workaround non ovvi con riferimento al problema
- Commenta le API pubbliche con XML doc (`///`)

**Quando NON commentare:**
- Codice auto-esplicativo (`// incrementa il contatore` su `count++`)
- Codice morto — eliminalo, non commentarlo
- TODO non tracciati — usa issue nel tracker

```csharp
// ✅ Commento utile
// Usiamo un lock qui perché CompanySettings viene letto da più thread
// durante l'inizializzazione; vedere issue #47
lock (_settingsLock) { ... }

// ❌ Commento inutile
// Ottiene il turno per ID
var shift = await GetShiftAsync(id);
```

---

## Evitare Duplicazioni (DRY)

- Prima di scrivere una nuova funzione, cerca se esiste già qualcosa di simile
- Estrai logica comune in metodi/classi condivise
- Usa estensioni (extension methods) per logica ripetitiva su tipi esistenti
- Le costanti condivise vanno in `Constants.cs` o file dedicati per dominio

---

## Preferire Semplicità e Manutenibilità

- **YAGNI** (You Ain't Gonna Need It) — non implementare funzionalità non richieste ora
- **Composition over inheritance** — preferisci interfacce e composizione
- **Fail fast** — valida input all'ingresso, lancia eccezioni chiare immediatamente
- Evita classi con più di 300 righe — segnale di refactoring necessario
- Preferisci strutture dati semplici a gerarchie di classi complesse

---

## Testing

Ogni funzionalità nuova richiede:
1. Unit test per i Service (logica di business)
2. Integration test per gli endpoint critici (auth, turni, ferie)
3. Nessun codice di produzione con coverage < 70% sui Service

Usa **xUnit** + **Moq** + **FluentAssertions** per il backend.

---

## Gestione Errori

- Usa un middleware globale per la gestione delle eccezioni (non try/catch ovunque)
- Distingui: errori di validazione (400), non trovato (404), non autorizzato (401/403), errori server (500)
- Restituisci sempre un `ProblemDetails` standard (RFC 7807)
- Non esporre stack trace in produzione

---

## Git e Workflow

- Branch naming: `feature/nome-feature`, `fix/descrizione-bug`, `chore/nome-task`
- Commit messages in italiano o inglese, formato imperativo: `Aggiungi endpoint creazione turno`
- Nessun commit diretto su `main` — usa Pull Request
- Ogni PR deve avere almeno un test che copre il caso principale

---

*Aggiorna questo file ogni volta che vengono definite nuove convenzioni di progetto.*
