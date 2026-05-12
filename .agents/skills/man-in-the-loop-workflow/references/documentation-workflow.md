# Documentation Workflow Reference

Use this file to decide which project documents should be updated during or after an iteration.

## Docs-as-Code rule

The repository treats documentation as part of the working software. Update it when behavior, scope, tests, or important decisions change.

## Main documents and when to update them

## `docs/spec.md`

Use for the functional and non-functional specification.

Update when:

- requirements change;
- a new mandatory or optional feature is introduced;
- acceptance criteria change;
- new constraints or risks become relevant.

## `docs/plan.md`

Use for the roadmap of iterations.

Update when:

- a new iteration is added;
- an iteration changes scope significantly;
- dependencies or sequencing between iterations change;
- risks or mitigation plans need adjustment.

## `docs/architecture.md`

Use for technical structure, patterns, data flow, state management, and navigation.

Update when:

- the project introduces a new architectural component;
- navigation or data flow changes materially;
- storage or service boundaries are reworked.

## `docs/test-matrix.md`

Use for recorded verification evidence.

Update when:

- new manual tests are executed;
- new edge cases are discovered;
- bugs are found or resolved;
- a completed iteration adds meaningful validation evidence.

## `docs/prompt-log.md`

Use for prompts that materially influenced decisions, structure, code, or tests.

Update when:

- a prompt led to an architectural decision;
- a prompt produced code later accepted with or without changes;
- a prompt was rejected for a useful reason worth documenting.

## `docs/iterations/it-xx-nome-corto.md`

Use for the log of a single iteration.

Update when:

- a meaningful iteration starts or closes;
- you need to record objective, plan, prompts, touched files, tests, issues, fixes, and outcome.

## Supporting documents

- `docs/deployment.md`: release packaging, APK/AAB, signing, pre-release checklist.
- `docs/demo-script.md`: final presentation flow.
- `docs/api-notes.md`: external API details, limits, endpoint notes.

## Practical rule of thumb

Ask these questions after each substantial change:

1. Did requirements or acceptance criteria change? Update `docs/spec.md`.
2. Did the roadmap or scope of iterations change? Update `docs/plan.md`.
3. Did we complete or materially advance one iteration? Update `docs/iterations/it-xx-nome-corto.md`.
4. Did we run relevant tests or find bugs? Update `docs/test-matrix.md`.
5. Did an important prompt shape the solution? Update `docs/prompt-log.md`.

If the answer is yes to more than one question, update more than one document.
