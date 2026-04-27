# Piano di Sviluppo — Turnify

**Versione:** 1.0  
**Metodologia:** Iterativa / Sprint bisettimanali  
**Orizzonte pianificazione:** 6 mesi al rilascio MVP  

---

## Panoramica Milestone

```
Mese 1        Mese 2        Mese 3        Mese 4        Mese 5        Mese 6
  │             │             │             │             │             │
[M1: Analisi]─[M2: UI Proto]─[M3: Backend]─[M4: Auth]───[M5-7: Core]──[M8-10: Deploy]
```

---

## Milestone Dettagliate

---

### M1 — Analisi e Setup (Settimane 1–2)

**Priorità:** 🔴 Critica  
**Durata stimata:** 2 settimane  

**Obiettivi:**
- Definizione definitiva requisiti funzionali e non funzionali
- Progettazione architettura sistema
- Schema database iniziale
- Setup repository Git e struttura progetto
- Scelta definitiva tech stack (conferma PostgreSQL vs MySQL)
- Setup ambiente di sviluppo (locale + VPS test)

**Deliverable:**
- `docs/spec.md` completato e validato ✅
- `docs/architecture.md` completato ✅
- `docs/database.md` completato ✅
- Repository Git con struttura cartelle base
- Ambiente dev funzionante (backend compila, DB connesso)

**Rischi:**
- Scope creep nelle funzionalità → mitigato con freeze dei requisiti v1.0
- Problemi setup VPS → fallback su macchina locale per sviluppo

---

### M2 — Prototipo UI/UX (Settimane 3–4)

**Priorità:** 🔴 Critica  
**Durata stimata:** 2 settimane  

**Obiettivi:**
- Wireframe schermate principali (carta o Figma)
- Definizione palette colori e design system
- Prototipo navigazione app in .NET MAUI (shell + tab bar)
- Schermate statiche: Login, Dashboard, Calendario, Profilo

**Deliverable:**
- Wireframe approvati
- `docs/ui-ux.md` completato ✅
- App MAUI con navigazione funzionante (senza dati reali)
- Palette colori e componenti base definiti

**Rischi:**
- MAUI learning curve → allocare tempo extra per documentazione
- Inconsistenza UI iOS vs Android → test su entrambi i target

---

### M3 — Backend Base (Settimane 5–6)

**Priorità:** 🔴 Critica  
**Durata stimata:** 2 settimane  

**Obiettivi:**
- Setup progetto ASP.NET Core Web API
- Configurazione Entity Framework Core + PostgreSQL
- Migrazioni database (tabelle Users, Companies, Employees)
- Endpoint base CRUD: Companies, Users
- Logging strutturato (Serilog)
- Gestione errori centralizzata (middleware)

**Deliverable:**
- API avviabile e connessa al DB
- Endpoint `/health` funzionante
- CRUD Companies e Users testati con Postman/Swagger
- Swagger UI attivo in development

**Rischi:**
- Configurazione EF Core con PostgreSQL → documentare attentamente la config
- Performance query iniziali → aggiungere indici base sin dall'inizio

---

### M4 — Login e Autenticazione JWT (Settimane 7–8)

**Priorità:** 🔴 Critica  
**Durata stimata:** 2 settimane  

**Obiettivi:**
- Endpoint registrazione azienda e login
- Generazione JWT access token + refresh token
- Middleware autenticazione e autorizzazione
- Gestione ruoli (SuperAdmin, CompanyAdmin, Employee)
- Login funzionante nella app mobile MAUI
- Persistenza token su device (SecureStorage)

**Deliverable:**
- Flusso login completo funzionante end-to-end
- Token refresh automatico nell'app
- Accesso agli endpoint protetti funzionante
- Test unitari auth service

**Rischi:**
- Gestione sicura token su mobile → usare MAUI SecureStorage, non Preferences
- Token refresh race condition → implementare retry logic lato client

---

### M5 — Gestione Turni (Settimane 9–11)

**Priorità:** 🔴 Critica  
**Durata stimata:** 3 settimane  

**Obiettivi:**
- CRUD completo turni (backend + frontend)
- Calendario turni lato admin (vista settimanale)
- Calendario personale lato dipendente
- Validazione sovrapposizioni turni
- Test completi funzionalità turni

**Deliverable:**
- Admin può creare, modificare, eliminare turni
- Dipendente vede i propri turni nel calendario
- Validazione: non si possono assegnare due turni sovrapposti allo stesso dipendente
- Copertura test > 70% su ShiftService

**Rischi:**
- UI calendario complessa in MAUI → valutare libreria esistente vs custom
- Gestione timezone → usare UTC nel DB, conversione lato client

---

### M6 — Richieste Ferie (Settimane 12–13)

**Priorità:** 🟡 Alta  
**Durata stimata:** 2 settimane  

