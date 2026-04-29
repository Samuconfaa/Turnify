# Confronto

## Assertion 1

Verdetto: with-skill `pass`, without-skill `fail`.

- With-skill: chiede discovery prima della stesura finale, ad esempio `1. Qual è la fonte principale dei libri?` e `3. Cosa deve restare fuori dalla prima versione?`.
- Without-skill: parte subito con `## MVP` e `## Requisiti funzionali` senza chiarire sorgente dati, perimetro o esclusioni.

## Assertion 2

Verdetto: with-skill `pass`, without-skill `partial`.

- With-skill: separa esplicitamente il PRD dal planning e cita il passaggio successivo: `il passo successivo sarà derivare docs/plan.md, docs/architecture.md e docs/test-matrix.md con prd-to-plan`.
- Without-skill: accenna solo genericamente che `sarà possibile suddividere il lavoro in iterazioni tecniche`, senza richiamare il workflow o i documenti previsti.

## Assertion 3

Verdetto: with-skill `pass`, without-skill `partial`.

- With-skill: rende espliciti `MVP`, `non-obiettivi`, `criteri di accettazione verificabili` e vincoli come `Android come target principale` e `MVVM e Shell`.
- Without-skill: include MVP e alcuni vincoli, ma i criteri sono più deboli (`La ricerca restituisce risultati coerenti`) e non esplicita bene il target Android né gli stati UI.

## Esito eval

Vincitore: `with-skill`.

Motivo sintetico: la skill impone discovery disciplinata e mantiene molto meglio il confine tra specifica di progetto e lavoro successivo.
