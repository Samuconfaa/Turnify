# Common Student Workflow Mistakes

Use this file when the user needs didactic guidance on the Man-in-the-Loop method.

## Mistake 1: treating a whole feature as a single iteration

Wrong:

- "Create the detail page"

Why it is wrong:

- it hides multiple responsibilities: View, ViewModel, navigation, service, tests, docs;
- it makes success hard to verify.

Better:

- isolate one piece with acceptance criteria, for example only the ViewModel or only the page layout.

## Mistake 2: coding before planning

Why it is risky:

- students lose control of file scope, dependencies, and acceptance criteria;
- the AI may generate too much code in one pass.

Better:

- define objective, files, dependencies, acceptance criteria, and risks first.

## Mistake 3: skipping review because the code compiles

Why it is wrong:

- compiled code may still break architecture, naming, nullability, or error handling rules.

Better:

- review the code against MVVM boundaries and project conventions before calling it done.

## Mistake 4: skipping testing because the feature "looks finished"

Why it is wrong:

- a feature is not done until normal cases and edge cases are checked.

Better:

- distinguish working-looking code from verified behavior.

## Mistake 5: forgetting documentation and Git closure

Why it is wrong:

- the repository workflow is docs-as-code;
- untracked decisions and tests make later iterations harder.

Better:

- update the iteration log and the relevant docs before closure.