**Obiettivi:**
- Flusso completo richiesta ferie (dipendente → admin)
- Form richiesta con date e nota
- Lista richieste pendenti per admin
- Approvazione / rifiuto con nota
- Aggiornamento calendario dopo approvazione

**Deliverable:**
- Dipendente invia richiesta ferie
- Admin approva o rifiuta
- Stato richiesta visibile a entrambi
- Test scenari principali coperti

**Rischi:**
- Gestione ferie che si sovrappongono a turni già assegnati → definire regola business (blocca o avvisa?)

---

### M7 — Notifiche Push (Settimane 14–15)

**Priorità:** 🟡 Alta  
**Durata stimata:** 2 settimane  

**Obiettivi:**
- Integrazione Firebase Cloud Messaging (FCM) per Android
- Integrazione APNs per iOS
- Notifiche per: nuovo turno, modifica turno, ferie approvate/rifiutate
- Gestione permessi notifiche nell'app

**Deliverable:**
- Notifiche push funzionanti su entrambi i SO
- Notifiche in-app (quando app è aperta)
- Preferenze notifiche nel profilo dipendente

**Rischi:**
- Configurazione certificati APNs (iOS) → richiede account Apple Developer
- Costo FCM: gratuito fino a volumi alti → nessun rischio per MVP

---

### M8 — Dashboard e Statistiche (Settimane 16–17)

**Priorità:** 🟢 Media  
**Durata stimata:** 2 settimane  

**Obiettivi:**
- Dashboard admin con KPI chiave
- Ore lavorate per dipendente (settimana/mese)
- Presenze vs assenze
- Riepilogo ferie utilizzate
- Grafici base (barre o linee)

**Deliverable:**
- Dashboard admin con dati reali
- Almeno 3 widget statistiche utili
- Filtro per periodo (settimana corrente, mese corrente, custom)

**Rischi:**
- Performance query aggregazioni su grandi dataset → aggiungere indici e considerare view materializzate

---

### M9 — Testing e Bug Fixing (Settimane 18–19)

**Priorità:** 🔴 Critica  
**Durata stimata:** 2 settimane  

**Obiettivi:**
- Test end-to-end su scenari principali (vedere `docs/test-matrix.md`)
- Bug fixing
- Test su dispositivi fisici Android e iOS
- Ottimizzazione performance app
- Code review generale
- Documentazione API Swagger completa

**Deliverable:**
- Test matrix completata al 90%
- Nessun bug critico aperto
- Performance API sotto i target definiti in `docs/spec.md`
- Swagger aggiornato

---

### M10 — Deploy VPS e Go-Live (Settimane 20–21)

**Priorità:** 🔴 Critica  
**Durata stimata:** 2 settimane  

**Obiettivi:**
- Configurazione VPS Ubuntu 22.04
- Deploy API ASP.NET Core come systemd service
- Configurazione Nginx reverse proxy
- SSL con Let's Encrypt
- Configurazione PostgreSQL in produzione
- Monitoraggio uptime (UptimeRobot)
- Build app mobile per distribuzione (beta testing)

**Deliverable:**
- API live su dominio HTTPS
- Database produzione configurato e sicuro
- Backup automatico configurato
- App inviata a beta tester (TestFlight iOS, Firebase App Distribution Android)

Per dettagli → `docs/deployment.md`

---

## Riepilogo Tempi

| Milestone | Settimane | Durata | Priorità |
|---|---|---|---|
| M1 Analisi e Setup | 1–2 | 2 sett. | 🔴 Critica |
| M2 Prototipo UI/UX | 3–4 | 2 sett. | 🔴 Critica |
| M3 Backend Base | 5–6 | 2 sett. | 🔴 Critica |
| M4 Login / Auth JWT | 7–8 | 2 sett. | 🔴 Critica |
| M5 Gestione Turni | 9–11 | 3 sett. | 🔴 Critica |
| M6 Richieste Ferie | 12–13 | 2 sett. | 🟡 Alta |
| M7 Notifiche Push | 14–15 | 2 sett. | 🟡 Alta |
| M8 Dashboard | 16–17 | 2 sett. | 🟢 Media |
| M9 Testing | 18–19 | 2 sett. | 🔴 Critica |
| M10 Deploy | 20–21 | 2 sett. | 🔴 Critica |

**Totale: ~21 settimane (~5 mesi) per MVP completo**

---

## Note di Pianificazione

- Le milestone M1–M5 sono **bloccanti**: nessuna delle successive può iniziare prima del completamento
- M6, M7, M8 possono essere sviluppate in parallelo da team separati (se disponibili)
- Mantenere sempre 1 settimana di buffer per imprevisti tecnici
- Review di progetto ogni 2 sprint con rivalutazione priorità
