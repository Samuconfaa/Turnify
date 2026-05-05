# Turnify — UI Redesign Spec for Google Stitch
**Palette:** Tropic Burst  
**Target platform:** Mobile (iOS + Android, .NET MAUI)  
**Design language:** Bold gradients, real photographic/illustrated icons (PNG/SVG from icon libraries — NO emoji), high-saturation card colors, rounded corners (20–28 dp), Plus Jakarta Sans typeface.

---

## 1. Design Tokens

### Colors
| Token | Value | Usage |
|---|---|---|
| `Primary` | `#059669` | Buttons, active states, borders |
| `PrimaryLight` | `#D1FAE5` | Chip/badge backgrounds |
| `PrimaryDark` | `#064E3B` | Header gradient start |
| `PrimaryMid` | `#0F766E` | Header gradient end |
| `Accent` | `#FBBF24` | Warning badges, secondary CTA |
| `AccentLight` | `#FEF3C7` | Warning chip backgrounds |
| `Danger` | `#F43F5E` | Error states, reject buttons |
| `DangerLight` | `#FFE4E6` | Error chip backgrounds |
| `Info` | `#0EA5E9` | Info badges, 4th KPI card |
| `InfoLight` | `#E0F2FE` | Info chip backgrounds |
| `Background` | `#F0FDF4` | Page background (green-tinted white) |
| `Surface` | `#FFFFFF` | Card backgrounds |
| `OnBackground` | `#052E16` | Primary text |
| `OnSurfaceVariant` | `#374151` | Secondary text |
| `Outline` | `#9CA3AF` | Borders, muted text |
| `OutlineVariant` | `#D1FAE5` | Dividers, subtle borders |

### KPI Card Gradients (4 cards)
| Card | Gradient From | Gradient To | Icon |
|---|---|---|---|
| Dipendenti (attivi) | `#059669` | `#34D399` | `users-group.png` — illustrated icon of 3 people silhouettes, white on green |
| Turni (questa settimana) | `#FBBF24` | `#FDE68A` | `calendar-check.png` — calendar icon with checkmark, dark amber on yellow |
| Ferie (in attesa) | `#F43F5E` | `#FB7185` | `beach-umbrella.png` — palm/beach umbrella illustration, white on coral |
| Ore (questa settimana) | `#0EA5E9` | `#7DD3FC` | `clock-timer.png` — stopwatch/clock illustration, white on sky blue |

### Typography
| Style | Font | Size | Weight |
|---|---|---|---|
| Heading XL | Plus Jakarta Sans | 26sp | ExtraBold |
| Heading L | Plus Jakarta Sans | 22sp | Bold |
| Heading M | Plus Jakarta Sans | 18sp | Bold |
| Body | Plus Jakarta Sans | 15sp | Regular |
| Body Semi | Plus Jakarta Sans | 14sp | SemiBold |
| Caption | Plus Jakarta Sans | 12sp | Regular |
| Label | Plus Jakarta Sans | 10sp | Bold, letter-spacing 1.1 |

---

## 2. Global Components

### Primary Button
- Background: `#059669` (solid green)
- Text: white, 15sp Bold
- Height: 52dp
- Corner radius: 14dp
- Shadow: `0 4 16 rgba(5,150,105,0.35)`

### Accent Button (secondary CTA)
- Background: `#FBBF24`
- Text: `#052E16`, 15sp Bold
- Same shape as primary

### Outline Button
- Background: transparent
- Border: 1.5dp `#059669`
- Text: `#059669`

### Danger Button
- Background: transparent
- Border: 1.5dp `#F43F5E`
- Text: `#F43F5E`

### Card
- Background: `#FFFFFF`
- Border: 1dp `#D1FAE5`
- Corner radius: 20dp
- Shadow: `0 4 16 rgba(0,0,0,0.06)`

### Input Field
- Background: `#F0FDF4`
- Border: 1.5dp `#A7F3D0`
- Corner radius: 13dp
- Height: 52dp
- Text: `#052E16`, placeholder: `#9CA3AF`

### Chip / Badge
- Corner radius: full (pill)
- Padding: 10dp horizontal, 5dp vertical
- Font: 10sp Bold

