# UI/UX Design — Turnify

**Versione:** 1.0  
**Target:** App mobile .NET MAUI (iOS + Android)  
**Filosofia:** Semplice, veloce, professionale. Zero apprendimento necessario.

---

## 1. Palette Colori

### Colori Principali

| Nome | Hex | Uso |
|---|---|---|
| **Primary Blue** | `#2563EB` | CTA principali, accenti, icone attive |
| **Primary Dark** | `#1D4ED8` | Hover / pressed states |
| **Success Green** | `#16A34A` | Turni confermati, approvazioni |
| **Warning Amber** | `#D97706` | Richieste pendenti, avvisi |
| **Danger Red** | `#DC2626` | Errori, rifiuti, cancellazioni |
| **Neutral Gray** | `#6B7280` | Testi secondari, icone inattive |

### Background e Surface (Light Mode)

| Nome | Hex | Uso |
|---|---|---|
| `Background` | `#F9FAFB` | Sfondo principale |
| `Surface` | `#FFFFFF` | Card, modal, bottom sheet |
| `Surface2` | `#F3F4F6` | Input fields, divisori |
| `Border` | `#E5E7EB` | Bordi card e separatori |
| `Text Primary` | `#111827` | Testo principale |
| `Text Secondary` | `#6B7280` | Sottotitoli, placeholder |

### Dark Mode

| Nome | Hex | Uso |
|---|---|---|
| `Background` | `#111827` | Sfondo principale |
| `Surface` | `#1F2937` | Card, modal |
| `Surface2` | `#374151` | Input fields |
| `Border` | `#374151` | Bordi |
| `Text Primary` | `#F9FAFB` | Testo principale |
| `Text Secondary` | `#9CA3AF` | Testi secondari |

I colori Primary, Success, Warning, Danger restano identici in dark mode per consistenza.

---

## 2. Tipografia

| Stile | Font | Dimensione | Peso |
|---|---|---|---|
| Heading H1 | System (SF Pro / Roboto) | 24sp | Bold (700) |
| Heading H2 | System | 20sp | SemiBold (600) |
| Heading H3 | System | 17sp | SemiBold (600) |
| Body | System | 15sp | Regular (400) |
| Body Small | System | 13sp | Regular (400) |
| Caption | System | 12sp | Regular (400) |
| Button | System | 15sp | SemiBold (600) |
| Label | System | 13sp | Medium (500) |

Si usa il font di sistema (SF Pro su iOS, Roboto su Android) per massima leggibilità e performance.

---

## 3. Navigazione — Tab Bar

L'app usa una **bottom tab bar** con 4-5 voci, differente per ruolo.

### Tab Bar — Dipendente (4 tab)
```
┌─────────┬──────────┬───────────┬──────────┐
│  Turni  │  Ferie   │  Notifiche │ Profilo  │
│  (🗓️)   │  (🏖️)   │   (🔔)    │  (👤)   │
└─────────┴──────────┴───────────┴──────────┘
```

