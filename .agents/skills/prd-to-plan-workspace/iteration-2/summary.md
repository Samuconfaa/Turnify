# Summary

## Overall winner

Con skill: 5 eval su 5 favoriscono il comportamento guidato dalla skill.

## Recurring strengths

- Gestisce bene la distinzione tra `stop completo` e `bozza provvisoria`, che era il principale punto debole dell'iterazione 1.
- Mantiene iterazioni piccole, reviewable e con criteri di accettazione verificabili.
- Resta coerente con il contesto MAUI del repository: MVVM, Shell, servizi separati, stati UI espliciti.
- Produce una `docs/test-matrix.md` pragmatica, separando verifiche manuali, automatiche subito e automatiche più avanti.
- Evita di inventare UI automation già disponibile e mantiene il linguaggio di pianificazione senza spacciare test come eseguiti.

## Recurring weaknesses

- Nei prompt che dicono "lo spec è pronto" ma non forniscono il file reale, la skill resta utile grazie alla bozza provvisoria, ma continua a dipendere da assunzioni su API, persistenza e naming: corretto, però ancora meno forte di un caso con spec leggibile davvero.
- Gli handoff a `maui-prd`, `maui-expert` e `maui-automatic-testing` sono più chiari di prima, ma in output restano spesso solo impliciti come raccomandazione e non sempre come soglia decisionale molto nitida.
- L'architettura proposta resta volutamente ad alto livello; per alcuni utenti potrebbe servire un esempio minimo in più su come marcare i `TBD` senza sembrare evasivi.

## Iteration-1 issues status

- Issue: la skill tendeva a bloccarsi o a restare troppo prudente quando il prompt dava uno spec riassunto ma il file non era disponibile.
  Status: Resolved.
  Evidence: eval 1 e eval 5 producono una bozza provvisoria utile invece di fermarsi.

- Issue: non era chiaro se un riassunto affidabile del PRD nel prompt bastasse per una prima bozza marcata come non definitiva.
  Status: Resolved.
  Evidence: eval 5 etichetta esplicitamente il risultato come draft provvisorio da validare contro `docs/spec.md`; eval 1 adotta la stessa logica anche quando il prompt parla di spec già pronto ma non leggibile nella simulazione.

- Issue: l'handoff a `maui-prd`, `maui-expert` e `maui-automatic-testing` era implicito e poteva produrre risposte troppo prudenti o troppo dipendenti da altri skill.
  Status: Partially resolved.
  Evidence: eval 4 chiama bene `maui-prd` quando mancano goal/MVP/vincoli; negli altri eval l'allineamento esiste ma il confine operativo con gli altri skill è più descritto che dimostrato.

- Issue: il livello minimo atteso per `docs/test-matrix.md` non era abbastanza esplicito quando il repository non aveva infrastruttura di test.
  Status: Resolved.
  Evidence: eval 3 mostra una matrice realistica con unit/service/build ora e UI automation più avanti.

## Concrete next improvement suggestions

1. Aggiungere nel `SKILL.md` un micro-esempio completo di risposta "bozza provvisoria" per stabilizzare ancora di più il comportamento nei casi simili a eval 1 ed eval 5.
2. Rendere più esplicita la soglia di handoff verso `maui-expert`: per esempio, quando il piano scende a nomi di classi, route o responsabilità implementative dettagliate.
3. Rendere più esplicita la soglia di handoff verso `maui-automatic-testing`: per esempio, quando l'utente chiede framework, harness UI o strategia CI concreta anziché una semplice matrice pianificatoria.
4. Chiarire meglio come scegliere tra `Preferences` e SQLite nella fase di bozza, per evitare output oscillanti quando la persistenza locale è minima ma non banale.
