# Piano breve

1. Confermo i pochi punti ancora aperti che incidono sul perimetro.
2. Produco una bozza di `docs/spec.md` già utile per studenti e agenti.
3. Lascio il dettaglio architetturale e la scomposizione in iterazioni al passaggio successivo.

# File da creare o modificare

- `docs/spec.md`

# Implementazione richiesta

Prima di salvare la versione finale, ho ancora 2 chiarimenti utili:

1. Le foto delle ricette nell'MVP devono essere:
   A. Solo selezionate dalla galleria
   B. Caricate anche da fotocamera
   C. Facoltative
   D. Altro: [specifica]

2. Il piano pasti settimanale nell'MVP deve supportare:
   A. Solo assegnazione ricetta-giorno
   B. Assegnazione + note
   C. Assegnazione + lista spesa derivata
   D. Altro: [specifica]

Con le informazioni già disponibili, questa è una bozza coerente di `docs/spec.md`.

```markdown
# Specifica di Progetto - Recipe Organizer

## 1. Visione e contesto

### Problema da risolvere
Consentire a uno studente o a un utente domestico di raccogliere ricette personali, trovarle rapidamente e pianificare i pasti settimanali senza dipendere da servizi esterni o login.

### Obiettivo del progetto
Realizzare una app `.NET MAUI` Android-first per gestire ricette personali con categorie, foto, ricerca locale e pianificazione settimanale semplice.

### Utenti target
- Studenti o utenti singoli che organizzano i propri pasti.
- Utilizzo personale, ricorrente, prevalentemente da smartphone Android.

## 2. Ambito MVP

### Flusso principale da supportare
Creare o modificare una ricetta, assegnarle categorie e foto, ritrovarla con ricerca locale e inserirla nel piano pasti settimanale.

### Funzionalità obbligatorie
- Creazione, modifica, visualizzazione ed eliminazione di ricette personali.
- Gestione categorie.
- Associazione foto alla ricetta.
- Ricerca locale per nome e categoria.
- Piano pasti settimanale con associazione ricetta-giorno.

### Funzionalità opzionali future
- Lista della spesa derivata dal piano pasti.
- Esportazione o condivisione ricette.
- Supporto iOS rifinito e validato.
- Sincronizzazione cloud.

### Non-obiettivi
- Login e account nella prima versione.
- Collaborazione multiutente.
- Suggerimenti AI o nutrizionali avanzati.

## 3. Scenari d'uso principali

### Scenario 1
Come utente, voglio aggiungere una nuova ricetta con categoria e foto così da conservarla in modo ordinato.

### Scenario 2
Come utente, voglio cercare rapidamente una ricetta già salvata e inserirla nel piano pasti settimanale.

## 4. Requisiti funzionali

- FR-01: l'utente può creare, modificare e cancellare ricette personali.
- FR-02: ogni ricetta può avere titolo, ingredienti, passaggi, una o più categorie e almeno una foto opzionale.
- FR-03: l'utente può filtrare o cercare ricette localmente per testo e categoria.
- FR-04: l'utente può assegnare una ricetta a uno o più giorni della settimana.
- FR-05: l'app deve preservare i dati localmente tra una sessione e l'altra.

## 5. Epic, user stories e criteri di accettazione

### EPIC-01 - Gestione ricette

**Obiettivo:**
Permettere all'utente di mantenere un archivio personale di ricette.

**User stories:**
- Come utente, voglio inserire una ricetta così da poterla consultare in seguito.
- Come utente, voglio modificare una ricetta così da correggere ingredienti o istruzioni.

**Criteri di accettazione:**
- [ ] Una nuova ricetta salvata compare nell'elenco senza riavviare l'app.
- [ ] Se il salvataggio fallisce, l'interfaccia mostra uno stato di errore comprensibile.
- [ ] Se non esistono ricette, l'app mostra uno stato empty esplicito.

### EPIC-02 - Ricerca e classificazione

**Obiettivo:**
Ritrovare velocemente ricette già archiviate.

**User stories:**
- Come utente, voglio cercare per nome così da trovare una ricetta in pochi secondi.
- Come utente, voglio filtrare per categoria così da ridurre il numero di risultati.

**Criteri di accettazione:**
- [ ] La ricerca aggiorna i risultati locali in modo coerente con il testo inserito.
- [ ] Se non ci sono risultati, l'app mostra uno stato empty e non una lista vuota ambigua.

### EPIC-03 - Piano pasti settimanale

**Obiettivo:**
Associare ricette ai giorni della settimana.

**User stories:**
- Come utente, voglio pianificare i pasti della settimana così da organizzarmi in anticipo.

**Criteri di accettazione:**
- [ ] L'utente può assegnare almeno una ricetta a un giorno specifico.
- [ ] Se il caricamento del piano richiede accesso ai dati locali, la schermata espone stati loading, success, empty o error.

## 6. Requisiti non funzionali

### UX e stati UI
- Ogni schermata di elenco o dettaglio dati deve rendere espliciti loading, empty, success ed error quando applicabili.
- Un nuovo utente deve poter creare una ricetta entro pochi passaggi senza formazione esterna.

### Prestazioni percepite
- La ricerca locale deve restituire feedback percepibile immediato su dataset personali di dimensione tipica.

### Affidabilità e gestione errori
- Errori di lettura o scrittura locale non devono lasciare la UI bloccata.

### Privacy e dati
- Nessun login nell'MVP.
- Dati archiviati localmente sul dispositivo.

## 7. Vincoli tecnici di progetto

- App `.NET MAUI`
- MVVM
- Shell navigation
- `CommunityToolkit.Mvvm`
- `Preferences` e/o SQLite per persistenza locale
- Android come target principale
- iOS opzionale, non obiettivo di parità funzionale nell'MVP

## 8. Metriche di successo

- L'utente riesce a creare una ricetta e inserirla nel piano pasti senza supporto esterno.
- Le funzioni di ricerca e filtro permettono di trovare una ricetta in pochi secondi in una collezione personale realistica.

## 9. Rischi, dipendenze e questioni aperte

### Rischi
- Gestione immagini può ampliare il lavoro oltre l'MVP.

### Dipendenze
- Persistenza locale coerente con il volume dati effettivo.

### Questioni aperte o `TBD`
- Modalità esatta di acquisizione foto.
- Eventuale generazione di lista spesa dal piano pasti.

## 10. Passaggio al planning

Il prossimo passo è derivare `docs/plan.md`, `docs/architecture.md` e `docs/test-matrix.md` con `prd-to-plan`.
```

# Rischi o punti da controllare

- Le foto possono spostare rapidamente il progetto verso dettagli tecnici non ancora definiti.
- Il piano pasti rischia di espandersi in lista spesa, notifiche e analytics se non resta contenuto.

# Test manuali suggeriti

- Verificare che ogni epic resti nel perimetro MVP.
- Controllare che i non-obiettivi escludano davvero login e sincronizzazione.
- Rivedere se gli stati loading, empty ed error sono citati nei flussi dove servono.
