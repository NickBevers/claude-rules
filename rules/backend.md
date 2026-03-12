---
paths:
  - "**/server/**"
  - "**/api/**"
  - "**/*.server.ts"
  - "**/routes/**"
  - "**/services/**"
  - "**/middleware/**"
---

# Backend Rules

## Hono

- All routes: `/api/v1/` prefix (versioned from day one)
- `env(c)` from `hono/adapter` for env vars — NEVER `Bun.env` or `process.env`
- `crypto.subtle` for encryption — cross-runtime
- Abstract runtime-specific features behind interfaces

## API Design

- Response shapes: `{ data }` success, `{ error, message }` failure
- Pagination: cursor-based for large sets, offset for admin/small
- Zod validation at handler level for all input
- Never expose stack traces, internal IDs, or DB details in errors
- Generic auth errors: "Invalid email or password"

## Auth (when applicable)

- Argon2id via `Bun.password` (native, no npm)
- Session cookies: HTTP-only, Secure, SameSite=Strict
- Rotate session token on: login, email verification, password change
- Never trust X-Forwarded-For — use cf-connecting-ip or X-Real-IP
- Same-origin deployments: NO CORS middleware, NO CSRF middleware

## Middleware

- Rate limiting: `hono-rate-limiter` — per-IP on auth, per-user on API, global safety net
- Security headers: X-Content-Type-Options, X-Frame-Options, HSTS, CSP, Referrer-Policy
- Request ID per request for tracing

## Jobs (when applicable)

- PostgreSQL-based queues preferred (pgboss) — BullMQ has Bun segfault issues
- Idempotent handlers, circuit breakers for external APIs
