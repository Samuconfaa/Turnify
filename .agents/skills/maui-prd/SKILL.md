---
name: maui-prd
description: Create or refine `docs/spec.md` for a structured .NET MAUI project that will be built with a Man-in-the-Loop workflow. Use this skill whenever the user wants to start a MAUI app, define product requirements, write a PRD or spec, turn an idea into documented scope, or guide students through MVP definition, non-goals, acceptance criteria, and project constraints, even if they only say "plan the project" or "help me structure the app."
---

# Maui PRD

Use this skill to turn a project idea into a clear product specification that both the student and the agent can use as a shared source of truth.

## Core goal

Create or update `docs/spec.md` as the project-level PRD.
The document should guide later work without collapsing directly into code, architecture minutiae, or iteration planning.

This skill is for students. Help them understand the difference between:

- project idea;
- project PRD or spec;
- iteration plan;
- implementation work.

## What this skill owns

- clarify the problem, users, scope, MVP, non-goals, constraints, risks, and success criteria;
- capture MAUI-specific project constraints that materially affect the product definition;
- write or refine `docs/spec.md`;
- hand off to `prd-to-plan` once the spec is solid enough to drive planning.

Do not:

- start writing app code;
- split the whole project into detailed iterations here;
- invent technical decisions that are still unknown.

## First pass

1. Read existing `docs/spec.md` if present.
2. If the repository already contains project docs, preserve their language and naming style.
3. Align the spec with the local workflow: `docs/spec.md` is the project PRD, while `docs/plan.md`, `docs/architecture.md`, and `docs/test-matrix.md` are later derivations.
4. Keep the spec compatible with this repository's MAUI defaults: MVVM, Shell navigation, `CommunityToolkit.Mvvm`, async `HttpClient`, `System.Text.Json`, explicit loading/error/empty states, and Android-first scope unless the user clearly asks for more.
5. If the user is really asking for code, still stop at specification unless they explicitly want to skip the PRD phase.
6. If the prompt is already well scoped and the user wants a first draft now, do not over-interview: ask only the minimum targeted clarifications and move into the draft.

## Discovery workflow

Before drafting a brand new spec, ask 3-5 essential clarifying questions with lettered options when the prompt leaves important gaps. If the prompt or conversation already provides a credible problem statement, target users, MVP boundary, and main constraints, ask at most 2 targeted clarification questions and then draft `docs/spec.md` with explicit assumptions or `TBD` items.

Focus on:

- problem and timing;
- target users and primary scenario;
- MVP scope versus later scope;
- data sources, connectivity, persistence, and external dependencies;
- constraints: deadline, course rules, platform priorities, auth or privacy needs;
- success criteria;
- expected level of testing and documentation discipline.

Always include one question about what should stay out of scope for the first version.

### Preferred question format

Use concise numbered questions with options and a free-text escape hatch.

```text
1. Qual è l'obiettivo principale del progetto?
   A. Cercare e consultare dati remoti
   B. Gestire dati creati dall'utente
   C. Guidare un flusso step-by-step
   D. Altro: [specifica]

2. Quale deve essere il perimetro dell'MVP?
   A. Solo il flusso principale
   B. Flusso principale + persistenza locale
   C. Flusso principale + autenticazione
   D. Altro: [specifica]
```

Read `references/question-bank.md` when the user needs stronger guidance or the project idea is still confused.

## Decision rule: discovery depth

Use this rule instead of mechanically forcing the same interview every time:

- Ask 3-5 questions when the prompt is still broad or is missing two or more of these anchors: problem, users, MVP boundary, key constraints.
- Ask 1-2 targeted questions when only edge details are missing but the core project shape is already clear.
- Draft immediately when the user explicitly asks for a first draft and the prompt already gives enough detail to define problem, MVP, and constraints. In that case, convert the remaining uncertainty into `TBD` items instead of stalling.

The goal is to reduce hallucinations without slowing down students who already did the thinking.

## Student-safe rule

If the user is inexperienced:

- explain why a PRD is not yet an implementation plan;
- explain why non-goals protect the project from scope creep;
- explain why vague statements such as "simple", "fast", or "modern" need measurable criteria;
- call out unknowns as `TBD` instead of guessing.

## Requirements quality

Translate vague wishes into verifiable statements.

Bad:

