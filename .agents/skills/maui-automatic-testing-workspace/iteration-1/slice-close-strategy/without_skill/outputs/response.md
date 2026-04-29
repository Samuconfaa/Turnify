# Strategia di chiusura slice

## 1. Piano breve

- Aggiungere subito un test project unitario separato dal progetto MAUI, così da coprire la logica che oggi ha valore e rischio reale: `SearchViewModel` e `BookService`.
- Usare i test automatici per stati UI, branching ed error handling; usare la build come smoke test per XAML e wiring; lasciare a verifica manuale il rendering reale della pagina e la navigazione Shell end-to-end.
- Non introdurre ancora UI automation: senza un'infrastruttura già presente, il costo iniziale è alto e per questa slice renderebbe più lenta la chiusura rispetto al valore ottenuto.

## 2. File da creare o modificare

- `tests/BookScout.Mobile.Tests/BookScout.Mobile.Tests.csproj`
- `tests/BookScout.Mobile.Tests/ViewModels/SearchViewModelTests.cs`
- `tests/BookScout.Mobile.Tests/Services/BookServiceTests.cs`
- `tests/BookScout.Mobile.Tests/TestDoubles/FakeHttpMessageHandler.cs`
- `tests/BookScout.Mobile.Tests/TestDoubles/FakeBookService.cs` oppure mock equivalenti
- `BookScout.Mobile.sln` o soluzione equivalente, per includere il test project
- `docs/test-matrix.md` oppure `docs/iterations/it-xx.md`, per registrare copertura e limiti della slice

## 3. Implementazione richiesta

### Test da aggiungere subito

Per `SearchViewModel.cs` aggiungerei test unitari su comportamento osservabile, non sull'implementazione interna:

- avvio ricerca: imposta `IsBusy = true`, poi lo rimette a `false` a fine operazione;
- ricerca con risultati: popola la collection, `HasData = true`, `ErrorMessage` vuoto, empty state disattivo;
- ricerca senza risultati: collection vuota, `HasData = false`, empty state attivo;
- errore dal service: `ErrorMessage` valorizzato, nessun crash, stato finale coerente;
- input non valido o query vuota: il comando non chiama il service oppure restituisce stato neutro, in base al comportamento atteso;
- doppio trigger rapido della ricerca: verificare che non partano due esecuzioni concorrenti se il ViewModel dovrebbe impedirlo.

Per `BookService.cs` aggiungerei test unitari/pseudo-integrati con `HttpClient` finto e payload controllati:

- risposta HTTP 200 con JSON valido: mapping corretto verso DTO/modello usato dal ViewModel;
- risposta HTTP 200 con lista vuota: ritorno coerente, senza eccezioni spurie;
- risposta HTTP non success (`404`, `500`): gestione esplicita dell'errore atteso;
- JSON malformato: propagazione o traduzione coerente della `JsonException`;
- cancellazione o timeout: comportamento previsto per `TaskCanceledException`;
- encoding e campi mancanti/null: il parser non rompe il flusso in casi realistici.

Per `SearchPage.xaml` e `AppShell.xaml.cs` non partirei subito con test UI automatici. Aggiungerei invece solo verifiche indirette a basso costo:

- build del progetto MAUI per far compilare XAML e binding;
- eventuale test semplice sulla registrazione route solo se la route è esposta in modo facilmente verificabile senza bootstrappare l'app intera.

Se `AppShell.xaml.cs` contiene sola registrazione route, il ROI di un test dedicato è basso. Meglio coprirla con build + verifica manuale di navigazione.

### Priorità reale

Ordine consigliato:

1. `SearchViewModelTests`
2. `BookServiceTests`
3. smoke check di build MAUI
4. documentazione di ciò che resta manuale

## 4. Comandi che eseguirei

Per impostare i test:

```powershell
dotnet new xunit -o tests/BookScout.Mobile.Tests
dotnet sln add tests/BookScout.Mobile.Tests/BookScout.Mobile.Tests.csproj
dotnet add tests/BookScout.Mobile.Tests/BookScout.Mobile.Tests.csproj reference src/BookScout.Mobile/BookScout.Mobile.csproj
```

Se servono package minimi di supporto ai test, li limiterei allo stretto necessario:

```powershell
dotnet add tests/BookScout.Mobile.Tests/BookScout.Mobile.Tests.csproj package Microsoft.NET.Test.Sdk
dotnet add tests/BookScout.Mobile.Tests/BookScout.Mobile.Tests.csproj package xunit
dotnet add tests/BookScout.Mobile.Tests/BookScout.Mobile.Tests.csproj package xunit.runner.visualstudio
dotnet add tests/BookScout.Mobile.Tests/BookScout.Mobile.Tests.csproj package coverlet.collector
```

Per eseguire i controlli automatici della slice:

```powershell
dotnet test tests/BookScout.Mobile.Tests/BookScout.Mobile.Tests.csproj
dotnet build src/BookScout.Mobile/BookScout.Mobile.csproj -f net8.0-android
```

Se la pipeline locale supporta anche il restore separato:

```powershell
dotnet restore
dotnet test --no-restore tests/BookScout.Mobile.Tests/BookScout.Mobile.Tests.csproj
dotnet build --no-restore src/BookScout.Mobile/BookScout.Mobile.csproj -f net8.0-android
```

## 5. Cosa lascerei ancora a verifica manuale

- resa visiva reale di `SearchPage.xaml` su Android: spaziature, allineamenti, scroll, tastiera, densità schermo;
- correttezza dei binding a runtime che dipendono dal visual tree o da converter/style non coperti da unit test;
- navigazione Shell end-to-end da UI, inclusa back navigation e parametri route, se la route è stata toccata in `AppShell.xaml.cs`;
- comportamento con rete lenta o assente su dispositivo/emulatore;
- eventuali regressioni di focus, tap multipli, refresh visuale durante `IsBusy`.

## 6. Rischi o punti da controllare

- Un progetto MAUI referenziato da test classici può richiedere piccoli aggiustamenti di target/framework; conviene tenere i test più possibile su classi ViewModel/Service pure.
- Se `BookService` costruisce direttamente URL o usa `HttpClient` senza astrazione minima, i test restano fattibili ma vanno preparati con `HttpMessageHandler` finto.
- Se `SearchViewModel` dipende da `MainThread`, navigazione Shell o servizi statici, va isolata la dipendenza prima dei test; questo è il punto tecnico più probabile da rifinire.
- Senza UI automation resta un gap sulle regressioni visive e di navigazione reale, ma è un compromesso ragionevole per chiudere questa slice.

## 7. Test manuali suggeriti

1. Cercare una query valida e verificare comparsa risultati, fine loading e assenza errori.
2. Cercare una query senza match e verificare empty state.
3. Simulare errore rete e verificare messaggio utente e recovery al tentativo successivo.
4. Toccare rapidamente il comando di ricerca più volte e verificare assenza di comportamenti duplicati.
5. Aprire il flusso che usa la route registrata in `AppShell.xaml.cs` e verificare navigazione avanti/indietro.
6. Ripetere almeno un test su emulatore Android con connessione lenta.

## Sintesi

Per chiudere bene la slice aggiungerei subito test automatici solo dove il valore è alto e il costo è basso: `SearchViewModel` e `BookService`. Per `SearchPage.xaml` e `AppShell.xaml.cs` userei build come smoke test e lascerei a manuale la parte realmente UI/navigation, rimandando l'UI automation a quando esisterà una baseline stabile di test e una seconda slice dedicata.
