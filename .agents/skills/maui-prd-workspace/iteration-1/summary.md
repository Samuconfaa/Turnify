# Summary

## Overall winner across evals

`with-skill` vince in 4 eval su 4.

## Recurring strengths of the skill

- Forza la discovery iniziale invece di trasformare idee vaghe in specifiche fittizie.
- Mantiene bene il confine tra PRD, planning e implementazione.
- Tiene visibili i vincoli MAUI del repository: Android-first, MVVM, Shell, stati UI espliciti, persistenza locale ragionata.
- Spinge verso criteri di accettazione più verificabili e verso non-obiettivi espliciti.
- Gestisce bene i casi in cui il prompt chiede troppo presto il codice, riportando il lavoro alla fase corretta.

## Recurring weaknesses or ambiguities

- La regola `ask at least 2 questions before writing a new docs/spec.md` può rallentare prompt già ben specificati, dove una bozza immediata con poche assunzioni sarebbe più utile.
- Il riferimento a `prd-to-plan` è corretto come handoff, ma resta un po' implicito: la skill non chiarisce cosa fare se quel passaggio o quella skill non sono disponibili nell'ambiente.
- La skill dice di creare o aggiornare `docs/spec.md`, ma non definisce abbastanza quando conviene solo proporre una bozza inline versus scrivere direttamente il file, soprattutto in contesti conversazionali o valutativi come questi.

## Concrete improvement suggestions for the skill

- Rendere più elastica la discovery: mantenere le domande obbligatorie solo per prompt davvero ambigui, e consentire una bozza diretta quando il perimetro è già abbastanza definito.
- Aggiungere una regola esplicita del tipo: `se il prompt è sufficientemente dettagliato, fai al massimo 2 chiarimenti mirati e poi produci una bozza di docs/spec.md con TBD minimi`.
- Esplicitare meglio l'handoff: indicare che, se `prd-to-plan` non è disponibile, l'agente deve comunque elencare i documenti successivi e fermarsi prima della pianificazione dettagliata.
- Rafforzare l'output rule sulla scrittura file: chiarire quando salvare direttamente `docs/spec.md` e quando invece mostrare prima la bozza per approvazione.
- Aggiungere un esempio completo di risposta in un caso ambiguo e in un caso già ben definito, per mostrare il livello di discovery atteso in ciascuno.
