# Test Infrastructure Reference

Use this file when deciding how to add or extend automated testing support.

## Preferred order

1. Reuse an existing test project.
2. If none exists, create one focused unit-test project.
3. Keep test dependencies minimal and justified.

## Default recommendation when nothing exists yet

For a repository without tests, the safest first step is usually:

- one unit-test project for ViewModels, services, and DTO/parsing logic;
- build validation for the MAUI app project;
- no UI automation in the same iteration unless the user explicitly wants that infrastructure.

## What a new test project should usually cover first

- changed ViewModels;
- changed services;
- changed DTO or parser logic;
- regression tests for the new slice.

## What not to do by default

- do not introduce multiple test projects in the same iteration unless the repository already uses them;
- do not add emulator/device automation and snapshot testing together in one step;
- do not build a large fake UI-testing framework for a small feature.

## Reporting rule

When new infrastructure is needed, report it explicitly in three parts:

1. what is already available;
2. what was added now;
3. what remains future work.
