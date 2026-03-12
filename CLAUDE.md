# Global Rules

Domain rules in `rules/` load by file path. Skills in `skills/` load by keyword. **If the user's question relates to a topic below but the rule wasn't auto-loaded, read the rule file before answering.**

## Rule Index

| Topic | Rule File | Read when user asks about... |
|---|---|---|
| frontend | `rules/frontend.md` | Astro, Preact, islands, CSS Modules, hydration |
| design | `rules/design.md` | spacing, typography, color, tokens, motion, states |
| backend | `rules/backend.md` | Hono, API routes, middleware, response shapes |
| database | `rules/database.md` | PostgreSQL, Drizzle, schema, migrations, queries |
| security | `rules/security.md` | auth, sessions, encryption, headers, rate limiting |
| testing | `rules/testing.md` | tests, Vitest, Playwright, bun:test, E2E |
| devops | `rules/devops.md` | Docker, CI/CD, deployment, Coolify, backups |
| laravel | `rules/laravel.md` | PHP, Laravel, Livewire, Blade, Eloquent |
| compliance | `rules/compliance.md` | GDPR, cookies, privacy, licenses, accessibility legal |
| incident | `rules/incident.md` | outage, postmortem, rollback, severity, status page |
| copywriting | `rules/copywriting.md` | labels, error messages, empty states, microcopy |
| git | `rules/git.md` | branches, commits, gitignore, push safety |
| ticketing | `rules/ticketing.md` | tickets, acceptance criteria, phases |
| planning | `rules/planning.md` | architecture decisions, ADRs, roadmap |
| research | `rules/research.md` | library eval, API eval, spikes |

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
