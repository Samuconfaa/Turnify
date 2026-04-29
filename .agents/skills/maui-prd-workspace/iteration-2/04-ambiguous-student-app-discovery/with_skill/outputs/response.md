## Piano breve

1. Non invento login, offline, API o notifiche finché non chiarisci il problema reale.
2. Ti faccio solo le domande che determinano il perimetro del PRD.
3. Ti lascio una struttura iniziale con `TBD`, utile come base di `docs/spec.md` senza forzare decisioni premature.

## File da creare o modificare

- `docs/spec.md`.

## Implementazione richiesta

Per impostare bene il PRD mi servono questi chiarimenti essenziali:

1. Qual è il problema principale che l'app deve risolvere?
   A. Organizzare studio e scadenze
   B. Cercare informazioni o materiali
   C. Coordinare attività di gruppo
   D. Altro: [specifica]

2. Qual è il flusso minimo che deve funzionare nell'MVP?
   A. Consultare dati
   B. Inserire e gestire dati personali
   C. Ricevere promemoria o supporto operativo
   D. Altro: [specifica]

3. Cosa vuoi tenere sicuramente fuori dalla prima versione?
   A. Login
   B. Offline avanzato
   C. Notifiche push
   D. Altro: [specifica]

4. I dati principali saranno:
   A. Solo locali
   B. Solo remoti
   C. Misti
   D. Non ancora deciso

5. Come capiremo che il progetto è riuscito?
   A. Demo semplice del flusso principale
   B. Uso reale da parte di altri studenti
   C. Documentazione chiara per iterazioni AI-guidate
   D. Altro: [specifica]

Intanto, questa è la struttura iniziale consigliata per `docs/spec.md`.

```md
# Specifica di Progetto - App Studenti Universitari

## 1. Visione e contesto

### Problema da risolvere
`TBD` - il problema concreto non è ancora definito.

### Obiettivo del progetto
Definire una app mobile utile per studenti universitari con un MVP realistico e documentato, senza assumere funzioni non ancora confermate.

### Utenti target
- Studenti universitari.
- `TBD`: chiarire corso, contesto d'uso e frequenza d'utilizzo.

## 2. Ambito MVP

### Flusso principale da supportare
`TBD` - da definire in base al problema principale.

### Funzionalità obbligatorie
- `TBD`

### Funzionalità opzionali future
- Login, offline avanzato, notifiche e integrazioni esterne restano potenziali opzioni future finché non confermate.

### Non-obiettivi
- Non assumere automaticamente autenticazione.
- Non assumere automaticamente sincronizzazione offline.
- Non assumere notifiche push nell'MVP.

## 3. Requisiti funzionali

- FR-01: `TBD` dopo definizione del flusso principale.

## 4. Vincoli tecnici di progetto

- App `.NET MAUI`
- Android come target principale salvo richiesta diversa
- Compatibilità con MVVM e Shell navigation
- Gestione esplicita di loading, empty ed error state quando esistono flussi dati

## 5. Questioni aperte o `TBD`

- Serve login?
- I dati sono locali, remoti o misti?
- È richiesto uso offline?
- Servono notifiche?
- Qual è il confine dell'MVP?

## 6. Passaggio al planning

Da fare solo dopo che il PRD sarà sufficientemente definito.
```

## Rischi o punti da controllare

- Senza un problema specifico, il progetto rischia di restare troppo generico.
- Login, offline e notifiche sono aree ad alto rischio di scope creep.

## Test manuali suggeriti

- Verificare che nessun requisito presenti come deciso qualcosa che è ancora aperto.
- Controllare che il prossimo giro di chiarimenti riduca davvero i `TBD` più importanti.
