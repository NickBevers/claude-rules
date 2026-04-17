---
name: frontend-astro
description: Write production-grade Astro pages, layouts, and content collections. Triggers on "astro page", "astro layout", "astro component", "content collection", "astro routing", "build in astro".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro — Pages, Layouts & Content Architecture

Write Astro code using current APIs. Check the Astro version in `package.json` — APIs differ between major versions.

## Astro Import Paths

Astro provides built-in modules. Using the wrong import path is a common mistake:

| Module | Use | Don't use |
|---|---|---|
| `astro:content` | Collections, `getCollection()`, `getLiveEntry()` | — |
| `astro:env/server`, `astro:env/client` | Environment variables | `process.env`, `import.meta.env` |
| `astro:actions` | Server actions | — |
| `astro/zod` | Zod validation (Zod 4 in Astro 6) | bare `zod`, `astro:schema` (deprecated) |
| `astro:assets` | `<Image />` component, `Font` component (Astro 6+) | — |
| `astro:transitions` | `<ClientRouter />` | `<ViewTransitions />` (removed in Astro 6) |

## Version-Critical Differences

| Feature | Astro 6 | Astro 5 | Astro 4 |
|---|---|---|---|
| Node.js | 22.12.0+ required | 18+ | 18+ |
| Zod | Zod 4 (`astro/zod`) | Zod 3 | Zod 3 |
| Content config | `src/content.config.ts` | `src/content.config.ts` | `src/content/config.ts` |
| Live collections | `defineLiveCollection()` + `getLiveEntry()` | Experimental | Not available |
| Built-in fonts | `fonts` config + `Font` from `astro:assets` | Experimental | Not available |
| CSP | `security: { csp: true }` | Experimental | Not available |
| `Astro.glob()` | Removed — use `import.meta.glob()` | Deprecated | Available |
| View Transitions | `<ClientRouter />` only | `<ClientRouter />` (+ deprecated `<ViewTransitions />`) | `<ViewTransitions />` |
| Server actions | `astro:actions` | `astro:actions` | Not available |
| Server islands | `server:defer` | `server:defer` | Not available |
| Config format | ESM only (`.mjs`/`.ts`) | `.cjs` supported | `.cjs` supported |
| Collection `entry.slug` | Removed — use `entry.id` | Available | Available |
| `entry.render()` | Removed — use `render(entry)` import | Available | Available |
| `getStaticPaths` params | Must be strings | Strings or numbers | Strings or numbers |

## Step 1: Gather Context

- What is being built (page, layout, component, content collection, API route)
- Static (SSG) or server-rendered (SSR) — check `astro.config.*` for `output` mode
- UI framework in use (Preact, React, Vue, Svelte, Solid) — check integrations in config
- Read existing pages/layouts: `Glob("**/pages/**/*.astro")`, `Glob("**/layouts/**/*.astro")`

## Step 2: Page Architecture

### Page Types

**Static pages** (default SSG):
```astro
---
// Runs at build time
import Layout from '../layouts/Base.astro'
import { getCollection } from 'astro:content'

const posts = await getCollection('blog')
---
<Layout title="Blog">
  <main>
    {posts.map(post => (
      <article>
        <a href={`/blog/${post.slug}`}>{post.data.title}</a>
      </article>
    ))}
  </main>
</Layout>
```

**Dynamic routes** (SSG with `getStaticPaths`):
```astro
---
import { getCollection } from 'astro:content'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map(post => ({
    params: { slug: post.id },  // Astro 6: use .id (not .slug)
    props: { post },
  }))
}

const { post } = Astro.props

// Astro 6: use render() import, not entry.render()
import { render } from 'astro:content'
const { Content } = await render(post)
---
<Content />
```

**Server-rendered pages** (SSR, `output: 'server'` or per-page opt-in):
```astro
---
// Runs on every request
export const prerender = false
const session = Astro.cookies.get('session')
---
```

### Layouts

- Use `<slot />` for content projection (Astro's equivalent of `children`)
- Named slots for multi-region layouts: `<slot name="sidebar" />`
- Common pattern: Base layout (HTML shell) → Page layout (page structure) → Content

```astro
---
interface Props {
  title: string
  description?: string
}
const { title, description = 'Default description' } = Astro.props
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content={description} />
  <title>{title}</title>
</head>
<body>
  <slot />
</body>
</html>
```

## Step 3: Content Collections

### Standard Collections (Astro 5+/6)

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog }
```

### Live Collections (Astro 6 — request-time fetching, no rebuild)

```ts
// src/live.config.ts
import { defineLiveCollection, z } from 'astro:content'

