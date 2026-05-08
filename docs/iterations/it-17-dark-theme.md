# Iterazione 17

## Data
2026-05-08

## Commit
4fbe3fb — feat(mobile): aggiungi tema scuro Deep Forest con AppThemeBinding

## Obiettivo
Aggiungere il tema scuro "Deep Forest" all'app MAUI usando `AppThemeBinding`, con una palette verde-foresta tinted derivata da Material Design 3.

## Piano
1. Definire i token dark nel file `Colors.xaml` (prefisso `Dark*`)
2. Aggiornare gli stili globali in `Colors.xaml` (ContentPage, FieldBorder, CardBorder, PrimaryButton, OutlineButton, GhostButton, FieldEntry, SectionLabel, HeadingLabel) con `AppThemeBinding`
3. Sostituire tutti i `{StaticResource X}` con `{AppThemeBinding Light=..., Dark=...}` nelle 27 view tramite script Python

## Palette Dark — "Deep Forest"
| Token | Light | Dark |
|---|---|---|
| Background | #F5FBF5 | #0D1510 |
| Surface | #FFFFFF | #162019 |
| SurfaceContainerLow | #EFF5EF | #1A261D |
| SurfaceContainer | #E9EFE9 | #1F2C22 |
| SurfaceContainerHigh | #E4EAE4 | #273529 |
| SurfaceVariant | #DEE4DE | #1F2C22 |
| OnBackground | #171D19 | #E2F0E6 |
| OnSurfaceVariant | #3D4A42 | #A3B5A8 |
| Primary | #006948 | #68DBA9 |
| PrimaryContainer | #00855D | #004D34 |
| Outline | #6D7A72 | #7D8F83 |
| OutlineVariant | #BCCAC0 | #3A4D41 |
| HeaderGradientStart | #064E3B | #0D2218 |
| HeaderGradientEnd | #115E59 | #103529 |

## Prompt principali utilizzati
- Proposta palette scura (3 opzioni A/B/C), scelta opzione A "Deep Forest"
- Implementazione: aggiunta token, aggiornamento stili globali, script bulk per le view

## File creati/modificati
- `src/Turnify.Mobile/Resources/Styles/Colors.xaml` — aggiunta sezione Dark tokens + AppThemeBinding in tutti gli stili globali
- `src/Turnify.Mobile/Views/*.xaml` — 527 sostituzioni `{StaticResource X}` → `{AppThemeBinding Light=..., Dark=...}` in 27 file
