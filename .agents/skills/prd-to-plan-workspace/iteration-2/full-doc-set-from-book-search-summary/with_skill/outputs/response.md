# Piano breve

Userò il riassunto presente nel prompt come base sufficiente per una bozza pianificatoria iniziale. Poiché in questa simulazione non ho letto il contenuto reale di `docs/spec.md`, tratto i tre documenti come **draft provvisorio da validare** contro lo spec salvato.

# File da creare o modificare

- `docs/plan.md`
- `docs/architecture.md`
- `docs/test-matrix.md`

# Implementazione richiesta

## `docs/plan.md` (draft provvisorio)

### Sintesi operativa

- Obiettivo: app .NET MAUI Android-first per cercare libri, vedere un dettaglio e salvare preferiti locali.
- Vincoli principali: MVVM, Shell, `CommunityToolkit.Mvvm`, niente logica business nel code-behind.
- Dipendenze esterne: API libri da confermare nello spec definitivo.

### Sequenza iterazioni

| Iterazione | Obiettivo verificabile | Dipendenze | Rischio | Stato |
| --- | --- | --- | --- | --- |
| IT-01 | Impostare shell, struttura MVVM e schermata base di ricerca con stati UI | nessuna | medio | pianificata |
| IT-02 | Integrare ricerca remota libri con gestione loading/error/empty/success | IT-01 | medio | pianificata |
| IT-03 | Aggiungere dettaglio libro con navigazione Shell e parametri | IT-02 | basso | pianificata |
| IT-04 | Salvare e rimuovere preferiti locali e verificarne la persistenza | IT-03 | medio | pianificata |
| IT-05 | Hardening, test di regressione, aggiornamento documentazione e preparazione Git/review | IT-01..IT-04 | basso | pianificata |

### Dettaglio essenziale

#### IT-01 - Fondazioni e ricerca locale fittizia

- In scope: Shell, cartelle Views/ViewModels/Services/Models, pagina ricerca con input e stati espliciti.
- Out of scope: chiamate API reali, dettaglio, preferiti.
- Aree probabili: `AppShell.xaml`, `Views/SearchPage.xaml`, `ViewModels/SearchViewModel.cs`, `docs/plan.md`.
- Criteri di accettazione:
  - [ ] La app apre la pagina ricerca tramite Shell.
  - [ ] Sono visibili stati loading, empty, error e success simulati.
  - [ ] Il progetto compila senza logica business nel code-behind.

#### IT-02 - Ricerca remota libri

- In scope: `HttpClient`, parsing JSON, DTO, mapping, gestione timeout/errore.
- Out of scope: preferiti, caching avanzato.
- Criteri di accettazione:
  - [ ] Una query valida restituisce elenco libri.
  - [ ] Timeout o errore server mostrano messaggio coerente.
  - [ ] Una query senza risultati mostra empty state dedicato.

#### IT-03 - Dettaglio libro

- In scope: route Shell, passaggio identificativo, pagina dettaglio.
- Out of scope: modifica preferiti offline avanzata.
- Criteri di accettazione:
  - [ ] Tap su un libro apre il dettaglio corretto.
  - [ ] Il dettaglio gestisce loading ed errore.

#### IT-04 - Preferiti locali

- In scope: persistenza locale per preferiti, toggle salva/rimuovi, lista preferiti.
- Out of scope: sincronizzazione cloud, login.
- Criteri di accettazione:
  - [ ] L'utente può salvare un libro tra i preferiti.
  - [ ] I preferiti restano disponibili al riavvio app.

#### IT-05 - Chiusura MVP

- In scope: rifiniture UX minime, verifica regressioni principali, documentazione e branch/commit guidance.
- Criteri di accettazione:
  - [ ] Tutti gli scenari MVP risultano coperti dalla matrice di test.
  - [ ] La documentazione è allineata a quanto implementato.

## `docs/architecture.md` (draft provvisorio)

- Pattern applicativi: .NET MAUI, MVVM, `CommunityToolkit.Mvvm`, Shell navigation.
- Views: `SearchPage`, `BookDetailPage`, eventuale `FavoritesPage`.
- ViewModels: uno per pagina, con `IsBusy`, `ErrorMessage`, `HasData` o equivalente.
- Services: `IBookSearchService` per API remota, `IFavoritesService` per persistenza locale.
- Models e DTO: DTO separati dal model UI; parsing con `System.Text.Json`.
- Navigazione: route Shell per ricerca, dettaglio e preferiti; passaggio parametro ID libro verso il dettaglio.
- Stato UI: ogni pagina deve rendere espliciti loading/error/empty/success.
- Persistenza locale: `Preferences` solo se i dati sono minimi; per preferiti strutturati meglio SQLite, da confermare nello spec definitivo.
- DI: registrare ViewModels e Services in `MauiProgram.cs`.
- TBD: fonte API concreta, strategia finale di persistenza locale, eventuale pagina dedicata preferiti.

## `docs/test-matrix.md` (draft provvisorio)

| ID | Requisito o scenario | Categoria | Manuale | Automatico ora | Automatico più avanti | Iterazione target | Evidenza prevista | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TM-01 | Query vuota o solo spazi | Input | Si | Si | No | IT-01 | `dotnet test` | Validare ViewModel |
| TM-02 | Ricerca con risultati | API | Si | Si | No | IT-02 | `dotnet test` | Mock servizio |
| TM-03 | Timeout o errore server | API | Si | Si | No | IT-02 | `dotnet test` | Gestione error state |
| TM-04 | Risposta vuota | UI state | Si | Si | No | IT-02 | `dotnet test` | Empty state coerente |
| TM-05 | Tap risultato -> dettaglio corretto | Navigation | Si | No | Si | IT-03 | Da eseguire | UI automation solo più avanti |
| TM-06 | Salvataggio preferito e riapertura app | Persistence | Si | Si | No | IT-04 | `dotnet test` | Test di service locale |
| TM-07 | Tema/rotazione non rompono schermata principale | Device | Si | No | Si | IT-05 | Da eseguire | Da pianificare se necessario |

# Rischi o punti da controllare

- Il prompt basta per una bozza, ma mancano dettagli dello spec reale su API, pagina preferiti dedicata e persistenza finale.
- Da validare se SQLite sia davvero necessario o se `Preferences` basti per l'MVP.
- Da confermare il naming delle route Shell e delle cartelle di progetto.

# Test manuali suggeriti

- Cercare un libro valido, aprire il dettaglio e tornare indietro.
- Simulare risposta vuota e verificare empty state.
- Salvare un preferito, chiudere e riaprire la app.

Nota: questo output è un **draft provvisorio derivato dal riassunto del prompt**; va riallineato al contenuto effettivo di `docs/spec.md` prima di considerarlo finale.
