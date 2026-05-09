# Iterazioni applicative Turnify

Questa cartella contiene i log delle iterazioni di sviluppo definite in `docs/plan.md`.
La naming convention usa il prefisso `it-NN-` seguito da un suffisso descrittivo.

## File presenti

- `it-01-bootstrap.md` — Setup soluzione, dominio, backend core (JWT, EF Core, MySQL)
- `it-02-maui-login.md` — Fondamenta MAUI: Shell, LoginPage, test unitari
- `it-03-api-admin.md` — Espansione API, feature mobile admin (dipendenti, business, ferie)
- `it-04-gdpr-onboard.md` — GDPR consent, onboarding, push notification FCM
- `it-05-redesign.md` — Redesign UI, timbratura presenze, ricorrenza turni, allineamento MVVM
- `it-06-web.md` — Portale web admin Next.js
- `it-07-production.md` — Production-readiness: reportistica, rate limiter, email
- `it-08-security.md` — Sicurezza, FluentValidation, error reporting, 122 test
- `it-09-username.md` — Login dipendente con username
- `it-10-calendar.md` — UX liste, report ore dipendenti, calendario avanzato
- `it-11-gaps.md` — Gap architetturali MVVM post-audit
- `it-12-session-ferie.md` — Sessione persistente, saldo ferie, codice invito
- `it-13-swap-coverage.md` — Swap turni, copertura dashboard, disponibilità calendario
- `it-14-caching.md` — Caching locale SQLite, pattern stale-while-revalidate
- `it-15-ui-redesign.md` — Redesign UI "Tropic Burst": palette colori, 26 icone SVG, conversione 11 pagine XAML
- `it-16-test-fixes.md` — Fix 8 test falliti pre-esistenti, copertura nuovi servizi (232 test totali)
- `it-17-dark-theme.md` — Tema scuro "Deep Forest" con AppThemeBinding, 527 sostituzioni in 27 view
- `it-18-fcm-badge.md` — Integrazione Firebase Cloud Messaging, badge notifiche real-time, rimozione codice morto
- `it-19-pagination-warnings.md` — Paginazione server-side API, infinite scroll MAUI, fix warning build
- `it-20-session-fix.md` — Fix sessione persistente al riavvio app
