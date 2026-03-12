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

## Database

- Drizzle ORM — no raw SQL unless perf-critical and measured
- TEXT (not VARCHAR) for unbounded data + `md5()` hash-based unique indexes
- Soft delete default: `is_active` + `deleted_at` columns on user-facing entities
- All queries filter `WHERE is_active = true`

## API Design

- Response shapes: `{ data }` success, `{ error, message }` failure
- Pagination: cursor-based for large sets, offset for admin/small
- Zod validation at handler level for all input
- Never expose internals in errors (stack traces, IDs, DB details)
- Generic auth errors: "Invalid email or password"

## Middleware

- Rate limiting: `hono-rate-limiter` — per-IP on auth, per-user on API, global safety net
- Security headers: X-Content-Type-Options, X-Frame-Options, HSTS, CSP, Referrer-Policy
- Request ID per request for tracing

## Jobs

- PostgreSQL-based queues preferred (pgboss) — BullMQ has Bun segfault issues
- Idempotent handlers, circuit breakers for external APIs
