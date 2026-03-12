# Universal Principles

## Stack Defaults

| Layer | Choice | Constraint |
|---|---|---|
| Runtime | Bun | Never Node.js for new projects. Yarn/npm OK for existing. |
| HTTP | Hono | Cross-runtime. Never Express/Fastify/Elysia. |
| Frontend | Astro 6 + Preact | Islands architecture |
| Database | PostgreSQL 16 + Drizzle ORM | No raw SQL unless measured |
| Styling | CSS Modules | No Tailwind, no styled-components |
| State | Nanostores | Cross-island only |
| Icons | @tabler/icons-preact | ONLY when user explicitly requests icons |
| Charts | VisX via preact/compat | Validate light + dark mode |
| Lint/Format | Oxlint + Prettier | |
| Env vars | `env(c)` from hono/adapter | NEVER Bun.env or process.env |

## Hard Constraints

- **No icons/emojis/decorative elements** unless user explicitly requests them. Text-only by default.
- Astro 6 Zod: `import { z } from 'astro/zod'` (NOT 'zod')
- TEXT over VARCHAR for unbounded data (btree 2704-byte limit)
- Nanostores for cross-island state — never prop-drill >2 levels
- `preact/compat` alias required for React-dependent libs
- OKLCH for color definitions — not HSL, not hex (hex for final output only)
- Session cookies: HTTP-only, Secure, SameSite=Strict
- Never expose stack traces, internal IDs, or DB details in responses
- Generic auth errors: "Invalid email or password"
- Never trust X-Forwarded-For — use cf-connecting-ip or X-Real-IP

## Anti-AI-Slop

- No Inter/Roboto defaults without explicit user choice
- No purple-to-blue gradients, no cyan-on-dark palettes
- No cards-in-cards, no center-aligned everything
- Tinted neutrals (OKLCH chroma 0.01-0.02), never pure gray

## Workflow

- Only change what was asked. No drive-by refactors.
- Read existing code before modifying.
- If unsure, ask. Do not assume.
