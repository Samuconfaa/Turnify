# Common Student MAUI Mistakes

Use this file when the goal is not only to implement MAUI code, but also to teach best practices.

## Mistake 1: putting logic in code-behind

Why students do it:

- it feels direct and easy to see from the page.

Why it is a problem:

- it mixes UI, state, navigation, and data loading;
- it becomes harder to test and review.

Better:

- keep page wiring in `.xaml.cs` only;
- move state and commands to the ViewModel;
- move integration and data access to services.

## Mistake 2: using `ListView` for new work

Why it is a problem:

- it is legacy in MAUI;
- new list work should prefer `CollectionView`.

Better:

- use `CollectionView` for new screens;
- migrate only when it is justified and safe.

## Mistake 3: skipping state properties

Why it is a problem:

- the UI cannot express loading, error, empty, and data states clearly.

Better:

- define and update `IsBusy`, `ErrorMessage`, `HasData`, and `IsEmptyState` coherently.

## Mistake 4: mixing navigation styles

Why it is a problem:

- Shell-based apps become inconsistent and harder to maintain.

Better:

- use Shell navigation consistently unless the repository already wraps it in a controlled abstraction.

## Mistake 5: constructing dependencies inside ViewModels

Why it is a problem:

- it hides dependencies and makes testing harder.

Better:

- inject services via constructor and register them in `MauiProgram`.

## Mistake 6: thinking compiled XAML means the feature is correct

Why it is wrong:

- compiled XAML does not prove state behavior, navigation flow, or UX quality.

Better:

- combine review, tests, and manual verification.
