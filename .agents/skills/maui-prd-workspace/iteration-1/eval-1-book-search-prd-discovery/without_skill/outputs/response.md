# `docs/spec.md`

## Visione

L'app consente di cercare libri, vedere i dettagli e salvare i preferiti in una esperienza mobile semplice e moderna.

## MVP

- ricerca libri per titolo;
- pagina di dettaglio con autore, copertina e descrizione;
- salvataggio e rimozione dei preferiti;
- elenco preferiti.

## Funzionalità future

- login;
- sincronizzazione cloud;
- recensioni utenti;
- suggerimenti personalizzati.

## Requisiti funzionali

- L'utente può cercare libri da un catalogo remoto.
- L'utente può aprire il dettaglio di un libro.
- L'utente può aggiungere un libro ai preferiti.
- L'utente può rimuovere un libro dai preferiti.

## Criteri di accettazione

- La ricerca restituisce risultati coerenti con il testo inserito.
- Il dettaglio mostra le informazioni principali del libro.
- I preferiti restano disponibili dopo la chiusura dell'app.

## Vincoli tecnici

- App sviluppata con `.NET MAUI`.
- Pattern MVVM.
- Navigazione con Shell.
- Persistenza locale dei preferiti.

## Note

In seguito sarà possibile suddividere il lavoro in iterazioni tecniche e implementare le relative pagine e i servizi necessari.
