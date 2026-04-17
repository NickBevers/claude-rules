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
- Static pages: pre-rendered at build. Dynamic pages: server islands (SSR) or `export const prerender = false`
- Use Astro's built-in modules: `astro:content`, `astro:env`, `astro:actions`, `astro/zod` — never bare `zod` or `dotenv`
- `preact/compat` only when a library requires React (e.g., VisX). Scope it — don't enable globally.

## State

- **Preact Signals** (`@preact/signals`) for shared or frequently-updating state — skips VDOM diffing
- **`useState`** for truly local, ephemeral UI state (modal open, input focus)
- **Nanostores** (`@nanostores/preact`) for cross-island state in Astro projects
- Never store derived state — use `computed()` (Signals) or compute during render
- Never prop-drill >2 levels — extract to Signal or nanostore

## CSS Modules

- Scoped `.module.css` — no runtime cost, no class collisions
- No inline styles beyond truly dynamic values
- No `!important` — fix specificity properly

## Icons

- Default icon set: Tabler Icons. `import { IconName } from '@tabler/icons-preact'` — individual imports only, never full set.
- User can specify a different icon set — defer to their choice.
- Icons always need text labels. Icon-only buttons need `aria-label`.
- No emojis in UI elements.

## Performance

- Hydrate only interactive islands — minimize client JS
- `client:visible` for below-fold, `client:load` for above-fold, `client:idle` for non-critical
- Lazy-load below-the-fold components
- Explicit `width`/`height` on images/media (prevent CLS)
- `loading="lazy"` + `decoding="async"` on below-fold images. `fetchpriority="high"` on LCP image.
- Named imports only — no barrel file re-exports
