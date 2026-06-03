---
name: Epicurean Minimalist
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#424842'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#727972'
  outline-variant: '#c2c8c0'
  surface-tint: '#46654f'
  primary: '#001809'
  on-primary: '#ffffff'
  primary-container: '#0f2e1b'
  on-primary-container: '#76977e'
  inverse-primary: '#accfb3'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#111514'
  on-tertiary: '#ffffff'
  tertiary-container: '#252928'
  on-tertiary-container: '#8c908f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8ebce'
  primary-fixed-dim: '#accfb3'
  on-primary-fixed: '#02210f'
  on-primary-fixed-variant: '#2f4d38'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e0e3e1'
  tertiary-fixed-dim: '#c4c7c5'
  on-tertiary-fixed: '#181c1b'
  on-tertiary-fixed-variant: '#434846'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Bodoni Moda
    fontSize: 56px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0em
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.2'
  title-md:
    fontFamily: Bodoni Moda
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter-desktop: 24px
  margin-desktop: 64px
  gutter-mobile: 16px
  margin-mobile: 20px
---

## Brand & Style

The design system is engineered for a premium eCommerce experience that merges the precision of high-end technology interfaces with the organic richness of gourmet groceries. The brand personality is sophisticated, transparent, and authoritative, positioning everyday ingredients as luxury goods.

The aesthetic follows a **Modern Corporate** direction infused with **Glassmorphism**, now punctuated by elegant, high-contrast serif typography. It prioritizes extreme clarity, generous whitespace, and high-quality imagery. The interface must feel "airy" yet grounded, using translucent layers to create a sense of depth and material quality. The goal is to evoke a sense of absolute freshness and meticulous curation, mirroring an "Apple-esque" approach to product presentation with a refined, editorial edge.

## Colors

The palette is anchored by **Deep Forest Green** (#0f2e1b), used sparingly for primary actions and brand presence to signify nature and depth. **Rich Gold** (#c5a059) serves as an accent for high-value indicators, loyalty statuses, and premium product badges. 

The background strategy utilizes **Crisp Whites** and **Off-Whites** to maintain a laboratory-clean environment for product photography. In dark mode, the system transitions to a "Midnight Forest" palette, using deep shades of emerald-black rather than pure black to maintain a premium, organic feel. Glassmorphic elements should utilize a variable opacity of the neutral or background colors to ensure legibility across varying content.

## Typography

This design system uses a high-contrast typographic approach to balance luxury editorial aesthetics with high-readability. **Bodoni Moda** is the primary display face, providing an elegant, high-contrast serif character for headlines that evokes classic high-end fashion and culinary journals. For body copy, **Inter** provides a neutral, highly legible sans-serif canvas. **IBM Plex Sans** is utilized for functional labels and data-heavy metadata to provide a structured, systematic feel.

For **Tamil language support**, use the system's native sans-serif fallback (e.g., Arimo or Noto Sans Tamil) ensuring that line-heights are increased by 20% to accommodate the script's vertical anatomy. Headlines in Bodoni Moda should be used to establish a sophisticated hierarchy, while labels utilize wider tracking for clarity at small scales.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model on desktop to preserve the intentional whitespace characteristic of luxury brands. A 12-column grid is used for the main shop interface, while product detail pages may utilize a 2-column asymmetric split (60/40) to highlight high-resolution imagery.

Spacing is based on an 8px linear scale. On mobile, margins are tightened to 20px to maximize real estate for product tiles. Vertical rhythm should be generous; use larger gaps (64px+) between distinct sections like "Featured Spices" and "Recently Viewed" to allow the eyes to rest and the content to breathe.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and **Ambient Shadows**. 

1.  **Base Layer:** Solid white or off-white background.
2.  **Mid Layer (Product Cards):** Low-contrast outlines (1px solid #E5E5E7) with an extremely soft, wide-spread shadow (Blur: 40px, Opacity: 4%, Color: Primary).
3.  **Top Layer (Navigation/Modals):** Backdrop-filter: blur(20px) with 80% opacity fill. This creates a frosted-glass effect that keeps the user grounded in their previous context while highlighting new information.

Avoid harsh shadows. The depth should feel like light passing through natural elements, not heavy objects casting shadows.

## Shapes

The design system utilizes **Pill-shaped** corners (1rem base) to create a friendly, ultra-modern aesthetic that feels highly polished and organic. 

Large containers and product cards should use `rounded-lg` (2rem), while primary action buttons and input fields use the standard base roundedness. This significant curvature mirrors the organic, soft shapes found in nature and gourmet ingredients, providing a distinctive "premium lifestyle" feel that contrasts with the sharp, elegant lines of the serif typography.

## Components

### Buttons
- **Primary:** Solid Deep Forest Green with white text. Pill-shaped high-contrast buttons, no shadow.
- **Secondary:** Transparent with 1px Deep Forest Green border.
- **Ghost:** Rich Gold text with no background, used for subtle navigation or "Learn More" links.

### Product Cards
- **Structure:** Edge-to-edge product photography on a light grey (#FBFBFB) background at the top, followed by a clean white content area below. Features `rounded-lg` corners.
- **Interaction:** On hover, the ambient shadow increases slightly in intensity and the image scales 2% for a "lifted" feel.

### Glassmorphic Header
- **Style:** Sticky positioning with a 20px backdrop-blur. 1px bottom border in 10% opacity primary color.
- **Content:** Minimalist navigation links using `label-sm` typography.

### Input Fields
- **Style:** Fully enclosed with `rounded-base` and a light grey fill (#F5F5F7) for high-frequency search tasks, maintaining the pill-shaped silhouette.

### Chips & Badges
- **Status:** Use Rich Gold backgrounds with dark text for "Organic," "Premium," or "Limited" labels. These are always fully rounded pills.