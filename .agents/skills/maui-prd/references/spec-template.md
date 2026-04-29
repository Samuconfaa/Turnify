# Template `docs/spec.md`

Use this as the default skeleton for the project PRD.
Keep the sections that matter, trim the ones that do not, and mark unresolved items as `TBD` instead of guessing.

```markdown
# Specifica di Progetto - [Nome progetto]

## 1. Visione e contesto

### Problema da risolvere

### Obiettivo del progetto

### Utenti target

## 2. Ambito MVP

### Flusso principale da supportare

### Funzionalità obbligatorie

### Funzionalità opzionali future

### Non-obiettivi

## 3. Scenari d'uso principali

### Scenario 1

### Scenario 2

## 4. Requisiti funzionali

- FR-01: ...
- FR-02: ...
- FR-03: ...

## 5. Epic, user stories e criteri di accettazione

### EPIC-01 - [Nome]

**Obiettivo:**

**User stories:**

- Come [utente], voglio [azione] così da [beneficio].

**Criteri di accettazione:**

- [ ] criterio verificabile
- [ ] criterio verificabile

## 6. Requisiti non funzionali

### UX e stati UI

### Prestazioni percepite

### Affidabilità e gestione errori

### Privacy e dati

## 7. Vincoli tecnici di progetto

- App `.NET MAUI`
- MVVM
- Shell navigation
- `CommunityToolkit.Mvvm`
- `HttpClient`
- `System.Text.Json`
- `Preferences` e/o SQLite se serve persistenza locale
- Android come target principale

## 8. Metriche di successo

- metrica 1
- metrica 2
- metrica 3

## 9. Rischi, dipendenze e questioni aperte

### Rischi

### Dipendenze

### Questioni aperte o `TBD`

## 10. Passaggio al planning

Il prossimo passo è derivare:

- `docs/plan.md`
- `docs/architecture.md`
- `docs/test-matrix.md`
```

## Notes

- Keep acceptance criteria concrete and observable.
- Keep MVP smaller than the total project vision.
- Move architecture-heavy detail to `docs/architecture.md`, not here.
