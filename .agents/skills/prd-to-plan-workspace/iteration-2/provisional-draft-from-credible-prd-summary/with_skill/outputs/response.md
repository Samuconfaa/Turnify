# Piano breve

Il riassunto del PRD nel prompt è abbastanza solido per una **bozza provvisoria** dei tre documenti. Procedo quindi senza bloccare il lavoro, ma tratto tutto come materiale da validare contro il futuro `docs/spec.md` definitivo.

# File da creare o modificare

- `docs/plan.md`
- `docs/architecture.md`
- `docs/test-matrix.md`

# Implementazione richiesta

## `docs/plan.md` (bozza provvisoria derivata dal prompt)

| Iterazione | Obiettivo verificabile | Dipendenze | Rischio | Stato |
| --- | --- | --- | --- | --- |
| IT-01 | Fondazioni MAUI, Shell, pagina elenco alloggi e stati UI | nessuna | medio | pianificata |
| IT-02 | Ricerca/lista alloggi da API esterna con gestione errori | IT-01 | medio | pianificata |
| IT-03 | Pagina dettaglio alloggio con navigazione Shell | IT-02 | basso | pianificata |
| IT-04 | Preferiti locali e persistenza al riavvio | IT-03 | medio | pianificata |
| IT-05 | Verifiche finali MVP, documentazione e chiusura iterazione | IT-01..IT-04 | basso | pianificata |

Dettaglio rapido:

- IT-01 in scope: setup progetto, route iniziale, lista placeholder, loading/error/empty/success.
- IT-02 in scope: service remoto, DTO, parsing JSON, filtri minimi; out of scope: login.
- IT-03 in scope: dettaglio alloggio e passaggio identificativo; out of scope: mappe avanzate o prenotazione.
- IT-04 in scope: salva/rimuovi preferiti in locale; out of scope: sync cloud.
- IT-05 in scope: riallineamento docs, smoke test manuali, review e branch/commit guidance.

## `docs/architecture.md` (bozza provvisoria derivata dal prompt)

- Pattern: .NET MAUI + MVVM + `CommunityToolkit.Mvvm` + Shell.
- Views probabili: `HousingSearchPage`, `HousingDetailPage`, `FavoritesPage`.
- ViewModels: uno per pagina con stato esplicito (`IsBusy`, `ErrorMessage`, collezioni dati, empty state).
- Services: `IHousingApiService` per API esterna, `IFavoritesService` per storage locale.
- Models/DTO: DTO da API separati da model UI; parsing con `System.Text.Json`.
- Persistenza locale: preferenza per SQLite se i preferiti richiedono struttura; `Preferences` solo se il dato resta minimale.
- DI e composition root in `MauiProgram.cs`.
- TBD da validare sullo spec: sorgente API concreta, campi essenziali del dettaglio alloggio, eventuali filtri MVP.

## `docs/test-matrix.md` (bozza provvisoria derivata dal prompt)

| ID | Requisito o scenario | Categoria | Manuale | Automatico ora | Automatico più avanti | Iterazione target | Evidenza prevista | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TM-01 | Ricerca alloggi con input valido e input vuoto | Input | Si | Si | No | IT-01..IT-02 | `dotnet test` | Validation ViewModel |
| TM-02 | Lista alloggi da API con risposta valida | API | Si | Si | No | IT-02 | `dotnet test` | Mock service |
| TM-03 | Timeout / errore server / JSON incompleto | API | Si | Si | No | IT-02 | `dotnet test` | Error handling |
| TM-04 | Apertura dettaglio alloggio corretto | Navigation | Si | No | Si | IT-03 | Da eseguire | UI automation non prevista ora |
| TM-05 | Salvataggio preferiti e riapertura app | Persistence | Si | Si | No | IT-04 | `dotnet test` | Service locale |
| TM-06 | Tema o rotazione non degradano la vista lista | Device | Si | No | Si | IT-05 | Da eseguire | Future automation se servirà |

## Cosa validare quando esisterà `docs/spec.md`

- Nome e struttura esatta delle feature MVP: lista semplice o filtri più ricchi.
- Fonte API e campi minimi obbligatori del dettaglio alloggio.
- Scelta finale della persistenza locale (`Preferences` vs SQLite).
- Presenza o assenza di una schermata dedicata ai preferiti nell'MVP.

# Rischi o punti da controllare

- Il perimetro è abbastanza chiaro per una bozza, ma non ancora per documenti finali.
- Se lo spec definitivo amplia la ricerca con mappe, geolocalizzazione o prenotazioni, il piano andrà risliced.

# Test manuali suggeriti

- Ricerca con risultati e senza risultati.
- Apertura del dettaglio da lista.
- Salvataggio preferiti e riavvio app.

Nota esplicita: questa è una **bozza provvisoria derivata dal riassunto del prompt**, non un output finale validato contro `docs/spec.md`.
