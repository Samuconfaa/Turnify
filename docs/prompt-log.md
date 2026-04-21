# Prompt Log — Turnify

Storico dei prompt usati con AI assistant durante la progettazione e sviluppo di Turnify.

---

## Formato

| Campo | Descrizione |
|---|---|
| **Data** | Data di utilizzo del prompt |
| **Obiettivo** | Cosa si voleva ottenere |
| **Prompt** | Testo del prompt usato |
| **Output ottenuto** | Descrizione del risultato |
| **Qualità (1-5)** | Valutazione del risultato |
| **Note** | Miglioramenti, varianti, follow-up |

---

## Log

---

### #001 — Documentazione Iniziale Progetto

| | |
|---|---|
| **Data** | 2024-06-01 |
| **Obiettivo** | Generare tutta la documentazione iniziale del progetto Turnify |
| **Prompt** | Prompt completo da `shift_flow_project_brief_for_ai.md` — generazione struttura completa README, AGENTS, spec, plan, architecture, database, api-design, ui-ux, security, deployment, test-matrix, iterations |
| **Output ottenuto** | Struttura completa con 14 file markdown professionali, coerenti tra loro, pronti per portfolio |
| **Qualità** | ⭐⭐⭐⭐⭐ |
| **Note** | Prima iterazione già di alta qualità. Tutti i file generati in un'unica sessione. |

---

<!-- Template per nuovi prompt:

### #00X — [Titolo Breve]

| | |
|---|---|
| **Data** | YYYY-MM-DD |
| **Obiettivo** | |
| **Prompt** | |
| **Output ottenuto** | |
| **Qualità** | ⭐ (1-5) |
| **Note** | |

-->

---

## Convenzioni per Prompt Efficaci

Alcune linee guida emerse dall'uso di AI su questo progetto:

**Sii specifico sul contesto:** Fornire sempre il brief completo del progetto all'AI, non solo la singola richiesta. Risultati significativamente migliori.

**Specifica il formato output:** "Restituisci un file markdown con heading H2 per ogni sezione" produce output più coerente di una richiesta generica.

**Itera per sezione:** Per file molto lunghi (>200 righe), meglio richiedere una sezione alla volta con contesto dell'intero documento.

**Critica e chiedi miglioramenti:** "Questa sezione sembra generica, rendila più specifica per un'app di gestione turni per pizzerie italiane" migliora notevolmente il risultato.

**Coerenza cross-file:** Inizia sempre la sessione condividendo i file già esistenti, così l'AI mantiene coerenza (nomi tabelle, endpoint, ruoli, ecc.).