### Tab Bar — Admin (5 tab)
```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│Dashboard │  Turni   │  Team    │  Ferie   │Impostaz. │
│  (📊)   │  (🗓️)   │  (👥)   │  (🏖️)  │  (⚙️)   │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 4. Schermate Principali

---

### 4.1 Schermata Login

**Layout:** Logo centrato, form sotto, link "Password dimenticata"

```
┌────────────────────────────┐
│                            │
│       [LOGO TURNIFY]       │
│    Gestisci il tuo team    │
│                            │
│  ┌──────────────────────┐  │
│  │  Email               │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │  Password        👁️  │  │
│  └──────────────────────┘  │
│                            │
│  [      ACCEDI      ]      │
│                            │
│   Password dimenticata?    │
│   Non hai un account?      │
│   Registra la tua azienda  │
└────────────────────────────┘
```

**UX note:**
- Tastiera numerica per email quando appropriato
- Toggle visibilità password
- Feedback di errore inline (non popup)
- Tasto accedi disabilitato se campi vuoti

---

### 4.2 Dashboard Admin

```
┌────────────────────────────┐
│ 👋 Ciao, Mario!    🔔 (3) │
│ Pizzeria Roma · Giugno 24  │
├────────────────────────────┤
│ ┌──────────┐ ┌──────────┐  │
│ │ 12 👥   │ │ 45 📅   │  │
│ │Dipendenti│ │Turni sett│  │
│ └──────────┘ └──────────┘  │
│ ┌──────────┐ ┌──────────┐  │
│ │  3 🏖️   │ │ 720h ⏱️ │  │
│ │Ferie pend│ │Ore totali│  │
│ └──────────┘ └──────────┘  │
├────────────────────────────┤
│ TURNI OGGI                 │
│ ┌──────────────────────┐   │
│ │ Luigi V. · 8:00-16:00│   │
│ │ Anna M.  · 12:00-20:00│  │
│ │ + altri 6...         │   │
│ └──────────────────────┘   │
├────────────────────────────┤
│ RICHIESTE PENDENTI         │
│ ┌──────────────────────┐   │
│ │ Marco R. · 1-14 Lug  │   │
│ │ [Approva] [Rifiuta]  │   │
│ └──────────────────────┘   │
└────────────────────────────┘
```

---

### 4.3 Calendario Turni (Admin)

Vista settimanale con colonne per dipendente o per giorno (toggle).

```
┌────────────────────────────┐
│ ← Giugno 2024  →    [+]   │
│ [Sett.] [Mese]             │
├────────────────────────────┤
│ LUN 10 │ MAR 11 │ MER 12  │
├────────┼─────────┼─────────┤
│ Luigi  │         │  Luigi  │
│ 8-16   │         │  8-16   │
│────────│─────────│─────────│
│ Anna   │  Anna   │         │
│ 12-20  │  9-17   │         │
│────────│─────────│─────────│
│ Marco  │         │  Marco  │
│ 7-15   │         │  14-22  │
└────────────────────────────┘
```

**Interazioni:**
- Tap su turno: vedi dettagli e modifica
- Tap su slot vuoto: creazione rapida turno
- Swipe orizzontale: settimana precedente/successiva
- Long press su turno: opzioni rapide (copia, elimina)

---

### 4.4 Calendario Personale (Dipendente)

Vista semplificata con solo i propri turni.

```
┌────────────────────────────┐
│ I miei turni · Giugno 2024 │
├────────────────────────────┤
│ LUN  MAR  MER  GIO  VEN    │
│  10   11   12   13   14    │
│  🟦        🟦        🟦   │
├────────────────────────────┤
│ Prossimi turni:            │
│                            │
│ ┌──────────────────────┐   │
│ │ 📅 Lun 10 Giu        │   │
│ │    8:00 → 16:00      │   │
│ │    Turno Pranzo      │   │
│ └──────────────────────┘   │
│ ┌──────────────────────┐   │
│ │ 📅 Mer 12 Giu        │   │
│ │    8:00 → 16:00      │   │
│ └──────────────────────┘   │
└────────────────────────────┘
```

---

### 4.5 Form Richiesta Ferie

```
┌────────────────────────────┐
│ ← Richiesta Ferie          │
├────────────────────────────┤
│ Tipo richiesta             │
│ ○ Ferie  ○ Permesso  ○ Altro│
│                            │
│ Data inizio                │
│ ┌──────────────────────┐   │
│ │ 01/07/2024     📅   │   │
│ └──────────────────────┘   │
│                            │
│ Data fine                  │
│ ┌──────────────────────┐   │
│ │ 14/07/2024     📅   │   │
│ └──────────────────────┘   │
│                            │
│ Giorni: 10 giorni lavorativi│
│                            │
│ Motivazione (opzionale)    │
│ ┌──────────────────────┐   │
│ │                      │   │
│ │                      │   │
│ └──────────────────────┘   │
│                            │
│    [  INVIA RICHIESTA  ]   │
└────────────────────────────┘
```

---

### 4.6 Profilo Utente

Informazioni personali, preferenze notifiche, cambio password, logout.

---

## 5. Componenti UI Riutilizzabili

| Componente | Descrizione |
|---|---|
| `ShiftCard` | Card turno con nome, orario, status badge |
| `EmployeeAvatar` | Avatar con iniziali o foto, badge status |
| `StatusBadge` | Badge colorato per status (Scheduled, Approved, ecc.) |
| `DateRangePicker` | Selettore date con validazione |
| `EmptyState` | Illustrazione + testo per liste vuote |
| `LoadingOverlay` | Spinner centrato con background semi-trasparente |
| `ConfirmDialog` | Dialog di conferma azioni distruttive |
| `SnackBar` | Notifica toast in basso (successo/errore) |

---

## 6. Principi UX

**Velocità:** L'admin deve poter creare un turno in meno di 30 secondi. Il dipendente deve trovare il proprio orario del giorno in meno di 5 secondi dall'apertura dell'app.

**Chiarezza:** Usare colori semantici consistenti. Verde = confermato/approvato. Ambra = in attesa. Rosso = cancellato/rifiutato. Blu = programmato.

**Feedback immediato:** Ogni azione deve avere un feedback visivo (loading state, successo, errore) entro 200ms.

**Gestione errori umana:** I messaggi di errore devono essere in italiano chiaro, spiegare cosa è successo e cosa fare. Mai mostrare errori tecnici all'utente finale.

**Azioni distruttive protette:** Eliminazione turni e rifiuto ferie richiedono sempre conferma esplicita.

---

## 7. Accessibilità

- Font size minimo: 13sp (Caption), 15sp per testo body
- Contrasto minimo: 4.5:1 (testo normale), 3:1 (testo grande) — WCAG AA
- Tutti gli elementi interattivi hanno label accessibile per screen reader
- Touch target minimo: 44×44 dp
- Supporto Dynamic Type (iOS) e font scaling (Android)
- Non basarsi solo sul colore per comunicare stato (usa anche icona o testo)
