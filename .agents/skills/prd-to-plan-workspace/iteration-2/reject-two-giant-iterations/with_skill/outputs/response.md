# Piano breve

No: due iterazioni del tipo "costruisco tutto" e "poi rifinisco" sono troppo grandi per review, test e correzioni progressive. Ti propongo un `docs/plan.md` più controllato e didattico, mantenendo il focus su slice verificabili.

# File da creare o modificare

- `docs/plan.md`

# Implementazione richiesta

## Perché due iterazioni sono rischiose

- Rendono difficile capire dove nasce un problema: UI, ViewModel, servizi, navigazione o persistenza finiscono tutti nello stesso blocco.
- Spostano test e review troppo tardi, quando correggere regressioni costa di più.
- Producono branch e pull request troppo grandi per un workflow Man-in-the-Loop.

## `docs/plan.md`

| Iterazione | Obiettivo verificabile | Dipendenze | Rischio | Stato |
| --- | --- | --- | --- | --- |
| IT-01 | Fondazioni MAUI, Shell e struttura MVVM | nessuna | medio | pianificata |
| IT-02 | Primo flusso utente principale end-to-end senza persistenza | IT-01 | medio | pianificata |
| IT-03 | Secondo flusso o dettaglio dati con gestione stati UI completa | IT-02 | medio | pianificata |
| IT-04 | Persistenza locale / salvataggi / recupero stato | IT-02 | medio | pianificata |
| IT-05 | Test di regressione, documentazione e chiusura MVP | IT-01..IT-04 | basso | pianificata |

### IT-01 - Fondazioni

- In scope: Shell, cartelle, DI base, pagina iniziale.
- Out of scope: feature complete, persistenza.
- Criteri di accettazione:
  - [ ] La app si avvia nella route corretta.
  - [ ] Esiste una struttura coerente View/ViewModel/Service.

### IT-02 - Primo scenario utente completo

- In scope: scenario MVP minimo dalla schermata principale al primo risultato utile.
- Criteri di accettazione:
  - [ ] Lo scenario principale è eseguibile manualmente.
  - [ ] Loading/error/empty/success sono previsti.

### IT-03 - Estensione scenario

- In scope: dettaglio, navigazione o funzionalità complementare.
- Criteri di accettazione:
  - [ ] La navigazione è verificabile.
  - [ ] Il secondo scenario non rompe il primo.

### IT-04 - Persistenza

- In scope: salvataggio locale e recupero.
- Criteri di accettazione:
  - [ ] I dati persistono al riavvio.

### IT-05 - Stabilizzazione

- In scope: test matrix aggiornata, docs, review finale, branch/commit guidance.

# Rischi o punti da controllare

- Se lo spec contiene feature molto eterogenee, potresti dover aumentare ancora la granularità.
- Evita PR che mescolano setup architetturale, feature UI e persistenza nella stessa review.

# Test manuali suggeriti

- Verifica di ogni iterazione con uno scenario distinto prima di passare alla successiva.
- Review del branch a fine IT-02 e IT-04 per contenere la dimensione delle modifiche.
