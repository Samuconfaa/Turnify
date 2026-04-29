---
name: man-in-the-loop-workflow
description: Apply this repository's Man-in-the-Loop workflow for spec-driven .NET MAUI work. Use this skill whenever the user asks to plan, implement, review, test, document, branch, or close an iteration; mentions workflow, iterations, acceptance criteria, docs/spec.md, docs/plan.md, docs/iterations, docs/test-matrix.md, prompt logs, or wants help following the project method, even if they only ask for a feature or fix.
---

# Man-in-the-Loop Workflow

Use this skill to keep the agent inside the repository's controlled workflow instead of drifting into broad, under-specified coding.

## Core goal

Move one iteration forward in a way that stays bounded, reviewable, and explainable. The human remains the decider and validator; the agent helps structure, implement, review, test, and document the work.

## Core principles

- Treat one iteration as one verifiable objective.
- Prefer a narrow, explicit scope over a vague "build the whole feature" request.
- Keep architecture visible: do not hide large refactors inside a small request.
- Apply the workflow proportionally. Do not turn a trivial one-step task into ceremony.
- Do not merge or push unless the user explicitly asks.

This skill should also help students learn a controlled development method. When the user sounds unsure, explain why the workflow narrows scope and why each phase exists.

## First move

Before writing code for substantial work:

1. Turn the request into a concrete iteration objective.
2. List the files likely to be created or changed.
3. Identify dependencies, acceptance criteria, and likely risks.
4. If the scope is ambiguous, ask one short clarifying question instead of guessing.

If the user explicitly asks only for planning, review, or testing, stay in that phase and do not silently continue into later phases.

## Student-safe rule

If the request is educational or the user appears inexperienced, do not just perform the workflow mechanically. Explain:

- why the current request is one iteration or not;
- why some work must be postponed to a later iteration;
- which mistake the narrower scope is preventing.

## Phase 1: Planning

Use planning to make the iteration testable before coding begins.

- Define a precise objective that can be verified afterward.
- Keep the scope to one feature, one fix, or one architectural step.
- Call out files to create and files to modify separately when possible.
- Identify dependencies on existing services, routes, models, or docs.
- Write concrete acceptance criteria.
- Estimate whether the work is small, medium, or high risk.
- If the user wants Git help or asks to follow the full workflow, suggest a dedicated branch name such as `feature/it-xx-nome-corto`, `bugfix/...`, or `it-xx-nome-corto`.

Good objective pattern:

> Implement only `BookDetailViewModel.cs` with `Title`, `Author`, `Description`, `CoverUrl`, `LoadBookCommand`, `IsBusy`, `ErrorMessage`, and `HasData`. Reuse `IBookService.GetBookByIdAsync`. Do not create the XAML page in this iteration.

Bad objective pattern:

> Create the book detail page.

Read `references/student-mistakes.md` when the user needs help avoiding vague planning.

## Phase 2: Build

Implement only the planned scope.

- Reuse the current architecture before inventing new abstractions.
- In this repository, keep MAUI code aligned with MVVM, Shell navigation, and separated services. If the task is MAUI-specific, pair this workflow with `maui-expert`.
- Do not move logic into code-behind if it belongs in a ViewModel or service.
- Do not add packages unless there is a clear, user-approved reason.
- Manage loading, error, and empty states whenever a screen loads or mutates data.
- If the request starts spilling into additional features, stop and split the extra work into a next iteration.

## Phase 3: Review

Read the changed code critically before declaring success.

- Check naming, responsibility placement, nullability, and error handling.
- Verify the change respects MVVM boundaries.
- Check that no unrequested dependencies or hidden side effects were introduced.
- Look for duplicated logic and broad edits that should be split.
- If the user asked for a review, present findings first, ordered by severity with file references, and avoid rewriting code unless asked.

## Phase 4: Testing

Treat the feature as incomplete until it is verified.

- Run or propose tests proportional to the change.
- Cover both normal flow and edge cases.
- Prefer concrete manual steps when UI or device behavior is involved.
- Include relevant categories from the project matrix: input, API, UI state, navigation, persistence, and device behavior.
- If you could not run a verification step, say so explicitly rather than implying completion.

## Phase 5: Documentation and Git

Close the iteration cleanly.

- Update `docs/iterations/it-xx-nome-corto.md` when the change represents a meaningful iteration. Use a descriptive suffix such as `it-01-bootstrap.md` or `it-03-detail.md`; do not use bare names like `it-01.md`.
- Update `docs/spec.md`, `docs/plan.md`, `docs/test-matrix.md`, or `docs/prompt-log.md` when the change affects requirements, planning, verification evidence, or important prompts.
- Prefer small semantic commits when the user asks for commits.
- Treat merge and push as explicit, user-approved closure steps.

## Response format

For important project requests, prefer this structure:

1. `Piano breve`
2. `File da creare o modificare`
3. `Implementazione richiesta`
4. `Rischi o punti da controllare`
5. `Test manuali suggeriti`

Adapt the third section to the active phase:

- Planning only: write the scoped objective and acceptance criteria instead of code.
- Review only: replace it with findings first, then open questions, then a brief summary.
- Testing only: replace it with the test list, edge cases, and useful unit-test suggestions.

For didactic or uncertain requests, also include this table where useful:

| Fase | Cosa fare adesso | Cosa NON fare adesso | Perché |
| --- | --- | --- | --- |

## Practical guardrails

- Do not claim that a feature is done if review or testing is still missing.
- Do not silently widen scope beyond the current iteration.
- Do not use documentation as an afterthought when behavior or workflow evidence changed.
- Do not bypass the human for merge/push decisions.
- Do not let students confuse a feature idea with a valid iteration objective.
- Do not let students skip review and testing just because code was generated successfully.

## Reference files

Use the reference files proactively instead of relying on memory:

- Read `references/workflow-checklists.md` for a compact checklist of the five phases, the minimal testing matrix, and the iteration log skeleton.
- Read `references/project-structure.md` when you need the expected repository layout, the role of `docs/`, `src/`, and `assets/`, or the preferred repository-relative path style.
- Read `references/documentation-workflow.md` when deciding which document to update after a change and what each project document is supposed to contain.
- Read `references/iteration-example.md` before drafting or updating `docs/iterations/it-xx-nome-corto.md`, especially if the user wants a concrete example instead of a template.
- Read `references/student-mistakes.md` when the goal is to guide a student away from typical workflow mistakes.

Read the repository file `docs/method/man-in-the-loop.md` if the user asks for the original course wording or wants the complete rationale behind the workflow.