### Tab Bar
| State | Icon tint | Label color | Indicator |
|---|---|---|---|
| Active | `#059669` | `#059669` | green dot or underline |
| Inactive | `#9CA3AF` | `#9CA3AF` | none |

---

## 3. Screen Specifications

---

### 3.1 LoginPage

**Layout:** Two-row grid. Top 220dp = hero. Bottom = white rounded sheet (28dp top radius).

**Hero area:**
- Background: vertical gradient `#064E3B` → `#0F766E`
- Center: app logo mark — rounded rectangle 68×68dp, `#FFFFFF20` fill, `#FFFFFF30` border, letter "T" white 30sp Bold
- App name "Turnify" white 28sp ExtraBold below logo
- Tagline "Gestisci il tuo team, ovunque" white 60% opacity, 14sp

**Bottom sheet:**
- White card, border-radius 28dp top
- Title "Accedi" 22sp Bold, `#052E16`
- Mode toggle (Admin / Dipendente): pill segmented control, active pill `#064E3B` + white text, inactive transparent + `#374151`
- Input fields with `#F0FDF4` background and `#A7F3D0` border
- CTA "Accedi": full-width, `#059669` with white text
- Secondary link "Registra la tua azienda": outline button with `#059669` border
- Legal text 11sp muted

**Icons used:** none (text-only fields)

---

### 3.2 DashboardPage (Admin)

**Header:**
- Background: gradient `#064E3B` → `#0F766E`, height ~120dp
- Left: date label (Outline tint white 60%), page title "Dashboard" white 26sp ExtraBold
- Right: notification bell icon — `bell.png` (real SVG bell icon, white, 22px) inside circular button 42×42dp, semi-transparent white fill `#FFFFFF20`

**KPI 2×2 Grid** (below header, overlapping with -20dp margin for floating effect):
Each card:
- Background: linear gradient (see §1 KPI Card Gradients)
- Corner radius: 20dp
- Shadow: `0 8 24 rgba(0,0,0,0.12)`
- Content: icon (real PNG/SVG, 36×36dp) top-left → big number (30sp ExtraBold, white) → label (11sp SemiBold white 80%) → sublabel (11sp Regular white 60%)
- Icon container: white circle 48×48dp, icon tinted with card's dark color

**"Turni oggi" section:**
- Section label: "TURNI OGGI" 10sp Bold, `#059669`, letter-spacing 1.2
- Each row card: white, 14dp radius
  - Left accent bar: 4dp wide, `#059669`
  - Avatar: circle 38dp, `#D1FAE5` background, initials `#059669` 13sp Bold
  - Name + time range
  - Status chip: pill, `#D1FAE5` bg, `#059669` text

**"Ferie in attesa" section:**
- Section label + badge chip (amber)
- Each card: white, 18dp radius, shadow
  - Avatar circle 44dp
  - Name + date range
  - Two action buttons: "Rifiuta" (danger outline) + "Approva" (green solid)

**"Copertura settimana" section:**
- Horizontal scroll of 7 day cards, each colored by coverage level:
  - Full coverage: `#059669` → `#34D399` gradient
  - Partial: `#FBBF24` → `#FDE68A`
  - Empty: `#F43F5E` → `#FB7185`
- Each card shows: coverage icon (checkmark/warning/x — real SVG), day short label, date

---

### 3.3 EmployeeDashboardPage (Employee)

**Header:** same gradient `#064E3B` → `#0F766E` with greeting "Ciao, [Nome]!" white.

**"Il tuo prossimo turno" hero card:**
- Full-width, `#059669` solid, corner 20dp, padding 20dp
- Large time range "09:00 – 17:00" white 28sp ExtraBold
- Date below, white 60% opacity
- Icon: `briefcase.png` (real illustrated briefcase, white, 32px) top-right

**Today's shifts list:**
- Same style as admin dashboard turni section

**Quick actions row** (3 buttons horizontal):
- "Richiedi ferie" — `#FBBF24` card, `vacation-request.png` icon (palm tree silhouette, amber)
- "Timbratura" — `#059669` card, `fingerprint.png` icon (real fingerprint illustration, green)
- "Disponibilità" — `#0EA5E9` card, `calendar-edit.png` icon (calendar with pencil, sky blue)

