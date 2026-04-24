# Project Structure Reference

Use this file when you need to reason about where code and documentation belong in a repository that follows the course workflow.

## Layout goals

- Keep source code and project documentation in the same repository.
- Treat documentation as part of the deliverable, not as an afterthought.
- Use repository-relative paths in plans, logs, prompts, and reviews.

## Recommended repository layout

```text
ProjectRoot/
├─ .git/
├─ .gitignore
├─ AGENTS.md
├─ README.md
├─ .github/
│  └─ copilot-instructions.md
├─ docs/
│  ├─ spec.md
│  ├─ plan.md
│  ├─ architecture.md
│  ├─ test-matrix.md
│  ├─ prompt-log.md
│  ├─ deployment.md
│  ├─ demo-script.md
│  ├─ api-notes.md
│  └─ iterations/
├─ src/
│  └─ <ProjectName>/
│     ├─ <ProjectName>.csproj
│     ├─ App.xaml
│     ├─ App.xaml.cs
│     ├─ AppShell.xaml
│     ├─ AppShell.xaml.cs
│     ├─ MauiProgram.cs
│     ├─ Models/
│     ├─ Services/
│     ├─ ViewModels/
│     ├─ Views/
│     ├─ Converters/
│     ├─ Resources/
│     └─ Platforms/
└─ assets/
```

## Placement rules

- Put AI-agent rules in `AGENTS.md` at repository root.
- Keep project-level docs under `docs/`.
- Keep per-iteration logs under `docs/iterations/` using descriptive filenames such as `it-01-bootstrap.md`.
- Keep MAUI source inside `src/<ProjectName>/`, not directly under `src/`.
- Keep code separated by responsibility: `Models`, `Services`, `ViewModels`, `Views`, `Converters`.
- Keep supporting delivery material under `assets/`.

## Path-writing convention

When you mention files in plans, prompts, or reviews, prefer full repository-relative paths such as:

- `src/BookScout.Mobile/ViewModels/SearchViewModel.cs`
- `src/BookScout.Mobile/Views/BookDetailPage.xaml`
- `docs/iterations/it-03-detail.md`

Do not assume that `src/` is itself the MAUI project root.

## How to use this reference

Use this file when:

- planning a new iteration and listing impacted files;
- checking whether a proposed file location is coherent;
- reviewing changes that mix documentation and code;
- drafting prompts that must name precise file paths.
