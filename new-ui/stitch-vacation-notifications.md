# Stitch Prompt — Turnify Mobile UI
## Screens: VacationListPage + NotificationsPage

---

## Design System

Use the following color tokens for every element. Do NOT invent new colors.

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#006948` | buttons, active pills, accents |
| `primary-container` | `#00855D` | avatar backgrounds |
| `on-primary-container` | `#F5FFF7` | text on primary-container |
| `primary-light` | `#D1FAE5` | light tint surfaces |
| `header-gradient-start` | `#064E3B` | gradient header left/top |
| `header-gradient-end` | `#115E59` | gradient header right/bottom |
| `surface` | `#F5FBF5` | card backgrounds |
| `surface-container-low` | `#EFF5EF` | chip inactive, subtle surfaces |
| `surface-container` | `#E9EFE9` | toggle background |
| `on-background` | `#191C1A` | primary text |
| `on-surface-variant` | `#404943` | secondary text |
| `outline` | `#6F796E` | muted text, borders |
| `outline-variant` | `#BEC9BD` | dividers, card borders |
| `success` | `#1B6C37` | approve action |
| `success-light` | `#DDFBE8` | approved status background |
| `success-text` | `#1B6C37` | approved status text |
| `warning` | `#7A5900` | pending status |
| `warning-light` | `#FFEFD5` | pending status background |
| `warning-text` | `#7A5900` | pending status text |
| `error` | `#BA1A1A` | reject action, refused status |
| `error-light` | `#FFDAD6` | refused status background |
| `error-text` | `#BA1A1A` | refused status text |
| `secondary` | `#006B5E` | secondary gradient end on profile |
| `secondary-container` | `#99EFE5` | quick action teal |

**Typography**: Use Inter or a clean sans-serif. Weights: Regular (400), SemiBold (600), Bold (700), ExtraBold (800).

**Icons**: Use Material Symbols Outlined everywhere. No emoji.

**Corner radii**: cards 18–20dp, chips 99dp (fully rounded), buttons 12dp, bottom sheet top corners 28dp.

---

## Screen 1 — Vacation List Page (`lista_ferie`)

**Description**: List of vacation/leave requests. Two modes: Admin (sees all employees, can approve/reject) and Employee (sees own requests, can submit new ones). Header is a gradient banner like the other app pages.

### Layout

**Top section — Gradient Header**

Full-width horizontal gradient (`header-gradient-start` → `header-gradient-end`). Padding 20dp sides, 54dp top, 16dp bottom.

Contents (vertical stack inside header):
- Row 1: title "Ferie e Permessi" — white, 26sp, ExtraBold, letter-spacing -0.8
- Row 2 (employee mode only): pill button "+ Richiedi" — `primary` background, white text 13sp Bold, corner radius 22dp, aligned to the right

**Section below header — Filter chips (horizontal scrollable row)**

Padding 20dp sides, 12dp top. Single row of 4 chips:
1. "Tutte" — active state: `primary` background, white text; inactive: `surface-container-low` background, `outline-variant` border, `on-surface-variant` text
2. "In Attesa" — same active/inactive pattern
3. "Approvate" — same
4. "Rifiutate" — same

Show chip 1 ("Tutte") as active in the mockup.

**Main list — Request cards**

Each card is a `SwipeView` container (show as a normal card — swipe actions are not rendered in static mockup). Card structure:

```
┌─────────────────────────────────────────────────────┐
│ ▌ [left color bar 4dp wide, color = status color]   │
│   [Employee avatar circle 36dp — primary-light bg,  │
│    initials in primary, Bold] [Employee name 14sp]  │
│   [Type label 14sp Bold "Ferie"]  [Status chip →]   │
│   [Date range 12sp "12 mag — 16 mag 2025"]          │
│   [Days chip "4 giorni lavorativi" SurfaceContainerLow]│
│   [Review note banner — WarningLight, if present]   │
│   [Admin: Modifica | Approva | Rifiuta buttons]      │
│   [Employee: "Annulla richiesta" outline red button] │
└─────────────────────────────────────────────────────┘
```

