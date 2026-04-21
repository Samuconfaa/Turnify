# Roadmap 12 Mesi — Turnify

**Orizzonte:** 12 mesi dal lancio MVP  
**Aggiornamento:** Trimestrale  
**Versione documento:** 1.0

---

## Visione

Turnify diventa il punto di riferimento per la gestione turni delle PMI italiane. Nel primo anno, l'obiettivo è consolidare il prodotto core (turni + ferie + notifiche), acquisire i primi 200 clienti paganti e costruire la base tecnica per le funzionalità premium che differenziano il prodotto dalla concorrenza.

---

## Timeline

```
Q1  (Mesi 1-3)   MVP Launch
Q2  (Mesi 4-6)   Crescita e stabilizzazione
Q3  (Mesi 7-9)   Funzionalità Premium
Q4  (Mesi 10-12) Espansione e SaaS
```

---

## Q1 — MVP Launch (Mesi 1-3)

**Obiettivo:** Prodotto funzionante, stabile, nelle mani dei primi clienti reali.

### Funzionalità
- ✅ Login e gestione account (Admin + Dipendente)
- ✅ Creazione e gestione turni
- ✅ Calendario turni (settimanale + mensile)
- ✅ Richieste e approvazione ferie
- ✅ Notifiche push (Android, iOS)
- ✅ Dashboard admin con KPI base
- ✅ Gestione anagrafica dipendenti

### Go-to-Market
- Onboarding 5–10 aziende beta tester (pizzerie/bar zona locale)
- Raccolta feedback intensiva tramite interviste
- Piano prezzi definitivo (Free tier + piano a pagamento)
- Landing page `turnify.it` con form di interesse

### KPI Target Q1
- Aziende registrate: 20+
- Dipendenti attivi: 200+
- Turni creati: 2.000+
- NPS beta: > 30

---

## Q2 — Crescita e Stabilizzazione (Mesi 4-6)

**Obiettivo:** Crescita organica, riduzione churn, miglioramento UX basato sul feedback reale.

### Funzionalità
- **Swap turni:** dipendente può proporre scambio turno con collega, admin approva
- **Turni ricorrenti:** creazione automatica pattern settimanale (es. ogni lunedì dalle 9 alle 17)
- **Export base:** download CSV presenze e turni del mese
- **Multi-lingua:** supporto lingua inglese (per attività con staff internazionale)
- **App web leggera:** accesso browser per admin (no app) — vista sola lettura turni

### Miglioramenti
- Performance ottimizzata per aziende con 50+ dipendenti
- Onboarding wizard migliorato (riduzione drop-off)
- Supporto in-app (chat o form integrato)
- Backup manuale dati da pannello admin

### KPI Target Q2
- Aziende registrate: 80+
- Dipendenti attivi: 800+
- Retention mensile: > 75%
- Primo fatturato (conversioni free → paid)

---

## Q3 — Funzionalità Premium (Mesi 7-9)

**Obiettivo:** Differenziazione competitiva con funzionalità ad alto valore che giustificano il piano Pro.

### Funzionalità Premium

#### Timbratura GPS
- Check-in e check-out con verifica posizione geografica
- Admin definisce raggio di tolleranza dalla sede (es. 200 metri)
- Registro presenze effettive vs turno previsto
- Alert per check-in in ritardo o mancante

#### Export PDF Professionale
- Busta ore mensile per dipendente (PDF firmabile)
- Report presenze periodo custom
- Export calendario turni in PDF (formato A4 stampabile)

#### AI Ottimizzazione Turni *(sperimentale)*
- Suggerimento automatico turni basato su: storico, preferenze dipendente, copertura minima richiesta
- Rilevamento conflitti e carenze di copertura in anticipo
- Modello AI leggero basato su regole + statistiche storiche (no LLM in questa fase)

### KPI Target Q3
- Aziende su piano Pro: 30+
- Ricavi MRR: obiettivo da definire in Q2
- Feature adoption timbratura GPS: > 60% aziende Pro

---

## Q4 — Espansione e SaaS (Mesi 10-12)

**Obiettivo:** Scalare il modello, aprire nuovi segmenti, costruire la struttura SaaS sostenibile.

### Funzionalità

#### Multi-Sede
- Un'azienda gestisce più sedi indipendenti
- Turni e dipendenti assegnabili a sedi specifiche
- Dashboard cross-sede per il titolare

#### App Web Admin Completa
- Pannello web full-featured (non solo mobile)
- Vista calendario drag-and-drop per la pianificazione turni
- Gestione dipendenti e report da browser

#### Analytics Avanzate
- Trend presenze mensili / stagionali
- Costo ore per dipendente e per sede
- Previsione fabbisogno turni basata su stagionalità storica
- Confronto aziende dello stesso settore (benchmark anonimizzato)

#### Piattaforma SaaS Matura
- Self-service onboarding completo (senza supporto manuale)
- Billing integrato (Stripe): piani mensili/annuali, trial 14 giorni
- API pubblica documentata per integrazioni di terze parti
- Marketplace integrazioni: Google Calendar, software payroll italiani

#### Programma Partner
- Rivenditori / consulenti del lavoro che propongono Turnify ai propri clienti
- Dashboard partner con gestione clienti multipli
- Commissioni ricorrenti per partner

### KPI Target Q4
- Aziende totali: 200+
- MRR: obiettivo da definire a fine Q2
- Churn mensile: < 3%
- Rating App Store: ≥ 4.3

---

## Funzionalità Escluse dalla Roadmap Corrente

Le seguenti funzionalità sono state valutate ma escluse dal primo anno per mantenere il focus:

| Funzionalità | Motivazione esclusione |
|---|---|
| Gestione buste paga complete | Complessità legale/fiscale elevata, mercato presidiato da software specializzati |
| Chat team integrata | Commodità elevata (WhatsApp già usato), basso vantaggio competitivo |
| Integrazione POS / cassa | Scope troppo ampio, target diverso |
| Gestione presenze con badge fisici | Hardware requirement, complessità logistica |

---

## Principi Guida della Roadmap

**Cliente prima:** Ogni funzionalità viene aggiunta solo se richiesta da almeno 3 clienti attivi o se riduce il churn in modo misurabile.

**Semplicità:** Preferire funzionalità semplici e ben fatte a feature complesse e half-baked. Turnify deve restare usabile senza formazione.

**Iterare veloce:** Release minori ogni 2 settimane, release maggiori ogni quarter. Nessun mega-launch.

**Dati prima delle opinioni:** Ogni decisione di roadmap è supportata da: feedback clienti, metriche di utilizzo o analisi churn.
