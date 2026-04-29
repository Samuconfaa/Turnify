# Template `docs/test-matrix.md`

Use this document to map project scope to verification work.
When the file is generated from planning, mark evidence as planned. Do not pretend the checks already ran.

```markdown
# Test Matrix

## 1. Regole di lettura

- `Manuale`, `Automatico ora`, `Automatico più avanti`: usare `Si` o `No`
- `Evidenza prevista`: comando, nota di verifica, oppure `Da eseguire`

## 2. Matrice principale

| ID | Requisito o scenario | Categoria | Manuale | Automatico ora | Automatico più avanti | Iterazione target | Evidenza prevista | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TM-01 | ... | Input | Si | No | No | IT-01 | Da eseguire | ... |
| TM-02 | ... | API | Si | Si | No | IT-02 | `dotnet test` | ... |
| TM-03 | ... | UI state | Si | No | Si | IT-03 | Da eseguire | ... |

## 3. Aree minime da coprire

- Input: vuoto, invalido, lungo, caratteri speciali
- API: successo, timeout, errore server, JSON malformato, risposta vuota
- UI: loading, error, empty, success
- Navigation: apertura pagina, ritorno, parametri
- Persistence: salvataggio, riapertura app, modifica dato
- Device: tema, rotazione, permessi negati

## 4. Note su test automatici

Indicare qui quali controlli automatici sono realistici subito e quali richiedono lavoro successivo o infrastruttura aggiuntiva.
```

## Notes

- Prefer unit and service tests before UI automation.
- If the plan touches XAML or routes, include build verification among the automatic checks.
- Use `maui-automatic-testing` for deeper automatic test design.
