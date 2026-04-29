# Copilot Instructions

## Scopo

Questo repository è usato per un progetto didattico .NET MAUI con sviluppo
assistito da AI.
Le risposte devono supportare uno sviluppo spec-driven e documentato.

## Regole di comportamento

- Prima di generare codice, proporre un piano sintetico.
- Non implementare più di una feature significativa per volta.
- Rispettare l'architettura MVVM.
- Usare Shell per la navigazione, salvo esplicita richiesta diversa.
- Evitare di introdurre pacchetti o framework non richiesti.
- Tenere separati View, ViewModel, Model e Service.
- Gestire stati di caricamento (IsBusy), errore (ErrorMessage) e dati vuoti.
- Segnalare eventuali rischi di regressione.
- Suggerire e/o eseguire messaggi di commit basati sulle modifiche al momento opportuno.

## Formato preferito delle risposte

Per richieste tecniche importanti, restituire:

1. Obiettivo dell'intervento.
2. Piano sintetico.
3. File coinvolti.
4. Codice richiesto.
5. Test manuali da eseguire.
6. Possibili problemi o rischi.

## Limiti

- Non riscrivere l'intera applicazione se viene richiesto un intervento locale.
- Non aggiungere codice non necessario (no gold plating).
- Non rimuovere funzionalità esistenti senza motivazione.
- Non ignorare nullability, error handling e async/await.

## Convenzioni del progetto

- Target principale: Android.
- UI: XAML con data binding.
- Architettura: MVVM con CommunityToolkit.Mvvm.
- REST: HttpClient asincrono.
- Storage locale: Preferences e/o SQLite.
- Design: semplice, leggibile, mobile-first.

## Esempi di richieste ben formate

- "Proporre il piano per aggiungere la pagina dei preferiti."
- "Implementare solo il service REST per la ricerca libri."
- "Revisionare questo ViewModel senza riscriverlo."
- "Generare i casi di test manuali per questa feature."
- "Spiegare cosa fa questo metodo passo per passo."

## Esempi di richieste da evitare

- "Costruire tutta l'app completa."
- "Rifare tutto meglio."
- "Aggiungere qualsiasi libreria utile."
- "Sistemare tutto il progetto."
