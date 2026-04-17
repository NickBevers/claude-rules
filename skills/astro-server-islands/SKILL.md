---
name: astro-server-islands
description: Build Astro server islands for personalized, dynamic content within static pages. Triggers on "server island", "personalized content", "dynamic island astro", "server:defer", "deferred rendering".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro Server Islands — Dynamic Content in Static Pages

Server-rendered per-request while rest of page is statically cached. Zero JS shipped.

**Requires**: Astro 5+, SSR adapter, `output: 'hybrid'` or `'server'`.

## When to Use

**Good**: User-specific content on public pages (greeting, cart count), real-time data, auth-gated content, A/B tests.
**Bad**: Entire dynamic pages (use SSR), client interactivity (use client islands), user-interaction-driven changes (use client state + fetch).

| | Server Island | Client Island |
|---|---|---|
| Runs on | Server, per-request | Browser |
| JS shipped | Zero | Framework + component |
| Personalization | Server-side (cookies, DB) | Client-side (fetch) |
| Interactivity | None (static HTML) | Full |

## Step 1: Create

```astro
---
// src/components/UserGreeting.astro
const session = Astro.cookies.get('session')?.value
const user = session ? await getUserFromSession(session) : null
---
{user ? <p>Welcome, {user.name}</p> : <a href="/login">Sign in</a>}
```

### Use with `server:defer`

```astro
<UserGreeting server:defer>
  <div slot="fallback" class="skeleton" aria-hidden="true">
    <div style="width:150px;height:20px" />
  </div>
</UserGreeting>
```

1. Static page served with fallback (fast TTFB)
2. Small inline script fetches server island
3. Server renders with current request context
4. HTML replaces fallback — no framework JS

## Step 2: Props & Fallbacks

Props must be serializable (strings, numbers, booleans, plain objects). No functions or Dates.

```astro
<ProductStock server:defer productId={product.id}>
  <span slot="fallback">Checking…</span>
</ProductStock>
```

Fallback should be functional when possible (a cart link that works before count loads). No fallback = CLS.

## Step 3: Caching

```astro
---
Astro.response.headers.set('Cache-Control', 'private, max-age=300')
---
```

- `private, max-age=300`: Per-user, 5min (personalized)
- `public, max-age=60`: Shared, 1min (stock levels)
- `no-store`: Real-time

## Step 4: Error Handling

Degrade gracefully — show anonymous/default state, not error messages:

```astro
---
let user = null
try {
  const session = Astro.cookies.get('session')?.value
  if (session) user = await getUserFromSession(session)
} catch { /* fall through to anonymous state */ }
---
```

## Self-Check

- [ ] `server:defer` on component, not container
- [ ] Fallback via `slot="fallback"` (prevents CLS)
- [ ] Fallback matches loaded dimensions
- [ ] Props serializable
- [ ] Error degrades to default state
- [ ] Cache-Control set
- [ ] Critical content NOT in server island
