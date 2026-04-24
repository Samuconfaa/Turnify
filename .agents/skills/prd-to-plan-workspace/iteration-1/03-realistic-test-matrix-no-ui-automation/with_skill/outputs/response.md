# Piano breve

Posso impostare una `docs/test-matrix.md` realistica, ma senza il PRD concreto devo restare a livello di pianificazione e usare scenari tipo. Mantengo quindi i controlli come `Evidenza prevista` e non come test già eseguiti.

# File da creare o modificare

- `docs/test-matrix.md`

# Implementazione richiesta

## Regole di impostazione

- `Manuale`, `Automatico ora`, `Automatico più avanti` vanno distinti esplicitamente;
- niente UI automation come copertura già disponibile;
- priorità a unit test ViewModel, service test e build verification;
- eventuale UI automation solo come lavoro futuro.

## Bozza `docs/test-matrix.md`

| ID | Requisito o scenario | Categoria | Manuale | Automatico ora | Automatico più avanti | Iterazione target | Evidenza prevista | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TM-01 | Input vuoto o invalido | Input | Si | Si | No | TBD | `dotnet test` / Da eseguire | Validare comandi ViewModel e messaggi errore |
| TM-02 | Risposta API con successo | API | Si | Si | No | TBD | `dotnet test` | Mock del service e parsing DTO |
| TM-03 | Timeout o errore server | API | Si | Si | No | TBD | `dotnet test` | Verificare stato errore UI pianificato |
| TM-04 | Risposta vuota | UI state | Si | Si | No | TBD | `dotnet test` | Empty state del ViewModel |
| TM-05 | Navigazione verso dettaglio con parametro | Navigation | Si | No | Si | TBD | Da eseguire | UI automation non ancora presente |
| TM-06 | Salvataggio locale preferito o dato utente | Persistence | Si | Si | No | TBD | `dotnet test` | Service o repository locale testabile subito |
| TM-07 | Tema, rotazione, permessi negati | Device | Si | No | Si | TBD | Da eseguire | Richiede copertura device-specific più avanti |
| TM-08 | Build, XAML bindings e route Shell principali | Build/Navigation | No | Si | No | TBD | build CI / `dotnet test` | Verifica pragmatica disponibile subito |

## Note su ciò che metterei subito

- manuale: scenari end-to-end, device behavior, navigazione reale, controlli visuali;
- automatico ora: unit test su ViewModel, service test, parsing DTO, persistenza locale dove isolabile, verifica build;
- automatico più avanti: UI automation per flussi completi, rotazione, test device-specific più costosi.

## Gap minimi prima di finalizzare

1. Quali feature principali copre il PRD?
2. Esiste già una pipeline CI per build/test?
3. La persistenza locale è `Preferences` o `SQLite`?

# Rischi o punti da controllare

- senza PRD reale la matrice resta generica per scenari e iterazioni target;
- alcuni controlli automatici dipendono dalla testabilità delle ViewModel e dalla separazione service/UI;
- se il repository non compila ancora MAUI test projects, anche la copertura "ora" va calibrata.

# Test manuali suggeriti

- eseguire almeno uno scenario completo per feature chiave;
- verificare loading/error/empty/success;
- verificare navigazione reale e persistenza dopo riavvio app.
