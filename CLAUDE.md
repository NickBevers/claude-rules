# Global Rules

Domain rules in `rules/` load conditionally by file path. Skills in `skills/` load on demand.

## Stack Defaults

Use unless project CLAUDE.md overrides.

| Layer | Choice | Constraint |
|---|---|---|
| Runtime | Bun | Never Node.js |
| Frontend | Astro 6 + Preact | Islands architecture |
| Styling | CSS Modules (.module.css) | No Tailwind, no styled-components |
| State | Nanostores (@nanostores/preact) | Cross-island only. Never React Context. |
| Icons | @tabler/icons-preact | Individual imports only |
| Charts | VisX via preact/compat | Validate light + dark mode |
| Lint/Format | Oxlint + Prettier | |
| HTTP | Hono | When backend needed. Never Express/Fastify/Elysia. |
| Database | PostgreSQL 16 + Drizzle ORM | When DB needed. No raw SQL unless measured. |
| Env vars | `env(c)` from hono/adapter | When using Hono. NEVER Bun.env or process.env. |

## Hard Constraints

Things Claude gets wrong without explicit instruction:

- Astro 6 Zod: `import { z } from 'astro/zod'` (NOT from 'zod')
- Nanostores for cross-island state — never prop-drill >2 levels
- `preact/compat` alias required for React-dependent libs (VisX, etc.)
- CSS custom properties for theming — never hardcode colors/spacing
- Light + dark mode: design and validate both simultaneously
- Mobile-first: `min-width` media queries
- Only animate `transform` and `opacity` — never layout properties
- `@media (prefers-reduced-motion: reduce)` on all non-essential animation

## Workflow

- Only change what was asked. No drive-by refactors.
- Read existing code before modifying.
- If unsure, ask. Do not assume.
- Git branches: `feature/TICKET-ID-short-desc`, `fix/short-desc`

## Paired Subagent Sparring

When a skill calls for sparring, use the Agent tool to spawn parallel workers with opposing creative lenses. Always present results to the user for feedback before finalizing.
