# Piano breve

Non procedo con `docs/plan.md` e `docs/architecture.md` completi, perché manca il prerequisito principale: `docs/spec.md`. Se li derivassi adesso, riempirei i documenti di assunzioni non approvate.

# File da creare o modificare

- prima `docs/spec.md`
- poi `docs/plan.md`
- poi `docs/architecture.md`

# Implementazione richiesta

## Blocking gaps in `docs/spec.md`

- obiettivo reale dell'app per studenti;
- utenti o scenari principali;
- MVP e non-goal;
- feature aree principali;
- vincoli tecnici o di piattaforma.

## Passo corretto

Prima va completato `maui-prd`, così otteniamo uno `docs/spec.md` abbastanza solido da poter derivare il resto in modo controllato.

## Domande minime

1. Qual è il problema principale che l'app per studenti deve risolvere?
2. Quali sono le 2-3 feature MVP indispensabili?
3. Cosa vuoi esplicitamente fuori scope nella prima versione?

Quando queste risposte saranno trasformate in `docs/spec.md`, allora potrò derivare `docs/plan.md` e `docs/architecture.md` senza inventare struttura o iterazioni non approvate.

# Rischi o punti da controllare

- partire dal piano senza spec porta a iterazioni arbitrarie;
- l'architettura diventerebbe speculativa invece che giustificata dal requisito;
- il repository perderebbe la separazione tra product scope e scelte tecniche.

# Test manuali suggeriti

- nessuno per ora: prima serve consolidare il requisito in `docs/spec.md`.
