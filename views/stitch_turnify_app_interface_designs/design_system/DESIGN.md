---
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  h1:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 16px
---

## Brand & Style
The design system is built on the principles of high-velocity utility and "calm" management. Because the users are often in high-stress environments (rushed kitchens or busy gym floors), the UI minimizes cognitive load through a **Modern Corporate** aesthetic with **Minimalist** leanings. 

The emotional response should be one of "controlled precision." The interface stays out of the way, using ample white space and a rigid grid to ensure that schedules and staff data are the primary focus. It prioritizes clarity over decoration, ensuring that a manager can glance at a screen and understand the status of their entire floor in seconds.

## Colors
This design system utilizes a high-contrast palette optimized for legibility in various lighting conditions—from bright outdoor gym areas to dimly lit restaurant interiors. 

- **Primary Blue:** Used for intent and primary actions. It signals "system" and "action."
- **Semantic Colors:** Success, Warning, and Danger are reserved strictly for shift status (e.g., Clocked In, Pending Approval, Late/Absence).
- **Surface Strategy:** The distinction between the App Background and Card/Panel colors creates a clear mental model of "the canvas" versus "the interactive data."

## Typography
Leveraging the **System Default (Inter)**, the design system focuses on "utilitarian legibility." The scale is designed to handle hierarchical density. 

**Key Principles:**
- **Numerical Prominence:** Shift times and durations should use `semibold` or `bold` weights to stand out against names and roles.
- **Micro-copy:** Use `label-sm` for secondary metadata like "Scheduled 4h ago" to keep the interface clean.
- **Tight Leading:** Headlines use tighter line-heights to allow more content to be visible above the fold on mobile devices.

## Layout & Spacing
The design system employs a **Fluid Grid** model with a mobile-first philosophy. 

- **The 8pt Rhythm:** All padding, margins, and heights must be increments of 4px, with 8px (sm) and 16px (md) being the standard for element separation.
- **Mobile Grid:** A 4-column layout with 16px side margins. Cards should typically span the full width of the 4 columns.
- **Desktop/Tablet:** A 12-column grid with 24px gutters. Use the extra horizontal space for "Master-Detail" views (list on the left, shift details on the right) rather than stretching single items.

## Elevation & Depth
Depth in the design system is communicated through **Tonal Layers** supplemented by **Low-contrast outlines**. 

1. **Level 0 (Background):** The lowest layer (#F9FAFB / #111827).
2. **Level 1 (Cards/Panels):** Raised via color change (#FFFFFF / #1F2937) and a subtle 1px border.
3. **Level 2 (Modals/Overlays):** Used for shift editing or clock-in screens. These use a soft, diffused shadow (0px 10px 15px -3px rgba(0,0,0,0.1)) to separate from the main schedule.

Avoid aggressive shadows or glassmorphism to ensure the UI remains performant on older mobile devices often found in workforce environments.

## Shapes
The design system uses a **Rounded** (Level 2) shape language. This softens the "industrial" feel of shift management, making the app feel more modern and user-friendly.

- **Standard Elements:** Buttons, inputs, and cards use a 0.5rem (8px) radius.
- **Large Containers:** Bottom sheets and prominent panels use 1rem (16px) for the top corners.
- **Chips/Badges:** Status indicators for "AM/PM" or "In Progress" should use a fully rounded "pill" shape (999px) to distinguish them from interactive buttons.

## Components
Consistent implementation of components ensures users can navigate the app by muscle memory.

- **Buttons:** Primary buttons use the Primary Color with white text. Ghost buttons use Primary Text with the Border color.
- **Shift Cards:** The core component. Must feature a left-accent bar (4px width) colored by the status (Success/Warning/Danger). High padding (16px) ensures clear touch targets on mobile.
- **Input Fields:** Use the specified Input Background. Focus states must use a 2px Primary Color border. Label text should always be visible above the input.
- **Status Chips:** Small, pill-shaped indicators. Use a subtle background (10% opacity of the semantic color) with 100% opacity text for the label.
- **Timeline/Gantt:** For the schedule view, use Level 1 Cards as the base. The "Current Time" indicator should be a thin Primary Color vertical line.
- **Bottom Navigation:** A persistent bar for mobile with icons and `label-sm` text. Icons should be "Outline" when inactive and "Solid" when active.