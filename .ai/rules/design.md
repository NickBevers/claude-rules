
# Design Rules

## Spacing & Layout

- 4px base scale: 4, 8, 12, 16, 24, 32, 48, 64
- CSS Grid for page layouts, Flexbox for component alignment
- Max content width ~1200px
- Container queries (`@container`) for component-level responsiveness
- 44px minimum touch targets on interactive elements

## Typography

- Max 2 font families (heading + body, or 1 for both)
- Avoid Inter/Roboto defaults — use Instrument Sans, Figtree, Geist, or project-specific fonts
- Fluid type: `clamp()` for responsive font sizes
- WCAG AA contrast: 4.5:1 normal text, 3:1 large text

## Color

- OKLCH for color definitions (perceptually uniform, wide gamut)
- Tinted neutrals: chroma 0.01-0.02, never pure gray
- 60-30-10 rule: 60% dominant, 30% secondary, 10% accent
- Dark mode is a separate design — lighter surfaces for depth, not just inverted
- Colorblind-safe palettes. Semantic colors: success, warning, error, info.

## Component States

- Every component: default, hover, focus-visible, active, disabled, loading, error
- `:focus-visible` for keyboard focus — never `outline: none`
- Skeleton screens over spinners. Always design the empty state.

## Icons

- **NEVER add icons unless user explicitly requests them.** No decorative icons.
- When requested: Tabler at 16px inline, 20px buttons, 24px navigation. Paired with text label.

## Design Tokens

- CSS custom properties for all visual values
- Purpose-based names: `--color-primary` not `--blue-500`
- Single source of truth — never hardcode colors/spacing

## Motion

- Duration: 100ms micro, 200-300ms standard, 500ms complex
- Custom `cubic-bezier()` easing — never `ease` or `linear` for UI
- Only animate `transform` and `opacity` — never layout properties
- `grid-template-rows: 0fr → 1fr` for height animations
- Never use `transition: all`
- `@media (prefers-reduced-motion: reduce)` on all non-essential animation
