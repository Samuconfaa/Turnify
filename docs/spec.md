# Specifiche di Prodotto — Turnify

**Versione:** 1.0  
**Stato:** Bozza approvata  
**Data:** 2024  

---

## 1. Missione dell'App

Turnify nasce per eliminare il caos nella gestione dei turni nelle piccole e medie imprese italiane. La missione è semplice: **dare al titolare il controllo totale sui turni del personale e ai dipendenti la chiarezza su quando lavorano**, tutto da uno smartphone, senza bisogno di competenze tecniche.

Turnify non è uno strumento per grandi aziende con uffici HR strutturati. È fatto per la pizzeria con 10 dipendenti, per il bar che apre alle 6 e chiude a mezzanotte, per la palestra con istruttori part-time. È pratico, veloce, italiano.

---

## 2. Utenti Target

### 2.1 Azienda Admin (Titolare / Manager)
- Titolari di piccole attività (1–3 sedi, 3–50 dipendenti)
- Età media: 30–55 anni, mediamente digitali
- Dispositivi: smartphone Android o iPhone (uso primario), tablet (uso secondario)
- Dolori: tempo perso a comunicare turni, incomprensioni, sostituzioni last-minute

### 2.2 Dipendente
- Lavoratori di bar, ristoranti, negozi, palestre
- Età: 18–45 anni, alta familiarità con smartphone
- Dispositivi: smartphone (uso esclusivo)
- Dolori: non sapere i turni in anticipo, non riuscire a richiedere ferie facilmente

### 2.3 Super Admin (Interno Turnify)
- Team tecnico di Turnify
- Gestisce aziende onboard, supporto, monitoring piattaforma

---

## 3. Problemi Risolti

| Problema attuale | Soluzione Turnify |
|---|---|
| Turni comunicati su WhatsApp (dispersivi, non tracciabili) | Pubblicazione turni centralizzata con notifica push |
| Ferie richieste a voce o su carta | Flusso digitale richiesta → approvazione → notifica |
| Nessuna visibilità sulle ore lavorate | Dashboard con riepilogo ore per dipendente e periodo |
| Sostituzioni gestite in modo caotico | Notifiche cambio turno + storico modifiche |
| Assenze non tracciate correttamente | AttendanceLog con presenza effettiva vs turno previsto |
| Nessun archivio storico | Tutti i turni storici consultabili per dipendente o periodo |

---

## 4. Casi d'Uso Principali

### UC-01: Creazione Turno
**Attore:** Azienda Admin  
**Precondizioni:** Admin loggato, dipendente esistente  
**Flusso:** Admin seleziona giorno → sceglie dipendente → imposta orario inizio/fine → salva → dipendente riceve notifica  
**Postcondizioni:** Turno visibile nel calendario di admin e dipendente

### UC-02: Visualizzazione Turni (Dipendente)
**Attore:** Dipendente  
**Flusso:** Dipendente apre app → vede calendario settimanale con i propri turni → può scorrere avanti/indietro  

### UC-03: Richiesta Ferie
**Attore:** Dipendente  
**Flusso:** Dipendente seleziona date → inserisce motivazione (opzionale) → invia richiesta → Admin riceve notifica → approva o rifiuta → Dipendente notificato

### UC-04: Approvazione Ferie
**Attore:** Azienda Admin  
**Flusso:** Admin vede lista richieste pendenti → visualizza dettaglio (chi, quando, sovrapposizioni) → approva o rifiuta con nota → sistema aggiorna calendario

### UC-05: Modifica Turno
**Attore:** Azienda Admin  
**Flusso:** Admin apre turno esistente → modifica orario o dipendente → salva → dipendenti coinvolti notificati

### UC-06: Consultazione Dashboard
**Attore:** Azienda Admin  
**Flusso:** Admin apre dashboard → vede ore totali per periodo → identifica dipendenti con più/meno ore → esporta (futuro)

### UC-07: Registrazione Azienda
**Attore:** Nuovo Titolare  
**Flusso:** Download app → inserisce dati azienda → crea account admin → invita primo dipendente

---

## 5. Funzionalità Admin (v1.0)

- **Gestione dipendenti:** creazione profilo, ruolo, orario contrattuale, archivio
- **Pianificazione turni:** creazione, modifica, eliminazione turni singoli e ricorrenti
- **Calendario turni:** vista settimanale e mensile con tutti i dipendenti
- **Gestione ferie:** visualizzazione richieste, approvazione/rifiuto, note
- **Notifiche:** invio notifiche manuali al team o a dipendente specifico
- **Dashboard:** riepilogo ore lavorate, presenze, assenze del periodo
- **Profilo azienda:** nome, logo, sede, orari di apertura

---

## 6. Funzionalità Dipendente (v1.0)

- **Login sicuro** con email e password
- **Calendario personale:** visualizzazione turni assegnati (settimana / mese)
- **Richiesta ferie/permessi:** form digitale con date e motivazione
- **Storico richieste:** stato approvazione ferie e permessi
- **Notifiche:** ricezione aggiornamenti turni, approvazioni, comunicazioni admin
- **Profilo:** dati personali, preferenze di disponibilità

---

## 7. Funzionalità Future (Premium / v2.0+)

- **Timbratura GPS:** check-in/check-out con verifica posizione geografica
- **Swap turni:** richiesta di scambio turno con collega (con approvazione admin)
- **Export PDF/Excel:** buste ore mensili, report presenze
- **AI Scheduling:** suggerimento automatico turni basato su storico e preferenze
- **Multi-sede:** gestione turni per aziende con più location
- **App Web Admin:** pannello di controllo browser per admin
- **Integrazioni:** Google Calendar, payroll software, contabilità
- **Analytics avanzate:** trend presenze, costo ore, previsioni

---

## 8. Requisiti Non Funzionali

### Performance
- Tempo di caricamento calendario: < 1 secondo (connessione 4G)
- Risposta API per operazioni standard: < 300ms (p95)
- App avviabile in < 2 secondi su dispositivi mid-range (2019+)

### Disponibilità
- Uptime target: 99.5% (downtime massimo ~44 ore/anno)
- Backup database: giornaliero automatico, retention 30 giorni

### Scalabilità
- Architettura pensata per supportare fino a 10.000 dipendenti totali (multi-tenant) senza refactoring

### Sicurezza
- Tutti i dati in transito: HTTPS/TLS 1.2+
- Password: hash BCrypt con salt
- Token JWT: access 15 min, refresh 7 giorni
- Separazione totale dati tra aziende (multi-tenancy isolata)

### Usabilità
- Onboarding completabile in < 5 minuti (dalla registrazione al primo turno pubblicato)
- Nessuna formazione necessaria per dipendenti
- Supporto lingua italiana (v1.0), inglese (v2.0)

### Accessibilità
- Testo leggibile (font size minimo 14sp)
- Contrasto colori WCAG AA
- Compatibilità screen reader (TalkBack / VoiceOver) per funzionalità base

---

## 9. KPI di Successo Prodotto

| KPI | Target 6 mesi | Target 12 mesi |
|---|---|---|
| Aziende registrate | 50 | 200 |
| Dipendenti attivi | 500 | 2.500 |
| Turni creati/mese | 5.000 | 25.000 |
| Retention aziende (30gg) | > 70% | > 80% |
| Rating app store | ≥ 4.0 | ≥ 4.3 |
| NPS | > 30 | > 40 |
| Tempo medio onboarding | < 5 min | < 3 min |
| Richieste supporto / azienda / mese | < 1 | < 0.5 |
