# Review Findings

## Findings

1. **Bloccante - Impossibile fare una review puntuale senza i file modificati**  
   Nel workspace non risultano presenti i sorgenti del service REST e del ViewModel citati. In particolare `src/` è vuota e non risultano file `*.cs` applicativi fuori dalle cartelle di esempio delle skill. Senza il codice non è possibile verificare in modo affidabile architettura, naming, nullability ed error handling riga per riga.

## Architettura da verificare appena i file sono disponibili

- Il service REST dovrebbe contenere solo responsabilità di accesso ai dati remoti: costruzione richiesta, chiamata `HttpClient`, controllo codici HTTP, deserializzazione e mapping minimo.
- Il ViewModel dovrebbe gestire stato UI e orchestrazione (`IsBusy`, `ErrorMessage`, `HasData`, comando async), senza istanziare direttamente `HttpClient` o spostare logica REST nella view/code-behind.
- Le dipendenze dovrebbero essere iniettate via costruttore; se il ViewModel crea il service con `new`, è un problema architetturale.

## Naming da controllare

- Nomi coerenti con MAUI/MVVM: `BookService`, `SearchViewModel`, `LoadAsync`, `SearchBooksAsync`, `ErrorMessage`, `HasData`.
- Evitare nomi generici o ambigui come `data`, `result`, `responseObj`, `serviceManager`, `vm` nelle API pubbliche.
- I metodi asincroni dovrebbero terminare con `Async`.

## Nullability da controllare

- Risposta HTTP con body vuoto o JSON `null`.
- Collezioni esposte dal ViewModel non inizializzate.
- Proprietà stringa bindate alla UI lasciate `null` senza gestione esplicita.
- DTO con campi opzionali dell'API non validati prima dell'uso.

## Error Handling da controllare

- Gestione distinta di timeout, errore di rete, HTTP non-success e JSON malformato.
- `IsBusy` deve tornare sempre a `false` in `finally`.
- `ErrorMessage` va azzerato all'inizio di una nuova esecuzione e valorizzato in modo user-friendly in caso di errore.
- Se il service restituisce lista vuota per ogni errore, il ViewModel rischia di confondere "nessun risultato" con "errore": serve una distinzione chiara.
- Nessuna eccezione dovrebbe essere inghiottita in silenzio.

## Test Manuali Suggeriti

1. Chiamata con risposta `200 OK` e payload valido: risultati mostrati correttamente.
2. Risposta `200 OK` con body vuoto o `null`: UI in errore controllato, senza crash.
3. Risposta `404` o `500`: messaggio errore coerente e stato loading chiuso.
4. Timeout della richiesta: messaggio specifico e possibilità di riprovare.
5. Assenza di rete: nessun crash, `ErrorMessage` visibile.
6. Payload con campi mancanti/null: nessuna `NullReferenceException`.
7. Ricerca senza risultati: stato empty distinto dallo stato errore.
8. Esecuzioni ripetute del comando: niente doppie richieste concorrenti se `IsBusy` è già `true`.

## Nota Finale

Per una review Man-in-the-Loop completa servono i due file effettivamente modificati oppure un diff. Con il materiale attuale posso solo indicare i controlli obbligatori e il problema bloccante di assenza dei sorgenti.
