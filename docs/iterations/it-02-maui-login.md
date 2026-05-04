# Iterazione 02

## Obiettivo
Implementare:
1. struttura iniziale dell'app MAUI,
2. navigazione Shell,
3. login reale verso backend JWT,
4. persistenza sicura del token,
5. primi test automatici su service backend,
6. rimozione delle credenziali dai file di configurazione.

---

## Regole obbligatorie (NON violare)

- usare MVVM con `CommunityToolkit.Mvvm`
- NON inserire logica di business nei code-behind
- usare `SecureStorage` per il token mobile
- registrare pagine e ViewModel in DI
- usare `HttpClient` configurato centralmente
- non lasciare connection string o JWT secret reali nei file tracciati
- mantenere XAML coerente con `Colors.xaml` e `Styles.xaml`

---

# TASK 1 - Navigazione MAUI

## File da modificare/creare
- `Turnify.Mobile/AppShell.xaml`
- `Turnify.Mobile/AppShell.xaml.cs`
- `Turnify.Mobile/MauiProgram.cs`
- `Turnify.Mobile/ViewModels/BaseViewModel.cs`
- ViewModel stub principali
- pagine XAML principali

## Cosa fare

1. Configurare `AppShell` con tab principali.
2. Registrare route per dashboard, calendario, ferie, notifiche e profilo.
3. Creare `BaseViewModel` con proprietà condivise.
4. Registrare pagine e ViewModel in `MauiProgram.cs`.
5. Lasciare i code-behind solo per `InitializeComponent`.

---

# TASK 2 - Login mobile reale

## File da modificare/creare
- `Turnify.Mobile/Views/LoginPage.xaml`
- `Turnify.Mobile/Views/LoginPage.xaml.cs`
- `Turnify.Mobile/ViewModels/LoginViewModel.cs`
- `Turnify.Mobile/Services/AuthService.cs`

## Cosa fare

1. Creare form login con email e password.
2. Collegare il form a `LoginViewModel`.
3. Implementare `LoginCommand`.
4. Chiamare `POST /api/auth/login`.
5. Salvare JWT e dati essenziali in `SecureStorage`.
6. Navigare alla dashboard dopo login riuscito.
7. Gestire errore di rete, credenziali errate e timeout.

---

# TASK 3 - Design XAML iniziale

## File da modificare
- `DashboardPage.xaml`
- `ShiftCalendarPage.xaml`
- `VacationListPage.xaml`
- `NotificationsPage.xaml`
- `ProfilePage.xaml`
- `Resources/Styles/Colors.xaml`
- `Resources/Styles/Styles.xaml`

## Cosa fare

1. Convertire i layout iniziali in XAML MAUI.
2. Usare risorse colore centralizzate.
3. Evitare valori duplicati quando esiste una risorsa.
4. Mantenere UI semplice ma già navigabile.

---

# TASK 4 - Test backend iniziali

## File da creare/modificare
- `Turnify.Tests/Turnify.Tests.csproj`
- `Turnify.Tests/Services/AuthServiceTests.cs`
- `Turnify.Tests/Services/ShiftServiceTests.cs`
- service/repository necessari per testabilità

## Cosa fare

1. Configurare xUnit, Moq e FluentAssertions.
2. Testare registrazione e login.
3. Testare creazione e recupero turni.
4. Refactorare i service solo se necessario per renderli testabili.
5. Non cambiare il comportamento pubblico per adattarlo artificialmente ai test.

---

# TASK 5 - Sicurezza configurazione

## File da modificare/creare
- `Turnify.Api/appsettings.json`
- `Turnify.Api/appsettings.Development.json`
- `.env.example`
- `.gitignore`
- `Turnify.Api/Program.cs`

## Cosa fare

1. Spostare connection string e JWT secret fuori dai file tracciati.
2. Aggiungere `.env.example` con chiavi senza valori reali.
3. Caricare configurazione da ambiente o file locale escluso.
4. Verificare che l'app continui ad avviarsi in development.

---

# OUTPUT ATTESO

- app MAUI avviabile
- navigazione Shell funzionante
- login mobile collegato al backend
- token salvato in modo sicuro
- test backend iniziali presenti
- configurazione senza segreti reali

---

## Nota metodologica

Al termine di questa iterazione, il prompt utilizzato per la richiesta deve essere salvato in `docs/prompt-log.md` secondo le regole di tracciabilità del progetto.
