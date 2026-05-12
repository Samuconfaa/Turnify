# Iterazione 16

## Data
2026-05-07

## Obiettivo
Risolvere 8 test di integrazione pre-esistenti falliti e aggiungere copertura test per i servizi introdotti nelle iterazioni 11-14.

---

## Piano

### Parte A — Fix 8 test falliti (su `main`)

| # | Test | Causa | Fix |
|---|------|-------|-----|
| 1-4 | `AttendanceControllerIntegrationTests` (4 test) | `EmployeeUserId = 200` condiviso tra tutti i test → state bleed delle presenze | `SeedEmployeeAsync` genera userId univoco per ogni test con `Random.Shared.Next` |
| 5 | `UpdateShift_AsAdmin_Returns200` | `ShiftStatus` enum serializzato come stringa ma API senza `JsonStringEnumConverter` | Aggiunto `JsonStringEnumConverter` in `Program.cs` |
| 6-7 | `Login_WrongPassword_Returns401`, `EmployeeLogin_ValidCredentials_Returns200WithTokens` | Rate limiter (10 req/min per IP) attivo anche in Testing | `app.UseRateLimiter()` condizionato a `!IsEnvironment("Testing")` |
| 8 | `CreateEmployee_SameEmailDifferentCompanies_BothReturn201` | `ExistsByEmailAsync` è globale — blocca stessa email in aziende diverse | Rimosso check globale; aggiunto `ExistsByEmailInCompanyAsync` per check per-company; `User.Email = null` per employee |

### Parte B — Nuovi test (in branch `test/coverage-it11-14`)

- `ShiftSwapRepositoryTests` — 11 unit test con in-memory EF Core
- `FcmPushNotificationServiceTests` — 11 unit test con Moq
- `SmtpEmailServiceTests` — 3 unit test (limitati dall'assenza di interfaccia su `SmtpClient`)
- `CertificatePinningHandlerTests` — 8 unit test sull'algoritmo SHA-256 SPKI
- `ShiftSwapsControllerIntegrationTests` — 14 integration test con `WebApplicationFactory`

---

## File creati/modificati

### Parte A (main)
- `src/Api/Turnify.Api/Program.cs` — JsonStringEnumConverter + rate limiter condizionale
- `src/Api/Turnify.Api/Controllers/EmployeesController.cs` — email check per-company
- `src/Api/Turnify.Core/Interfaces/Repositories/IEmployeeRepository.cs` — `ExistsByEmailInCompanyAsync`
- `src/Api/Turnify.Infrastructure/Repositories/EmployeeRepository.cs` — implementazione del metodo
- `src/Turnify.Tests/Integration/AttendanceControllerIntegrationTests.cs` — userId univoco per test
- `src/Turnify.Tests/Integration/AuthControllerIntegrationTests.cs` — `IsActive = true` su Company

### Parte B (branch `test/coverage-it11-14`)
- `src/Turnify.Tests/Repositories/ShiftSwapRepositoryTests.cs`
- `src/Turnify.Tests/Services/FcmPushNotificationServiceTests.cs`
- `src/Turnify.Tests/Services/SmtpEmailServiceTests.cs`
- `src/Turnify.Tests/Services/CertificatePinningHandlerTests.cs`
- `src/Turnify.Tests/Integration/ShiftSwapsControllerIntegrationTests.cs`

---

## Risultato

**Suite totale:** 232/232 test passano su `main` (0 failure).
