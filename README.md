# Turnify 📅

> Gestione turni moderna per le PMI italiane. Dì addio a WhatsApp e fogli Excel.

---

## Il Problema

Milioni di piccole attività italiane — pizzerie, bar, palestre, negozi — gestiscono ancora i turni del personale tramite gruppi WhatsApp caoticici, fogli Excel condivisi e telefonate dell'ultimo minuto. Il risultato? Incomprensioni, ferie perse, assenze non tracciate, conflitti tra colleghi e manager esasperati.

**Turnify risolve tutto questo con un'app mobile semplice, professionale e accessibile.**

---

## Target Clienti

| Tipo attività | Dimensione team | Problema principale |
|---|---|---|
| Pizzerie / Ristoranti | 5–30 dipendenti | Turni serali caotici, cambi last-minute |
| Bar / Caffetterie | 3–15 dipendenti | Aperture/chiusure non coperte |
| Gelaterie | 5–20 dipendenti (stagionali) | Gestione picchi estivi |
| Negozi al dettaglio | 3–20 dipendenti | Copertura turni weekend |
| Palestre / Centri fitness | 5–25 dipendenti | Istruttori e reception |
| Attività locali generiche | 2–50 dipendenti | Qualsiasi esigenza di scheduling |

---

## Stack Tecnologico

```
┌─────────────────────────────────────────┐
│           App Mobile (iOS + Android)    │
│              .NET MAUI + MVVM           │
├─────────────────────────────────────────┤
│           Backend REST API              │
│           ASP.NET Core Web API          │
├─────────────────────────────────────────┤
│              Database                   │
│         PostgreSQL / MySQL              │
├─────────────────────────────────────────┤
│              Hosting                    │
│        VPS Linux + Nginx + SSL          │
└─────────────────────────────────────────┘
```

- **Frontend:** .NET MAUI (cross-platform iOS/Android)
- **Pattern:** MVVM (Model-View-ViewModel)
- **Backend:** ASP.NET Core Web API (.NET 8+)
- **Database:** PostgreSQL (principale) / MySQL (alternativa)
- **Autenticazione:** JWT (JSON Web Token)
- **Hosting:** VPS Linux (Ubuntu 22.04 LTS)
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt (Certbot)

---

## Funzionalità Principali

### Per il Manager / Admin
- ✅ Creazione e gestione turni del personale
- ✅ Visualizzazione calendario settimanale e mensile
- ✅ Approvazione/rifiuto richieste di ferie e permessi
- ✅ Dashboard con statistiche presenze e ore lavorate
- ✅ Gestione anagrafica dipendenti
- ✅ Invio notifiche push al team
- ✅ Export report ore (futuro)

### Per il Dipendente
- ✅ Visualizzazione turni assegnati
- ✅ Richiesta ferie e permessi
- ✅ Notifiche cambio turno in tempo reale
- ✅ Storico presenze personale
- ✅ Profilo personale e preferenze disponibilità

---

## Ruoli Utenti

1. **Super Admin** — Gestione piattaforma (Turnify SaaS)
2. **Azienda Admin** — Titolare/manager dell'attività
3. **Dipendente** — Membro del team

---

## Roadmap Futura

| Versione | Funzionalità |
|---|---|
| v1.0 | MVP: turni, ferie, notifiche base |
| v1.5 | Dashboard statistiche, export PDF |
| v2.0 | Timbratura GPS, multi-sede |
| v2.5 | AI ottimizzazione turni |
| v3.0 | App web admin, abbonamento SaaS |

Per la roadmap dettagliata → [`docs/iterations/roadmap.md`](docs/iterations/roadmap.md)

---

## Struttura del Progetto

```
Turnify/
├── README.md               ← Questo file
├── AGENTS.md               ← Istruzioni per AI assistant
├── .gitignore
├── docs/
│   ├── spec.md             ← Specifiche prodotto
│   ├── plan.md             ← Piano di sviluppo
│   ├── architecture.md     ← Architettura sistema
│   ├── database.md         ← Schema database
│   ├── api-design.md       ← Definizione API REST
│   ├── ui-ux.md            ← Design e UX
│   ├── security.md         ← Piano sicurezza
│   ├── deployment.md       ← Deploy VPS
│   ├── test-matrix.md      ← Matrice test
│   ├── prompt-log.md       ← Log prompt AI
│   └── iterations/
│       ├── it-01.md        ← Sprint 1 (MVP)
│       ├── it-02.md        ← Sprint 2
│       └── roadmap.md      ← Visione 12 mesi
```

---

## Come Avviare il Progetto

> ⚠️ Istruzioni preliminari — il codice sorgente non è ancora disponibile in questa fase di progettazione.

```bash
# 1. Clona il repository
git clone https://github.com/tuouser/turnify.git
cd turnify

# 2. Backend (ASP.NET Core)
cd backend/
dotnet restore
dotnet run

# 3. App Mobile (.NET MAUI)
cd ../mobile/
dotnet restore
dotnet build -t:Run -f net8.0-android  # oppure net8.0-ios
```

**Prerequisiti:**
- .NET SDK 8.0+
- Visual Studio 2022 o JetBrains Rider
- Android SDK / Xcode (per iOS)
- PostgreSQL 15+

---

## Screenshot

> 📸 Screenshot previsti — da aggiungere nella fase di sviluppo UI

| Schermata | Descrizione |
|---|---|
| `screenshot-login.png` | Schermata di login con logo Turnify |
| `screenshot-dashboard.png` | Dashboard manager con panoramica turni |
| `screenshot-calendario.png` | Calendario mensile dipendente |
| `screenshot-ferie.png` | Form richiesta ferie |
| `screenshot-notifiche.png` | Centro notifiche |

---

## Licenza

Progetto proprietario. Tutti i diritti riservati — Turnify © 2024.

---

*Fatto con ❤️ per le piccole imprese italiane.*