const products = defineLiveCollection({
  schema: z.object({
    name: z.string(),
    price: z.number(),
    inStock: z.boolean(),
  }),
  // Fetched per-request, not at build time
  load: async () => {
    const res = await fetch('https://api.example.com/products')
    return res.json()
  },
})

export const collections = { products }
```

```astro
---
import { getLiveEntry } from 'astro:content'
const product = await getLiveEntry('products', Astro.params.id)
---
```

### Astro 6 Collection Changes from v5

- `entry.slug` removed — use `entry.id` (now slug-based)
- `entry.render()` removed — use `import { render } from 'astro:content'` then `render(entry)`
- Zod 4 syntax: some methods changed (e.g., `z.email()` instead of `z.string().email()` for standalone validators)

## Step 4: Islands Architecture

Astro's power is zero-JS by default. Interactive components are explicit opt-in:

```astro
---
import { SearchBar } from '../islands/SearchBar'  // Preact/React component
---
<!-- No JS shipped -->
<p>Static content</p>

<!-- JS only when visible in viewport -->
<SearchBar client:visible />

<!-- JS on page load (above-fold interactive) -->
<Header client:load />

<!-- JS when browser is idle -->
<Analytics client:idle />

<!-- JS only on media query match -->
<MobileMenu client:media="(max-width: 768px)" />
```

**Rules:**
- Default is NO client directive = no JS shipped
- `client:load` for above-fold interactivity (nav, hero CTA)
- `client:visible` for below-fold (comments, forms, charts)
- `client:idle` for non-critical (analytics, chat widgets)
- Never wrap an entire page in a single island — split into focused interactive pieces
- Pass serializable props only (no functions, no complex objects)

## Step 5: Astro Components vs. Framework Islands

Use `.astro` components for:
- Anything that doesn't need client-side interactivity
- Layouts, navigation shells, footers, cards, content display
- They render to HTML with zero JavaScript

Use framework islands (`.tsx`, `.vue`, `.svelte`) for:
- User interactions (forms, search, toggles, modals)
- Animations requiring JS state
- Real-time updates (WebSocket, polling)
- Third-party libraries that require a framework runtime

## Step 6: Data & API Routes

**API routes** (`pages/api/*.ts`):
```ts
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json()
  // validate with Zod
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

**Environment variables** (Astro 5+):
```ts
// Use astro:env, not process.env or import.meta.env directly
import { API_KEY } from 'astro:env/server'
import { PUBLIC_SITE_URL } from 'astro:env/client'
```

**Actions** (Astro 5+):
```ts
// src/actions/index.ts
import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'

export const server = {
  submitForm: defineAction({
    input: z.object({ email: z.string().email() }),
    handler: async ({ email }) => {
      // server-side logic
      return { success: true }
    },
  }),
}
```

## Step 7: Built-In Fonts (Astro 6+)

```ts
// astro.config.ts
import { defineConfig } from 'astro/config'
import { fontProviders } from 'astro/assets'

export default defineConfig({
  fonts: [
    {
      name: 'Geist',
      cssVariable: '--font-body',
      provider: fontProviders.google(),
    },
    {
      name: 'Fraunces',
      cssVariable: '--font-heading',
      provider: fontProviders.fontsource(),
    },
  ],
})
```

Astro auto-downloads, caches, and self-hosts fonts. No manual `@font-face` or Google Fonts CDN link needed.

```astro
---
import { Font } from 'astro:assets'
---
<head>
  <Font cssVariable="--font-body" preload />
</head>
```

## Step 8: Styling in Astro

**Scoped styles** (default in `.astro` files):
```astro
<style>
  /* Scoped to this component automatically */
  h1 { color: oklch(0.5 0.2 260); }
</style>
```

**CSS Modules** (for framework islands):
```tsx
import styles from './Component.module.css'
```

**Global styles**: `<style is:global>` or import in layout. Use sparingly.

Rules:
- CSS custom properties for all theme values
- OKLCH for color definitions
- `min-width` media queries (mobile-first)
- No `!important` — fix specificity

## Step 8: Self-Check

- [ ] Verified Astro version and used correct APIs (especially content collections)
- [ ] Import paths use Astro modules (`astro:content`, `astro:env`, `astro/zod`)
- [ ] Islands use appropriate `client:` directive (not over-hydrated)
- [ ] Static content is in `.astro` components (not framework islands)
- [ ] Layouts use typed `Props` interface
- [ ] Content collections have Zod schema validation
- [ ] Pages have `<title>` and `<meta name="description">`
- [ ] Matches existing project conventions
