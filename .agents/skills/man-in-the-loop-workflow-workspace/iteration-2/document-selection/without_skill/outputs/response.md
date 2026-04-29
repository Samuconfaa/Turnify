# Selezione documenti da aggiornare

## 1. Piano breve

Chiudere l'iterazione aggiornando solo i documenti che il workflow collega a ciò che è realmente successo: feature completata, test manuali eseguiti, prompt rilevanti usati, nessun cambio ai requisiti funzionali.

## 2. File da creare o modificare

- `docs/iterations/it-02.md`
- `docs/test-matrix.md`
- `docs/prompt-log.md`

Da **non** aggiornare in questa iterazione, salvo informazioni aggiuntive oggi non presenti:

- `docs/spec.md`
- `docs/plan.md`

## 3. Implementazione richiesta

I documenti da aggiornare sono questi.

### `docs/iterations/it-02.md`

È il documento sicuramente obbligatorio secondo il workflow.
Va aggiornato perché la Fase 5 richiede di registrare il bilancio dell'iterazione con:

- obiettivo dell'iterazione;
- piano svolto;
- prompt principali utilizzati;
- file creati o modificati (`SearchViewModel`, `SearchPage`, `BookService`);
- test eseguiti;
- problemi trovati;
- correzioni effettuate;
- esito finale.

Nel tuo caso qui devono comparire almeno:

- introduzione di `SearchViewModel`, `SearchPage` e `BookService`;
- chiarimento degli stati UI;
- elenco dei test manuali passati: input vuoto gestito, timeout gestito, loading state visibile, lista vuota mostrata;
- nota che due prompt sono stati particolarmente importanti: uno per ottenere il service e uno per correggere il ViewModel.

### `docs/test-matrix.md`

Va aggiornato perché ci sono nuove evidenze di test manuale realmente eseguite in questa iterazione.
Il workflow dice di aggiornarlo quando la verifica effettuata è rilevante, e qui lo è perché i test coprono esplicitamente aree chiave della matrice minima:

- **Input**: input vuoto gestito;
- **API**: timeout gestito;
- **UI**: loading state visibile;
- **UI**: lista vuota mostrata.

Quindi non basta lasciare queste informazioni solo nel log di iterazione: conviene registrarle anche nella matrice di test come evidenza strutturata della copertura.

### `docs/prompt-log.md`

Va aggiornato perché hai esplicitamente detto che sono stati usati due prompt importanti e che hanno inciso sul risultato finale:

- prompt usato per ottenere il service;
- prompt usato per correggere il ViewModel.

Secondo il workflow, i prompt che influenzano materialmente la soluzione non vanno persi nel solo storico chat, ma tracciati in un log dedicato, così resta chiaro:

- quale problema si stava affrontando;
- quale prompt ha portato il risultato utile;
- quale correzione è arrivata da un prompt successivo.

## 4. Rischi o punti da controllare

- `docs/spec.md` **non** va aggiornato, perché hai detto che i requisiti funzionali non sono cambiati. Il chiarimento degli stati UI qui sembra una migliore esplicitazione implementativa e di comportamento, non una modifica della specifica funzionale.
- `docs/plan.md` **non** va aggiornato, perché non emerge un cambio di roadmap, scope o sequenza delle iterazioni. L'iterazione è stata completata come affinamento di quanto già previsto.
- Se però il piano originale non menzionava affatto gli stati UI o il tracciamento dei prompt, allora puoi aggiungere una piccola nota in `docs/plan.md`; non è l'aggiornamento principale, ma solo un allineamento opzionale.
- Nel log di iterazione occorre distinguere bene tra: codice prodotto inizialmente, problema rilevato in review/test, correzione ottenuta con il secondo prompt. Questa distinzione è importante perché il workflow è man-in-the-loop e documenta anche il percorso, non solo l'esito.

## 5. Test manuali suggeriti

Oltre a quelli già eseguiti, per chiudere meglio la documentazione suggerirei di annotare anche questi, se fatti o da fare subito dopo:

- errore HTTP non-timeout (`404` o `500`);
- stato errore visibile a schermo;
- input con caratteri speciali o molto lungo;
- lista lunga scrollabile.

## Sintesi finale

Seguendo il workflow del repository, in questa situazione devi aggiornare **esattamente**:

- `docs/iterations/it-02.md`, perché è il log ufficiale di chiusura dell'iterazione;
- `docs/test-matrix.md`, perché hai nuove evidenze di test manuale rilevanti;
- `docs/prompt-log.md`, perché due prompt hanno inciso materialmente sull'implementazione e sulla correzione.

Non aggiornerei invece:

- `docs/spec.md`, perché i requisiti funzionali non sono cambiati;
- `docs/plan.md`, perché non risulta cambiata la roadmap dell'iterazione.
