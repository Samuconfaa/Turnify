---
name: Turnify Core
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for the Italian SME market, where efficiency meets professional reliability. The brand personality is industrious, clear, and utilitarian, removing the complexity often associated with workforce management. 

The aesthetic is **Corporate / Modern**, drawing inspiration from high-productivity tools like Linear and Stripe. It prioritizes high-density information without visual clutter, utilizing generous white space and a rigid grid to evoke a sense of order and control. The emotional response is one of "calm productivity" (*produttività serena*), ensuring that shift managers feel empowered and employees feel well-informed.

## Colors

The color palette is rooted in a high-contrast blue primary, chosen for its association with trust and institutional stability in the Italian business sector. 

- **Primary (#2563EB):** Used for primary actions, active states, and brand-critical indicators.
- **Functional Palette:** Success, Warning, and Error colors follow standard semantic patterns to ensure immediate recognition of shift statuses (e.g., approved, pending, or conflict).
- **Surface Strategy:** In Dark Mode, the system utilizes a deep navy background (#0F172A) with slightly lighter surfaces (#1E293B) to create depth without relying on heavy borders. In Light Mode, it favors a clean off-white background to reduce eye strain during long planning sessions.

## Typography

This design system utilizes **Inter** as its primary typeface to emulate the clean, neutral aesthetics of system fonts while maintaining superior readability across varying screen densities.

The type scale is optimized for SaaS interfaces:
- **Headlines** use tighter letter-spacing and heavier weights to provide clear section anchoring.
- **Body Text** is set at 14px for high-density data views (like shift rosters), ensuring that complex tables remain legible.
- **Labels** use medium weights to ensure that secondary metadata (*es. "In attesa", "Confermato"*) is easily scannable.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with a base unit of 4px. This allows for precise alignment of shift blocks and time-slots.

A 12-column grid is used for desktop dashboards, while mobile views transition to a single-column stack with 16px side margins. Gutter widths are fixed at 16px to maintain a compact, professional appearance that maximizes screen real estate for calendar views and staff lists. Horizontal rhythm is emphasized to guide the eye across time-based data.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. This design system avoids heavy drop shadows in favor of subtle depth indicators:

- **Level 0 (Flat):** Used for the main background and decorative elements.
- **Level 1 (Subtle):** Used for cards and secondary surfaces. Includes a 1px border (#E2E8F0 in light mode) and a very soft 4px blur shadow with 5% opacity.
- **Level 2 (Active):** Used for modals and floating action buttons. Uses a 12px blur shadow with 10% opacity.
- **Interactive States:** Hovering over a shift card should slightly increase the elevation and border contrast, signaling interactivity without shifting the layout.

## Shapes

The shape language combines Material Design 3's logic with custom SME-focused refinements.

- **Cards:** Defined by a 16px radius, creating a soft but professional container for shift information.
- **Buttons:** A 12px radius provides a modern, approachable feel that is distinct from the sharper edges of legacy enterprise software.
- **Pills/Chips:** 24px radius used for status indicators (*Stato Turno*) to provide high visual contrast against rectangular card elements.
- **Sheet Logic:** The login and bottom sheets feature a pronounced 28px top-corner radius to emphasize the "sheet" metaphor and provide a tactile, mobile-first experience.

## Components

The design system focuses on high-density utility components tailored for the Italian work context:

- **Buttons:** Primary buttons use the #2563EB background with white text and 12px rounding. Secondary buttons use a subtle gray ghost style with an outline.
- **Shift Cards:** 16px radius containers featuring a left-side color strip indicating the department or role.
- **Chips (Pillole):** 24px height, used for "Mattina", "Pomeriggio", and "Notte" tags.
- **Input Fields:** Minimalist style with a 1px border that thickens to 2px in the primary blue upon focus. Labels are always positioned above the input.
- **The Login Sheet:** A prominent bottom-up surface with 28px top corners, designed to be the first point of interaction, conveying immediate quality and ease of use.
- **Calendar Grid:** A specialized component using "Sharp" internal borders but "Rounded" external corners to maintain a professional, organized structure for weekly schedules.