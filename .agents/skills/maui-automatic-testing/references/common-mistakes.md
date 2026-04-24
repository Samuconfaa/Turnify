# Common Mistakes

Use this file when the user needs didactic guidance.

## Mistake 1: "We changed a page, so we need UI automation first"

Why this is often wrong:

- The risky logic is usually in the ViewModel or service.
- UI automation costs more and fails more often.
- A build already checks some XAML and wiring issues.

Better choice:

- unit tests for ViewModel/service;
- build verification for XAML changes;
- manual verification for real rendering and navigation if no UI automation stack exists.

## Mistake 2: "The build passed, so the feature is covered"

Why this is wrong:

- build success does not prove business logic, error handling, or state transitions.
- it does not prove the user sees the right loading/error/empty states.

Better choice:

- treat build as one automatic check, not the whole test strategy.

## Mistake 3: "Let's add many test projects now"

Why this is risky:

- students often lose focus on the slice itself;
- infrastructure grows faster than the tested value.

Better choice:

- start with one focused unit-test project if nothing exists yet.

## Mistake 4: "Let's test MAUI internals directly"

Why this is risky:

- tests become brittle and tied to framework runtime behavior;
- they are harder to maintain and teach poorly.

Better choice:

- move or isolate logic so it can be tested through ViewModels, services, helpers, and parsers.

## Mistake 5: "Automatic tests mean no more manual checks"

Why this is wrong:

- device behavior, rendering, gestures, and real navigation often still need manual verification.

Better choice:

- say explicitly which parts are still manual-only.
