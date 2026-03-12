# Design Rules

## General Principles

- **Clarity over decoration** — Every visual element should serve a purpose
- **Consistency** — Reuse existing patterns, colors, spacing, and typography before introducing new ones
- **Progressive disclosure** — Show essential information first, details on demand
- **Responsive by default** — Every design must work on mobile, tablet, and desktop

## Visual Standards

- Use a systematic spacing scale (4px base: 4, 8, 12, 16, 24, 32, 48, 64)
- Typography: max 2 font families (one for headings, one for body — or one for both)
- Limit color palette: primary, secondary, neutral, success, warning, error, info
- All colors must meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Support light and dark mode from the start — design both simultaneously

## Layout

- Use CSS Grid for page-level layouts, Flexbox for component-level alignment
- Mobile-first: design the smallest viewport first, enhance for larger screens
- Max content width: ~1200px for readability (configurable per project)
- Consistent gutters and margins using the spacing scale

## Components

- Design reusable, composable components (buttons, inputs, cards, modals, etc.)
- States: default, hover, focus, active, disabled, loading, error
- Every interactive element needs visible focus styles (keyboard accessibility)
- Loading states: use skeleton screens over spinners where possible
- Empty states: always design what happens when there's no data

## Data Visualization

- Choose chart types appropriate to the data (line for trends, bar for comparison, etc.)
- Label axes, include legends, and show units
- Use colorblind-safe palettes
- Provide data tables as an alternative to charts for accessibility
- Show loading and empty states for all charts

## Iconography

- Use Tabler Icons consistently — don't mix icon libraries
- Icons should be accompanied by text labels (icon-only buttons need aria-labels)
- Consistent icon sizing within contexts (16px inline, 20px buttons, 24px navigation)

## Forms

- Labels above inputs (not placeholder-only labels)
- Inline validation with clear error messages
- Group related fields logically
- Primary action button clearly distinguished from secondary actions
- Disable submit button during form submission, show loading state

## Motion & Animation

- Keep animations subtle and purposeful (< 300ms for UI transitions)
- Respect `prefers-reduced-motion` — disable non-essential animations
- Use animation for state changes, not decoration

## Design Tokens

- Define design tokens (colors, spacing, typography, shadows, radii) as CSS custom properties
- Single source of truth for all visual values
- Token names describe purpose, not appearance (`--color-primary`, not `--blue-500`)

## Related Skills

For in-depth creative work, use the paired subagent skills:
- **[Design Discovery](./skill-design-discovery.md)** — Use when choosing fonts and colors for a project. Spawns paired agents that spar to avoid generic defaults.
- **[Micro Animations](./skill-micro-animations.md)** — Use when adding hover effects, transitions, and interactive polish. Spawns paired agents that balance expressiveness vs. restraint.
