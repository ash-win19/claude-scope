# Claude Scope — Brand Color Guidelines

> **Palette: "Crimson Intelligence"** — A red-primary, blue-secondary, teal-accent system designed for a tech-forward AI brand. Dark mode is the default experience.

---

## 1. Core Brand Colors

| Role | Token | Dark Mode | Light Mode | Notes |
|------|-------|-----------|------------|-------|
| Primary Red (base) | `--cs-accent` | `#E03030` | `#E03030` | Primary CTAs, record indicators, brand marks |
| Primary Red (hover) | `--cs-accent-hover` | `#FF5A5A` | `#FF6B6B` | Hover/active state on primary elements |
| Primary Red (deep) | `--cs-accent-deep` | `#A81F1F` | `#B01818` | Pressed states, dark accents |
| Primary Red (muted) | `--cs-accent-muted` | `rgba(224,48,48,0.15)` | `rgba(224,48,48,0.10)` | Subtle backgrounds, badges |
| On Accent (text) | `--cs-on-accent` | `#FFFFFF` | `#FFFFFF` | Text on red backgrounds |
| Secondary Blue (base) | `--cs-secondary` | `#1E88E5` | `#1976D2` | Links, secondary CTAs, info states |
| Secondary Blue (hover) | `--cs-secondary-hover` | `#64B5F6` | `#90CAF9` | Hover state on secondary elements |
| Secondary Blue (deep) | `--cs-secondary-deep` | `#1356A3` | `#0D47A1` | Pressed states |
| Secondary Blue (muted) | `--cs-secondary-muted` | `rgba(30,136,229,0.15)` | `rgba(25,118,210,0.10)` | Subtle info backgrounds |
| Accent Teal (base) | `--cs-teal` | `#00C9A7` | `#00BFA5` | Charts, data viz, AI output indicators |
| Accent Teal (hover) | `--cs-teal-hover` | `#4DFFD9` | `#64FFDA` | Hover on teal elements |
| Accent Teal (deep) | `--cs-teal-deep` | `#008C75` | `#007C6E` | Pressed teal states |
| Accent Teal (muted) | `--cs-teal-muted` | `rgba(0,201,167,0.15)` | `rgba(0,191,165,0.10)` | Subtle teal backgrounds |
| Neutral | `--cs-neutral` | `#4A4A4A` | `#E0E0E0` | UI lines, subtle borders |

---

## 2. Surface & Text Tokens

### Dark Mode (Default)

| Role | Token | Value |
|------|-------|-------|
| Main background | `--cs-bg-base` | `#121212` |
| Panel / card bg | `--cs-bg-surface` | `#1E1E1E` |
| Raised element bg | `--cs-bg-raised` | `#2A2A2A` |
| Overlay / popover bg | `--cs-bg-overlay` | `#3C3C3C` |
| Primary text | `--cs-text-primary` | `#F1F1F1` |
| Secondary text | `--cs-text-secondary` | `#A0A0A0` |
| Muted text | `--cs-text-muted` | `#666666` |
| Border (subtle) | `--cs-border-subtle` | `rgba(255,255,255,0.08)` |
| Border (default) | `--cs-border-default` | `rgba(255,255,255,0.14)` |
| Border (strong) | `--cs-border-strong` | `rgba(255,255,255,0.24)` |

### Light Mode (Marketing / Onboarding)

| Role | Token | Value |
|------|-------|-------|
| Main background | `--cs-bg-base` | `#FFFFFF` |
| Panel / card bg | `--cs-bg-surface` | `#F8F9FA` |
| Raised element bg | `--cs-bg-raised` | `#F5F5F5` |
| Overlay / popover bg | `--cs-bg-overlay` | `#E6E6E6` |
| Primary text | `--cs-text-primary` | `#1C1C1C` |
| Secondary text | `--cs-text-secondary` | `#5F6368` |
| Muted text | `--cs-text-muted` | `#9E9E9E` |
| Border (subtle) | `--cs-border-subtle` | `rgba(0,0,0,0.06)` |
| Border (default) | `--cs-border-default` | `rgba(0,0,0,0.12)` |
| Border (strong) | `--cs-border-strong` | `rgba(0,0,0,0.22)` |

---

## 3. Semantic Colors

| Purpose | Token | Dark Mode | Light Mode | Notes |
|---------|-------|-----------|------------|-------|
| Success | `--cs-success` | `#4ADE80` | `#4ADE80` | Completed states, positive metrics |
| Warning | `--cs-warning` | `#FBBF24` | `#FBBF24` | Caution, in-progress states |
| Danger / Error | `--cs-danger` | `#FF6B6B` | `#FF6B6B` | **Coral, NOT brand red** |
| Info | `--cs-info` | `#1E88E5` | `#1976D2` | Uses secondary blue |

---

## 4. Pipeline Step Colors

| Step | Token | Color | Rationale |
|------|-------|-------|-----------|
| Record | `--cs-step-record` | `#E03030` | Brand red — represents camera/recording |
| Process | `--cs-step-process` | `#FBBF24` | Warm amber — active processing |
| Review | `--cs-step-review` | `#1E88E5` | Secondary blue — analysis/inspection |
| Output | `--cs-step-output` | `#00C9A7` | Accent teal — completed AI output |

---

## 5. Accessibility — Contrast Ratios (WCAG 2.1)

### Dark Mode (`#121212` base)

