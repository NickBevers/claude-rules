---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.astro"
  - "**/*.module.css"
  - "**/*.css"
  - "**/components/**"
  - "**/islands/**"
  - "**/pages/**"
  - "**/layouts/**"
---

# Frontend Rules

## Astro + Preact

- Astro pages in `.astro`, interactive components in `.tsx` (Preact)
- Static pages: pre-rendered at build. Dynamic pages: server islands (SSR)
- `preact/compat` only when a library requires React (e.g., VisX)
- Never use full React when Preact suffices

## CSS Modules

- Scoped `.module.css` — no runtime cost, no class collisions
- No inline styles beyond truly dynamic values
- No `!important` — fix specificity properly
- CSS custom properties for all theming values
- Mobile-first: `min-width` media queries
- Light + dark mode: design and validate both simultaneously

## State

- Cross-island state: Nanostores only (`@nanostores/preact`)
- Local state: `useState` / `useReducer`
- Never prop-drill >2 levels — extract to nanostore

## Icons & Charts

- Tabler Icons: `import { IconSearch } from '@tabler/icons-preact'` — never full set
- VisX: requires `preact/compat` alias. Validate light + dark mode rendering.

## Performance

- Hydrate only interactive islands — minimize client JS
- Lazy-load below-the-fold components
- Set explicit dimensions on images/media (prevent layout shift)
- Named imports only — no barrel file re-exports
