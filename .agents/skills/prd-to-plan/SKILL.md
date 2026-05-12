---
name: prd-to-plan
description: Transform `docs/spec.md` into `docs/plan.md`, `docs/architecture.md`, and `docs/test-matrix.md` for a structured .NET MAUI project using the Man-in-the-Loop workflow. Use this skill whenever the user wants to break a PRD into iterations, define MAUI architecture, map requirements to tests, prepare documentation for the planning -> build -> review -> testing -> documentation -> Git cycle, or asks how to move from specification to implementation safely.
---

# PRD To Plan

Use this skill after the project PRD is good enough to drive implementation.

## Core goal

Create or update the planning documents that turn the approved product spec into bounded, reviewable work:

- `docs/plan.md`
- `docs/architecture.md`
- `docs/test-matrix.md`

This skill should help students understand why a solid process separates product requirements, architecture decisions, iteration slicing, and verification planning.

## What this skill owns

- read `docs/spec.md` and extract the scope that is actually approved;
- derive `docs/plan.md`, `docs/architecture.md`, and `docs/test-matrix.md`;
- keep each planned iteration small, verifiable, and aligned with the repository workflow;
- identify missing information that still blocks planning.

Do not:

- start implementing code;
- mark tests as executed if they are only planned;
- create giant iterations that bundle unrelated features;
- overwrite existing docs blindly when only part of them needs refinement.

## First pass

1. Read `docs/spec.md`.
2. Read existing `docs/plan.md`, `docs/architecture.md`, and `docs/test-matrix.md` if present.
3. Preserve valid decisions already documented and update only what changed.
4. If `docs/spec.md` is missing or too vague, decide explicitly between `stop` and `provisional draft` using the rule below instead of always blocking.
5. Keep the outputs consistent with `man-in-the-loop-workflow`, `maui-expert`, and `maui-automatic-testing`.

## Student-safe rule

If the user is inexperienced, explicitly teach the difference between:

- `docs/spec.md`: what the project must achieve;
- `docs/plan.md`: how the work is split into iterations;
- `docs/architecture.md`: how the solution is structured technically;
- `docs/test-matrix.md`: how the work will be verified.

Also explain why one large "build everything" iteration is risky and hard to review.

## Decision rule: stop vs provisional draft

Treat `docs/spec.md` as the preferred source, but not as an excuse to become useless.

- Stop completely when `docs/spec.md` is missing and the prompt also lacks a trustworthy summary of goal, MVP, and key constraints or non-goals.
- Produce a provisional draft when the file is missing but the prompt or conversation contains a credible PRD summary with enough detail to derive a first `docs/plan.md`, `docs/architecture.md`, or `docs/test-matrix.md`.
- When you produce a provisional draft, label it as derived from the prompt summary, list the blockers to validate against `docs/spec.md`, and avoid pretending it is final.

This keeps the workflow safe without turning the agent into a gatekeeper that blocks useful planning work.

## Derivation workflow

### Step 1: Readiness check

Before generating the documents, confirm that `docs/spec.md` or the prompt-level PRD summary contains enough information about:

- project goal;
- target users or scenarios;
- MVP scope;
- non-goals;
- major feature areas;
- relevant constraints.

If key parts are missing, list the blockers and ask only the minimum clarifying questions needed to continue.

### Step 2: Build `docs/plan.md`

Use `references/plan-template.md` as the default shape.

For each iteration, define:

- one verifiable objective;
- in-scope work;
- out-of-scope work;
- likely files or areas touched;
- dependencies on previous iterations or services;
- concrete acceptance criteria;
- main risks.

Iteration rules:

- one iteration equals one reviewable objective;
- avoid hidden architecture refactors inside feature slices;
- split View, ViewModel, service, navigation, or persistence work if combining them would make the slice too broad;
- keep the roadmap teachable, not just technically possible.

If Git guidance is useful, suggest branch names such as `it-01-...`, `feature/...`, or `docs/...`, but do not create branches unless asked.

### Step 3: Build `docs/architecture.md`

Use `references/architecture-template.md`.

Capture the decisions that matter for a MAUI project, such as:

- project structure and folder responsibilities;
- View, ViewModel, service, and model boundaries;
- Shell navigation;
- state handling and page-state expectations;
- remote data flow, DTO parsing, and error handling;
- local persistence approach;
- dependency injection and app composition.

Only document decisions that are justified by the spec or repository context. Mark the rest as `TBD`.

Keep the architecture coherent with `maui-expert`:

- MVVM with `CommunityToolkit.Mvvm`;
- XAML UI with compiled bindings;
- Shell navigation;
- no business logic in code-behind;
- explicit loading, error, empty, and success states.

### Step 4: Build `docs/test-matrix.md`

Use `references/test-matrix-template.md`.

Map features or iterations to realistic checks across these categories:

- input;
- API or service behavior;
- UI state;
- navigation;
- persistence;
- device behavior.

Distinguish clearly between:

- manual verification to execute during an iteration;
- automatic verification feasible now;
- automatic verification that should come later.

At minimum, a planning-level `docs/test-matrix.md` should map each relevant requirement or scenario to category, iteration target, and whether it is manual, automatic now, or automatic later. Do not over-specify concrete test suites when the repository is not ready for that level.

When automatic testing details become deep or infrastructure-sensitive, hand off to `maui-automatic-testing` instead of improvising a big testing stack.

When architecture discussion starts requiring concrete MAUI implementation patterns, component responsibilities, or route/viewmodel conventions beyond planning level, call out that `maui-expert` should shape those details during implementation or architecture refinement.

## File rules

Default to creating or updating all three documents in the same pass.
If the user asks only for one document, stay within that scope.

Do not create `docs/iterations/it-xx-nome-corto.md` yet unless the user explicitly asks to bootstrap the next iteration log. When creating one, use a descriptive suffix such as `it-01-bootstrap.md`, not a bare `it-01.md`.

## Explicit handoff rules

- Hand off to `maui-prd` when product scope, MVP, non-goals, or core constraints are still unstable.
- Hand off to `maui-expert` when the discussion shifts from architecture planning to concrete MAUI implementation choices.
- Hand off to `maui-automatic-testing` when the user wants a deeper automatic testing strategy than a planning-level matrix.

## Practical guardrails

- Do not derive architecture choices that contradict repository preferences.
- Do not plan UI automation by default if the repository does not already support it.
- Do not treat `docs/architecture.md` as a code skeleton full of speculative class names.
- Do not write test evidence as if it had already been executed.
- Do not widen scope beyond what `docs/spec.md` actually approves.

## Response format

For substantial planning requests, keep the response structured:

1. `Piano breve`
2. `File da creare o modificare`
3. `Implementazione richiesta`
4. `Rischi o punti da controllare`
5. `Test manuali suggeriti`

If the spec is not ready, section 3 should contain:

- the blocking gaps in `docs/spec.md`;
- the smallest set of clarifying questions needed;
- the recommendation to complete `maui-prd` first.

## Reference files

Read these references proactively when useful:

- `references/plan-template.md` for the roadmap structure;
- `references/architecture-template.md` for MAUI architecture sections;
- `references/test-matrix-template.md` for the verification matrix.