| Combination | Ratio | WCAG AA | WCAG AAA |
|-------------|-------|---------|----------|
| `#F1F1F1` on `#121212` | **17.1:1** | Pass | Pass |
| `#A0A0A0` on `#121212` | **7.3:1** | Pass | Pass |
| `#666666` on `#121212` | **3.4:1** | Large text only | Fail |
| `#E03030` on `#121212` | **4.2:1** | Large text / UI | Fail |
| `#FFFFFF` on `#E03030` | **4.6:1** | Pass | Fail |
| `#1E88E5` on `#121212` | **4.8:1** | Pass | Fail |
| `#FFFFFF` on `#1E88E5` | **4.1:1** | Large text / UI | Fail |
| `#00C9A7` on `#121212` | **7.8:1** | Pass | Pass |
| `#FF6B6B` on `#121212` | **5.2:1** | Pass | Fail |

### Light Mode (`#FFFFFF` base)

| Combination | Ratio | WCAG AA | WCAG AAA |
|-------------|-------|---------|----------|
| `#1C1C1C` on `#FFFFFF` | **17.6:1** | Pass | Pass |
| `#5F6368` on `#FFFFFF` | **6.0:1** | Pass | Fail |
| `#E03030` on `#FFFFFF` | **4.5:1** | Pass | Fail |
| `#1976D2` on `#FFFFFF` | **5.1:1** | Pass | Fail |

---

## 6. Usage by Component Type

### Buttons

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary CTA | `--cs-accent` | `--cs-on-accent` | none |
| Secondary | transparent | `--cs-text-primary` | `--cs-border-default` |
| Ghost | transparent | `--cs-text-secondary` | none |
| Danger | `--cs-danger-muted` | `--cs-danger` | `--cs-danger` |
| Teal/Data | `--cs-teal` | `#FFFFFF` | none |

### Cards

| Element | Token |
|---------|-------|
| Background | `--cs-bg-surface` |
| Border | `--cs-border-subtle` |
| Title text | `--cs-text-primary` |
| Body text | `--cs-text-secondary` |

### Charts & Data Visualization

Use the three brand colors in this order for chart series:
1. `--cs-accent` (red) — primary metric
2. `--cs-secondary` (blue) — secondary metric
3. `--cs-teal` (teal) — tertiary metric
4. `--cs-warning` (amber) — fourth series if needed

### Badges & Status Indicators

| State | Background | Text |
|-------|------------|------|
| Default | `--cs-bg-overlay` | `--cs-text-secondary` |
| Active/Recording | `--cs-accent-muted` | `--cs-accent` |
| Success | `--cs-success-muted` | `--cs-success` |
| Warning | `--cs-warning-muted` | `--cs-warning` |
| Error | `--cs-danger-muted` | `--cs-danger` |
| Info | `--cs-secondary-muted` | `--cs-secondary` |

### Navigation

| Element | Active | Inactive |
|---------|--------|----------|
| Sidebar item bg | `--cs-accent-muted` | transparent |
| Sidebar item text | `--cs-text-primary` | `--cs-text-secondary` |
| Brand dot | `--cs-accent` | — |

---

## 7. Do / Don't

### DO

- Use `--cs-accent` (#E03030) for primary CTAs, record buttons, brand marks, and key metrics
- Use `--cs-secondary` (#1E88E5) for links, secondary buttons, informational UI, and chart data
- Use `--cs-teal` (#00C9A7) for success-adjacent states, AI output indicators, and data viz highlights
- Use `--cs-danger` (#FF6B6B coral) for all error and destructive states
- Pair white text (`--cs-on-accent`) on red backgrounds for button labels
- Use `--cs-accent-muted` for subtle red tints (badges, active nav, soft highlights)
- Maintain WCAG AA contrast for all text/background combinations
- Keep red elements large (buttons, headers, icons ≥18px) when on dark backgrounds

### DON'T

- **Never use brand red (#E03030) for error states** — this conflates brand identity with destructive actions
- Don't use `--cs-accent` for inline body text on dark backgrounds (4.2:1 is below AA for small text)
- Don't mix the Crimson palette with the Ember Studio violet variant — pick one direction
- Don't use raw hex values in components — always reference `--cs-*` tokens
- Don't rely on color alone to convey meaning — always pair with icons or text labels
- Don't use `--cs-text-muted` (#666666) for essential information — it only passes for large text

---

## 8. Tailwind CSS Configuration

```js
// tailwind.config.ts — extend with brand tokens
theme: {
  extend: {
    colors: {
      brand: {
        red: {
          light: '#FF5A5A',
          DEFAULT: '#E03030',
          deep: '#A81F1F',
        },
        blue: {
          light: '#64B5F6',
          DEFAULT: '#1E88E5',
          deep: '#1356A3',
        },
        teal: {
          light: '#4DFFD9',
          DEFAULT: '#00C9A7',
          deep: '#008C75',
        },
      },
    },
  },
}
```

---

## 9. Alternative Palette: "Ember Studio" (Premium/Cinematic)

For a more editorial direction (Runway ML / Pika style), swap secondary blue for violet:

| Role | Token | Hex |
|------|-------|-----|
| Primary Red | `--cs-accent` | `#C62828` |
| Secondary Violet | `--cs-secondary` | `#7C4DFF` |
| Accent Blue | `--cs-teal` | `#29B6F6` |
| Background | `--cs-bg-base` | `#1A1A1A` |

This variant is documented but **not implemented** — the Crimson Intelligence palette is the active brand.
