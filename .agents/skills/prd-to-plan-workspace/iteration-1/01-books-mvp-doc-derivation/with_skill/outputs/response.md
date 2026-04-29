# Piano breve

Posso derivare `docs/plan.md`, `docs/architecture.md` e `docs/test-matrix.md`, ma per farlo in modo corretto devo prima leggere davvero `docs/spec.md`. Nel prompt hai dato solo un riassunto dell'MVP (`ricerca`, `dettaglio libro`, `preferiti`), quindi posso preparare una bozza guidata e segnalare i punti che restano bloccati finché lo spec non è disponibile.

# File da creare o modificare

- `docs/plan.md`
- `docs/architecture.md`
- `docs/test-matrix.md`

# Implementazione richiesta

## Blocking gap

- manca il contenuto reale di `docs/spec.md`, quindi non posso confermare scope approvato, non-goal, vincoli e scenari utente senza fare assunzioni non verificate;
- procedo quindi con una proposta iniziale da confermare, non con documenti definitivi.

## Bozza per `docs/plan.md`

### Sequenza proposta

- `IT-01` Ricerca libri: pagina di ricerca, input, chiamata service, stati `loading/error/empty/success`.
- `IT-02` Dettaglio libro: navigazione Shell dal risultato al dettaglio e rendering dati del libro.
- `IT-03` Preferiti locali: persistenza locale, aggiunta/rimozione preferiti, rilettura stato all'avvio.
- `IT-04` Hardening e documentazione: rifiniture UX minori, aggiornamento docs, verifica finale del flusso.

### Esempio dettaglio iterazione

#### IT-01 - Ricerca libri

**Obiettivo verificabile**

L'utente inserisce una query valida e visualizza una lista risultati con gestione esplicita degli stati pagina.

**In scope**

- View di ricerca
- ViewModel con comando async
- service di ricerca libri
- mapping DTO minimi

**Out of scope**

- dettaglio libro
- preferiti
- ottimizzazioni UI non essenziali

**Criteri di accettazione**

- [ ] query vuota gestita senza crash
- [ ] query valida mostra risultati
- [ ] timeout o errore server mostra stato errore chiaro
- [ ] risposta vuota mostra empty state

## Bozza per `docs/architecture.md`

- pattern: `.NET MAUI` + MVVM + `CommunityToolkit.Mvvm` + Shell navigation;
- `Views/`: `BookSearchPage`, `BookDetailPage`, `FavoritesPage`;
- `ViewModels/`: uno per pagina, con `IsBusy`, `ErrorMessage`, `HasData` o equivalenti;
- `Services/`: `IBookSearchService` per dati remoti, `IFavoritesService` per persistenza locale;
- `Models/DTO`: modelli dominio libro e DTO API separati;
- stato UI: obbligatori `loading`, `error`, `empty`, `success`;
- persistenza locale: `Preferences` se i preferiti sono minimi, `SQLite` se serve una struttura più ricca;
- decisioni ancora `TBD`: API concreta, schema DTO reale, chiave identificativa dei preferiti.

## Bozza per `docs/test-matrix.md`

| ID | Scenario | Categoria | Manuale | Automatico ora | Automatico più avanti | Iterazione |
| --- | --- | --- | --- | --- | --- | --- |
| TM-01 | Query vuota | Input | Si | Si | No | IT-01 |
| TM-02 | Risposta API con risultati | API/UI state | Si | Si | No | IT-01 |
| TM-03 | Timeout o errore server | API/UI state | Si | Si | No | IT-01 |
| TM-04 | Navigazione lista -> dettaglio | Navigation | Si | No | Si | IT-02 |
| TM-05 | Salvataggio preferito e ripristino | Persistence | Si | Si | No | IT-03 |
| TM-06 | Verifica build e binding principali | Device/build | No | Si | No | IT-01/IT-02 |

Note:

- `Automatico ora`: unit test ViewModel e service, più build verification.
- `Automatico più avanti`: eventuale UI automation, non pianificata come già disponibile.
- evidenza prevista: `Da eseguire` fino a esecuzione reale.

## Chiarimenti minimi per finalizzare i file

1. Qual è la fonte dati dei libri?
2. I preferiti richiedono solo salvataggio locale o anche sincronizzazione?
3. Ci sono non-goal espliciti nello spec, ad esempio login o filtri avanzati?

Raccomando di condividere `docs/spec.md` o completarlo prima di considerare questi tre documenti definitivi.

# Rischi o punti da controllare

- senza spec completo rischio di introdurre assunzioni errate su API e persistenza;
- i preferiti potrebbero richiedere SQLite invece di `Preferences`;
- Shell routes e struttura cartelle vanno confermate sul repository reale.

# Test manuali suggeriti

- cercare un libro con query valida;
- verificare empty state con query senza risultati;
- aprire il dettaglio da un elemento lista;
- salvare un preferito e riaprire l'app per verificarne il ripristino.
