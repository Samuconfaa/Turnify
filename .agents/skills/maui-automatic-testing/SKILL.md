---
name: maui-automatic-testing
description: Add, run, and review automatic tests for .NET MAUI slices at the end of an iteration. Use this skill whenever the user asks to test a MAUI feature, add unit tests, integration tests, UI automation, smoke builds, regression checks, coverage around ViewModels, services, XAML bindings, Shell navigation, DTO parsing, or wants to validate a completed slice before closing an iteration, even if they only say "run the tests" or "verify this feature".
---

# Maui Automatic Testing

Use this skill when a .NET MAUI slice or iteration has introduced new behavior and the agent needs to validate it with automatic tests, not only manual checks.

## Core goal

Produce the smallest credible automated test set for the changed MAUI feature, run what can be run in the current repository, and report clearly what was verified, what was not feasible, and what infrastructure is still missing.

## Testing philosophy

- Prefer a testing pyramid, not UI-heavy overkill.
- Cover business and presentation logic first: services, DTO parsing, validation, ViewModels, state transitions, and command behavior.
- Add UI automation only when the repository already has suitable infrastructure or the user explicitly wants to introduce it.
- Do not claim broad automated coverage if only build validation or a few unit tests were run.
- A slice is better protected by a few focused regression tests than by a large, brittle test suite.

This skill is also meant to help students avoid common testing mistakes in .NET MAUI projects. When the user sounds unsure, prefer clearer guidance over minimal hints.

## When this skill should trigger

Use this skill proactively when the user:

- asks to test a new MAUI feature or recently completed iteration;
- asks to add automatic tests for ViewModels, services, Shell navigation, DTO parsing, or UI states;
- says "run the tests", "verify this slice", "add regression coverage", or "check if this feature is safe to close";
- mentions post-iteration validation, regression testing, smoke testing, CI-readiness, or automatic quality gates for a MAUI app.

## First pass

Before writing tests:

1. Read the changed MAUI files: relevant `ViewModels`, `Services`, `Models`, `Views`, `AppShell`, and `MauiProgram`.
2. Discover the current test setup before proposing anything new.
3. Identify which parts are testable without device infrastructure.
4. Separate feasible-now tests from tests that require extra infrastructure.

Read `references/test-discovery.md` before deciding the plan.

## Student-safe rule

If the user is a student or the request is educational, do not just list possible tests. Explain which tests are the right first step, which ones are premature, and why.

## What to test by default

For a typical MAUI slice, prioritize these categories in order:

1. ViewModel logic
2. Service logic and HTTP/parsing behavior
3. Validation and state transitions
4. Navigation-related logic that is testable without Shell runtime coupling
5. Build and compile-time checks
6. UI automation only if infrastructure already exists or the user asks for it

Read `references/test-catalog.md` for the detailed catalog.

## Required MAUI-specific checks

When a feature touches these areas, look for test opportunities here:

- `CommunityToolkit.Mvvm` commands and observable state
- `IsBusy`, `ErrorMessage`, `HasData`, and `IsEmptyState` transitions
- service exception handling for `HttpRequestException`, `JsonException`, and `TaskCanceledException`
- DTO and `System.Text.Json` deserialization edge cases
- Shell route registration and route-name consistency where testable
- constructor injection and lack of `new` inside ViewModels
- XAML compile/build safety when bindings or pages changed

## Infrastructure rules

- Reuse the repository's existing test framework if present.
- If there is no test project yet, prefer the lightest viable addition.
- Do not add UI automation frameworks, snapshot tools, or device-test libraries unless they are already present or the user clearly wants that addition.
- If the repository has no test infrastructure and the user asks for comprehensive coverage, explain what can be added now versus later.

Read `references/test-infrastructure.md` before creating or extending test projects.

## Decision rule for test levels

Use this decision order:

- If logic lives in a ViewModel or service, add unit tests first.
- If behavior depends on HTTP payloads, add parsing and service tests with mocked handlers.
- If behavior is mostly XAML wiring and visual states, use build validation first and add UI automation only if already supported.
- If a behavior depends on platform runtime, sensors, or emulator/device interaction, mark it as not fully automatable in the current setup unless dedicated infrastructure exists.

Read `references/test-decision-table.md` and apply it explicitly when the user is deciding what to test.

## Common student mistakes to prevent

- Starting from end-to-end UI automation when ViewModel or service tests would cover the slice faster and more reliably.
- Treating `dotnet build` as if it proved the whole feature works.
- Writing fragile tests against MAUI runtime details instead of testing the logic one level lower.
- Adding too much test infrastructure in the same iteration as the feature itself.
- Forgetting to say which risks are still only manually verified.

Read `references/common-mistakes.md` when the user needs didactic guidance.

## Typical post-iteration workflow

1. Identify changed files and risk areas.
2. Map them to the smallest meaningful automatic test set.
3. Add or update tests.
4. Run the relevant test commands and build commands.
5. Report pass/fail, uncovered risks, and remaining manual-only checks.

## Output format

For substantial testing requests, respond with:

1. `Piano breve`
2. `File da creare o modificare`
3. `Implementazione richiesta`
4. `Rischi o punti da controllare`
5. `Test automatici eseguiti o proposti`

In section 3, distinguish clearly between:

- tests added;
- commands run;
- test types intentionally not added and why.

For didactic or uncertain requests, also include this table inside section 3:

| Parte modificata | Tipo di test consigliato | Automatico ora | Manuale | Motivo |
| --- | --- | --- | --- | --- |

Use `Si` or `No` in the `Automatico ora` and `Manuale` columns.

## Practical guardrails

- Do not jump directly to UI automation if unit or service tests would cover the risk better.
- Do not add brittle tests around MAUI internals when the real logic can be tested one layer lower.
- Do not invent emulator coverage if no emulator or UI automation stack exists.
- Do not silently add third-party libraries just because they are common in testing.
- Do not ignore build verification after changing XAML, DI, or route registration.
- Do not overwhelm students with every possible test level when a smaller set is the correct next step.

## Reference files

- Read `references/test-discovery.md` to inspect existing test infrastructure and choose feasible commands.
- Read `references/test-catalog.md` to map MAUI code changes to the right categories of automated tests.
- Read `references/test-infrastructure.md` when deciding whether to create or extend a test project and how to keep it minimal.
- Read `references/post-iteration-checklist.md` when the user wants to validate a completed slice before closing the iteration.
- Read `references/test-decision-table.md` when the user needs a clear rule for choosing the right test level.
- Read `references/common-mistakes.md` when the goal is educational and the user should be steered away from bad testing choices.
- Read `references/good-vs-bad-plans.md` when the user needs concrete examples of good and bad MAUI testing plans.

If the user asks for the rationale behind the repository workflow, also read `docs/method/man-in-the-loop.md` and align the testing response with the iteration-closing phase.
