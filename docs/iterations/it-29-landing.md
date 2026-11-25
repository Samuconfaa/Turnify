# Iterazione 29 (Web) — Landing page turniup.it

### Data
2026-06-02

### Commit
TBD

### Obiettivo
Creare una landing page marketing statica servita da nginx alla root `turniup.it/`, con sezioni hero, feature, come funziona e CTA finale. Il portale Next.js continua a girare su `turniup.it/dashboard` (basePath invariato).

### Piano
1. Leggere il prototipo HTML da `src/Turnify.Web/UI/PaginaIniziale/Turnify Landing.html`
2. Produrre `landing/index.html` a partire dal prototipo, con:
   - Tweaks panel rimosso (componente solo dev)
   - Colori fissati ai default dei TWEAK_DEFAULTS (accento `#10b981`/`#0ea5a3`, bg Ardesia `#101521`)
   - Tutti i link login → `/dashboard/login`
   - Social proof strip aggiunta (mancava nell'HTML originale)
3. Posizionare il file in `landing/` alla root del repo (non dentro `src/Turnify.Web/public` che eredita il basePath)
4. Su VPS: copiare `landing/index.html` in `/var/www/turnify/landing/` e configurare nginx per servire `/` da lì

### File creati/modificati
- `landing/index.html` — pagina marketing statica (superseded dalla versione Next.js)
- `src/Turnify.Web/next.config.mjs` — rimosso `basePath: '/dashboard'`
- `src/Turnify.Web/middleware.ts` — aggiunto handler per `/`, `/register`, `/termini`, `/privacy`, `/cookie`
- `src/Turnify.Web/app/page.tsx` — landing page Next.js con design system dashboard
- `src/Turnify.Web/app/globals.css` — sezione `.lp` con dashboard design tokens + `.lp-legal` per pagine legali
- `src/Turnify.Web/app/register/page.tsx` — pagina di registrazione (form + integrazione API)
- `src/Turnify.Web/app/termini/page.tsx` — Termini di Servizio GDPR
- `src/Turnify.Web/app/privacy/page.tsx` — Privacy Policy GDPR
- `src/Turnify.Web/app/cookie/page.tsx` — Cookie Policy
- `src/Turnify.Web/lib/auth.ts` — aggiunta funzione `register()`
- `src/Turnify.Web/app/login/page.tsx` — rimossi stats finti, collegato "Registrati gratis" → `/register`

### Note tecniche
- basePath rimosso → Next.js gestisce direttamente la root `/`
- nginx `location /` → proxy pass tutto a Next.js tranne `/api`
- `isPublicPage` in middleware consente accesso a `/register`, `/termini`, `/privacy`, `/cookie` senza sessione
- Pagine legali: layout landing (navbar + footer) con classe `.lp-legal` per body del documento
- Stats false (3.200+, 98%, 4.9★) rimossi sia dalla landing che dalla sidebar login

### Prompt principali utilizzati
- "dammi il prompt da passare a claude design per fare la grafica"
- "trovi la grafica in Turnify.Mobile/UI/PaginaIniziale" → implementa la pagina
- "la grafica della landing non mi piace, è troppo diversa da quella della gestione" → refactor con design tokens dashboard
- "rendi utilizzabili tutti i pulsanti, aggiungi pagina registrazione, rimuovi dati finti, rinomina Turnify→TurniUp, crea pagine GDPR"
