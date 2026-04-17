---
name: astro-middleware
description: Write Astro middleware for auth, redirects, response headers, and request processing. Triggers on "astro middleware", "request interceptor", "auth middleware astro", "response headers astro", "onRequest".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro Middleware — Request & Response Pipeline

Intercepts every request. Use for auth, redirects, headers, locale detection — never business logic.

**Location**: `src/middleware.ts` (auto-loaded, no config needed). Astro 4+.

## Step 1: Structure

```ts
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals, request } = context
  // before route handler
  const response = await next()
  // after route handler (modify response)
  return response
})
```

### Type `Astro.locals`

```ts
// src/env.d.ts
declare namespace App {
  interface Locals {
    user: { id: string; name: string; role: 'admin' | 'user' } | null
    requestId: string
  }
}
```

## Step 2: Common Patterns

### Auth Guard

```ts
const PROTECTED = ['/dashboard', '/settings', '/account']

export const onRequest = defineMiddleware(async ({ url, cookies, redirect, locals }, next) => {
  const token = cookies.get('session')?.value
  if (token) {
    try { locals.user = await verifySession(token) }
    catch { cookies.delete('session', { path: '/' }) }
  }
  if (!locals.user && PROTECTED.some(p => url.pathname.startsWith(p))) {
    return redirect('/login')
  }
  return next()
})
```

### Security Headers

```ts
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  if (context.url.pathname.startsWith('/api/'))
    response.headers.set('Cache-Control', 'no-store')
  return response
})
```

### Request Logging

```ts
export const onRequest = defineMiddleware(async ({ locals, url, request }, next) => {
  locals.requestId = crypto.randomUUID()
  const start = performance.now()
  const response = await next()
  console.log(JSON.stringify({
    requestId: locals.requestId, method: request.method,
    path: url.pathname, status: response.status,
    durationMs: Math.round(performance.now() - start),
  }))
  response.headers.set('X-Request-Id', locals.requestId)
  return response
})
```

## Step 3: Chaining

```ts
import { defineMiddleware, sequence } from 'astro:middleware'

const auth = defineMiddleware(async ({ cookies, locals }, next) => {
  const token = cookies.get('session')?.value
  if (token) locals.user = await verifySession(token)
  return next()
})

const headers = defineMiddleware(async (_, next) => {
  const response = await next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
})

export const onRequest = sequence(auth, headers)
```

Order matters. Auth before route checks. Logging wraps everything.

## Middleware vs. Alternatives

| Need | Middleware? | Alternative |
|---|---|---|
| Auth on many routes | Yes | — |
| Security headers | Yes | — |
| Data for one page | No | Fetch in frontmatter |
| Business logic | No | API route or action |
| One-route redirect | No | `Astro.redirect()` |

## Self-Check

- [ ] In `src/middleware.ts`
- [ ] `Astro.locals` typed in `src/env.d.ts`
- [ ] Auth doesn't block public routes
- [ ] No heavy computation (runs every request)
- [ ] `sequence()` order correct
- [ ] Error handling for malformed cookies/headers
