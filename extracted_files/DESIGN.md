---
name: Naturaleza Curativa
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#42493e'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#725a42'
  on-secondary: '#ffffff'
  secondary-container: '#fedcbe'
  on-secondary-container: '#796048'
  tertiary: '#602900'
  on-tertiary: '#ffffff'
  tertiary-container: '#813d0a'
  on-tertiary-container: '#ffb183'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcf0ae'
  primary-fixed-dim: '#a1d494'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#23501e'
  secondary-fixed: '#fedcbe'
  secondary-fixed-dim: '#e1c1a4'
  on-secondary-fixed: '#291806'
  on-secondary-fixed-variant: '#59422c'
  tertiary-fixed: '#ffdbc9'
  tertiary-fixed-dim: '#ffb68c'
  on-tertiary-fixed: '#321200'
  on-tertiary-fixed-variant: '#753401'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
  leaf-vibrant: '#47842E'
  balm-red: '#B23B25'
  surface-cream: '#FDFBF7'
  text-main: '#1C1C1C'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
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
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is built upon the intersection of traditional herbal wisdom and modern pharmaceutical reliability. It evokes a sense of "Effective Nature"—moving away from the clinical coldness of global competitors toward a warmer, more human-centric experience. 

The aesthetic is **Modern/Corporate with Tactile influences**. It prioritizes clarity and trust through a structured layout while using a warm, earthy palette to signal the natural origins of the ingredients (Arnica, Menthol, Eucalyptus). The interface should feel breathable and soothing, much like the product itself.

**Target Audience:** Active individuals seeking muscle relief, elderly users looking for trusted remedies, and health-conscious consumers who prefer natural-based topicals.

## Colors

This design system utilizes an earthy, high-contrast palette to establish immediate brand recognition and legibility.

- **Primary Green (#2D5A27):** A deep, forest-toned green representing botanical strength and relief. Used for primary actions and key brand moments.
- **Secondary Brown (#4B3621):** A grounding, deep espresso brown used for typography and structural elements to maintain an "earthy" feel without sacrificing professionalism.
- **Neutral Cream (#FAF7F2):** Replaces harsh whites to provide a softer, more organic backdrop that feels premium and inviting.
- **Balm Red (#B23B25):** A muted, heritage-inspired red used strictly for urgent notifications, sale accents, or specific "extra strength" callouts, nodding to the original product label.

## Typography

The typography uses **Plus Jakarta Sans** exclusively to bridge the gap between friendly approachability and modern precision. 

- **Headlines:** Use heavy weights (700-800) with slightly tighter letter spacing to create a sense of authority and impact.
- **Body Text:** Standard weight (400) with generous line heights (1.5x+) to ensure high legibility for all age groups.
- **Hierarchy:** Maintain clear distinction by using the Secondary Brown for headings and a slightly lightened version for secondary body text. Labels should always be in uppercase when used for categorization or ingredient callouts.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain a professional, organized feel, transitioning to a flexible fluid system on mobile.

- **Grid:** A 12-column grid is used for desktop (1280px max-width) to allow for complex ingredient and benefit layouts.
- **Rhythm:** An 8px base unit drives all spacing decisions. Content blocks should be separated by large vertical gaps (48px - 64px) to promote a "calm" browsing experience.
- **Mobile:** Margins shrink to 16px. Components like product cards should stack vertically to ensure the type remains large and legible.

## Elevation & Depth

To maintain a "natural" feel, this design system avoids heavy shadows in favor of **Tonal Layers** and **Soft Ambient Occlusion**.

- **Surface Tiers:** Use subtle variations of the neutral cream to separate content sections (e.g., a slightly darker cream for the "How it Works" section).
- **Shadows:** When necessary (e.g., on active buttons or hovering cards), use very soft, diffused shadows with a slight tint of the Primary Green. This keeps the depth feeling "organic" rather than "digital."
- **Outlines:** Use low-contrast outlines (1px solid, 10% opacity of the secondary brown) for form fields and container boundaries to provide structure without visual clutter.

## Shapes

The shape language is defined by **Rounded (Level 2)** settings. 

- **Elements:** Buttons and input fields use a 0.5rem (8px) radius. 
- **Large Containers:** Product cards and hero sections use "rounded-xl" (1.5rem / 24px) to evoke the softness of organic forms.
- **Iconography:** Use a thick stroke weight (2px) with rounded caps and corners to match the friendly character of the typography.

## Components

### Buttons
- **Primary:** Solid Primary Green with White or Cream text. Large padding (16px 32px) and bold weights.
- **Secondary:** Outlined in Primary Green with a light cream hover state.
- **Tertiary:** Text-only in Secondary Brown with a bottom underline on hover.

### Cards
Product and ingredient cards should feature a Cream surface with a subtle 1px border. Use the top of the card for high-quality lifestyle or botanical imagery. Ensure "Muscle Relief" or "Ingredient Name" is set in Headline-MD.

### Input Fields
Soft cream backgrounds with 1px border. Focus states should transition the border to Primary Green and add a very soft 4px glow.

### Chips/Labels
Used for ingredient callouts (e.g., "Arnica," "Menthol"). These should have pill-shaped corners and use a light green background with dark green text to signify "Natural."

### Lists
Benefit lists should use custom iconography (e.g., small leaf or checkmark icons in Primary Green) rather than standard bullets to reinforce the botanical brand identity.