
# Design Rules

## Spacing & Layout

- 4px base scale: 4, 8, 12, 16, 24, 32, 48, 64
- CSS Grid for page layouts, Flexbox for component alignment
- Mobile-first (`min-width` breakpoints)
- Max content width ~1200px

## Typography & Color

- Max 2 font families (heading + body, or 1 for both)
- WCAG AA contrast: 4.5:1 normal text, 3:1 large text
- Colorblind-safe palettes
- Light + dark mode designed simultaneously

## Component States

- Every component: default, hover, focus, active, disabled, loading, error
- Visible focus styles on all interactive elements
- Skeleton screens over spinners for loading
- Always design the empty state

## Icons

- Tabler: 16px inline, 20px buttons, 24px navigation
- Icons need text labels (icon-only buttons need aria-label)

## Design Tokens

- CSS custom properties for all visual values
- Purpose-based names: `--color-primary` not `--blue-500`
- Single source of truth — never hardcode colors/spacing in components

## Motion

- Transitions < 300ms. Custom `cubic-bezier()` easing, never just `ease`.
- `@media (prefers-reduced-motion: reduce)` on all non-essential animation
- Only animate `transform` and `opacity` (GPU-composited, no reflow)
- Never animate `width`, `height`, `margin`, `padding`, `top`, `left`
- Never use `transition: all`
