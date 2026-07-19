---
name: Ethereal Knowledge System
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#b4c5ff'
  on-secondary: '#002a78'
  secondary-container: '#0053db'
  on-secondary-container: '#cdd7ff'
  tertiary: '#e9c349'
  on-tertiary: '#3c2f00'
  tertiary-container: '#c29f27'
  on-tertiary-container: '#473700'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  quote-italic:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 30px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
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
  container-padding: 20px
  gutter: 16px
---

## Brand & Style
The design system for this app focuses on a "Digital Sanctuary" aesthetic—blending the precision of high-end productivity tools with the warmth of spiritual growth. The brand personality is scholarly yet accessible, premium but humble. 

The style utilizes a **Modern Glassmorphic** approach, drawing heavily from the depth and layering found in the latest Apple Human Interface Guidelines, combined with the systematic logic of Material 3. The UI should evoke a sense of calm focus ("Khushu") while maintaining high engagement through gamified feedback loops. 

Visual accents should incorporate ultra-thin line-art geometric patterns (Mashrabiya-inspired) used as low-opacity masks on containers and background blurs to reinforce the cultural context without cluttering the interface.

## Colors
The palette is rooted in deep, sophisticated tones that prioritize legibility and eye comfort for long study sessions.

- **Emerald Green (Primary):** Used for progress, success, and primary "Growth" actions. It represents life and the spiritual path.
- **Royal Blue (Secondary):** Used for navigation, information hierarchy, and depth.
- **Gold Accent (Tertiary):** Reserved strictly for achievements, premium features, and "Aha!" moments.
- **Dark Navy (Surface):** The core background for Dark Mode, providing a "Night Prayer" ambiance that reduces blue light strain.

Light mode uses a high-purity White (#FFFFFF) with soft blue-grey shadows to maintain a clean, "light-upon-light" feel. All color pairings must maintain a 4.5:1 contrast ratio for AA compliance, particularly when Gold or Emerald is used for text.

## Typography
The typography strategy creates a tension between modern utility and timeless wisdom. 

**Inter** serves as the functional workhorse for navigation, buttons, and instructional text, ensuring clarity and a "tech-forward" feel. **Source Serif 4** is introduced for Quranic translations, Hadith quotes, and major section headers to provide an editorial, scholarly weight.

When displaying Arabic script alongside English, ensure line-height is increased by at least 20% to accommodate the ascenders and descenders of complex calligraphy.

## Layout & Spacing
This design system utilizes a **Fluid Grid** with a 4px baseline rhythm. 

- **Mobile:** 4-column grid with 20px side margins and 16px gutters.
- **Desktop:** 12-column grid with a max-width of 1200px, centered.

The layout philosophy emphasizes "Breathable Hierarchy." Use significant vertical white space (32px+) between distinct learning modules to prevent cognitive overload. Cards and containers should use dynamic padding based on their hierarchy: primary action cards use `lg` (24px) padding, while secondary list items use `md` (16px).

## Elevation & Depth
Depth is created through **Glassmorphism** and tonal layering rather than traditional heavy shadows.

- **Base Layer:** Solid Background (Dark Navy or Pure White).
- **Surface Layer:** 60% opacity fill with a 20px backdrop blur and a 1px inner border (white at 10% opacity) to simulate a glass edge.
- **Elevated Layer:** Same as surface but with a subtle 0-10-20-0 rgba shadow to indicate interactivity.

Avoid using black shadows. In Dark Mode, use a deep Royal Blue tint for shadows to maintain the "Midnight" aesthetic. In Light Mode, use a soft Emerald-tinted shadow for success-state components.

## Shapes
The shape language is hyper-rounded to evoke friendliness and safety. 

A standard **24px radius** (rounded-xl) is the signature curve for all main content cards and modally-presented sheets. Secondary elements like buttons use a **16px radius**. Small interactive components like chips or checkboxes use an **8px radius**. 

Circular shapes are reserved for avatars, progress rings, and gamified "streak" icons to distinguish them from structural content.

## Components
- **Buttons:** Primary buttons feature a subtle vertical gradient (Emerald to a slightly darker shade) with a high-gloss overlay effect. Text is bold and centered.
- **Knowledge Cards:** These are the centerpiece. They use the glassmorphic style with a subtle geometric "watermark" pattern in the bottom right corner.
- **Progress Trackers:** Circular progress rings using the Emerald Green for completion and Gold for "Daily Streak" milestones.
- **Input Fields:** Minimalist with only a bottom border that animates into a full-ring Emerald glow when focused.
- **Chips:** Highly rounded (pill-shaped) with low-opacity background fills of the Primary or Secondary colors.
- **Lists:** Items are separated by soft dividers (10% opacity) or grouped into "Inbound" glass cards for a more modern, grouped appearance.
- **Gamified Popups:** Use high-contrast Gold accents with "confetti" particles that use the Emerald and Royal Blue palette to maintain brand cohesion during celebrations.