- "The app should be easy to use."
- "Search should be fast."
- "The project should support offline."

Better:

- "A first-time user must reach the main result screen in at most 3 taps from app launch."
- "The search flow must always expose loading, empty, success, or error state instead of leaving the page visually stuck."
- "If offline behavior is required, the spec must state whether cached data is readable, writable, or unavailable."

## What to put in `docs/spec.md`

Use `references/spec-template.md` as the default skeleton. Tailor it to the project instead of filling sections mechanically.

The spec should normally cover:

- project vision and problem statement;
- target users and main scenarios;
- MVP scope;
- future scope and non-goals;
- feature areas or epics;
- user stories and acceptance criteria for each epic;
- functional requirements;
- non-functional requirements;
- MAUI-specific project constraints;
- success metrics;
- risks, dependencies, and open questions.

## MAUI and workflow alignment

When the spec describes a MAUI app, keep these repository conventions visible at requirement level:

- Android is the primary target; iOS is optional unless explicitly required.
- UI should remain compatible with MVVM and Shell navigation.
- Screen flows that load data should account for loading, error, empty, and success states.
- Local data should fit `Preferences` and/or SQLite unless another persistence need is clearly justified.
- Remote integrations should assume async `HttpClient` calls and `System.Text.Json` parsing.
- Do not promise UI patterns that conflict with `maui-expert` guidance, such as new `ListView`-based designs or business logic in code-behind.

When the user asks for detailed architecture or iteration slicing, hand off to `prd-to-plan` instead of overloading the spec.

If the user asks for deep automatic test planning, mention that `maui-automatic-testing` can refine that later once the project shape is clearer.

## Output rules

Default to creating or updating `docs/spec.md`.
If the user explicitly wants a draft before writing files, present the draft inline first and say that the next step is to save it to `docs/spec.md`.

Use this decision rule:

- Write `docs/spec.md` directly when the user explicitly asks to create or update the file and the information is sufficient.
- Show the content inline first when the user asks to brainstorm, compare options, review a draft, or explicitly says not to write files yet.
- If the environment or evaluation context does not actually include file writing, still produce the exact content intended for `docs/spec.md` and label it clearly as the draft that should be saved.
- If the prompt is detailed enough for a meaningful first version, prefer a direct draft with a short assumptions and `TBD` list over a long interview.

When writing the spec:

- preserve existing content that is still valid;
- replace contradictions instead of duplicating them;
- mark unresolved items as `TBD`;
- keep the document readable for both students and agents.

## Practical guardrails

- Do not skip discovery and jump straight into a full spec from a vague one-line idea.
- Do not mix PRD content with detailed per-iteration task lists.
- Do not silently invent APIs, data models, or auth flows that the user did not request.
- Do not treat optional future ideas as MVP commitments.
- Do not promise automated tests as already present; only define expected verification needs.

## Handoff

After `docs/spec.md` is accepted, suggest `prd-to-plan` to derive:

- `docs/plan.md`;
- `docs/architecture.md`;
- `docs/test-matrix.md`.

If `prd-to-plan` is not available in the environment, explicitly name those next documents and stop before detailed planning rather than silently absorbing that whole phase into this skill.

## Response format

For substantial planning requests, keep the response structured:

1. `Piano breve`
2. `File da creare o modificare`
3. `Implementazione richiesta`
4. `Rischi o punti da controllare`
5. `Test manuali suggeriti`

If discovery is still open, section 3 should contain:

- the clarifying questions;
- the known assumptions;
- the missing information blocking the final `docs/spec.md`.

## Reference files

Read these references proactively when useful:

- `references/spec-template.md` for the default `docs/spec.md` structure;
- `references/question-bank.md` when the user needs more guided discovery prompts.

## Mini examples

### Example A: ambiguous idea

User asks: `Vorrei una app mobile utile per studenti, aiutami con docs/spec.md`.

Expected behavior:

- ask 3-5 structured questions;
- identify missing scope boundaries;
- postpone the final spec until enough anchors are known.

### Example B: well-scoped brief

User asks: `Ho già obiettivo, target, MVP e vincoli. Fammi una prima bozza di docs/spec.md e marca come TBD quello che resta aperto`.

Expected behavior:

- ask 0-2 targeted questions at most;
- draft the spec immediately;
- keep open issues explicit instead of blocking progress.
