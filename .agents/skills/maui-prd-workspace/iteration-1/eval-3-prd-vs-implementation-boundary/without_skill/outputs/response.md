# PRD sintetico

L'app permette di cercare film, visualizzare dettagli e consumare dati da un servizio REST.

## Requisiti principali

- Ricerca film.
- Dettaglio film.
- Gestione errori di chiamata API.

## Implementazione iniziale

### `SearchPage`

Pagina con `SearchBar`, pulsante di ricerca e lista risultati.

### `SearchViewModel`

Espone `Query`, `Results`, `IsBusy` e il comando `SearchCommand`.

### `MovieService`

Service REST che usa `HttpClient` per invocare l'API e deserializzare JSON.

In un secondo momento si potranno aggiungere ulteriori dettagli di progetto.
