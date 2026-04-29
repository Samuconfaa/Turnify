# Turnify

App mobile per la gestione dei turni lavorativi nelle piccole e medie imprese italiane.

---

## Il problema

Bar, ristoranti, negozi e palestre gestiscono ancora i turni via WhatsApp e fogli Excel. Il risultato sono cambi dell'ultimo minuto non tracciati, ferie ignorate e manager esasperati. Turnify centralizza tutto in un'unica app mobile.

---

## Stack tecnologico

| Layer | Tecnologia |
|---|---|
| App mobile | .NET MAUI 10 — iOS, Android, macOS, Windows |
| Pattern | MVVM + CommunityToolkit.Mvvm 8 |
| Backend | ASP.NET Core Web API (.NET 10) |
| Autenticazione | JWT |
| ORM | Entity Framework Core 9 |
| API docs | Swagger / Scalar |

---

## Struttura del progetto

```
Turnify/
├── src/
│   ├── Turnify.Mobile/        # App MAUI (Views + ViewModels)
│   ├── Turnify.Api/           # REST API (controllers, endpoints)
│   ├── Turnify.Core/          # Entità di dominio e interfacce
│   ├── Turnify.Infrastructure/ # EF Core, repository, servizi
│   └── Turnify.Tests/         # Test unitari e di integrazione
└── docs/                      # Specifiche, architettura, piano
```

---

## Funzionalità

### Admin
- Calendario settimanale dei turni con griglia per dipendente
- Creazione, modifica e copia turni
- Approvazione o rifiuto richieste di ferie e permessi
- Dashboard KPI: turni del giorno, ferie in attesa, presenze
- Gestione anagrafica dipendenti

### Dipendente
- Visualizzazione turni assegnati
- Check-in / check-out (timbratura)
- Richiesta ferie e permessi
- Storico presenze
- Profilo personale e disponibilità

---

## Schermate principali (Mobile)

`LoginPage` · `OnboardingPage` · `GdprConsentPage` · `RegisterPage` · `ForgotPasswordPage`  
`DashboardPage` · `EmployeeDashboardPage`  
`ShiftCalendarPage` · `ShiftDetailPage`  
`EmployeeListPage` · `EmployeeDetailPage`  
`VacationListPage` · `VacationEditPage`  
`AttendanceHistoryPage` · `AvailabilityPage`  
`BusinessListPage` · `BusinessDetailPage` · `BusinessOpeningHoursPage`  
`NotificationsPage` · `ProfilePage`

---

## Avvio in sviluppo

**Prerequisiti:**
- .NET SDK 10.0
- Visual Studio 2022 v17.12+ con workload MAUI
- Android SDK (API 21+) oppure Xcode 15+ per iOS

```bash
# Clona il repository
git clone https://github.com/Samuconfaa/Turnify.git
cd Turnify

# Avvia il backend
cd src/Turnify.Api
dotnet run

# Avvia l'app mobile (Android)
cd ../Turnify.Mobile
dotnet build -t:Run -f net10.0-android
```

Il backend espone Swagger su `https://localhost:<porta>/swagger` in ambiente Development.

---

## Licenza

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.
