# Post-Iteration Testing Checklist

Use this file when the user wants to validate a completed slice before closing the iteration.

## Automatic checks to prioritize

- unit tests for changed ViewModels and services;
- parser tests for new or changed API payload handling;
- regression tests for reported bug fixes;
- build verification for MAUI projects after XAML, Shell, or DI changes.

## Student-safe closure rule

Before saying a slice is well tested, check that the report distinguishes:

- what was covered automatically;
- what was only build-verified;
- what still needs manual verification on emulator or device.

If those three levels are mixed together, the student will likely overestimate coverage.

## What the final report should say

- which automatic tests were added;
- which commands were run;
- what passed and what failed;
- which risks remain uncovered;
- which checks are still manual-only.

## Example closure statement

"The slice is covered by ViewModel and service regression tests plus a successful MAUI build. UI automation was not added because the repository has no existing device-test stack; navigation and visual rendering still require manual verification on emulator or device."

## Minimal final checklist for students

- Did we add tests for the logic that changed?
- Did we run build after XAML, Shell, or DI changes?
- Did we avoid introducing unnecessary UI automation?
- Did we say clearly what remains manual-only?
- Did we avoid claiming full coverage without device/runtime checks?
