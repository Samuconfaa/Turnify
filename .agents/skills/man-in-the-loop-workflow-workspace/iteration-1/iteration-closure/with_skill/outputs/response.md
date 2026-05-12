# Piano breve

Chiuderei l'iterazione come una fase di sola verifica e documentazione: consolidare cosa è stato fatto sulla ricerca, registrare i test manuali eseguiti e preparare un commit semantico senza fare né merge né push.

# File da creare o modificare

- `docs/iterations/it-02.md` oppure il file di iterazione coerente con la numerazione che state usando: è il documento da aggiornare sicuramente per registrare obiettivo, file toccati, test eseguiti, problemi trovati e esito.
- `docs/test-matrix.md`: da creare o aggiornare se vuoi lasciare evidenza verificabile dei test manuali della ricerca e degli edge case coperti.
- `docs/spec.md`: da creare o aggiornare solo se la feature di ricerca ha cambiato requisiti, criteri di accettazione o vincoli rispetto a quanto previsto prima.
- `docs/plan.md`: da creare o aggiornare solo se la roadmap cambia, per esempio se la ricerca è considerata chiusa e la prossima iterazione passa ad altro.
- `docs/prompt-log.md`: utile se i prompt usati per arrivare alla soluzione hanno influenzato in modo sostanziale struttura, comportamento o correzioni.

# Implementazione richiesta

Per la chiusura dell'iterazione sulla ricerca, il minimo coerente con il workflow del repository è:

1. Aggiornare il log di iterazione con:
- obiettivo preciso della feature di ricerca;
- file creati e modificati;
- prompt principali usati;
- test eseguiti;
- problemi emersi e correzioni;
- esito finale, dichiarando esplicitamente se la feature è chiusa oppure "completata con riserva".

2. Aggiornare `docs/test-matrix.md` con l'evidenza dei test manuali reali, non solo con i test pianificati.

3. Aggiornare `docs/spec.md` solo se la ricerca ora include comportamenti che prima non erano specificati, ad esempio:
- ricerca con input vuoto gestito esplicitamente;
- stato loading, errore ed empty state come parte dei criteri di accettazione;
- regole su debounce, retry o messaggi utente.

4. Aggiornare `docs/plan.md` solo se stai formalmente chiudendo questa iterazione e aprendo la successiva.

Sul lato Git, senza merge o push automatici, i passi sensati sono:

1. Verificare lo stato con `git status`.
2. Se non esiste ancora, creare un branch dedicato, per esempio `feature/search-iteration-close` oppure `it-02-search-closure`.
3. Rivedere il diff con `git diff`.
4. Aggiungere solo i file pertinenti alla chiusura dell'iterazione.
5. Creare un commit semantico piccolo, per esempio `docs: close search iteration` oppure `feat: finalize search iteration` se nel commit ci sono ancora fix di prodotto oltre alla documentazione.
6. Lasciare merge e push come passi esplicitamente manuali e successivi.

# Rischi o punti da controllare

- Nel repository attuale esiste solo `docs/iterations/it-01-maui-expert.md`: quindi per chiudere davvero una iterazione di prodotto sulla ricerca probabilmente mancano ancora `docs/spec.md`, `docs/plan.md` e `docs/test-matrix.md`, da introdurre se vuoi seguire il workflow in modo completo.
- Se la ricerca "sembra pronta" ma non hai ancora tracciato gli edge case, rischi di chiudere l'iterazione senza evidenza sufficiente.
- Se nel commit mescoli codice, documentazione e riassetto generale, perdi la granularità richiesta dal workflow.
- Se non registri eventuali limiti residui, la feature può apparire chiusa più di quanto sia davvero.

# Test manuali suggeriti

Prima di chiudere l'iterazione, verificherei almeno questi casi della ricerca:

- Input: campo vuoto, solo spazi, testo molto lungo, caratteri speciali, accenti.
- API o servizio dati: risposta corretta, risposta vuota, errore di rete, timeout, JSON malformato se applicabile.
- UI state: loading visibile, messaggio di errore visibile, empty state visibile, lista risultati lunga e scrollabile.
- Navigazione: apertura della pagina di ricerca, selezione risultato, ritorno indietro, passaggio corretto di eventuali parametri.
- Persistenza: se salvi query recenti o preferenze, verificare riapertura app e ripristino coerente.
- Device behavior: tema chiaro/scuro, rotazione, comportamento Android reale o emulatore.

Se alcuni di questi test non sono ancora stati eseguiti, non dichiarerei la feature "chiusa" in modo pieno: la definirei pronta alla chiusura, ma subordinata al completamento della matrice minima di verifica.
