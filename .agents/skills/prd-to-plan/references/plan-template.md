# Template `docs/plan.md`

Use this file to derive a roadmap of bounded iterations from `docs/spec.md`.
One iteration should represent one verifiable objective, not a vague milestone.

```markdown
# Piano di Progetto

## 1. Sintesi operativa

### Obiettivo del progetto

### Vincoli principali

### Dipendenze esterne

## 2. Sequenza delle iterazioni

| Iterazione | Obiettivo verificabile | Dipendenze | Rischio | Stato |
| --- | --- | --- | --- | --- |
| IT-01 | ... | ... | basso-medio-alto | pianificata |
| IT-02 | ... | ... | basso-medio-alto | pianificata |

## 3. Dettaglio iterazioni

### IT-01 - [Titolo]

**Obiettivo verificabile**

**In scope**

- ...

**Out of scope**

- ...

**File o aree probabili**

- `src/...`
- `docs/...`

**Dipendenze**

- ...

**Criteri di accettazione**

- [ ] ...
- [ ] ...

**Verifiche principali**

- manuale: ...
- automatico: ...

**Rischi**

- ...

### IT-02 - [Titolo]

...
```

## Notes

- Prefer 4-8 focused iterations over 2 giant ones.
- Keep acceptance criteria concrete.
- If a single iteration touches too many layers, split it.
