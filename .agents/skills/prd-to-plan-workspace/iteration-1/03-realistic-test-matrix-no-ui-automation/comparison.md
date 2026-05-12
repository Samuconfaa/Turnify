# Confronto

## Assertion 1

Pass con skill. Evidenza: scrive "niente UI automation come copertura già disponibile" e nella tabella marca la navigazione come `Automatico più avanti`. Fail senza skill. Evidenza: propone "UI automation dei flussi principali" come automatico subito.

## Assertion 2

Pass con skill. Evidenza: usa una matrice con colonne separate `Manuale`, `Automatico ora`, `Automatico più avanti` e distingue ViewModel/service/build vs scenari device/UI. Partial senza skill. Evidenza: separa tre categorie, ma resta generico e poco calibrato su MAUI.

## Assertion 3

Pass con skill. Evidenza: usa formulazioni come `Evidenza prevista`, `Da eseguire`, `bozza`, quindi resta nel linguaggio di pianificazione. Fail senza skill. Evidenza: parla di "copertura completa" e di attivare presto UI automation, senza chiarire che i test sono solo pianificati.

## Valutazione sintetica

Vince con skill. La differenza principale è la disciplina nel non inventare infrastruttura di test non presente nel repository.
