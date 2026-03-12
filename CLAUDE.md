# Global Rules

Domain rules in `rules/` load conditionally by file path. Skills in `skills/` load on demand.

## Stack Defaults

Use unless project CLAUDE.md overrides.

| Layer | Choice | Constraint |
|---|---|---|
| Runtime | Bun | New projects only. Yarn/npm OK for existing projects. Never Node.js runtime. |
| Frontend | Astro 6 + Preact | Islands architecture |
| Styling | CSS Modules (.module.css) | No Tailwind, no styled-components |
| State | Nanostores (@nanostores/preact) | Cross-island only. Never React Context. |
| Icons | @tabler/icons-preact | ONLY when user explicitly requests icons |
| Charts | VisX via preact/compat | Validate light + dark mode |
| Lint/Format | Oxlint + Prettier | |
| HTTP | Hono | When backend needed. Never Express/Fastify/Elysia. |
| Database | PostgreSQL 16 + Drizzle ORM | When DB needed. No raw SQL unless measured. |
| Env vars | `env(c)` from hono/adapter | When using Hono. NEVER Bun.env or process.env. |

## Hard Constraints

Things Claude gets wrong without explicit instruction:

- **No icons/emojis/decorative elements** unless the user explicitly requests them. Never auto-add icons to buttons, nav items, headings, lists, or any UI element. Text-only by default.
- Astro 6 Zod: `import { z } from 'astro/zod'` (NOT from 'zod')
- Nanostores for cross-island state — never prop-drill >2 levels
- `preact/compat` alias required for React-dependent libs (VisX, etc.)
- CSS custom properties for theming — never hardcode colors/spacing
- OKLCH for color definitions — not HSL, not hex (hex for final output only)
- Light + dark mode: design and validate both simultaneously
- Mobile-first: `min-width` media queries
- Only animate `transform` and `opacity` — never layout properties
- `@media (prefers-reduced-motion: reduce)` on all non-essential animation

## Anti-AI-Slop

If you showed the output to someone and said "AI made this," would they believe immediately? If yes, fix it.

- No Inter/Roboto/system font defaults without explicit user choice
- No purple-to-blue gradients, no cyan-on-dark palettes
- No cards-in-cards, no center-aligned everything
- No generic hero metric layouts (big number + small label)
- Tinted neutrals (OKLCH chroma 0.01-0.02), never pure gray

## Workflow

- Only change what was asked. No drive-by refactors.
- Read existing code before modifying.
- If unsure, ask. Do not assume.
- Git branches: `feature/TICKET-ID-short-desc`, `fix/short-desc`

## Paired Subagent Sparring

When a skill calls for sparring, use the Agent tool to spawn parallel workers with opposing creative lenses. Always present results to the user for feedback before finalizing.
