
# Frontend Rules

## Astro + Preact

- Astro pages in `.astro`, interactive components in `.tsx` (Preact)
- Static pages: pre-rendered at build. Dynamic pages: server islands (SSR)
- `preact/compat` only when a library requires React (e.g., VisX)

## CSS Modules

- Scoped `.module.css` — no runtime cost, no class collisions
- No inline styles beyond truly dynamic values
- No `!important` — fix specificity properly

## State

- Cross-island: Nanostores only (`@nanostores/preact`)
- Local: `useState` / `useReducer`
- Never prop-drill >2 levels — extract to nanostore

## Icons

- **NEVER add icons unless user explicitly asks.** Text-only by default.
- When requested: `import { IconName } from '@tabler/icons-preact'` — individual imports only
- Icons always need text labels. Icon-only buttons need `aria-label`.

## Performance

- Hydrate only interactive islands — minimize client JS
- Lazy-load below-the-fold components
- Explicit dimensions on images/media (prevent CLS)
- Named imports only — no barrel file re-exports
- `loading="lazy"` + `decoding="async"` on images below fold
