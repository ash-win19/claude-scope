# Claude Scope — Master Design System

Global source of truth for the Claude Scope application. All UI work must conform to these specifications. Page-specific overrides live in `design-system/pages/<page-name>.md`.

## Brand Identity

- **Product**: Claude Scope — "Inspect your UI. Prompt your AI."
- **Category**: AI Developer Tool / SaaS
- **Style**: Dark-mode-first, minimal, AI-native with subtle depth
- **Personality**: Technical precision meets visual elegance

## Color System

### Surfaces (Dark Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--cs-bg-base` | `#080810` | Page background, root container |
| `--cs-bg-surface` | `#0F0F1A` | Cards, panels, sidebars |
| `--cs-bg-raised` | `#161625` | Elevated cards, hover states |
| `--cs-bg-overlay` | `#1E1E30` | Modals, drawers, tooltips |

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--cs-border-subtle` | `rgba(255,255,255,0.06)` | Dividers, section separators |
| `--cs-border-default` | `rgba(255,255,255,0.12)` | Card borders, input borders |
| `--cs-border-strong` | `rgba(255,255,255,0.22)` | Focus rings, active borders |

### Text

| Token | Value | Contrast | Usage |
|-------|-------|----------|-------|
| `--cs-text-primary` | `#F0F0F8` | ~18:1 on base | Headings, primary content |
| `--cs-text-secondary` | `#8888A0` | ~5.2:1 on base | Descriptions, labels |
| `--cs-text-muted` | `#444458` | ~2.3:1 on base | Placeholders, disabled text |

### Brand Accent

| Token | Value | Usage |
|-------|-------|-------|
| `--cs-accent` | `#7B6EF6` | Primary buttons, links, active states |
| `--cs-accent-hover` | `#9388F8` | Hover state for accent elements |
| `--cs-accent-muted` | `rgba(123,110,246,0.15)` | Accent backgrounds, selection |
| `--cs-accent-border` | `rgba(123,110,246,0.35)` | Focus rings on accent elements |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--cs-success` / `--cs-success-muted` | `#4ADE80` / `rgba(74,222,128,0.12)` | Success states, completion |
| `--cs-warning` / `--cs-warning-muted` | `#FBBF24` / `rgba(251,191,36,0.12)` | Warnings, caution |
| `--cs-danger` / `--cs-danger-muted` | `#F87171` / `rgba(248,113,113,0.12)` | Errors, destructive actions |
| `--cs-info` / `--cs-info-muted` | `#60A5FA` / `rgba(96,165,250,0.12)` | Informational, links |

### Pipeline Step Colors

| Token | Value | Step |
|-------|-------|------|
| `--cs-step-record` | `#F87171` | Record (red) |
| `--cs-step-process` | `#FBBF24` | Process (amber) |
| `--cs-step-review` | `#60A5FA` | Review (blue) |
| `--cs-step-output` | `#4ADE80` | Output (green) |

### DOM Diff Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--cs-diff-added` | `#4ADE80` | Added elements |
| `--cs-diff-removed` | `#F87171` | Removed elements |
| `--cs-diff-changed` | `#FBBF24` | Changed elements |

## Typography

| Role | Font | Weight | Size | Usage |
|------|------|--------|------|-------|
| Body | DM Sans | 400 | 14px | Default text, paragraphs |
| Heading | DM Sans | 600–700 | 18–32px | Page titles, section headers |
| Label | DM Sans | 500 | 12–14px | Form labels, navigation |
| Code | JetBrains Mono | 400 | 13px | Code blocks, technical output |

- **Line height**: 1.6 (body), 1.3 (headings)
- **Google Fonts**: `DM Sans:wght@400;500;600;700` + `JetBrains Mono:wght@400;500`
- **Tailwind config**: `fontFamily.sans: ['DM Sans', 'system-ui', 'sans-serif']`, `fontFamily.mono: ['JetBrains Mono', 'monospace']`

## Spacing & Layout

- **Spacing scale**: 4px base (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
- **Max content width**: `max-w-6xl` (1152px)
- **Card padding**: 16–24px
- **Section gap**: 24–32px
- **Border radius**: 8px (cards), 6px (inputs/buttons), 12px (modals)

## Component Conventions

### CS* Component Library

All custom UI components follow the `CS` prefix convention and are located in `frontend/src/components/ui/`:

| Component | File | Purpose |
|-----------|------|---------|
| CSButton | `CSButton.tsx` | Primary action buttons with variant/size props |
| CSCard | `CSCard.tsx` | Container cards with surface background |
| CSInput | `CSInput.tsx` | Text inputs with labels |
| CSCodeBlock | `CSCodeBlock.tsx` | Code display with copy functionality |
| CSToast | `CSToast.tsx` | Toast notifications |

### Layout Components

Located in `frontend/src/components/layout/`:

| Component | Purpose |
|-----------|---------|
| AppShell | Main app layout wrapper |
| TopNav | Top navigation bar |
| PipelineShell | Pipeline step layout (Record → Process → Review → Output) |

### Icons

- **Library**: Lucide React (`lucide-react`)
- **Sizing**: Use consistent token sizes (16px inline, 20px nav, 24px primary actions)
- **Rule**: Never use emojis as functional icons

## Interaction States

| State | Visual Treatment |
|-------|-----------------|
| Hover | Background shift to `--cs-bg-raised`, accent color to `--cs-accent-hover` |
| Focus | 2px ring with `--cs-accent-border`, visible outline |
| Active/Pressed | Scale 0.98, slight darken |
| Disabled | Opacity 0.5, `cursor-not-allowed` |
| Loading | Spinner animation (`animate-cs-spin`), disabled state |

## Animation Tokens

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| `cs-fade-in` | 200ms | ease-out | Element appearance |
| `cs-scale-in` | 200ms | ease-out | Modal/popover entrance |
| `cs-slide-in-right` | 300ms | ease-out | Panel slides |
| `cs-pulse` | 800ms | infinite | Loading indicators |
| `cs-shimmer` | 1.5s | infinite | Skeleton placeholders |
| `cs-spin` | 600ms | linear | Spinner rotation |

## Anti-Patterns (Avoid)

- Hardcoded hex values — always use `--cs-*` tokens
- Mixing font families beyond DM Sans / JetBrains Mono
- Light backgrounds on dark surfaces (inverted contrast)
- Emojis as navigation or action icons
- Animations > 500ms for micro-interactions
- AI purple/pink gradient cliches — the accent is a refined indigo `#7B6EF6`
- Inconsistent border-radius values across components
- Using gray text on dark surfaces below 3:1 contrast

## Accessibility Requirements

- Text contrast: >= 4.5:1 (AA) for all body text
- Large text contrast: >= 3:1 for headings 18px+
- Touch targets: >= 44x44px
- Focus indicators: visible on all interactive elements
- `prefers-reduced-motion`: respect by disabling decorative animations
- Semantic HTML: proper heading hierarchy (h1 → h6)
- Form labels: every input must have an associated label

## File Reference

| File | Purpose |
|------|---------|
| `frontend/src/index.css` | CSS custom properties (design tokens) |
| `frontend/tailwind.config.ts` | Tailwind theme extension |
| `frontend/index.html` | Google Fonts imports, meta tags |
| `frontend/src/components/ui/` | CS* component library |
| `frontend/src/components/layout/` | Layout components |