Left bar colors:
- Pending → `warning` (#7A5900)
- Approved → `success` (#1B6C37)
- Rejected → `error` (#BA1A1A)

Status chip colors:
- "In attesa" → `warning-light` bg, `warning-text` text
- "Approvata" → `success-light` bg, `success-text` text
- "Rifiutata" → `error-light` bg, `error-text` text

Admin buttons (3 columns):
- "Modifica" — transparent bg, `primary` text, `primary` border 1.5dp, corner 9dp
- "Approva" — `success` background, white text, corner 9dp
- "Rifiuta" — transparent bg, `error` text, `error` border 1.5dp, corner 9dp

**Show in mockup:**
- Admin view
- 3 cards: one "In Attesa" (with Approva/Rifiuta buttons), one "Approvata", one "Rifiutata"
- Avatar initials for each employee

---

### Bottom Sheet Overlay — New Request Form

Show this as a second frame/state of the screen: "Employee — New Request".

**Dimmed overlay**: `rgba(0,0,0,0.5)` full screen behind sheet.

**Bottom sheet**: white (`surface`), rounded top corners 28dp, shadow upward. Padding 24dp sides, 36dp bottom.

Contents (vertical stack):
- Drag handle: 4dp tall, 40dp wide, `outline-variant`, centered, margin 14dp top
- Title "Nuova Richiesta" 20sp ExtraBold + ✕ close button (icon) top right
- Label "TIPO RICHIESTA" 10sp uppercase `primary` — Picker dropdown (field border style: `surface-container-low` bg, radius 12dp)
- Two date pickers side by side: "INIZIO" | "FINE" (same field border style)
- Days preview chip: "4 giorni lavorativi" — `success-light` bg, `success` border, `success-text`, centered pill
- Label "MOTIVO (OPZIONALE)" — multi-line text input (same field style, min height 76dp)
- CTA button "Invia Richiesta" — `primary` background, white text, full width, radius 12dp, subtle shadow

---

## Screen 2 — Notifications Page (`notifiche`)

**Description**: Feed of in-app notifications. Shows unread count badge. "Segna tutte lette" action top right. Cards have an unread dot indicator.

### Layout

**Top section — Gradient Header**

Same horizontal gradient as other pages (`header-gradient-start` → `header-gradient-end`). Padding 20dp sides, 54dp top, 16dp bottom.

Contents (single row, space-between):
- Left: title "Notifiche" white 24sp ExtraBold + unread count pill ("3 non lette") — `primary-light` background, `primary` text, corner 12dp. Place pill immediately after the title text.
- Right: text link "Segna tutte lette" — white text 13sp SemiBold (visible only when there are unread notifications)

**Notification cards list**

No horizontal margin (cards go edge-to-edge with 12dp side margin). Vertical gap 4dp between cards.

Card structure:
```
┌─────────────────────────────────────────────────────┐
│  [Icon circle 44dp]  [Title 14sp Bold        ] [●]  │
│                      [Body 13sp Regular           ]  │
│                      [Time "2 ore fa" 11sp muted  ]  │
└─────────────────────────────────────────────────────┘
```

Unread card background: `#F0FDF4` (very light green tint).
Read card background: `surface` (`#F5FBF5`).
Unread dot (●): 8dp circle, `primary` color, top-right corner, hidden when read.

Icon circle backgrounds by notification type:
| Type | Icon (Material Symbols) | Circle bg |
|---|---|---|
| Shift assigned | `calendar_month` | `primary-light` |
| Vacation approved | `check_circle` | `success-light` |
| Vacation rejected | `cancel` | `error-light` |
| Shift swap | `swap_horiz` | `secondary-container` |
| Generic | `notifications` | `surface-container-low` |

**Show in mockup — 5 notification cards:**
1. Unread — shift assigned: "Turno assegnato" / "Domenica 11 mag, 09:00–17:00" / "5 minuti fa"
2. Unread — vacation approved: "Ferie approvate" / "La tua richiesta 12–16 mag è stata approvata" / "1 ora fa"
3. Unread — vacation rejected: "Ferie rifiutate" / "La richiesta 20–22 mag è stata rifiutata" / "3 ore fa"
4. Read — shift swap: "Scambio turno" / "Mario ha accettato lo scambio del 15 mag" / "Ieri"
5. Read — generic: "Promemoria turno" / "Domani hai un turno dalle 08:00" / "2 giorni fa"

**Empty state** (second frame: "Nessuna notifica"):
- Centered icon box 68×68dp, `surface` bg, `bell` Material Symbol 34dp
- Title "Nessuna notifica" 18sp Bold
- Subtitle "Le notifiche sui tuoi turni e ferie appariranno qui." 14sp Regular centered

---

## General UI Rules

- `Shell.NavBarIsVisible = False` on both pages — use the custom gradient header, no system nav bar
- All interactive elements (buttons, chips, cards) have subtle shadows: offset (0,4), blur 14dp, black 6% opacity
- Use `Inter` or `Plus Jakarta Sans` typeface throughout
- All text in gradient headers is white
- Spacing between list items: 8–10dp
- Section labels (above form fields): 10sp, Bold, uppercase, `primary` color, letter-spacing 0.8
- Form field borders: `surface-container-low` background, `outline-variant` border 1dp, corner radius 12dp, height 48dp

---

## Deliverables

Generate **3 frames** total:
1. `lista_ferie` — Vacation list, Admin mode, 3 cards visible (In Attesa / Approvata / Rifiutata)
2. `lista_ferie_nuova_richiesta` — Vacation list, Employee mode, bottom sheet "Nuova Richiesta" open
3. `notifiche` — Notifications page, 5 cards (3 unread + 2 read), header with unread badge

Each frame: mobile (390×844dp), light mode only.
