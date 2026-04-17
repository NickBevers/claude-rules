---
name: astro-server-islands
description: Build Astro server islands for personalized, dynamic content within static pages. Triggers on "server island", "personalized content", "dynamic island astro", "server:defer", "deferred rendering".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro Server Islands — Dynamic Content in Static Pages

Server islands render on the server per-request while the rest of the page is statically cached. Use them for personalized or real-time content inside otherwise static pages.

## Requirements

- Astro 5+ (server islands were introduced in Astro 5)
- SSR adapter (`@astrojs/node`, `@astrojs/vercel`, etc.)
- `output: 'hybrid'` or `output: 'server'` in `astro.config.ts`

## Step 1: When to Use Server Islands

### Good Use Cases
- User-specific content on otherwise public pages (greeting, cart count, recommendations)
- Real-time data that shouldn't be cached (stock levels, live scores)
- Content behind auth that should render server-side (profile widget in header)
- A/B test variants

### Bad Use Cases (use something else)
- Entire pages that are dynamic → use SSR pages instead (`export const prerender = false`)
- Client-only interactivity (forms, search) → use client islands (Preact/React `client:load`)
- Content that changes on user interaction → use client-side state + fetch

### Server Island vs. Client Island

| | Server Island | Client Island |
|---|---|---|
| Runs on | Server, per-request | Browser, after hydration |
| JS shipped | Zero | Framework runtime + component |
| SEO | Fully rendered HTML | Depends on hydration timing |
| Personalization | Server-side (cookies, DB) | Client-side (fetch, cookies) |
| Interactivity | None (static HTML output) | Full (event handlers, state) |
| Caching | Edge/CDN cacheable per-user | N/A |

## Step 2: Creating a Server Island

### The Component

Server islands are regular `.astro` components with the `server:defer` directive:

```astro
---
// src/components/UserGreeting.astro
const session = Astro.cookies.get('session')?.value
let user = null

if (session) {
  user = await getUserFromSession(session)
}
---
{user ? (
  <div class="greeting">
    <p>Welcome back, {user.name}</p>
    <a href="/dashboard">Go to dashboard</a>
  </div>
) : (
  <div class="greeting">
    <a href="/login">Sign in</a>
  </div>
)}
```

### Using the Server Island

```astro
---
// src/pages/index.astro (prerendered / static page)
import UserGreeting from '../components/UserGreeting.astro'
---
<html>
<body>
  <header>
    <nav><!-- static nav --></nav>
    <UserGreeting server:defer>
      <!-- Fallback shown while server island loads -->
      <div slot="fallback" class="greeting-skeleton">
        <div class="skeleton-line" style="width: 150px; height: 20px;" />
      </div>
    </UserGreeting>
  </header>

  <main>
    <!-- All static content — cached at CDN -->
    <h1>Welcome to our site</h1>
  </main>
</body>
</html>
```

### How It Works

1. Static page is pre-rendered (or cached at CDN) with the fallback placeholder
2. Browser receives the static HTML immediately (fast TTFB)
3. A small inline script fetches the server island content from an Astro endpoint
4. Server renders the island component with the current request context (cookies, headers)
5. HTML fragment replaces the fallback — no framework JS shipped

## Step 3: Passing Props

Server islands accept serializable props:

```astro
<!-- Parent page -->
<ProductStock server:defer productId={product.id}>
  <span slot="fallback">Checking availability…</span>
</ProductStock>
```

```astro
---
// src/components/ProductStock.astro
interface Props {
  productId: string
}
const { productId } = Astro.props
const stock = await getStockLevel(productId)
---
{stock > 0 ? (
  <span class="in-stock">{stock} in stock</span>
) : (
  <span class="out-of-stock">Out of stock</span>
)}
```

**Props must be serializable** (strings, numbers, booleans, plain objects, arrays). No functions, no class instances, no Dates (convert to ISO string).

## Step 4: Fallback Content

The fallback is critical for perceived performance — it's what users see while the server island loads.

### Skeleton Fallback (recommended)

```astro
<UserGreeting server:defer>
  <div slot="fallback" class="greeting-skeleton" aria-hidden="true">
    <div class="skeleton-avatar" />
    <div class="skeleton-text" />
  </div>
</UserGreeting>
```

### Meaningful Fallback

```astro
<CartCount server:defer>
  <a slot="fallback" href="/cart">Cart</a>
</CartCount>
```

The fallback should be functional — a cart link that works even before the count loads.

### No Fallback (avoid)

Without a `slot="fallback"`, the space is empty until the server island loads. This causes CLS.

## Step 5: Caching Server Islands

Server islands can be cached per-user at the edge:

```astro
---
// src/components/Recommendations.astro
Astro.response.headers.set('Cache-Control', 'private, max-age=300')

const user = await getUser(Astro.cookies.get('session')?.value)
const recs = await getRecommendations(user.id)
---
<section>
  <h2>Recommended for you</h2>
  {recs.map(r => <a href={r.url}>{r.title}</a>)}
</section>
```

Cache strategies:
- `private, max-age=300`: Per-user cache for 5 minutes (personalized content)
- `public, max-age=60`: Shared cache for 1 minute (same for all users, like stock levels)
- `no-store`: Never cache (real-time data)

## Step 6: Multiple Server Islands

A single page can have multiple server islands, each fetched independently:

```astro
<header>
  <UserGreeting server:defer>
    <span slot="fallback">…</span>
  </UserGreeting>
  <CartCount server:defer>
    <span slot="fallback">Cart</span>
  </CartCount>
</header>

<aside>
  <Recommendations server:defer>
    <div slot="fallback"><RecommendationsSkeleton /></div>
  </Recommendations>
</aside>
```

Each island makes its own request. Order of completion is not guaranteed — design fallbacks so the page looks good regardless of which island loads first.

## Step 7: Accessibility

- Fallback content should be visually similar to loaded content (prevents jarring layout shift)
- If the fallback is purely decorative (skeleton), use `aria-hidden="true"`
- If the fallback is functional (a link), it should be accessible
- Server islands produce HTML — they're SEO-friendly and screen-reader-friendly by default
- Don't rely on server islands for critical content that must be in the initial HTML (e.g., main heading, primary navigation)

## Step 8: Error Handling

```astro
---
// src/components/UserGreeting.astro
let user = null

try {
  const session = Astro.cookies.get('session')?.value
  if (session) user = await getUserFromSession(session)
} catch (error) {
  console.error('Server island error:', error)
  // Fall through to unauthenticated state
}
---
{user ? (
  <p>Welcome, {user.name}</p>
) : (
  <a href="/login">Sign in</a>
)}
```

Server island errors should degrade gracefully — show the anonymous/default state, not an error message. The fallback already covers the loading case; the component should handle its own error case.

## Self-Check

- [ ] SSR adapter configured and `output: 'hybrid'` or `'server'` set
- [ ] `server:defer` directive on the component (not the container)
- [ ] Fallback provided via `slot="fallback"` (prevents CLS)
- [ ] Fallback matches loaded content dimensions (prevents layout shift)
- [ ] Props are serializable (no functions, no class instances)
- [ ] Error handling degrades to anonymous/default state
- [ ] Cache-Control headers set appropriately (private for personalized, public for shared)
- [ ] Critical page content is NOT in a server island (it's in the static shell)
- [ ] Multiple server islands load independently (no interdependencies)
