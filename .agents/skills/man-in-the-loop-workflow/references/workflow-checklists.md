# Workflow Checklists

Use this file when the task needs a compact per-phase checklist instead of the full course document.

## 1. Planning checklist

- Define one verifiable objective.
- List files to create.
- List files to modify.
- Identify dependencies on existing code or previous iterations.
- Write acceptance criteria.
- Call out specific risks.
- If Git workflow is in scope, suggest a dedicated branch.

## 2. Build checklist

- Implement only one feature or fix at a time.
- State project context explicitly when needed.
- Keep constraints visible: MVVM, Shell, no unnecessary packages, no large refactors.
- Prefer small, explainable edits.
- Keep logic out of code-behind when it belongs elsewhere.
- Manage `IsBusy`, `ErrorMessage`, `HasData`, and empty state where relevant.

## 3. Review checklist

- Does the code respect MVVM boundaries?
- Are naming and file placement coherent?
- Is nullability handled?
- Is error handling present and understandable?
- Were new dependencies introduced without need?
- Is there duplication or a refactor that should be split?

## 4. Testing checklist

For each iteration, consider at least these areas:

| Area | Minimum checks |
| --- | --- |
| Input | Empty input, invalid input, long input, special characters |
| API | Success, 404/500, timeout, malformed JSON, empty response |
| UI | Loading visible, error visible, empty state visible, long list scroll |
| Navigation | Open page, go back, parameter passing |
| Persistence | Save, reopen app, edit saved data |
| Device | Light/dark theme, rotation, denied permissions |

## 5. Documentation and Git checklist

- Update `docs/iterations/it-xx-nome-corto.md` with objective, plan, prompts, files, tests, issues, fixes, and outcome.
- Update `docs/spec.md` if requirements changed.
- Update `docs/plan.md` if the iteration roadmap changed.
- Update `docs/test-matrix.md` if new verification evidence matters.
- Update `docs/prompt-log.md` if a prompt materially influenced the solution.
- Keep commits frequent and semantic when the user asks for them.
- Merge and push only after explicit user approval.

## Iteration log skeleton

Use this structure for `docs/iterations/it-xx-nome-corto.md`, for example `docs/iterations/it-02-search.md`:

```markdown
# Iterazione XX

## Obiettivo

## Piano

## Prompt principali utilizzati

## File creati

## File modificati

## Codice prodotto dall'AI e accettato

## Codice prodotto dall'AI e modificato manualmente

## Test eseguiti

## Problemi trovati

## Correzioni effettuate

## Esito
```
