# Reach Landing Page — Crystalline Flow

**High-Fidelity Interactive Prototype**

Designer: **Jony**
Date: February 13, 2026
Version: 1.0

---

## Overview

This is a fully functional HTML/CSS/JS prototype implementing the **Concept 1: "Crystalline Flow"** design from the Reach landing page redesign spec. This prototype serves as both a visual reference and a working foundation for implementation.

## Deliverables

### 1. Interactive Prototype

| File | Description |
|------|-------------|
| `index.html` | Full landing page with all sections |
| `styles.css` | Complete CSS with design system tokens |
| `script.js` | Interactive behaviors and animations |
| `design-system.html` | Component library and design tokens |

### 2. Screenshots (2x Resolution)

Located in `/screenshots/`:

**Full Page Captures:**
- `landing-page-desktop-full.png` — Desktop (1440px)
- `landing-page-tablet-full.png` — Tablet (768px)
- `landing-page-mobile-full.png` — Mobile (375px)

**Above-the-fold Captures:**
- `landing-page-desktop-viewport.png`
- `landing-page-tablet-viewport.png`
- `landing-page-mobile-viewport.png`

**Section Captures:**
- `section-hero.png`
- `section-metrics.png`
- `section-features.png`
- `section-testimonial.png`
- `section-pricing.png`
- `section-cta.png`
- `section-footer.png`

**Design System:**
- `design-system-desktop-full.png`
- `design-system-tablet-full.png`
- `design-system-mobile-full.png`

---

## Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | #FAFAFA | Page background |
| `--bg-elevated` | #FFFFFF | Cards, elevated surfaces |
| `--bg-subtle` | #F5F5F5 | Subtle backgrounds |
| `--text-primary` | #0A0A0A | Headlines, primary text |
| `--text-secondary` | #525252 | Body text |
| `--text-tertiary` | #737373 | Labels, captions |
| `--text-muted` | #A3A3A3 | Placeholder, disabled |
| `--accent` | #6366F1 | Primary brand color (Indigo) |
| `--accent-hover` | #4F46E5 | Hover state |
| `--border-default` | #E5E5E5 | Default borders |

### Typography

- **Font Family:** Inter (system fallback)
- **Display:** 72px / 600 / -0.03em letter-spacing
- **H1:** 40px / 600 / -0.02em
- **H2:** 30px / 600 / -0.02em
- **Body:** 16px / 400 / 1.6 line-height
- **Caption:** 14px / 400

### Spacing Scale

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-24` | 96px |

### Border Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | 4px |
| `--radius-md` | 6px |
| `--radius-lg` | 8px |
| `--radius-xl` | 12px |
| `--radius-2xl` | 16px |
| `--radius-3xl` | 24px |
| `--radius-full` | 9999px |

---

## Components

### Buttons

| Variant | Usage |
|---------|-------|
| Primary | Main CTAs, form submissions |
| Secondary | Alternative actions |
| Ghost | Inline actions, secondary options |
| CTA | Final conversion buttons |

### Cards

- **Feature Card:** Icon + title + description + link
- **Pricing Card:** Tier + price + features + CTA
- **Testimonial Card:** Quote + author info

### Navigation

- Fixed header with blur effect on scroll
- Mobile hamburger menu
- Smooth scroll anchor links

---

## Animations & Interactions

### Implemented

- ✅ Scroll-triggered fade-up animations
- ✅ Navigation blur on scroll
- ✅ Button hover effects (lift + shadow)
- ✅ Link hover underline animations
- ✅ Floating social icons parallax
- ✅ Metrics counter animation
- ✅ Card hover lift effects
- ✅ Mobile navigation toggle

### Motion Principles

- **Duration:** 200-400ms
- **Easing:** ease-out for entrances
- **Stagger:** 100ms between sequential elements

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | Single column, hamburger nav |
| Tablet | 768-1024px | 2-column grids |
| Desktop | > 1024px | Full 3-column layouts |

---

## What's Missing (Requires Figma/Design Tools)

While this prototype is highly detailed, the following would typically come from native design tools:

1. **Vector Assets**
   - Logo SVG (using text placeholder)
   - Custom illustrations for hero
   - Platform logo files (using text placeholders)

2. **Design Specifications**
   - Exact spacing measurements overlay
   - Redlines for developer handoff
   - Asset export at various densities

3. **Prototyping Features**
   - Click-through flows
   - State variations
   - More complex interactions

4. **Design File Organization**
   - Component variants with properties
   - Auto-layout configurations
   - Design system documentation in-tool

---

## How to Use

### View the Prototype

1. Open `index.html` in a browser
2. Open `design-system.html` for component reference

### Generate New Screenshots

```bash
node generate-screenshots.js
```

### Serve Locally (optional)

```bash
npx serve .
```

---

## Next Steps

1. **Stakeholder Review:** Share screenshots for approval
2. **Feedback Iteration:** Update prototype based on feedback
3. **Handoff to Turing:** Provide prototype + spec for implementation
4. **Figma Migration (Optional):** If Figma access becomes available, translate to native design file

---

## File Structure

```
reach-landing-prototype/
├── index.html              # Landing page
├── styles.css              # Design system + styles
├── script.js               # Interactions
├── design-system.html      # Component library
├── generate-screenshots.js # Screenshot generator
├── README.md               # This file
├── package.json
└── screenshots/
    ├── landing-page-desktop-full.png
    ├── landing-page-tablet-full.png
    ├── landing-page-mobile-full.png
    ├── section-hero.png
    ├── section-features.png
    ├── section-pricing.png
    └── ... (all screenshots)
```

---

*Designed with intention. Built for implementation.*

— Jony
