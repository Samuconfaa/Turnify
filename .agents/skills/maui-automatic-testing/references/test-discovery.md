# Test Discovery Reference

Use this file at the start of every testing task.

## Discovery checklist

1. Find the solution file (`*.sln`) if present.
2. Find existing test projects (`*Tests*.csproj`, `*.Tests.csproj`, `*.UnitTests.csproj`).
3. Inspect which test framework already exists:
   - xUnit
   - NUnit
   - MSTest
4. Inspect helper libraries already present:
   - mocking libraries
   - assertion libraries
   - coverage tooling
5. Check whether there is any UI automation stack already configured.
6. Check whether the feature changed XAML, Shell routes, DI registration, DTO parsing, ViewModels, or services.

## What to conclude from discovery

- If there is an existing test project, extend it before creating a new one.
- If there is no test project, prefer a focused unit-test project for ViewModels and services.
- If there is no UI automation stack, treat UI automation as optional future infrastructure, not a default change.
- If there is no solution file, use project-level `dotnet test` and `dotnet build` commands on the affected projects.

## Minimum commands to consider

- `dotnet test <solution-or-test-project>`
- `dotnet build <solution-or-project>`

If the feature changed XAML or page registration, build verification is part of the automatic test story even when no new unit tests are added.
