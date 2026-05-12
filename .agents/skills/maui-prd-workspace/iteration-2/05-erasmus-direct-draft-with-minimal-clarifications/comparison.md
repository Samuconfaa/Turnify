# Comparison

## Assertion 1

- `with_skill`: Pass
  Evidence: limita la discovery a 2 chiarimenti mirati, coerenti col prompt già ben definito.
- `without_skill`: Fail
  Evidence: trasforma il prompt in un'intervista da 5 domande, proprio il comportamento che iteration-1 aveva segnalato come debolezza.

## Assertion 2

- `with_skill`: Pass
  Evidence: fornisce nella stessa risposta una bozza completa e strutturata di `docs/spec.md`, con `TBD` residui espliciti.
- `without_skill`: Fail
  Evidence: non produce alcuna bozza di spec nella stessa risposta; rimanda tutto a dopo i chiarimenti.

## Assertion 3

- `with_skill`: Pass
  Evidence: chiude con handoff a `prd-to-plan` e cita i documenti successivi senza mescolare il PRD col planning.
- `without_skill`: Partial
  Evidence: non mescola direttamente planning e spec, ma neppure esplicita il passaggio workflow successivo.

## Winner

`with_skill`.
