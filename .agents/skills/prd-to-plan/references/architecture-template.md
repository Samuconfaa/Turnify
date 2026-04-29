# Template `docs/architecture.md`

Use this file to document the technical structure that supports the approved spec.
Keep it tied to real decisions, not speculative over-engineering.

```markdown
# Architettura

## 1. Obiettivo architetturale

## 2. Struttura del repository e del progetto

### Cartelle principali

### Responsabilità per area

## 3. Pattern applicativi

- `.NET MAUI`
- MVVM
- `CommunityToolkit.Mvvm`
- Shell navigation

## 4. Componenti principali

### Views

### ViewModels

### Services

### Models e DTO

## 5. Navigazione

### Route Shell

### Parametri di navigazione

## 6. Stato della UI

### Loading

### Error

### Empty

### Success

## 7. Dati e integrazioni

### Chiamate remote

### Parsing JSON

### Persistenza locale

## 8. Dependency injection e composition root

## 9. Error handling e logging

## 10. Decisioni aperte e `TBD`
```

## Notes

- Do not document code-behind business logic as an accepted pattern.
- Keep navigation aligned with Shell.
- Keep service boundaries separate from ViewModels.
