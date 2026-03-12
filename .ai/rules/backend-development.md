
# Backend Rules

## Hono

- All routes: `/api/v1/` prefix (versioned from day one)
- `env(c)` from `hono/adapter` for env vars — NEVER `Bun.env` or `process.env`
- `crypto.subtle` for encryption — cross-runtime

## API Design

- Response shapes: `{ data }` success, `{ error, message }` failure
- Pagination: cursor-based for large sets, offset for admin/small
- Zod validation at handler level for all input
- Never expose stack traces, internal IDs, or DB details in errors

## Middleware

- Rate limiting: `hono-rate-limiter` — per-IP on auth, per-user on API, global safety net
- Security headers: X-Content-Type-Options, X-Frame-Options, HSTS, CSP, Referrer-Policy
- Request ID per request for tracing
- Same-origin deployments: NO CORS middleware, NO CSRF middleware

## Auth

See security rules for full details. Key: Argon2id via `Bun.password`, session cookies HTTP-only/Secure/SameSite=Strict, generic auth errors only.

## Jobs (when applicable)

- PostgreSQL-based queues preferred (pgboss) — BullMQ has Bun segfault issues
- Idempotent handlers, circuit breakers for external APIs
