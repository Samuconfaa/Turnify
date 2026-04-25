# Piano breve

- Review only: verificare le modifiche al service REST e al relativo ViewModel senza riscrivere codice.
- Controllare architettura, naming, nullability, error handling e test suggeriti seguendo il modello Man-in-the-Loop.
- Limitazione attuale: nel repository non risultano presenti i file modificati da recensire.

# File da creare o modificare

- Nessun file applicativo individuato in `src/`.
- Evidenza verificata: `src/` è vuota nel repository corrente.
- File di output creato: `.agents/skills/man-in-the-loop-workflow-workspace/iteration-1/review-findings/with_skill/outputs/response.md`

# Implementazione richiesta

## Findings

1. Bloccante - impossibile eseguire una review del service REST e del ViewModel richiesti perché nel workspace corrente non sono presenti file sorgente compatibili con la richiesta.
   Riferimenti:
   - `src/` è vuota.
   - `git status --short` mostra solo file e cartelle non tracciati a livello repository, non modifiche a un service REST o a un ViewModel applicativo.
   - Gli unici `ViewModel` trovati sono esempi sotto `.agents/skills/maui-expert/examples/`, quindi non fanno parte di una modifica dell'app da recensire.

## Domande aperte

- Quali sono i path repository-relative del service REST e del ViewModel che vuoi sottoporre a review?
- Se le modifiche non sono ancora presenti in questo workspace, puoi renderle disponibili o indicare il branch/cartella corretti?

## Breve sintesi

- Ho seguito la fase di review del workflow e ho verificato il repository prima di formulare giudizi.
- In assenza dei file modificati, qualsiasi valutazione su architettura, naming, nullability o error handling sarebbe inventata e quindi non affidabile.

# Rischi o punti da controllare

- Rischio principale: review falsa-positiva o generica se non viene analizzato il codice reale.
- Appena i file saranno disponibili, la review dovrà controllare almeno:
  - rispetto dei confini MVVM tra `Services/` e `ViewModels/`;
  - naming coerente di metodi asincroni, DTO, proprietà osservabili e command;
  - annotazioni nullability e gestione di risposte API nulle o incomplete;
  - gestione esplicita di timeout, codici HTTP non di successo, eccezioni di deserializzazione e stati `IsBusy`/`ErrorMessage`/`HasData`.

# Test manuali suggeriti

- API: risposta `200` valida, `404`, `500`, timeout, payload vuoto, JSON malformato.
- UI state: caricamento visibile, errore visibile, empty state visibile, recupero dopo retry.
- Input e navigazione: parametri mancanti o non validi nel ViewModel, apertura pagina e ritorno indietro.
- Robustezza: avvio con rete assente, risposta parziale con campi nulli, refresh multipli rapidi.
- Se condividi i file reali, questi test possono essere affinati e collegati a finding puntuali con riferimenti di linea.
