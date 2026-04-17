---
name: astro-integrations
description: Configure and build Astro integrations, adapters, and framework connections. Triggers on "astro integration", "astro adapter", "add preact to astro", "add react to astro", "astro config", "astro plugin".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# Astro Integrations — Frameworks, Adapters & Extensions

Astro integrations are the plumbing that connects UI frameworks, SSR adapters, and build tools. Getting the config right is critical — wrong config produces silent failures or unexpected bundle sizes.

## Step 1: Framework Integrations

### Preact (Preferred)

```bash
bunx astro add preact
```

```ts
// astro.config.ts
import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'

export default defineConfig({
  integrations: [
    preact({
      compat: false, // Set true only if React libraries are needed
    }),
  ],
})
```

**When to enable `compat: true`:**
- A dependency imports from `react` or `react-dom`
- You're using Radix UI, VisX, Recharts, or similar React-only libraries
- You get `Cannot find module 'react'` errors

**Cost of compat**: ~3KB added to every island that uses it. Isolate compat-dependent code.

### React

```bash
bunx astro add react
```

```ts
import react from '@astrojs/react'

export default defineConfig({
  integrations: [react()],
})
```

### Preact + React Together (rare, but valid)

When a project uses Preact by default but needs React for specific libraries:

```ts
import preact from '@astrojs/preact'
import react from '@astrojs/react'

export default defineConfig({
  integrations: [
    preact({ compat: false }),
    react({ include: ['**/react-islands/**'] }),
  ],
})
```

Use `include` to scope React to a specific directory. Otherwise Astro can't determine which framework handles which `.tsx` file.

```
src/
  islands/              # Preact islands (default)
    Counter.tsx
    SearchBar.tsx
  react-islands/        # React islands (scoped)
    Chart.tsx            # Uses VisX, needs real React
```

### Vue / Svelte / Solid

Same pattern — `bunx astro add vue|svelte|solid-js`. Each integration scopes to its file extensions (`.vue`, `.svelte`), so there's no ambiguity.

## Step 2: SSR Adapters

Astro needs an adapter for server-side rendering. The adapter determines where and how SSR code runs.

### Choosing an Adapter

| Hosting | Adapter | Package |
|---|---|---|
| Node.js (Coolify, Docker, VPS) | Node | `@astrojs/node` |
| Vercel | Vercel | `@astrojs/vercel` |
| Netlify | Netlify | `@astrojs/netlify` |
| Cloudflare | Cloudflare | `@astrojs/cloudflare` |
| Deno | Deno | `@deno/astro-adapter` |
| Static only (no SSR) | None | — |

### Node Adapter (Coolify / Docker / VPS)

```bash
bunx astro add node
```

```ts
import node from '@astrojs/node'

export default defineConfig({
  output: 'server',  // or 'hybrid' for mostly-static + some SSR
  adapter: node({
    mode: 'standalone', // Runs its own HTTP server
  }),
})
```

**`standalone` vs `middleware`:**
- `standalone`: Astro runs its own server. Use for Docker/Coolify/simple VPS.
- `middleware`: Astro exports an Express/Fastify-compatible handler. Use when embedding Astro in an existing server.

### Vercel Adapter

```ts
import vercel from '@astrojs/vercel'

export default defineConfig({
  output: 'server',
  adapter: vercel({
    imageService: true,
    isr: { expiration: 60 },
  }),
})
```

### Cloudflare Adapter

```ts
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
})
```

Note: Cloudflare Workers have limitations (no Node.js `fs`, limited APIs). WebSearch `site:docs.astro.build/en/guides/integrations-guide/cloudflare` for compatibility.

## Step 3: Output Modes

```ts
export default defineConfig({
  output: 'static',  // Default: every page pre-rendered at build time
  // output: 'server',  // Every page server-rendered by default
  // output: 'hybrid',  // Static by default, opt-in SSR per page
})
```

### Hybrid Mode (recommended for most projects)

```ts
export default defineConfig({
  output: 'hybrid',  // Static by default
  adapter: node({ mode: 'standalone' }),
})
```

Then per-page opt-in to SSR:
```astro
---
export const prerender = false  // This page is server-rendered
---
```

Or per-page opt-in to static in server mode:
```astro
---
export const prerender = true  // This page is pre-rendered at build
---
```

## Step 4: Image Optimization

### Built-In (`astro:assets`)

```astro
---
import { Image } from 'astro:assets'
import heroImage from '../assets/hero.jpg'
---
<Image
  src={heroImage}
  alt="Hero description"
  width={1200}
  height={600}
  format="webp"
  quality={80}
/>
```

**Local images**: Imported, optimized at build time, auto-generates `srcset`.
**Remote images**: Need explicit dimensions OR `inferRemoteSize` (Astro 5+):

```astro
---
import { Image } from 'astro:assets'
---
<Image
  src="https://example.com/photo.jpg"
  alt="Remote photo"
  width={800}
  height={600}
  format="webp"
/>
```

### Image Service Config

```ts
export default defineConfig({
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
    // Or for Cloudflare:
    // service: { entrypoint: 'astro/assets/services/squoosh' },
    domains: ['example.com', 'cdn.example.com'],
    remotePatterns: [{ protocol: 'https', hostname: '**.example.com' }],
  },
})
```

## Step 5: Common Integration Patterns

### Tailwind (when project uses it instead of CSS Modules)

```bash
bunx astro add tailwind
```

```ts
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  integrations: [tailwind()],
})
```

### Sitemap

```bash
bunx astro add sitemap
```

```ts
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
})
```

### MDX

```bash
bunx astro add mdx
```

```ts
import mdx from '@astrojs/mdx'

export default defineConfig({
  integrations: [mdx()],
})
```

Allows `.mdx` files in content collections — Markdown with component imports.

### Partytown (third-party scripts)

```ts
import partytown from '@astrojs/partytown'

export default defineConfig({
  integrations: [
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
})
```

Offloads analytics/marketing scripts to a web worker — keeps the main thread clean.

## Step 6: Building Custom Integrations

```ts
// integrations/my-integration.ts
import type { AstroIntegration } from 'astro'

export default function myIntegration(options: { verbose?: boolean } = {}): AstroIntegration {
  return {
    name: 'my-integration',
    hooks: {
      'astro:config:setup': ({ updateConfig, addMiddleware }) => {
        // Modify astro config, add virtual modules, inject routes
      },
      'astro:build:start': () => {
        // Before build
      },
      'astro:build:done': ({ pages }) => {
        // After build — generate sitemap, optimize images, etc.
        if (options.verbose) {
          console.log(`Built ${pages.length} pages`)
        }
      },
    },
  }
}
```

### Available Hooks

| Hook | When | Common Use |
|---|---|---|
| `astro:config:setup` | Config resolved | Add integrations, inject routes, add Vite plugins |
| `astro:config:done` | Config finalized | Read final config |
| `astro:server:setup` | Dev server starting | Add middleware to dev server |
| `astro:build:start` | Build starting | Pre-build tasks |
| `astro:build:ssr` | SSR build done | Post-process SSR bundle |
| `astro:build:done` | Build complete | Generate sitemaps, copy assets |

## Self-Check

- [ ] Verified integration versions match Astro version
- [ ] Framework integration scoped correctly (Preact vs React `include` paths)
- [ ] `compat: true` only when actually needed (React library dependency)
- [ ] Adapter matches hosting target
- [ ] Output mode matches project needs (static/hybrid/server)
- [ ] Image optimization configured (sharp service, allowed domains)
- [ ] `site` set in config (required for sitemap, canonical URLs)
- [ ] Custom integrations follow the `AstroIntegration` interface
