# Iterazione 14

## Data
2026-05-04

## Obiettivo
Caching locale dei dati con aggiornamento in background: l'app non deve attendere ogni volta una risposta di rete per visualizzare dipendenti, turni, dashboard e profilo. I dati vengono letti dalla cache SQLite locale, mostrati immediatamente, e aggiornati silenziosamente in background.

---

## Regole obbligatorie (NON violare)

- NON inserire logica nei code-behind (`.xaml.cs`)
- usare solo MVVM (ViewModel + binding)
- ogni ViewModel carica prima dalla cache, poi aggiorna in background
- la cache è gestita da un `ICacheService` dedicato — mai da ViewModel o code-behind
- NON rompere funzionalità esistenti
- ogni nuovo ViewModel deve esporre `IsBusy`, `HasData`, `IsEmptyState`, `ErrorMessage`
- la cache non sostituisce mai il token JWT: autenticazione e refresh restano via rete

---

# TASK 1 — Servizio di caching locale (`ICacheService`)

## Problema
Ogni apertura di pagina (dipendenti, turni, dashboard, profilo) esegue una chiamata HTTP sincrona. Su connessioni lente o assenti, l'utente vede uno spinner lungo o un errore. Non esiste alcuna persistenza locale dei dati ricevuti.

## Comportamento atteso
- Al primo avvio ogni pagina carica i dati dalla rete e li salva in cache
- Agli avvii successivi i dati cached vengono mostrati immediatamente (zero spinner visibile)
- In background la pagina aggiorna i dati freschi e aggiorna la UI silenziosamente
- Se la rete è assente e la cache è valida, l'app funziona in modalità offline
- La cache ha una TTL configurabile per tipo di dato

## Architettura

### File da creare
- `Turnify.Mobile/Services/ICacheService.cs`
- `Turnify.Mobile/Services/CacheService.cs`

### Interfaccia `ICacheService`
```csharp
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key) where T : class;
    Task SetAsync<T>(string key, T value, TimeSpan? ttl = null) where T : class;
    Task InvalidateAsync(string key);
    Task InvalidateAllAsync();
}
```

### Implementazione `CacheService`
- Usa `SQLite` (già dipendenza del progetto via `sqlite-net-pcl`) per persistenza tra sessioni
- Schema: tabella `CacheEntry(Key TEXT PK, Json TEXT, ExpiresAt TEXT)`
- Serializza/deserializza con `System.Text.Json`
- TTL default: 5 minuti per dati frequenti (turni, dashboard), 30 minuti per dati stabili (dipendenti, profilo)
- Thread-safe: usa `SemaphoreSlim` per accesso concorrente

### Chiavi cache (costanti in `CacheKeys.cs`)
```csharp
public static class CacheKeys
{
    public const string Employees       = "employees_list";
    public const string Dashboard       = "dashboard_summary";
    public const string MyShifts        = "my_shifts";        // prefisso + mese
    public const string Profile         = "user_profile";
    public const string ShiftSwaps      = "shift_swaps";
}
```

---

# TASK 2 — Pattern stale-while-revalidate nei ViewModel

## Problema
I ViewModel attuali caricano dati solo via rete. Nessuno implementa la strategia "mostra subito il vecchio, aggiorna in silenzio".

## Comportamento atteso
- `LoadCommand` eseguito: legge cache → mostra dati cached con `IsBusy = false` → avvia fetch in background → aggiorna lista senza spinner
- Se la cache è vuota o scaduta: mostra spinner normale, carica dalla rete, aggiorna cache
- Se la rete fallisce e la cache è valida: mostra dati cached + banner "Dati non aggiornati" (`IsStale = true`)

## Pattern da applicare nei ViewModel seguenti

### ViewModel da aggiornare
- `EmployeesViewModel` — lista dipendenti (cache key: `employees_list`)
- `DashboardViewModel` — sommario dashboard (cache key: `dashboard_summary`)
- `ShiftCalendarViewModel` — turni del mese (cache key: `my_shifts_{yyyy_MM}`)
- `ProfileViewModel` — dati profilo utente (cache key: `user_profile`)
- `ShiftSwapsViewModel` — lista scambi (cache key: `shift_swaps`)

