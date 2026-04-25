# Piano breve

1. Mi fermo alla fase PRD, perché qui serve prima la specifica di progetto.
2. Raccolgo le informazioni minime per definire il perimetro.
3. Solo dopo una `docs/spec.md` accettata si passa a planning e implementazione.

# File da creare o modificare

- `docs/spec.md`

# Implementazione richiesta

Non implemento subito `SearchPage`, `SearchViewModel` o il service REST, perché questi appartengono alla fase successiva. In questo workflow il PRD definisce obiettivi, scope, criteri di accettazione e vincoli; il planning trasforma il PRD in iterazioni e architettura; solo dopo ha senso scrivere il codice.

Per impostare bene il PRD, mi servono almeno queste risposte:

1. La ricerca film usa:
   A. API remota pubblica
   B. Catalogo locale
   C. Entrambi
   D. Altro: [specifica]

2. Qual è il flusso minimo dell'MVP?
   A. Solo ricerca + dettaglio
   B. Ricerca + dettaglio + preferiti
   C. Ricerca + dettaglio + cronologia
   D. Altro: [specifica]

3. Cosa deve restare fuori dall'MVP?
   A. Login
   B. Recensioni utenti
   C. Raccomandazioni personalizzate
   D. Altro: [specifica]

Con ciò che già sappiamo, il PRD dovrà almeno fissare:

- target Android primario;
- UI compatibile con MVVM e Shell;
- stati loading, empty, success ed error per ricerca e dettaglio;
- uso eventuale di `HttpClient` e `System.Text.Json` solo come vincoli di progetto, non ancora come codice;
- non-obiettivi chiari per evitare di entrare subito nell'implementazione.

Quando `docs/spec.md` sarà approvato, il passaggio successivo coerente è usare `prd-to-plan` per derivare `docs/plan.md`, `docs/architecture.md` e `docs/test-matrix.md`. Solo dopo potremo implementare `SearchPage`, `SearchViewModel` e il service REST in un'iterazione dedicata.

# Rischi o punti da controllare

- Saltare il PRD porta facilmente a pagine e service costruiti su requisiti ancora instabili.
- Senza non-obiettivi, il progetto film può allargarsi rapidamente verso login, rating o raccomandazioni.

# Test manuali suggeriti

- Verificare che la risposta non contenga codice applicativo.
- Controllare che il prossimo passo indicato sia planning, non implementazione immediata.
- Confermare che i requisiti restino a livello di prodotto e non di dettagli tecnici di classe.
