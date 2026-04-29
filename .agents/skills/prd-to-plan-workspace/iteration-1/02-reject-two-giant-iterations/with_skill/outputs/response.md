# Piano breve

No: due iterazioni del tipo "costruire tutta l'app" e "rifinire" sono troppo ampie per un workflow planning -> build -> review -> testing -> documentation -> Git. Un piano così rende difficile capire cosa approvare, cosa testare e cosa isolare in review.

# File da creare o modificare

- `docs/plan.md`

# Implementazione richiesta

Ti propongo di sostituire le due macro-fasi con iterazioni piccole e verificabili.

## Perché il piano in due blocchi non va bene

- concentra View, ViewModel, servizi, navigazione e persistenza nella stessa slice;
- rende i criteri di accettazione troppo vaghi;
- sposta i problemi di integrazione alla fine;
- rende più debole la review Git, perché ogni branch contiene troppi cambiamenti insieme.

## Proposta `docs/plan.md`

# Piano di Progetto

## 1. Sintesi operativa

### Obiettivo del progetto

Consegna incrementale dell'MVP in slice piccole, verificabili e documentabili.

## 2. Sequenza delle iterazioni

| Iterazione | Obiettivo verificabile | Dipendenze | Rischio | Stato |
| --- | --- | --- | --- | --- |
| IT-01 | Struttura base MAUI, Shell e pagina iniziale funzionante | nessuna | medio | pianificata |
| IT-02 | Primo flusso utente completo su feature A | IT-01 | medio | pianificata |
| IT-03 | Secondo flusso o persistenza locale | IT-02 | medio | pianificata |
| IT-04 | Hardening finale, docs e verifica finale | IT-01..IT-03 | basso | pianificata |

## 3. Dettaglio iterazioni

### IT-01 - Fondazione reviewable

**Obiettivo verificabile**

L'app si avvia, usa Shell e mostra uno stato iniziale consistente.

**In scope**

- wiring iniziale progetto
- registrazione dipendenze
- pagina iniziale minima

**Out of scope**

- feature di business complete

**Criteri di accettazione**

- [ ] build pulita
- [ ] route iniziale funzionante
- [ ] stato loading/error/empty definito dove serve

### IT-02 - Prima feature verticale

**Obiettivo verificabile**

Un singolo scenario utente è completo end-to-end.

**Criteri di accettazione**

- [ ] input gestito
- [ ] service integrato o simulato
- [ ] feedback UI corretto

### IT-03 - Seconda feature verticale o persistenza

**Obiettivo verificabile**

Il secondo scenario chiave dell'MVP è completo senza ampliare il perimetro.

### IT-04 - Stabilizzazione finale

**Obiettivo verificabile**

Regression pass manuale, docs aggiornate e pacchetto pronto per review finale.

Se mi condividi il contenuto di `docs/spec.md`, posso sostituire "feature A" e "secondo flusso" con iterazioni concrete e coerenti con lo scope reale.

# Rischi o punti da controllare

- se lo spec contiene troppe feature nel MVP, va prima ristretto;
- la tentazione di inserire refactor nascosti dentro una singola iterazione resta alta;
- senza acceptance criteria concreti le review diventano poco affidabili.

# Test manuali suggeriti

- verificare un solo flusso utente completo per iterazione;
- controllare che ogni branch resti leggibile in review;
- confermare che ogni iterazione abbia un criterio di stop chiaro.
