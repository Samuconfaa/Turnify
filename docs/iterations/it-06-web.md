# Iterazione 06

## Obiettivo
Implementare:
1. portale web admin in Next.js,
2. login web riservato ai datori di lavoro,
3. dashboard amministrativa,
4. consultazione dati da API Turnify,
5. configurazione deploy compatibile con VPS.

---

## Regole obbligatorie (NON violare)

- il portale web è solo per admin/datori di lavoro
- non duplicare logica backend nel frontend
- usare API esistenti
- non esporre token o segreti nel client
- mantenere UI essenziale e professionale
- preparare configurazione compatibile con Node su VPS
- non rompere app mobile o API

---

# TASK 1 - Creazione progetto web

## File/aree da creare
- `Turnify.Web/`
- configurazione Next.js
- configurazione TypeScript
- configurazione Tailwind
- layout globale
- pagina login
- pagina dashboard admin

## Cosa fare

1. Creare app Next.js con TypeScript.
2. Configurare Tailwind CSS.
3. Creare struttura pagine admin.
4. Collegare variabili ambiente per URL API.
5. Non inserire credenziali reali.

---

# TASK 2 - Login web admin

## File da creare/modificare
- pagina login web
- servizio client API auth
- gestione token lato browser

## Cosa fare

1. Implementare form email/password.
2. Chiamare endpoint login backend.
3. Accettare solo utenti admin.
4. Reindirizzare alla dashboard dopo login.
5. Mostrare errore se login non valido o utente non autorizzato.

---

# TASK 3 - Dashboard web

## File da creare/modificare
- pagina dashboard
- componenti card riepilogo
- componenti lista ferie/turni/dipendenti
- servizio API condiviso

## Cosa fare

1. Mostrare riepilogo azienda.
2. Mostrare dipendenti, turni e richieste ferie.
3. Gestire loading, errore e sessione scaduta.
4. Rendere l'interfaccia leggibile da desktop.

---

# TASK 4 - Deploy VPS

## File da modificare/creare
- `Turnify.Web/next.config.ts`
- script build/start
- documentazione deploy se necessaria

## Cosa fare

1. Rendere il progetto buildabile in produzione.
2. Verificare compatibilità con Node disponibile su VPS.
3. Evitare dipendenze non necessarie.
4. Documentare variabili richieste.

---

# TASK 5 - Migrazioni EF Core

## File da modificare
- migrazioni manuali in `Turnify.Infrastructure/Migrations`

## Cosa fare

1. Verificare che ogni migrazione manuale abbia file companion necessario.
2. Rendere le migrazioni scopribili dal CLI EF Core.
3. Non modificare schema senza necessità.

---

# OUTPUT ATTESO

- portale web admin creato
- login web funzionante solo per admin
- dashboard web collegata alle API
- configurazione deploy pronta per VPS
- migrazioni EF Core scopribili
- nessun impatto regressivo sul mobile

---

## Nota metodologica

Al termine di questa iterazione, il prompt utilizzato per la richiesta deve essere salvato in `docs/prompt-log.md` secondo le regole di tracciabilità del progetto.
