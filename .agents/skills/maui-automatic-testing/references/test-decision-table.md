# Test Decision Table

Use this file to choose the correct first automatic tests for a MAUI slice.

| Parte modificata | Primo livello di test | Secondo livello, se serve | Cosa NON fare come default |
| --- | --- | --- | --- |
| `ViewModels/` | unit test su comandi, stato e validazione | test di regressione aggiuntivi su edge case | partire da UI automation |
| `Services/` | unit/service test con fake `HttpMessageHandler` o equivalente | parser/DTO tests | testare la rete reale come default |
| `Models/` o parsing JSON | parser/DTO tests | service tests che coprono mapping completo | saltare i casi null/malformed |
| `Views/*.xaml` | build verification | UI automation solo se giustificata e già supportata | pretendere che il build copra il rendering reale |
| `AppShell.xaml.cs` | build verification e test di helper/abstraction se esistono | UI smoke test solo con infrastruttura esistente | test fragili sull'intero runtime Shell |
| `MauiProgram.cs` | build verification | test su wiring estraibile solo se la logica è isolata | costruire test complessi del container per una slice piccola |

## Teaching rule

If more than one area changed, combine the smallest useful set.

Example:

- `ViewModel + Service + XAML` -> unit tests + service tests + build verification.
- Not automatically -> UI automation, unless the repository already supports it or the user explicitly wants to add it.
