---
name: claude-scope:ui-styling
description: Create beautiful, accessible user interfaces with Radix UI primitives, Tailwind CSS utility-first styling, and the Claude Scope CS* component system. Use when building user interfaces, implementing design systems, creating responsive layouts, adding accessible components (dialogs, dropdowns, forms, tables), customizing themes and colors, enforcing brand consistency, or establishing consistent styling patterns across the application.
argument-hint: "[component or layout]"
license: MIT
metadata:
 author: claudekit
 version: "1.0.0"
---

# UI Styling Skill — Claude Scope

Comprehensive skill for creating beautiful, accessible user interfaces using the Claude Scope design system: CS* component library (built on Radix UI), Tailwind CSS utility styling, and centralized CSS custom properties for brand consistency.

## Reference

- Radix UI: https://radix-ui.com
- Tailwind CSS: https://tailwindcss.com/docs
- Lucide Icons: https://lucide.dev

## When to Use This Skill

Use when:
- Building or modifying UI pages and components in the Claude Scope frontend
- Enforcing brand consistency across the application (colors, typography, spacing)
- Implementing accessible components (dialogs, forms, tables, navigation)
- Styling with utility-first CSS approach using Tailwind
- Creating responsive, mobile-first layouts
- Adding or updating CS* components (CSButton, CSCard, CSInput, etc.)
- Reviewing UI for visual consistency with the `--cs-*` design token system
- Optimizing perceived quality, contrast, or interaction feedback

## Core Stack

### Component Layer: CS* Components (Radix UI)
- Custom component library prefixed with `CS` (CSButton, CSCard, CSInput, CSCodeBlock, etc.)
- Built on Radix UI primitives for accessibility
- Located in `frontend/src/components/ui/`
- TypeScript-first with full type safety
- Composable primitives for complex UIs

### Styling Layer: Tailwind CSS + CSS Custom Properties
- Utility-first CSS framework via Tailwind CSS 3
- Centralized design tokens as CSS custom properties (`--cs-*`) in `frontend/src/index.css`
- Brand colors, surfaces, borders, text, and semantic tokens
- Fonts: DM Sans (body), JetBrains Mono (code)
- Dark mode by default (deep navy/purple dark theme)

### Layout Layer: App Shell
- Layout components in `frontend/src/components/layout/` (AppShell, TopNav, PipelineShell)
- Pipeline-based navigation (Record → Process → Review → Output)

## Quick Start

### Using CS* Components

All custom components live in `frontend/src/components/ui/` and follow the `CS` prefix convention.

**Example — Using CSButton and CSCard:**
```tsx
import { CSButton } from "@/components/ui/CSButton"
import { CSCard } from "@/components/ui/CSCard"

export function DashboardCard() {
  return (
    <CSCard className="p-6">
      <h3 className="text-lg font-semibold" style={{ color: 'var(--cs-text-primary)' }}>
        Analytics
      </h3>
      <p style={{ color: 'var(--cs-text-secondary)' }}>View your metrics</p>
      <CSButton variant="primary" size="md" className="w-full mt-4">
        View Details
      </CSButton>
    </CSCard>
  )
}
```

### Design Token System

All brand values are defined as CSS custom properties in `frontend/src/index.css`:

```css
:root {
  /* Surfaces */
  --cs-bg-base:        #080810;
  --cs-bg-surface:     #0F0F1A;
  --cs-bg-raised:      #161625;
  --cs-bg-overlay:     #1E1E30;

  /* Brand */
  --cs-accent:         #7B6EF6;
  --cs-accent-hover:   #9388F8;
  --cs-accent-muted:   rgba(123, 110, 246, 0.15);

  /* Text */
  --cs-text-primary:   #F0F0F8;
  --cs-text-secondary: #8888A0;
  --cs-text-muted:     #444458;

  /* Semantic */
  --cs-success:        #4ADE80;
  --cs-warning:        #FBBF24;
  --cs-danger:         #F87171;
  --cs-info:           #60A5FA;
}
```

**Rule:** Always use `--cs-*` tokens for colors. Never hardcode hex values in components.

## Component Library Guide

**Comprehensive component catalog with usage patterns, installation, and composition examples.**

See: `references/shadcn-components.md`

Covers:
- Form & input components (Button, Input, Select, Checkbox, Date Picker, Form validation)
- Layout & navigation (Card, Tabs, Accordion, Navigation Menu)
- Overlays & dialogs (Dialog, Drawer, Popover, Toast, Command)
- Feedback & status (Alert, Progress, Skeleton)
- Display components (Table, Data Table, Avatar, Badge)

## Theme & Customization

**Theme configuration, CSS variables, dark mode implementation, and component customization.**

See: `references/shadcn-theming.md`

Covers:
- Dark mode setup with next-themes
- CSS variable system
- Color customization and palettes
- Component variant customization
- Theme toggle implementation

