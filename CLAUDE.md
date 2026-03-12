# Global Rules

Domain rules in `rules/` load conditionally by file path. Skills in `skills/` load on demand.

## Stack Defaults

Use unless project CLAUDE.md overrides.

| Layer | Choice | Constraint |
|---|---|---|
| Runtime | Bun | Never Node.js |
| HTTP | Hono | Cross-runtime. Never Express/Fastify/Elysia. |
| Frontend | Astro 6 + Preact | Islands architecture |
| Database | PostgreSQL 16 + Drizzle ORM | No raw SQL unless measured perf need |
| Styling | CSS Modules (.module.css) | No Tailwind, no styled-components |
| State | Nanostores (@nanostores/preact) | Cross-island only. Never React Context. |
| Icons | @tabler/icons-preact | Individual imports only |
| Charts | VisX via preact/compat | Validate light + dark mode |
| Lint/Format | Oxlint + Prettier | |
| Env vars | `env(c)` from hono/adapter | NEVER Bun.env or process.env |
| Encryption | crypto.subtle (Web Crypto) | Cross-runtime |
| Passwords | Bun.password + Argon2id | Native on Bun |

## Hard Constraints

Things Claude gets wrong without explicit instruction:

- Astro 6 Zod: `import { z } from 'astro/zod'` (NOT from 'zod')
- TEXT over VARCHAR for unbounded data (PostgreSQL btree 2704-byte limit)
- Nanostores for cross-island state — never prop-drill >2 levels
- `preact/compat` alias required for React-dependent libs (VisX, etc.)
- Session cookies: HTTP-only, Secure, SameSite=Strict
- Never expose stack traces, internal IDs, or DB details in API responses
- Generic auth errors only: "Invalid email or password"
- Never trust X-Forwarded-For — use cf-connecting-ip or X-Real-IP

## Workflow

- Only change what was asked. No drive-by refactors.
- Read existing code before modifying.
- If unsure, ask. Do not assume.
- Git branches: `feature/TICKET-ID-short-desc`, `fix/short-desc`
- Colocate tests with source: `foo.ts` + `foo.test.ts`

## Paired Subagent Sparring

When a skill calls for sparring, use the Agent tool to spawn parallel workers with opposing creative lenses. Always present results to the user for feedback before finalizing.
