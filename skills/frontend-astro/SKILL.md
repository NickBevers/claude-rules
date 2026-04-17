---
name: frontend-astro
description: Write production-grade Astro pages, layouts, and content collections. Triggers on "astro page", "astro layout", "astro component", "content collection", "astro routing", "build in astro".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro — Pages, Layouts & Content Architecture

Check Astro version in `package.json` — APIs differ between major versions.

## Import Paths

| Module | Use | Avoid |
|---|---|---|
| `astro:content` | Collections, `getCollection()`, `getLiveEntry()` | — |
| `astro:env/server`, `astro:env/client` | Env vars | `process.env`, `import.meta.env` |
| `astro:actions` | Server actions | — |
| `astro/zod` | Validation (Zod 4 in Astro 6) | bare `zod`, `astro:schema` |
| `astro:assets` | `<Image />`, `Font` (Astro 6+) | — |
| `astro:transitions` | `<ClientRouter />` | `<ViewTransitions />` (removed v6) |

## Version Differences

| Feature | Astro 6 | Astro 5 | Astro 4 |
|---|---|---|---|
| Node.js | 22.12.0+ | 18+ | 18+ |
| Zod | Zod 4 (`astro/zod`) | Zod 3 | Zod 3 |
| Content config | `src/content.config.ts` | `src/content.config.ts` | `src/content/config.ts` |
| Live collections | `defineLiveCollection()` | Experimental | N/A |
| `Astro.glob()` | Removed → `import.meta.glob()` | Deprecated | Available |
| View Transitions | `<ClientRouter />` only | Both names | `<ViewTransitions />` |
| `entry.slug` | Removed → `entry.id` | Available | Available |
| `entry.render()` | Removed → `render(entry)` import | Available | Available |

## Step 1: Page Types

**Static (SSG default):**
```astro
---
import Layout from '../layouts/Base.astro'
import { getCollection } from 'astro:content'
const posts = await getCollection('blog')
---
<Layout title="Blog">
  <main>{posts.map(p => <article><a href={`/blog/${p.slug}`}>{p.data.title}</a></article>)}</main>
</Layout>
```

**Dynamic routes:**
```astro
---
import { getCollection, render } from 'astro:content'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map(post => ({ params: { slug: post.id }, props: { post } }))
}
const { post } = Astro.props
const { Content } = await render(post)
---
<Content />
```

**SSR (per-page):**
```astro
---
export const prerender = false
const session = Astro.cookies.get('session')
---
```

### Layouts

`<slot />` for content projection. Named: `<slot name="sidebar" />`. Type props with `interface Props`.

## Step 2: Content Collections

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

### Live Collections (Astro 6)

```ts
import { defineLiveCollection, z } from 'astro:content'
const products = defineLiveCollection({
  schema: z.object({ name: z.string(), price: z.number() }),
  load: async () => (await fetch('https://api.example.com/products')).json(),
})
```

Access: `const product = await getLiveEntry('products', Astro.params.id)`

## Step 3: Islands

Zero-JS by default. Interactive components are explicit:

```astro
<SearchBar client:visible />   <!-- JS when visible (below-fold) -->
<Header client:load />         <!-- JS on page load (above-fold) -->
<Analytics client:idle />      <!-- JS when idle (non-critical) -->
<MobileMenu client:media="(max-width: 768px)" />
```

- No directive = no JS shipped
- Never wrap entire page in one island
- Pass serializable props only

## Step 4: Built-In Fonts (Astro 6+)

```ts
import { fontProviders } from 'astro/assets'
export default defineConfig({
  fonts: [{
    name: 'Geist', cssVariable: '--font-body',
    provider: fontProviders.google(),
  }],
})
```

```astro
<head><Font cssVariable="--font-body" preload /></head>
```

## Self-Check

- [ ] Correct APIs for Astro version
- [ ] Import paths use Astro modules
- [ ] Islands use appropriate `client:` directive
- [ ] Static content in `.astro`, interactive in islands
- [ ] Layouts use typed `Props`
- [ ] Collections have Zod schema
- [ ] Pages have `<title>` and `<meta name="description">`
