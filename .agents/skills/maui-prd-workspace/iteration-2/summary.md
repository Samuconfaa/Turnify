# Summary

## Overall winner across evals

`with_skill` vince in 5 eval su 5.

## Recurring strengths

- La skill aggiornata calibra meglio la profondità della discovery: quando il prompt è già ricco, passa rapidamente alla bozza invece di bloccare il lavoro.
- Tiene molto bene il confine tra PRD, planning e implementazione, soprattutto nei prompt che cercano di forzare il salto al codice.
- Esplicita meglio l'handoff a `prd-to-plan` e, cosa migliorata rispetto a iteration-1, chiarisce cosa fare se quel passaggio non è disponibile nell'ambiente.
- Rende costanti i vincoli MAUI del repository: Android-first, MVVM, Shell, gestione loading/error/empty, persistenza locale ragionata.
- Usa `TBD` in modo disciplinato nei casi ambigui e trasforma desideri vaghi in requisiti più verificabili.
- La nuova regola sull'output aiuta nei contesti conversazionali o valutativi: quando non si stanno davvero scrivendo file, l'agente mostra il contenuto previsto per `docs/spec.md` inline invece di fingere salvataggi.

## Recurring weaknesses

- Alcune bozze con skill restano dense: per studenti molto inesperti potrebbe essere utile alleggerire ancora il primo draft o fornire una variante più corta quando l'obiettivo è solo allineare il perimetro.
- Nei prompt molto vaghi la skill gestisce bene i `TBD`, ma il valore finale dipende ancora parecchio dalla qualità delle risposte utente ai chiarimenti; questo è corretto, ma limita quanto il primo output possa essere "pronto all'uso".
- La skill menziona `prd-to-plan`, ma non può dimostrare nel testo se quella skill esista davvero nell'ambiente: resta un handoff nominato, non verificato operativamente.

## Iteration-1 issue status

### 1. Discovery troppo rigida su prompt già ben specificati

Status: Resolved.

Evidence:
- Nell'eval 2 la risposta con skill va direttamente a una bozza di `docs/spec.md` senza intervista superflua.
- Nell'eval 5 limita la discovery a 2 chiarimenti mirati e produce subito la bozza completa, centrando esattamente il comportamento che mancava in iteration-1.

### 2. Handoff a `prd-to-plan` corretto ma troppo implicito, senza fallback esplicito

Status: Resolved.

Evidence:
- Le risposte con skill negli eval 1, 3 e 5 nominano chiaramente `docs/plan.md`, `docs/architecture.md` e `docs/test-matrix.md`.
- In più, esplicitano che se `prd-to-plan` non è disponibile bisogna comunque fermarsi prima del planning dettagliato e trattare quei documenti come fase successiva.

### 3. Regola poco chiara su bozza inline versus scrittura diretta del file

Status: Resolved.

Evidence:
- Le risposte con skill negli eval 2 e 5 dichiarano apertamente che, in questo contesto di valutazione, non stanno realmente scrivendo il file ma stanno producendo il contenuto previsto per `docs/spec.md` inline.
- Questo elimina l'ambiguità osservata in iteration-1 e evita di fingere operazioni filesystem non avvenute.

## Concrete next improvement suggestions

- Aggiungere nel `SKILL.md` un micro-esempio di risposta "bozza rapida" ancora più corta per prompt già chiari, così l'agente può scegliere tra draft completo e draft compatto.
- Rafforzare una regola su quando convertire vincoli non confermati in semplici questioni aperte, evitando di ripeterli in troppe sezioni del documento.
- Valutare un riferimento opzionale a una checklist finale per il PRD accettato, utile prima dell'handoff a `prd-to-plan`.
- Introdurre un eval aggiuntivo su aggiornamento di `docs/spec.md` già esistente, perché l'attuale set valuta bene la creazione iniziale ma poco il refinement di documentazione preesistente.
