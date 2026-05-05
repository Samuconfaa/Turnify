---
name: Tropic Burst
colors:
  surface: '#f5fbf5'
  surface-dim: '#d5dcd6'
  surface-bright: '#f5fbf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff5ef'
  surface-container: '#e9efe9'
  surface-container-high: '#e4eae4'
  surface-container-highest: '#dee4de'
  on-surface: '#171d19'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#2c322e'
  inverse-on-surface: '#ecf2ec'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#9b3e3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ba5551'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#7f2928'
  background: '#f5fbf5'
  on-background: '#171d19'
  surface-variant: '#dee4de'
typography:
  heading-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  heading-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: '1.3'
  body:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
  button:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
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
  container-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
This design system utilizes a **Corporate / Modern** style infused with high-energy vibrancy. It targets professional environments that require a fresh, energetic atmosphere without sacrificing reliability. The aesthetic is defined by "Organic Professionalism"—combining the structured reliability of deep teal and emerald foundations with the warmth of tropical accents. 

The visual narrative relies on depth created through lush gradients and substantial corner radii, evoking a sense of approachability and high-end craftsmanship. High-quality illustrated iconography replaces standard glyphs to reinforce a premium, bespoke feel.

## Colors
The palette is rooted in the "Tropic Burst" concept. The foundation uses a **Soft Mint White** background to reduce eye strain while maintaining a vibrant "fresh" feeling. 

- **Primary & Deep Tones:** Emerald is the active signal. Deep Teal gradients are reserved for high-level containers like headers to provide grounding depth.
- **Accents:** Amber and Coral are used sparingly for high-priority actions and status states, ensuring they pop against the cool green base.
- **KPIs:** Use the defined linear gradients for data visualization and metric cards to create a sense of movement and energy.

## Typography
This design system uses **Plus Jakarta Sans** exclusively to maintain a friendly yet geometric and modern appearance. 

Headlines utilize ExtraBold weights and tight letter-spacing to command attention and feel "impactful." The body text is set at 15px with a generous line height to ensure readability against the vibrant background colors. Labels and small metadata should use semi-bold weights to remain legible at smaller scales.

## Layout & Spacing
The layout follows a **Fluid Grid** philosophy with a focus on generous internal padding to match the large corner radii. 

- **Outer Margins:** Use 24px for mobile and 40px for desktop containers.
- **Rhythm:** Elements are spaced in multiples of 4px, with 16px being the standard "comfortable" gap between related components.
- **Sections:** Use 32px or 48px vertical spacing to separate major content blocks, allowing the "Soft Mint" background to act as a visual breather.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and **Tonal Layers**. 

Shadows should be soft and tinted with the primary color (Emerald) rather than pure grey. This keeps the UI feeling "lush" and integrated. Surface elements (White) sit atop the Mint background with a light 10% opacity emerald-tinted shadow. Buttons utilize a more aggressive shadow to indicate interactability, giving them a slightly "raised" appearance.

## Shapes
The shape language is defined by **large, friendly radii**. This softness balances the high-saturation colors to prevent the UI from feeling aggressive. 

Standard components like buttons and inputs use a 13-14px radius, while larger structural components like cards and modals scale up to 20px and 28px respectively. This creates a nested hierarchy where smaller items feel "housed" within larger containers.

## Components
- **Buttons:** Height is fixed at 52px. Primary buttons use solid Emerald (#059669) with white text and a soft shadow. Secondary/Accent buttons use solid Amber (#FBBF24).
- **Cards:** Use a 20px radius and a subtle #D1FAE5 border. The shadow should be very light to maintain a clean aesthetic.
- **Inputs:** Feature a #F0FDF4 background and a #A7F3D0 border at rest. On focus, the border transitions to Primary Emerald with a subtle outer glow.
- **KPI Cards:** These should utilize the full-bleed KPI Gradients. Text inside these cards should be white for maximum contrast.
- **Icons:** Use Phosphor or Heroicons. Ensure icons are stroke-based for a modern look. In Primary buttons, icons are white; in secondary contexts, they are tinted to #064E3B.
- **Chips/Badges:** Small, pill-shaped elements with 10% opacity backgrounds of their respective status color (e.g., a Coral background at 10% for "Error" badges).