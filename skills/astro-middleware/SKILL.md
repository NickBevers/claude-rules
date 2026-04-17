---
name: astro-middleware
description: Write Astro middleware for auth, redirects, response headers, and request processing. Triggers on "astro middleware", "request interceptor", "auth middleware astro", "response headers astro", "onRequest".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro Middleware — Request & Response Pipeline

Astro middleware intercepts every request. Use it for auth, redirects, headers, locale detection, and request context — never for business logic.

## Availability

Astro 4+ supports `defineMiddleware`, `sequence()` for chaining, and typed `Astro.locals`. Astro 3 has a different middleware API.

## Step 1: Middleware Basics

### Location

```
src/
  middleware.ts        # Single entry point (or middleware/index.ts)
```

Astro loads `src/middleware.ts` automatically. No config needed.

### Structure

```ts
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  // Before the route handler
  const { url, cookies, redirect, locals, request } = context

  // Do work (auth check, set locals, etc.)

  const response = await next()

  // After the route handler (modify response if needed)

  return response
})
```

### Context Object

| Property | Type | Use for |
|---|---|---|
| `url` | `URL` | Path matching, query params |
| `cookies` | `AstroCookies` | Read/write cookies |
| `redirect(path, status?)` | Function | Redirect the request |
| `locals` | `App.Locals` | Pass data to pages/endpoints (typed) |
| `request` | `Request` | Raw request (headers, method, body) |
| `params` | `Record<string, string>` | Route params |
| `site` | `URL` | Configured site URL |
| `clientAddress` | `string` | Client IP (SSR only) |

## Step 2: Common Middleware Patterns

### Authentication Guard

```ts
import { defineMiddleware } from 'astro:middleware'

const PROTECTED_PATHS = ['/dashboard', '/settings', '/account']
const AUTH_PATHS = ['/login', '/signup', '/forgot-password']

export const onRequest = defineMiddleware(async ({ url, cookies, redirect, locals }, next) => {
  const sessionToken = cookies.get('session')?.value

  if (sessionToken) {
    try {
      const user = await verifySession(sessionToken)
      locals.user = user

      if (AUTH_PATHS.some(p => url.pathname.startsWith(p))) {
        return redirect('/dashboard')
      }
    } catch {
      cookies.delete('session', { path: '/' })
    }
  }

  if (!locals.user && PROTECTED_PATHS.some(p => url.pathname.startsWith(p))) {
    return redirect('/login')
  }

  return next()
})
```

### Typing `Astro.locals`

```ts
// src/env.d.ts
declare namespace App {
  interface Locals {
    user: {
      id: string
      name: string
      email: string
      role: 'admin' | 'user'
    } | null
    requestId: string
  }
}
```

Now `Astro.locals.user` is typed in every `.astro` page and API route.

### Security Headers

```ts
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (context.url.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store')
  }

  return response
})
```

### Locale Detection

```ts
import { defineMiddleware } from 'astro:middleware'

const SUPPORTED_LOCALES = ['en', 'nl', 'fr', 'de'] as const
const DEFAULT_LOCALE = 'en'

export const onRequest = defineMiddleware(async ({ request, locals, url, redirect }, next) => {
  const pathLocale = url.pathname.split('/')[1]

  if (SUPPORTED_LOCALES.includes(pathLocale as any)) {
    locals.locale = pathLocale as typeof SUPPORTED_LOCALES[number]
    return next()
  }

  const acceptLang = request.headers.get('Accept-Language')
  const preferred = acceptLang
    ?.split(',')
    .map(l => l.split(';')[0].trim().substring(0, 2))
    .find(l => SUPPORTED_LOCALES.includes(l as any))

  const locale = preferred ?? DEFAULT_LOCALE

  if (url.pathname === '/') {
    return redirect(`/${locale}`)
  }

  locals.locale = locale as typeof SUPPORTED_LOCALES[number]
  return next()
})
```

### Request Logging / Tracing

```ts
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async ({ locals, url, request }, next) => {
  const requestId = crypto.randomUUID()
  locals.requestId = requestId

  const start = performance.now()
  const response = await next()
  const duration = Math.round(performance.now() - start)

  console.log(JSON.stringify({
    requestId,
    method: request.method,
    path: url.pathname,
    status: response.status,
    durationMs: duration,
  }))

  response.headers.set('X-Request-Id', requestId)
  return response
})
```

### Rate Limiting (simple)

```ts
import { defineMiddleware } from 'astro:middleware'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export const onRequest = defineMiddleware(async ({ clientAddress, url, request }, next) => {
  if (!url.pathname.startsWith('/api/')) return next()

  const key = `${clientAddress}:${url.pathname}`
  const now = Date.now()
  const window = 60_000
  const limit = 60

  let entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + window }
    rateLimitMap.set(key, entry)
  }

  entry.count++
  if (entry.count > limit) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
      },
    })
  }

  return next()
})
```

## Step 3: Chaining Middleware

Use `sequence()` to compose multiple middleware in order:

```ts
import { defineMiddleware, sequence } from 'astro:middleware'

const auth = defineMiddleware(async ({ cookies, locals }, next) => {
  const token = cookies.get('session')?.value
  if (token) locals.user = await verifySession(token)
  return next()
})

const headers = defineMiddleware(async (context, next) => {
  const response = await next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
})

const logging = defineMiddleware(async ({ url, request }, next) => {
  const start = performance.now()
  const response = await next()
  console.log(`${request.method} ${url.pathname} ${response.status} ${Math.round(performance.now() - start)}ms`)
  return response
})

export const onRequest = sequence(logging, auth, headers)
```

**Order matters**: Middleware runs in the order passed to `sequence()`. Auth should run before route-specific checks. Logging wraps everything.

## Step 4: Middleware vs. Other Patterns

| Need | Use Middleware | Use Instead |
|---|---|---|
| Auth check on many routes | Yes | — |
| Security headers on all responses | Yes | — |
| Locale detection | Yes | — |
| Request ID / tracing | Yes | — |
| Rate limiting | Yes (simple) | External (Cloudflare, nginx) for production |
| Data fetching for one page | No | Fetch in the page frontmatter |
| Business logic | No | API route or action |
| One-route redirect | No | `Astro.redirect()` in the page |
| Build-time logic | No | `getStaticPaths` or content collections |

## Step 5: Testing Middleware

Middleware is hard to test in isolation. Strategies:

- Extract logic into pure functions, test those:
  ```ts
  // middleware/auth.ts
  export function isProtectedPath(pathname: string): boolean {
    return PROTECTED_PATHS.some(p => pathname.startsWith(p))
  }
  ```
- E2E tests (Playwright) for the full request/response cycle
- Integration tests against the Astro dev server

## Self-Check

- [ ] Middleware is in `src/middleware.ts` (correct location)
- [ ] `Astro.locals` types defined in `src/env.d.ts`
- [ ] Auth middleware doesn't block public routes
- [ ] Middleware doesn't do heavy computation (runs on every request)
- [ ] `sequence()` order is correct (logging → auth → headers)
- [ ] Protected paths list is maintained (not hardcoded in 5 places)
- [ ] SSR-only features (`clientAddress`) not used in SSG mode
- [ ] Error handling: middleware doesn't crash on malformed cookies/headers
