# Design.md — AddaDotCom Design System

## Brand Identity
- **Brand Name**: AddaDotCom
- **Tagline**: "Artisan Coffee, Gourmet Kitchen & Good Times"
- **Vibe**: Warm, premium, modern café aesthetics with rich dark modes, sleek glassmorphism, and responsive interactions.

---

## Color Palette Tokens

Defined in `tailwind.config.ts` and CSS variables:

| Token Name | Hex Code | HSL / CSS Variable | Main Usage |
|------------|----------|-------------------|------------|
| **espresso** | `#4B2E2B` | `hsl(7, 27%, 23%)` | Primary brand color, headers, primary buttons, admin sidebar |
| **caramel** | `#D4A056` | `hsl(35, 60%, 58%)` | Accent highlights, CTA buttons, active state indicators, prices |
| **cream** | `#FFF8F0` | `hsl(33, 100%, 97%)` | Light mode base background, card contrast backgrounds |
| **sage** | `#8BA888` | `hsl(115, 16%, 60%)` | Secondary tag highlights, vegetarian badges, calm indicators |
| **background** | — | `var(--background)` | Global app background |
| **foreground** | — | `var(--foreground)` | Global text color |
| **card** | — | `var(--card)` | Component card surface background |
| **border** | — | `var(--border)` | Subtle divider lines and card borders |

---

## Typography

- **Display / Headings**: `DM Serif Display` (`var(--font-serif)`)
  - Usage: Hero text, section titles, receipt headings, modal titles.
- **Body & Controls**: `DM Sans` / System Sans-Serif (`var(--font-sans)`)
  - Usage: Paragraph text, table text, form inputs, button labels.
- **Monospace**: `font-mono`
  - Usage: Order numbers, Bill IDs, transaction hashes, QR code strings.

---

## Spacing & Radius System

- **Grid System**: 4px base unit (`p-1` = 4px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px).
- **Border Radius**:
  - `rounded-lg`: 8px for small buttons & badges.
  - `rounded-xl`: 12px for standard cards and form inputs.
  - `rounded-2xl`: 16px for modals, hero sections, and main panels.
  - `rounded-full`: Pill badges, status tags, and avatar icons.

---

## Component Pattern Guidelines

### Cards
```tsx
<div className="rounded-xl border border-border bg-card shadow-sm p-6 transition-all hover:shadow-md">
  ...
</div>
```

### Primary Buttons
```tsx
<button className="bg-espresso text-cream hover:bg-espresso/90 rounded-xl px-5 py-3 font-semibold transition-all active:scale-95">
  Action Label
</button>
```

### CTA Buttons
```tsx
<button className="bg-caramel text-espresso hover:bg-caramel/90 rounded-xl px-6 py-3.5 font-bold shadow-md transition-all active:scale-95">
  Order Now
</button>
```

---

## Animation Guidelines

1. **Page Transitions**: Handled by `framer-motion` (`AnimatePresence` + `motion.div`). Smooth opacity transition with 10px Y-axis shift (duration: 0.2s).
2. **Interactive Elements**: Micro-interactions use `framer-motion` (`whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`). Never CSS `@keyframes` on interactive components.
3. **Scroll-Driven Entrance**: GSAP `ScrollTrigger` for landing page hero and feature section roll-ins.
4. **Smooth Scroll**: `lenis` handles smooth momentum scrolling application-wide.

---

## Responsive & Accessibility Standards

- Mobile viewport target: minimum 320px layout support.
- Dark mode toggle: class-based sync with zero-flash layout script in `layout.tsx`.
- All icon-only buttons (`lucide-react`) MUST contain `aria-label` tags for screen readers.