---

### 3.4 ShiftCalendarPage

**Header:** gradient `#064E3B` → `#0F766E`
- Title "Turni" white
- View mode toggle (3 buttons: Dipendenti / Settimana / Giorno) — pill segmented control, active `#FFFFFF` bg + `#064E3B` text, inactive transparent + white 70%

**Week grid (WeekMode):**
- Sticky column headers: Mon–Sun, each a colored pill if today (`#FBBF24` highlight)
- Hourly rows: alternating `#F0FDF4` / `#FFFFFF`
- Shift blocks: rounded, `#059669` gradient, white text, 10dp radius
- Empty cells: subtle dashed border `#A7F3D0`

**Employee list (EmployeeMode):**
- Each row: avatar circle (48dp, `#D1FAE5` bg, green initials) + name + shifts count badge (green pill)

**Day view (DayMode):**
- Vertical timeline, hour labels left
- Shift blocks: full-width, green gradient, rounded 12dp

---

### 3.5 EmployeeListPage

**Header:** gradient `#064E3B` → `#0F766E`, title "Team" white
- Search bar below header: `#FFFFFF` background, `search.png` icon (magnifier, `#9CA3AF`), 14dp radius

**Employee cards:**
- Background: white, 16dp radius, shadow
- Left: avatar circle 48dp, `#D1FAE5` background, initials green 15sp Bold
- Name 14sp SemiBold, role chip (Admin: `#D1FAE5`/`#059669`, Dipendente: `#FEF3C7`/`#B45309`)
- Right: `chevron-right.png` icon (small arrow, `#9CA3AF`)

**Add card (dashed):**
- Dashed border 1.5dp `#059669`, `#F0FDF4` background
- Center: `plus-circle.png` icon (green circle with plus, 28px) + "Aggiungi dipendente" `#059669` text

---

### 3.6 VacationListPage

**Header:** gradient `#064E3B` → `#0F766E`, title "Ferie"
- FAB or header button "+" for new request

**Status tabs:** pill segmented (Tutte / In attesa / Approvate / Rifiutate)
- Active: `#059669` solid, white text
- Inactive: `#D1FAE5` bg, `#059669` text

**Request cards:**
- Status indicator: left bar 4dp
  - In attesa: `#FBBF24`
  - Approvata: `#059669`
  - Rifiutata: `#F43F5E`
- Date range bold, type label, days count chip
- Action icons: `edit.png`, `trash.png` (real icon, 20px, muted)

---

### 3.7 ProfilePage

**Top hero:**
- Gradient `#064E3B` → `#0F766E`, height ~200dp
- Center: avatar circle 80dp — `#FFFFFF20` fill, initials or selected emoji, white 36sp
- Name 20sp ExtraBold white, role chip below (green pill)
- Edit icon `edit-pencil.png` (white, 18px) top-right

**Settings sections** (white cards with green accents):
- Section header: 10sp Bold `#059669` uppercase, letter-spacing 1.2
- Row: `chevron-right.png` right arrow, icon left (real PNG, 20px, colored per action)
  - `lock.png` — Cambia password (teal)
  - `report.png` — Report ore (amber)
  - `building.png` — Aziende (green)
  - `users.png` — Dipendenti (green)
  - `logout.png` — Esci (red/coral)

---

### 3.8 NotificationsPage

**Header:** gradient, title "Notifiche"
- Unread count badge: `#F43F5E` pill, white text

**Notification cards:**
- Unread: `#F0FDF4` background (green tint), left bar `#059669`
- Read: white background, no bar
- Icon per type:
  - Turno: `calendar-dot.png` (green)
  - Ferie approvata: `check-circle.png` (green)
  - Ferie rifiutata: `x-circle.png` (red/coral)
  - Scambio turno: `arrows-swap.png` (amber)
- Title 14sp SemiBold, body 13sp Regular, timestamp 11sp muted

---

### 3.9 OnboardingPage

**Full screen slides (3 steps):**
- Background: gradient `#064E3B` → `#0F766E` (dark) with floating colored blobs/shapes
- Center illustration: large photographic/illustrated icon per slide (128×128dp):
  - Step 1: `onboarding-team.png` — illustration of diverse team
  - Step 2: `onboarding-calendar.png` — colorful calendar with shifts
  - Step 3: `onboarding-notifications.png` — phone with notification bell
