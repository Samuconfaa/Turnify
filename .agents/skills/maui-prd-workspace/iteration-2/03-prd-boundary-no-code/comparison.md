# Comparison

## Assertion 1

- `with_skill`: Pass
  Evidence: rifiuta esplicitamente di produrre `SearchPage`, `SearchViewModel` e service REST in questa fase e resta sul PRD.
- `without_skill`: Fail
  Evidence: scrive subito snippet di `SearchPage.xaml`, `SearchViewModel.cs` e `MovieService.cs`.

## Assertion 2

- `with_skill`: Pass
  Evidence: spiega in modo esplicito e didattico la differenza tra PRD, planning e implementazione, con il perché del confine.
- `without_skill`: Fail
  Evidence: non spiega alcuna distinzione tra livelli documentali e implementativi.

## Assertion 3

- `with_skill`: Pass
  Evidence: indica come passo successivo `prd-to-plan` e, in fallback, i documenti da derivare prima del codice.
- `without_skill`: Fail
  Evidence: salta direttamente al codice e rinvia la documentazione a un eventuale secondo momento.

## Winner

`with_skill`.