## Accessibility Patterns

**ARIA patterns, keyboard navigation, screen reader support, and accessible component usage.**

See: `references/shadcn-accessibility.md`

Covers:
- Radix UI accessibility features
- Keyboard navigation patterns
- Focus management
- Screen reader announcements
- Form validation accessibility

## Tailwind Utilities

**Core utility classes for layout, spacing, typography, colors, borders, and shadows.**

See: `references/tailwind-utilities.md`

Covers:
- Layout utilities (Flexbox, Grid, positioning)
- Spacing system (padding, margin, gap)
- Typography (font sizes, weights, alignment, line height)
- Colors and backgrounds
- Borders and shadows
- Arbitrary values for custom styling

## Responsive Design

**Mobile-first breakpoints, responsive utilities, and adaptive layouts.**

See: `references/tailwind-responsive.md`

Covers:
- Mobile-first approach
- Breakpoint system (sm, md, lg, xl, 2xl)
- Responsive utility patterns
- Container queries
- Max-width queries
- Custom breakpoints

## Tailwind Customization

**Config file structure, custom utilities, plugins, and theme extensions.**

See: `references/tailwind-customization.md`

Covers:
- @theme directive for custom tokens
- Custom colors and fonts
- Spacing and breakpoint extensions
- Custom utility creation
- Custom variants
- Layer organization (@layer base, components, utilities)
- Apply directive for component extraction

## Visual Design System

**Canvas-based design philosophy, visual communication principles, and sophisticated compositions.**

See: `references/canvas-design-system.md`

Covers:
- Design philosophy approach
- Visual communication over text
- Systematic patterns and composition
- Color, form, and spatial design
- Minimal text integration
- Museum-quality execution
- Multi-page design systems

## Utility Scripts

**Python automation for component installation and configuration generation.**

### shadcn_add.py
Add shadcn/ui components with dependency handling:
```bash
python scripts/shadcn_add.py button card dialog
```

### tailwind_config_gen.py
Generate tailwind.config.js with custom theme:
```bash
python scripts/tailwind_config_gen.py --colors brand:blue --fonts display:Inter
```

## Best Practices

1. **Component Composition**: Build complex UIs from simple, composable primitives
2. **Utility-First Styling**: Use Tailwind classes directly; extract components only for true repetition
3. **Mobile-First Responsive**: Start with mobile styles, layer responsive variants
4. **Accessibility-First**: Leverage Radix UI primitives, add focus states, use semantic HTML
5. **Design Tokens**: Use consistent spacing scale, color palettes, typography system
6. **Dark Mode Consistency**: Apply dark variants to all themed elements
7. **Performance**: Leverage automatic CSS purging, avoid dynamic class names
8. **TypeScript**: Use full type safety for better DX
9. **Visual Hierarchy**: Let composition guide attention, use spacing and color intentionally
10. **Expert Craftsmanship**: Every detail matters - treat UI as a craft

## Reference Navigation

**Component Library**
- `references/shadcn-components.md` - Complete component catalog
- `references/shadcn-theming.md` - Theming and customization
- `references/shadcn-accessibility.md` - Accessibility patterns

**Styling System**
- `references/tailwind-utilities.md` - Core utility classes
- `references/tailwind-responsive.md` - Responsive design
- `references/tailwind-customization.md` - Configuration and extensions

**Visual Design**
- `references/canvas-design-system.md` - Design philosophy and canvas workflows

**Automation**
- `scripts/shadcn_add.py` - Component installation
- `scripts/tailwind_config_gen.py` - Config generation

## Common Patterns

**Using CS* components with design tokens:**
```tsx
import { CSButton } from "@/components/ui/CSButton"
import { CSCard } from "@/components/ui/CSCard"
import { CSInput } from "@/components/ui/CSInput"

export function SettingsForm() {
  return (
    <CSCard className="p-6 space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--cs-text-primary)' }}>
        Settings
      </h2>
      <CSInput label="Display Name" placeholder="Enter name" />
      <CSInput label="Email" type="email" placeholder="you@example.com" />
      <div className="flex gap-3 pt-2">
        <CSButton variant="primary" size="md">Save</CSButton>
        <CSButton variant="ghost" size="md">Cancel</CSButton>
      </div>
    </CSCard>
  )
}
```

**Responsive layout with Claude Scope tokens:**
```tsx
<div className="min-h-screen" style={{ background: 'var(--cs-bg-base)' }}>
  <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CSCard className="p-6">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--cs-text-primary)' }}>
          Content
        </h3>
        <p style={{ color: 'var(--cs-text-secondary)' }}>Description here</p>
      </CSCard>
    </div>
  </div>
</div>
```

## Resources

- Radix UI: https://radix-ui.com
- Tailwind CSS Docs: https://tailwindcss.com
- Lucide Icons: https://lucide.dev
- Tailwind UI: https://tailwindui.com