- Title: white 26sp ExtraBold
- Body: white 70% opacity 16sp Regular
- Progress dots: white (active), white 40% (inactive)
- CTA button: `#FBBF24` (amber) with `#052E16` dark text

---

## 4. Icons Reference List

All icons must be real SVG/PNG assets (NOT emoji). Suggested sources: [Heroicons](https://heroicons.com), [Phosphor Icons](https://phosphoricons.com), or custom illustrated set.

| Asset name | Description | Used in |
|---|---|---|
| `bell.png` | Notification bell | Dashboard header |
| `users-group.png` | 3 people silhouettes | KPI card Dipendenti |
| `calendar-check.png` | Calendar + checkmark | KPI card Turni |
| `beach-umbrella.png` | Beach umbrella / palm | KPI card Ferie |
| `clock-timer.png` | Stopwatch / timer | KPI card Ore |
| `briefcase.png` | Work briefcase | Employee dashboard hero |
| `fingerprint.png` | Fingerprint scan | Quick action Timbratura |
| `vacation-request.png` | Palm tree / sun | Quick action Ferie |
| `calendar-edit.png` | Calendar + pencil | Quick action Disponibilità |
| `search.png` | Magnifier | Employee list search |
| `chevron-right.png` | Right arrow | List row disclosure |
| `plus-circle.png` | Circle with plus | Add card |
| `edit.png` | Pencil / edit | Vacation row edit |
| `trash.png` | Trash can | Vacation row delete |
| `lock.png` | Padlock | Profile → Cambia password |
| `report.png` | Chart / bar graph | Profile → Report |
| `building.png` | Office building | Profile → Aziende |
| `users.png` | Two people | Profile → Dipendenti |
| `logout.png` | Exit door / arrow | Profile → Esci |
| `check-circle.png` | Circle + checkmark | Notification approvata |
| `x-circle.png` | Circle + X | Notification rifiutata |
| `calendar-dot.png` | Calendar + dot | Notification turno |
| `arrows-swap.png` | Two swap arrows | Notification scambio |
| `edit-pencil.png` | Pencil | Profile avatar edit |
| `onboarding-team.png` | Team illustration (128px) | Onboarding step 1 |
| `onboarding-calendar.png` | Calendar illustration (128px) | Onboarding step 2 |
| `onboarding-notifications.png` | Phone+bell illustration (128px) | Onboarding step 3 |

---

## 5. Animation & Motion

- **Page transitions:** slide-in from right (standard push), fade for modal sheets
- **KPI cards:** staggered fade-up on load (0ms, 60ms, 120ms, 180ms delay)
- **Buttons:** scale 0.96 on press, spring back on release
- **Shift blocks in calendar:** slide-in from left on view switch
- **Notification bell:** subtle shake animation on new unread count

---

## 6. Spacing & Layout Grid

- Horizontal page padding: **20dp**
- Section spacing: **24dp**
- Card inner padding: **16dp**
- Stack spacing (labels + inputs): **6dp**
- Stack spacing (cards in list): **10dp**
- Bottom tab bar height: **64dp** (+ safe area inset)
- Status bar area: always **transparent**, icons dark on light screens / light on dark gradient headers

---

## 7. Summary: What Changes vs Current Design

| Element | Current (v2) | New (Tropic Burst) |
|---|---|---|
| Primary color | Navy `#0F1629` / Blue `#3B5BDB` | Emerald `#059669` |
| Background | Warm beige `#EDEAE5` | Fresh green-tint `#F0FDF4` |
| Header | Flat navy | Gradient `#064E3B` → `#0F766E` |
| KPI icons | Emoji (👥 📅 🏖️ ⏱️) | Real PNG/SVG illustrated icons |
| KPI cards | White + colored light backgrounds | Full gradient colored cards |
| Tab bar active | Blue | Emerald green |
| Notification bell | 🔔 emoji | `bell.png` real icon |
| Profile avatar edit | Text | `edit-pencil.png` icon |
| CTA button | Dark navy | Emerald `#059669` |
| Secondary CTA | Grey outline | Amber `#FBBF24` |
