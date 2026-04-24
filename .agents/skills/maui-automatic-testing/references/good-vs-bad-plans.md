# Good vs Bad Plans

Use this file when the user needs examples, especially in a teaching context.

## Good plan example

Scenario:

- changed `SearchViewModel.cs`
- changed `BookService.cs`
- changed `SearchPage.xaml`
- no UI automation infrastructure exists

Good plan:

- add `SearchViewModelTests` for command behavior, `IsBusy`, `ErrorMessage`, empty/data states;
- add `BookServiceTests` with fake HTTP responses for success, timeout, malformed JSON, empty payload;
- run `dotnet test` on the unit-test project;
- run `dotnet build` on the MAUI app project because XAML changed;
- keep rendering and Shell runtime flow as manual verification.

Why it is good:

- it covers the risky logic first;
- it keeps infrastructure small;
- it distinguishes automatic from manual checks.

## Bad plan example

Bad plan:

- add UI automation immediately;
- skip unit tests for ViewModel and service;
- say the feature is fully tested if the UI test clicks through once;
- ignore build verification and parsing edge cases.

Why it is bad:

- it is expensive and brittle;
- it misses the simplest and most valuable regression checks;
- it teaches the wrong testing priorities.
