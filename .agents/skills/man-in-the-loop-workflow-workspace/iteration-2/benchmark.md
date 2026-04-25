# Benchmark Summary

## Result overview

| Eval | With skill | Without skill | Notes |
| --- | --- | --- | --- |
| path-normalization | 3/3 | 3/3 | Both runs normalized paths well. |
| document-selection | 3/3 | 3/3 | Both runs selected the right docs and justified them. |
| iteration-drafting | 3/3 | 1/3 | The skill strongly improved adherence to the repository iteration format. |

## Analyst notes

- This iteration separates the skill more clearly than iteration 1.
- `path-normalization` is still weakly discriminating: the baseline already understands common MAUI repository structure.
- `document-selection` is also only moderately discriminating: the baseline reasons well about docs-as-code and optional spec updates.
- `iteration-drafting` is the strongest eval so far. The skill-guided run produces a document much closer to the repository's full iteration example, while the baseline falls back to a shorter summary format.
- The clearest value of the skill is not generic planning quality, but forcing conformance to the repository's specific workflow artifacts and document shapes.

## Comparison with iteration 1

- Iteration 1: all evals passed for both configurations, so the benchmark signal was weak.
- Iteration 2: one eval now clearly favors `with_skill`, showing that the references and workflow instructions improve output format fidelity.
- Next improvements should focus on prompts that require even tighter reuse of repository-specific artifacts, not just generally good engineering judgment.
