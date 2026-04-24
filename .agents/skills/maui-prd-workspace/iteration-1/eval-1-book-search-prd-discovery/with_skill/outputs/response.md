# Piano breve

1. Chiarisco i punti che cambiano davvero il perimetro del PRD.
2. Dopo le tue risposte preparo `docs/spec.md` come specifica di progetto, non come piano di iterazioni.
3. Quando la specifica è stabile, il passo successivo sarà derivare `docs/plan.md`, `docs/architecture.md` e `docs/test-matrix.md` con `prd-to-plan`.

# File da creare o modificare

- `docs/spec.md`

# Implementazione richiesta

Prima di completare un nuovo `docs/spec.md`, mi servono alcune decisioni essenziali. Evito di inventare dettagli che poi falserebbero il perimetro del progetto.

1. Qual è la fonte principale dei libri?
   A. API pubblica remota
   B. Catalogo locale creato da me
   C. Entrambe
   D. Altro: [specifica]

2. Qual è il flusso minimo dell'MVP?
   A. Ricerca + dettaglio libro
   B. Ricerca + dettaglio + preferiti locali
   C. Ricerca + dettaglio + preferiti + filtri
   D. Altro: [specifica]

3. Cosa deve restare fuori dalla prima versione?
   A. Login/sincronizzazione cloud
   B. Recensioni e commenti
   C. Suggerimenti personalizzati
   D. Altro: [specifica]

4. Come devono funzionare i preferiti?
   A. Solo salvataggio locale sul dispositivo
   B. Sincronizzati con account
   C. Da decidere (`TBD`)
   D. Altro: [specifica]

Assunzioni già ragionevoli, ma ancora da confermare nel PRD:

- app `.NET MAUI` con impostazione compatibile con MVVM e Shell;
- Android come target principale;
- stati UI espliciti almeno per ricerca e caricamento dettaglio: loading, empty, success, error;
- persistenza locale plausibile tramite `Preferences` e/o SQLite per i preferiti, se confermi che non serve sincronizzazione;
- il PRD descriverà MVP, non-obiettivi, criteri di accettazione e vincoli di progetto, senza entrare ancora nel dettaglio implementativo.

Con queste risposte, preparo `docs/spec.md` con:

- visione e problema da risolvere;
- utenti target e scenario principale;
- MVP e non-obiettivi;
- epic e user stories;
- criteri di accettazione verificabili;
- vincoli MAUI coerenti con il repository.

# Rischi o punti da controllare

- Senza chiarire la sorgente dati rischio di inventare requisiti API non confermati.
- Senza definire cosa resta fuori dall'MVP il progetto può crescere troppo presto.
- Se i preferiti devono essere sincronizzati, cambiano ambito, privacy e complessità.

# Test manuali suggeriti

- Verificare che il PRD distingua chiaramente specifica di progetto e planning.
- Controllare che ogni epic abbia criteri di accettazione osservabili.
- Confermare che Android resti il target primario e che iOS non venga promesso implicitamente.
