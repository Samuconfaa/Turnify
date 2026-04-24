# Piano breve

Qui non conviene derivare `docs/plan.md` e `docs/architecture.md` in modo completo: manca `docs/spec.md` e il prompt non fornisce un riassunto affidabile di obiettivo, MVP, non-goal e vincoli. In questo caso la scelta corretta è fermarsi e completare prima la fase PRD.

# File da creare o modificare

- Nessun documento di piano o architettura finale in questa fase.
- Passaggio consigliato: lavorare prima su `docs/spec.md` con `maui-prd`.

# Implementazione richiesta

## Blocker

- Non è chiaro che tipo di app per studenti sia: studio, agenda, alloggi, voti, biblioteca o altro.
- Manca l'MVP: quali sono i 2-3 flussi minimi da supportare.
- Mancano vincoli e non-goal: login sì/no, dati remoti sì/no, persistenza locale sì/no, target Android-only o altro.

## Minimo indispensabile per poter continuare

1. Obiettivo dell'app in una frase.
2. 2-3 funzionalità MVP.
3. Vincoli principali e non-goal.

Con queste informazioni conviene prima derivare o completare `docs/spec.md` tramite `maui-prd`, poi passare a `docs/plan.md` e `docs/architecture.md`.

# Rischi o punti da controllare

- Procedere ora con troppe assunzioni produrrebbe iterazioni arbitrarie e architettura poco credibile.

# Test manuali suggeriti

- Nessuno per ora: prima va chiarito lo spec.
