# Security Rules

## Authentication

- **Password hashing:** Argon2id via `Bun.password` (native, no npm packages on Bun)
- **Session-based auth** with HTTP-only, Secure, SameSite=Strict cookies
- **Session rotation:** Rotate token on login, email verification, and password change
- Never return password hashes in any response
- Generic error messages on auth failure: "Invalid email or password"
- Lock accounts after repeated failed attempts (track `auth_failure_count`)

## Authorization

- Role-based access control (RBAC) with middleware enforcement
- Check permissions at the route level, not deep in business logic
- Never trust client-side role checks — always verify server-side
- Ownership verification: confirm the authenticated user has access to the requested resource

## API Security

- Validate ALL input with schema validation (Zod) at the handler level
- Never expose internal errors, stack traces, or database details in responses
- Rate limiting on all endpoints:
  - Per-IP on auth endpoints (strict: 5 login/15 min)
  - Per-user on authenticated endpoints (moderate: 100 req/15 min)
  - Global per-IP safety net (permissive: 1000 req/15 min)
- Use `hono-rate-limiter` — listed on Hono's official third-party middleware page

## Encryption

- **At rest:** AES-256-GCM via Web Crypto API (`crypto.subtle`) for API credentials and PII
- **In transit:** HTTPS everywhere (TLS 1.2+)
- Never store encryption keys in code or version control
- Rotate encryption keys periodically (key versioning)
- CCPA safe harbor requires ALL PII encrypted at rest (not just API credentials)

## Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` — configured per application
- `X-XSS-Protection: 0` (modern CSP makes this unnecessary, disable to avoid false positives)

## Environment Variables

- Secrets in environment variables, never in code
- `.env` files in `.gitignore` — always
- `.env.example` with all required vars (no real values)
- Use `env(c)` from `hono/adapter` — never `process.env` or `Bun.env` directly

## Cookies

- **HTTP-only** — JavaScript cannot access session cookies
- **Secure** — Only sent over HTTPS
- **SameSite=Strict** — Prevents CSRF in same-origin deployments
- No CSRF middleware needed for same-origin deployments with SameSite=Strict

## Third-Party Dependencies

- Audit dependencies for known vulnerabilities before adding
- Prefer well-maintained packages with active security response
- Minimize dependency count — fewer deps = smaller attack surface
- Pin dependency versions in production

## OWASP Top 10 Prevention

1. **Injection** — Parameterized queries via Drizzle ORM, never string concatenation
2. **Broken Auth** — Session management, rate limiting, password hashing
3. **Sensitive Data Exposure** — Encryption at rest and in transit, minimal data collection
4. **XXE** — Not applicable (JSON APIs, no XML parsing)
5. **Broken Access Control** — RBAC middleware, ownership verification
6. **Security Misconfiguration** — Security headers, secure defaults
7. **XSS** — Framework auto-escaping (Astro/Preact), CSP headers
8. **Insecure Deserialization** — Zod schema validation on all input
9. **Vulnerable Components** — Dependency auditing, minimal deps
10. **Insufficient Logging** — Structured logging with request IDs, audit trails

## IP Trust

- Behind Cloudflare: use `cf-connecting-ip` header
- Behind Nginx: use `X-Real-IP` (configured to strip client values)
- **NEVER blindly trust `X-Forwarded-For`** — it can be spoofed