### Proprietà aggiuntiva da aggiungere a `BaseViewModel`
```csharp
[ObservableProperty]
[NotifyPropertyChangedFor(nameof(HasStaleWarning))]
private bool isStale;

public bool HasStaleWarning => IsStale;
```

### Schema `LoadCoreAsync` con cache
```csharp
private async Task LoadCoreAsync()
{
    // 1. Leggi dalla cache
    var cached = await _cacheService.GetAsync<List<EmployeeDto>>(CacheKeys.Employees);
    if (cached != null)
    {
        UpdateList(cached);
        HasData = true;
        IsEmptyState = false;
        IsStale = false;
        // non mostrare spinner se abbiamo dati
    }
    else
    {
        IsBusy = true;
    }

    // 2. Fetch in background (sempre)
    try
    {
        ErrorMessage = null;
        var fresh = await _employeeService.GetAllAsync();
        await _cacheService.SetAsync(CacheKeys.Employees, fresh, TimeSpan.FromMinutes(30));
        UpdateList(fresh);
        HasData = fresh.Count > 0;
        IsEmptyState = fresh.Count == 0;
        IsStale = false;
    }
    catch (HttpRequestException) when (cached != null)
    {
        IsStale = true; // dati cached ma non freschi
    }
    catch (HttpRequestException)
    {
        ErrorMessage = "Connessione non disponibile.";
        HasData = false;
        IsEmptyState = false;
    }
    finally
    {
        IsBusy = false;
    }
}
```

---

# TASK 3 — Invalidazione cache su mutazioni

## Problema
Se la cache non viene invalidata quando si crea/modifica/elimina un dato, l'utente vede dati obsoleti dopo un'azione.

## Comportamento atteso
- Creazione dipendente → invalida `employees_list`
- Reset password dipendente → nessuna invalidazione necessaria
- Approvazione/rifiuto ferie → invalida `dashboard_summary`
- Creazione/modifica turno → invalida `my_shifts_{yyyy_MM}` del mese coinvolto
- Approvazione scambio turno → invalida `shift_swaps` e `my_shifts_{yyyy_MM}`
- Logout → invalida tutta la cache (`InvalidateAllAsync`)

## File da modificare
- `EmployeesViewModel` — dopo `CreateEmployee`: `await _cache.InvalidateAsync(CacheKeys.Employees)`
- `ShiftDetailViewModel` — dopo save turno: `await _cache.InvalidateAsync(CacheKeys.MyShifts + ...)`
- `VacationViewModel` — dopo approvazione: `await _cache.InvalidateAsync(CacheKeys.Dashboard)`
- `ShiftSwapsViewModel` — dopo approve/reject: invalidazione doppia
- `ProfileViewModel` — al logout: `await _cache.InvalidateAllAsync()`

---

# TASK 4 — Banner "Dati non aggiornati" nella UI

## Problema
L'utente non sa se sta vedendo dati freschi o cached. Su connessioni instabili può agire su informazioni obsolete.

## Comportamento atteso
- Quando `IsStale = true` compare un banner sottile in cima alla pagina: "Dati non aggiornati — tocca per ricaricare"
- Il banner è un componente XAML riusabile (`StaleDataBanner.xaml`) incluso nelle pagine interessate
- Tap sul banner: esegue `RefreshCommand` del ViewModel

## File da creare
- `Turnify.Mobile/Views/Components/StaleDataBanner.xaml` + `.xaml.cs`

### XAML del banner
```xml
<Grid IsVisible="{Binding HasStaleWarning}"
      BackgroundColor="{StaticResource Warning}"
      Padding="12,8">
    <Grid.GestureRecognizers>
        <TapGestureRecognizer Command="{Binding RefreshCommand}"/>
    </Grid.GestureRecognizers>
    <Label Text="Dati non aggiornati — tocca per ricaricare"
           TextColor="White" FontSize="12" FontFamily="PJSReg"
           HorizontalOptions="Center"/>
</Grid>
```

---

# PREREQUISITI

- `sqlite-net-pcl` già presente nel progetto (usato da `SessionService`)
- `System.Text.Json` già presente (usato dai service REST)
- `ICacheService` registrato come Singleton in `MauiProgram.cs`

---

# OUTPUT ATTESO

