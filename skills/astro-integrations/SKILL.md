---
name: astro-integrations
description: Configure and build Astro integrations, adapters, and framework connections. Triggers on "astro integration", "astro adapter", "add preact to astro", "add react to astro", "astro config", "astro plugin".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# Astro Integrations — Frameworks, Adapters & Extensions

## Step 1: Framework Integrations

### Preact (Preferred)

```ts
import preact from '@astrojs/preact'
export default defineConfig({
  integrations: [preact({ compat: false })], // true only if React libraries needed
})
```

### Preact + React Together

```ts
integrations: [
  preact({ compat: false }),
  react({ include: ['**/react-islands/**'] }), // scope React to specific directory
]
```

Without `include`, Astro can't determine which framework handles `.tsx` files.

### Vue / Svelte / Solid

`bunx astro add vue|svelte|solid-js` — each scopes to its file extension automatically.

## Step 2: SSR Adapters

| Hosting | Package |
|---|---|
| Node.js (Docker, VPS, Coolify) | `@astrojs/node` |
| Vercel | `@astrojs/vercel` |
| Netlify | `@astrojs/netlify` |
| Cloudflare | `@astrojs/cloudflare` |

### Node Adapter

```ts
import node from '@astrojs/node'
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }), // 'middleware' to embed in Express/Fastify
})
```

### Vercel / Cloudflare

```ts
adapter: vercel({ imageService: true, isr: { expiration: 60 } })
adapter: cloudflare({ platformProxy: { enabled: true } })
```

## Step 3: Output Modes

```ts
output: 'static'   // Default: all pages pre-rendered
output: 'server'   // All pages server-rendered
output: 'hybrid'   // Static default, per-page SSR opt-in (recommended)
```

Per-page override:
```astro
---
export const prerender = false  // SSR this page (in hybrid mode)
export const prerender = true   // Static this page (in server mode)
---
```

## Step 4: Image Optimization

```astro
---
import { Image } from 'astro:assets'
import heroImage from '../assets/hero.jpg'
---
<Image src={heroImage} alt="Hero" width={1200} height={600} format="webp" quality={80} />
```

Config:
```ts
image: {
  service: { entrypoint: 'astro/assets/services/sharp' },
  domains: ['example.com'],
  remotePatterns: [{ protocol: 'https', hostname: '**.example.com' }],
}
```

## Step 5: Common Integrations

| Integration | Install | Purpose |
|---|---|---|
| Sitemap | `bunx astro add sitemap` | Auto-generate sitemap (requires `site` in config) |
| MDX | `bunx astro add mdx` | Markdown with component imports |
| Tailwind | `bunx astro add tailwind` | Utility CSS |
| Partytown | `@astrojs/partytown` | Offload analytics/marketing to web worker |

## Step 6: Custom Integrations

```ts
import type { AstroIntegration } from 'astro'

export default function myIntegration(options = {}): AstroIntegration {
  return {
    name: 'my-integration',
    hooks: {
      'astro:config:setup': ({ updateConfig, addMiddleware }) => { },
      'astro:build:done': ({ pages }) => { },
    },
  }
}
```

| Hook | When |
|---|---|
| `astro:config:setup` | Config resolved — add plugins, inject routes |
| `astro:build:start` | Build starting |
| `astro:build:done` | Build complete — generate sitemaps, post-process |
| `astro:server:setup` | Dev server starting |

## Self-Check

- [ ] Integration versions match Astro version
- [ ] Framework scoped correctly (Preact vs React `include`)
- [ ] `compat: true` only when needed
- [ ] Adapter matches hosting target
- [ ] Output mode matches needs
- [ ] `site` set in config (required for sitemap, canonical URLs)
- [ ] Image domains/patterns configured for remote images
