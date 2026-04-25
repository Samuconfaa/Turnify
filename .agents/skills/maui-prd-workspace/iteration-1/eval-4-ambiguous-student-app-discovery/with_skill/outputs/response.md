# Piano breve

1. Stringo l'idea in un problema concreto e in un MVP realistico.
2. Imposto `docs/spec.md` senza inventare login, API, offline o notifiche.
3. Lascio in `TBD` ciò che oggi non è ancora deciso.

# File da creare o modificare

- `docs/spec.md`

# Implementazione richiesta

Con una idea così ampia, la cosa corretta è fare discovery prima della stesura finale. Ti propongo 5 domande brevi.

1. Quale problema principale dovrebbe risolvere l'app per gli studenti?
   A. Organizzare studio e scadenze
   B. Consultare materiali o orari
   C. Collaborare con altri studenti
   D. Altro: [specifica]

2. Chi è l'utente principale?
   A. Studente singolo
   B. Gruppo di studenti
   C. Tutor o docente
   D. Altro: [specifica]

3. Qual è il flusso minimo che deve funzionare nell'MVP?
   A. Consultazione informazioni
   B. Inserimento e gestione dati personali
   C. Promemoria e pianificazione
   D. Altro: [specifica]

4. Cosa deve restare fuori dalla prima versione?
   A. Login
   B. Notifiche push
   C. Funzioni offline avanzate
   D. Altro: [specifica]

5. Quale livello di testing e documentazione vuoi mantenere?
   A. Essenziale ma ordinato
   B. Medio con test sui flussi principali
   C. Più rigoroso per demo o esame
   D. Altro: [specifica]

Per non bloccarti del tutto, ecco come imposterei subito `docs/spec.md` senza riempire i vuoti con supposizioni forti:

```markdown
# Specifica di Progetto - App utile per studenti universitari

## 1. Visione e contesto

### Problema da risolvere
`TBD` - da chiarire se il problema principale riguarda organizzazione personale, consultazione dati o collaborazione.

### Obiettivo del progetto
Definire una app mobile `.NET MAUI` utile per studenti universitari con uno scope MVP ancora da restringere.

### Utenti target
`TBD` - studente singolo, gruppo di studio o altro.

## 2. Ambito MVP

### Flusso principale da supportare
`TBD`

### Funzionalità obbligatorie
Da definire dopo la discovery.

### Funzionalità opzionali future
- Login, se emergerà un bisogno reale di account.
- Offline avanzato, se emergerà un bisogno reale di uso senza rete.
- Notifiche, se davvero necessarie al valore dell'app.

### Non-obiettivi
`TBD` - da esplicitare nella prossima revisione.

## 3. Requisiti funzionali

- FR-01: l'app deve supportare almeno un flusso principale chiaro per uno studente universitario. Dettaglio `TBD`.

## 4. Requisiti non funzionali

- Stati UI espliciti: loading, empty, success, error per i flussi che caricano o salvano dati.
- Android come target principale; iOS opzionale.

## 5. Vincoli tecnici di progetto

- App `.NET MAUI`
- MVVM
- Shell navigation
- `CommunityToolkit.Mvvm`
- Persistenza locale `Preferences` e/o SQLite solo se la discovery confermerà questa esigenza
- `HttpClient` e `System.Text.Json` solo se la discovery confermerà dati remoti

## 6. Rischi, dipendenze e questioni aperte

### Questioni aperte o `TBD`
- Serve login?
- Servono dati remoti?
- Serve utilizzo offline?
- Servono notifiche?
```

Quando rispondi alle domande sopra, posso trasformare questa impostazione in una vera `docs/spec.md` completa senza inventare dettagli non confermati.

# Rischi o punti da controllare

- L'idea è talmente ampia che, senza un problema preciso, il PRD resterebbe generico.
- Login, offline e notifiche cambiano molto il progetto: vanno trattati come decisioni aperte, non come default.

# Test manuali suggeriti

- Verificare che ogni sezione `TBD` corrisponda a una decisione ancora non presa.
- Controllare che il documento non introduca API, autenticazione o sincronizzazione non richieste.
- Confermare che il primo obiettivo sia restringere lo scope, non espandere le feature.
