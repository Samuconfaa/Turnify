# Piano breve

Preparo una `docs/test-matrix.md` di livello pianificatorio: separo ciò che conviene verificare manualmente subito, ciò che è automatizzabile adesso con test unitari/service/build, e ciò che può arrivare più avanti senza fingere che la UI automation esista già.

# File da creare o modificare

- `docs/test-matrix.md`

# Implementazione richiesta

## `docs/test-matrix.md`

| ID | Requisito o scenario | Categoria | Manuale | Automatico ora | Automatico più avanti | Iterazione target | Evidenza prevista | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TM-01 | Input vuoto o invalido nella ricerca | Input | Si | Si | No | IT-01 | `dotnet test` | ViewModel validation |
| TM-02 | Risposta API con risultati validi | API | Si | Si | No | IT-02 | `dotnet test` | Mock `HttpClient` o service |
| TM-03 | Timeout / errore server / JSON malformato | API | Si | Si | No | IT-02 | `dotnet test` | Gestione error state e parsing |
| TM-04 | Empty state coerente quando non ci sono risultati | UI state | Si | Si | No | IT-02 | `dotnet test` | Verifica stato ViewModel |
| TM-05 | Navigazione verso dettaglio con parametro corretto | Navigation | Si | No | Si | IT-03 | Da eseguire | UI automation non disponibile oggi |
| TM-06 | Salvataggio e rimozione preferiti locali | Persistence | Si | Si | No | IT-04 | `dotnet test` | Test service/repository |
| TM-07 | Riavvio app con preferiti ancora presenti | Persistence | Si | Si | No | IT-04 | `dotnet test` | Verifica serializzazione o DB |
| TM-08 | Rotazione / cambio tema non rompono la schermata | Device | Si | No | Si | IT-05 | Da eseguire | Richiede setup successivo |
| TM-09 | Compilazione XAML e route Shell valide | Navigation | No | Si | No | IT-01..IT-05 | build CI / `dotnet build` | Check automatico realistico subito |

## Note su test automatici

- Subito: privilegiare test di ViewModel, servizi, parsing DTO e build verification.
- Più avanti: UI automation per scenari cross-page e controlli device-specific, solo dopo che il repository avrà infrastruttura adatta.
- Evidenza prevista: tutte le righe restano in forma pianificata (`Da eseguire`, `dotnet test`, `dotnet build`), non come risultato già ottenuto.

# Rischi o punti da controllare

- Senza conoscere lo stack esatto di persistenza, alcuni check restano generici a livello service/repository.
- Se il PRD include scenari offline complessi, serviranno righe aggiuntive dedicate.

# Test manuali suggeriti

- Scenario happy path completo.
- Scenario errore rete.
- Salvataggio preferiti e riavvio app.
