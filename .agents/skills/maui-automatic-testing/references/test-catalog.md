# MAUI Test Catalog

Use this file to choose the smallest correct automated tests for a MAUI slice.

## 1. ViewModel tests

Best for:

- command behavior;
- loading/error/empty/data state transitions;
- validation rules;
- prevention of concurrent executions;
- mapping from service results to UI-facing properties.

Typical assertions:

- `IsBusy` becomes `true` at start and `false` in `finally`;
- `ErrorMessage` is cleared on retry and populated on failure;
- `HasData` and `IsEmptyState` stay coherent;
- commands call the correct service methods;
- invalid input does not trigger invalid downstream behavior.

## 2. Service tests

Best for:

- `HttpClient` usage through fake or mocked handlers;
- success, 404/500, timeout, malformed JSON, empty payload;
- `System.Text.Json` deserialization edge cases;
- mapping of remote payloads to DTOs or models.

Typical assertions:

- expected result on success;
- safe fallback or explicit failure mode on errors;
- no silent swallowing of important failures;
- null payload handling stays predictable.

## 3. DTO and parser tests

Best for:

- nullable JSON fields;
- alternate shapes from APIs;
- default values and required-field assumptions.

## 4. Navigation-adjacent tests

Best for:

- route-name generation helpers;
- query parameter formatting/parsing abstractions;
- navigation service abstractions if the app wraps Shell.

Avoid brittle tests that need the full Shell runtime unless the project already supports them.

## 5. Build and compile validation

Best for:

- changed XAML;
- changed bindings;
- changed DI registration in `MauiProgram`;
- changed route registration in `AppShell`.

Use build validation whenever:

- a page was added or edited;
- a page's binding context changed;
- routes or DI registrations changed.

## 6. UI automation

Use only when the repository already has infrastructure or the user explicitly requests adding it.

Best for:

- end-to-end smoke flows;
- interaction across multiple screens;
- platform-specific regressions that unit tests cannot cover.

Do not default to UI automation when the same risk is covered by ViewModel, service, or build tests.
