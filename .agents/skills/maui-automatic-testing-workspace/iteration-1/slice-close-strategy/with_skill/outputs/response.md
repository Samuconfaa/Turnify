# Piano breve

- Aggiungerei subito un solo test project unitario, focalizzato su `SearchViewModel` e `BookService`.
- Userei il build della app MAUI come check automatico obbligatorio perché sono stati toccati `SearchPage.xaml` e `AppShell.xaml.cs`.
- Lascerei fuori per ora la UI automation: nel repository non esistono ancora né test project né stack device/emulator automation.

# File da creare o modificare

- `tests/<NomeApp>.Tests/<NomeApp>.Tests.csproj` oppure un equivalente singolo test project unitario.
- `tests/<NomeApp>.Tests/ViewModels/SearchViewModelTests.cs`
- `tests/<NomeApp>.Tests/Services/BookServiceTests.cs`
- Facoltativo ma sensato se esiste parsing non banale: `tests/<NomeApp>.Tests/Models/BookDtoParsingTests.cs`
- Facoltativo per allineamento documentale di fine slice: `docs/test-matrix.md` oppure `docs/iterations/it-xx.md`

# Implementazione richiesta

## Test aggiunti

Subito aggiungerei questi test automatici:

1. `SearchViewModelTests`
   - esecuzione del comando di ricerca con input valido: invoca il service una sola volta e popola i risultati;
   - transizione `IsBusy`: `true` all'avvio e `false` in `finally`;
   - reset di `ErrorMessage` su nuovo tentativo;
   - gestione risposta vuota: stato coerente tra risultati, `HasData` e stato empty;
   - gestione errore dal service: messaggio di errore valorizzato e nessun crash;
   - prevenzione di doppie esecuzioni concorrenti, se il ViewModel la implementa.

2. `BookServiceTests`
   - risposta HTTP 200 con JSON valido: mapping corretto verso il modello usato dalla UI;
   - risposta vuota o corpo `null`: fallback prevedibile, tipicamente lista vuota o errore esplicito;
   - `HttpRequestException`: comportamento dichiarato e non silenzioso;
   - `TaskCanceledException` o timeout: comportamento prevedibile;
   - JSON malformato (`JsonException`): fallback o errore esplicito coerente.

3. `BookDtoParsingTests` solo se `BookService` fa parsing con assunzioni non banali
   - campi mancanti/null;
   - array vuoto;
   - proprietà con casing/shape inattesa se l'API reale è instabile.

## Comandi da eseguire

Nel repo applicativo reale eseguirei, in quest'ordine:

```powershell
dotnet test tests/<NomeApp>.Tests/<NomeApp>.Tests.csproj
dotnet build src/<NomeApp>/<NomeApp>.csproj
```

Se esiste una solution, meglio:

```powershell
dotnet test <NomeSolution>.sln
dotnet build <NomeSolution>.sln
```

Il `build` è parte della strategia automatica, non un extra, perché `SearchPage.xaml` e `AppShell.xaml.cs` possono introdurre regressioni di binding, route o compilazione XAML anche senza UI automation.

## Tipi di test intenzionalmente non aggiunti ora

- UI automation end-to-end: non la aggiungerei in questa slice perché il repository non ha infrastruttura esistente e sarebbe un salto troppo grande rispetto al rischio attuale.
- Test accoppiati al runtime completo di Shell: eviterei test fragili su internals MAUI; meglio verificare build e, se c'è logica estraibile, testare quella a livello di ViewModel o helper.
- Snapshot o visual regression: non giustificati per questa iterazione.

# Rischi o punti da controllare

- In questo repository di eval non sono presenti i file MAUI citati, né solution, né project file: quindi non è possibile eseguire davvero i comandi sopra qui dentro.
- `SearchPage.xaml` resta esposto a problemi visuali che il build non copre: visibilità di loading/error/empty state, layout, binding contestuali e comportamento della `CollectionView`.
- `AppShell.xaml.cs` resta esposto a problemi di navigazione runtime: route registrata ma non usata correttamente, parametri Shell errati, navigazione back.
- Se `SearchViewModel` contiene dipendenze concrete create con `new`, i test unitari diventano più costosi: va verificata l'iniezione via costruttore.

# Test automatici eseguiti o proposti

## Eseguiti in questo repository

- Lettura completa dello skill `maui-automatic-testing` e dei reference richiesti.
- Verifica infrastrutturale del repository: nessun `.sln`, nessun `.csproj`, nessun test project, nessuna UI automation rilevata.

## Proposti per chiudere la slice in modo sensato

- 1 test project unitario minimo.
- Test di regressione su `SearchViewModel`.
- Test di servizio/parsing su `BookService`.
- Build automatico della app MAUI come check obbligatorio dopo modifiche a XAML e Shell.

## Parti da lasciare ancora a verifica manuale

- apertura della pagina di ricerca e rendering iniziale;
- stato loading visibile durante la ricerca;
- stato empty con query valida ma nessun risultato;
- stato errore realmente visibile a schermo;
- navigazione Shell collegata alle route modificate;
- comportamento su emulator/device Android con rete assente o lenta;
- layout, scroll e usabilità su schermi piccoli.

In sintesi: per chiudere bene la slice aggiungerei subito unit test su `SearchViewModel` e `BookService`, eseguirei `dotnet test` e `dotnet build`, e lascerei alla verifica manuale tutto ciò che dipende da rendering MAUI reale e navigazione Shell a runtime. Questa è la copertura automatica minima credibile senza introdurre oggi una infrastruttura di UI automation che il repository ancora non ha.