- Apertura di qualsiasi pagina principale: dati visibili in < 100ms se già cached
- Aggiornamento silenzioso in background senza bloccare la UI
- Funzionamento offline con dati cached e banner di avviso
- Logout pulisce tutta la cache
- Mutazioni invalidano solo le chiavi interessate
- Zero logica di caching nei code-behind o ViewModel (tutto delegato a `ICacheService`)
- `x:DataType` presente su ogni nuova View
- Compilazione senza warning

---

# File da creare

- `src/Turnify.Mobile/Services/ICacheService.cs`
- `src/Turnify.Mobile/Services/CacheService.cs`
- `src/Turnify.Mobile/Services/CacheKeys.cs`
- `src/Turnify.Mobile/Views/Components/StaleDataBanner.xaml` + `.xaml.cs`

# File da modificare

- `src/Turnify.Mobile/ViewModels/BaseViewModel.cs` — aggiungere `IsStale`, `HasStaleWarning`
- `src/Turnify.Mobile/ViewModels/EmployeesViewModel.cs` — pattern stale-while-revalidate
- `src/Turnify.Mobile/ViewModels/DashboardViewModel.cs` — pattern stale-while-revalidate
- `src/Turnify.Mobile/ViewModels/ShiftCalendarViewModel.cs` — pattern stale-while-revalidate
- `src/Turnify.Mobile/ViewModels/ProfileViewModel.cs` — pattern stale-while-revalidate + invalidate on logout
- `src/Turnify.Mobile/ViewModels/ShiftSwapsViewModel.cs` — pattern stale-while-revalidate
- `src/Turnify.Mobile/ViewModels/ShiftDetailViewModel.cs` — invalidate on save
- `src/Turnify.Mobile/MauiProgram.cs` — registrazione `ICacheService` (Singleton)
- Pagine XAML interessate — aggiunta `StaleDataBanner`

---

# File creati/modificati

**Nuovi file:**
- `src/Turnify.Mobile/Services/ICacheService.cs`
- `src/Turnify.Mobile/Services/CacheService.cs` — SQLite, TTL, SemaphoreSlim, System.Text.Json
- `src/Turnify.Mobile/Services/CacheKeys.cs` — costanti + `ShiftsWeek(DateTime)` helper
- `src/Turnify.Mobile/Views/Components/StaleDataBanner.xaml` + `.xaml.cs`

**File modificati:**
- `src/Turnify.Mobile/ViewModels/BaseViewModel.cs` — `IsStale`, `HasStaleWarning`
- `src/Turnify.Mobile/ViewModels/EmployeeListViewModel.cs` — stale-while-revalidate, `RefreshCommand`, `InvalidateEmployeeCacheAsync`
- `src/Turnify.Mobile/ViewModels/DashboardViewModel.cs` — stale-while-revalidate, `RefreshCommand`, `ApplySummary`, `InvalidateDashboardCacheAsync`
- `src/Turnify.Mobile/ViewModels/ShiftCalendarViewModel.cs` — stale-while-revalidate, `RefreshCommand`, `InvalidateWeekCacheAsync`
- `src/Turnify.Mobile/ViewModels/ProfileViewModel.cs` — stale-while-revalidate, `RefreshCommand`, `ApplyProfile`, `InvalidateAllAsync` su logout
- `src/Turnify.Mobile/ViewModels/ShiftSwapsViewModel.cs` — stale-while-revalidate, `RefreshCommand`, invalidazione su risposta
- `src/Turnify.Mobile/ViewModels/ShiftDetailViewModel.cs` — invalidazione cache su save e delete
- `src/Turnify.Mobile/MauiProgram.cs` — `AddSingleton<ICacheService, CacheService>`
- `src/Turnify.Mobile/Views/DashboardPage.xaml` — `StaleDataBanner` aggiunto
- `src/Turnify.Mobile/Views/ShiftCalendarPage.xaml` — `StaleDataBanner` aggiunto
- `src/Turnify.Mobile/Views/ShiftSwapsPage.xaml` — `StaleDataBanner` aggiunto
- `src/Turnify.Mobile/Views/EmployeeListPage.xaml` — `StaleDataBanner` aggiunto
- `src/Turnify.Mobile/Views/ProfilePage.xaml` — `StaleDataBanner` aggiunto

# Prompt principali utilizzati

- Prompt 36 — implementazione completa it-14: caching SQLite stale-while-revalidate
