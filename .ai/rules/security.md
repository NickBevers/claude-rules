
# Security Rules

## Auth

- Argon2id via `Bun.password` (native, no npm)
- Session cookies: HTTP-only, Secure, SameSite=Strict
- Rotate session token on: login, email verification, password change
- Never return password hashes. Generic errors: "Invalid email or password"
- Track `auth_failure_count`, lock after repeated failures

## Rate Limiting

- `hono-rate-limiter` (Hono official third-party)
- Auth endpoints: 5 login/15 min, 3 register/hour (per-IP)
- Authenticated API: 100 req/15 min (per-user)
- Global safety net: 1000 req/15 min (per-IP)

## Encryption

- AES-256-GCM via `crypto.subtle` for credentials and PII at rest
- HTTPS everywhere (TLS 1.2+)
- Keys in env vars, never in code. Rotate periodically.

## Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: [configured per app]
X-XSS-Protection: 0
```

## IP Trust

- Behind Cloudflare: `cf-connecting-ip`
- Behind Nginx: `X-Real-IP` (strip client values)
- NEVER trust `X-Forwarded-For`
