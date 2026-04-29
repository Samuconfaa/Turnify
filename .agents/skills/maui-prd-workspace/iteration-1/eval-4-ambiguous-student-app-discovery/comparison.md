# Confronto

## Assertion 1

Verdetto: with-skill `pass`, without-skill `fail`.

- With-skill: gestisce l'ambiguità con discovery esplicita, ad esempio `Quale problema principale dovrebbe risolvere l'app` e `Cosa deve restare fuori dalla prima versione?`.
- Without-skill: sceglie direttamente un prodotto specifico con `lezioni, materiali, scadenze e promemoria` senza chiedere nulla.

## Assertion 2

Verdetto: with-skill `pass`, without-skill `fail`.

- With-skill: usa ripetutamente `TBD`, ad esempio `Flusso principale da supportare` -> `TBD` e una sezione `Questioni aperte o TBD`.
- Without-skill: non lascia questioni aperte e tratta tutte le decisioni come già definite.

## Assertion 3

Verdetto: with-skill `pass`, without-skill `fail`.

- With-skill: evita di approvare in anticipo scelte tecniche, ad esempio `HttpClient e System.Text.Json solo se la discovery confermerà dati remoti`.
- Without-skill: presenta come approvate `API REST remota`, `database locale per uso offline` e `notifiche push` nonostante il prompt dicesse che non erano ancora decise.

## Esito eval

Vincitore: `with-skill`.

Motivo sintetico: la skill protegge bene dal rischio principale di questo scenario, cioè inventare una soluzione completa partendo da un'idea ancora vaga.
