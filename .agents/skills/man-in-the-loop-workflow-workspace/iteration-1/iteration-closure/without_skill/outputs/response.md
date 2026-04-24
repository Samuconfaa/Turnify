# Chiusura iterazione: feature ricerca

## 1. Piano breve

Chiuderei l'iterazione in tre passaggi: allineare la documentazione minima, completare la verifica manuale della ricerca su emulatore o device, poi fare solo i passaggi Git di consolidamento locale. In questa fase non farei né merge né push.

## 2. File da creare o modificare

- `docs/iterations/it-xx.md`: da aggiornare sempre per registrare obiettivo, piano, file toccati, test eseguiti, problemi, correzioni ed esito finale dell'iterazione.
- `docs/test-matrix.md`: da creare o aggiornare se hai eseguito nuovi test sulla ricerca; qui vanno casi, esiti e bug trovati.
- `docs/prompt-log.md`: da creare o aggiornare se durante questa feature hai usato prompt significativi che hanno influenzato codice, struttura o test.
- `docs/spec.md`: da aggiornare solo se la feature di ricerca ha cambiato requisiti, stati UI, comportamenti attesi o criteri di accettazione.
- `docs/plan.md`: da aggiornare solo se la roadmap è cambiata, se l'iterazione si è allargata/ridotta, o se restano attività spostate alla prossima iterazione.

Se questi file non esistono ancora, ha senso crearli adesso partendo dal workflow documentato nel repository.

## 3. Implementazione richiesta

Per considerare davvero chiusa l'iterazione della ricerca, la documentazione dovrebbe riportare almeno questi contenuti:

- Nel log di iterazione: obiettivo della feature ricerca, file coinvolti, rischi emersi, test eseguiti, problemi trovati, correzioni effettuate, esito finale (`Completato`, `Parziale` o `Da rifinire`).
- Nella test matrix: casi positivi, casi di errore e casi limite della ricerca con esito esplicito.
- Nel prompt log: solo i prompt che hanno inciso davvero su implementazione o decisioni.
- Nella specifica: solo le parti che descrivono il comportamento finale della ricerca, se diverso da quanto pianificato prima.
- Nel piano: solo lo stato avanzamento e gli eventuali step successivi.

## 4. Rischi o punti da controllare

- La feature può sembrare pronta ma non essere ancora verificata su device/emulatore: nel repository questo è parte della Definition of Done.
- Se manca `docs/iterations/it-xx.md`, l'iterazione non è ben tracciata anche se il codice è corretto.
- Se non registri gli esiti in `docs/test-matrix.md`, resta debole l'evidenza che loading, error state ed empty state siano stati davvero verificati.
- Se la ricerca ha introdotto comportamenti non previsti inizialmente e `docs/spec.md` non viene allineato, la documentazione resterà incoerente con il codice.
- Se non sei su un branch dedicato all'iterazione, conviene segnalarlo come eccezione al workflow prima di chiudere il lavoro.

## 5. Test manuali suggeriti

Prima di chiudere l'iterazione farei almeno questi test manuali sulla ricerca:

- Ricerca con input valido: inserire una query normale e verificare che compaiano risultati coerenti.
- Input vuoto: premere cerca senza testo e verificare messaggio o validazione prevista.
- Input con caratteri speciali: provare simboli, accenti ed eventualmente emoji.
- Input molto lungo: verificare che non rompa UI o richiesta.
- Nessun risultato: usare una query che restituisca lista vuota e controllare empty state.
- Errore di rete: simulare assenza connessione e verificare error state leggibile.
- Timeout o attesa lunga: verificare che il loading state sia visibile e che l'app non si blocchi.
- Lista lunga: verificare scrolling e stabilità UI con molti risultati.
- Navigazione dalla ricerca al dettaglio, se presente: apertura corretta e ritorno alla lista senza perdita di stato inattesa.
- Tema chiaro/scuro e, se rilevante, rotazione schermo durante o dopo la ricerca.

## 6. Passi Git sensati adesso

Senza fare merge o push, i passi Git più sensati sono:

1. Verificare di essere sul branch dell'iterazione o della feature ricerca.
2. Controllare `git status` per vedere codice e documentazione ancora non tracciati o modificati.
3. Rivedere diff e contenuti finali prima di chiudere l'iterazione.
4. Aggiornare/stagiare sia il codice sia i documenti minimi della chiusura iterazione.
5. Creare un commit semantico finale, per esempio `docs: close search iteration` se stai chiudendo solo la documentazione, oppure `feat: complete search iteration` se l'ultimo commit include anche fix conclusivi.
6. Lasciare branch e worktree pronti per una review umana finale.

Se vuoi essere ancora più ordinato, ha senso separare:

- un commit per eventuali fix finali della feature;
- un commit per la sola documentazione di chiusura iterazione.

Non farei altro finché non hai confermato che i test manuali sopra sono passati e che la documentazione minima è coerente con il comportamento reale della ricerca.
