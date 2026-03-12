# Backend Development Rules

## Runtime & Framework

- **Bun** as the runtime — use Bun-native APIs where they exist (`Bun.password`, `Bun.file`, etc.)
- **Hono** as the HTTP framework — chosen for cross-runtime portability
- Never use Express, Fastify, Elysia, or other frameworks unless explicitly specified per-project
- All API routes use `/api/v1/` prefix (versioned from day one)

## Cross-Runtime Portability

- Use **`env(c)`** from `hono/adapter` for environment variables — NEVER use `Bun.env` or `process.env` directly
- Use **`crypto.subtle`** (Web Crypto API) for encryption — works on all runtimes
- Abstract runtime-specific features behind interfaces (e.g., password hashing, file system access)
- Code should be deployable to Bun, Cloudflare Workers, Vercel, and AWS Lambda without rewrites

## Database

- **PostgreSQL** as the database, always
- **Drizzle ORM** for all queries — no raw SQL unless performance-critical and measured
- Never use VARCHAR for unbounded user/API data — use TEXT
- Use `md5()` hash-based indexes for TEXT columns that need uniqueness constraints (btree has a 2704-byte limit)
- All schema defined upfront, even if tables are populated in later phases
- Soft delete by default for user-facing entities (`is_active`, `deleted_at`)
- Always filter soft-deleted records in queries (`WHERE is_active = true`)

## API Design

- RESTful conventions: proper HTTP methods, status codes, and resource naming
- Return consistent JSON response shapes: `{ data }` for success, `{ error, message }` for failures
- Pagination: cursor-based for large datasets, offset-based for admin/small sets
- Always validate request input at the handler level (Zod schemas)
- Never expose internal IDs, stack traces, or implementation details in error responses
- Generic error messages for auth failures ("Invalid email or password")

## Error Handling

- Use typed errors with error codes, not string matching
- Let unexpected errors bubble up to a global error handler — don't silently swallow them
- Log errors with structured context (request ID, user ID, route)
- Never return 200 for an error condition

## Environment Variables

- All env vars documented in `.env.example`
- Sensitive values (keys, secrets, connection strings) never committed to git
- Use `env(c)` from `hono/adapter` exclusively — enables runtime-agnostic deployment

## Middleware

- Auth middleware: validate session, attach user to context
- Rate limiting: `hono-rate-limiter` with per-IP and per-user layers
- Request ID: generate unique ID per request for tracing
- Security headers: X-Content-Type-Options, X-Frame-Options, HSTS, CSP, Referrer-Policy
- CORS: only needed when API serves different origins (same-origin deployments skip this)

## Job Processing

- Prefer PostgreSQL-based job queues (e.g., pgboss) over Redis-based (BullMQ has Bun compatibility issues)
- Idempotent job handlers — safe to retry on failure
- Track consecutive failures and implement circuit breakers for external API calls
- Log job execution with timing and outcome
