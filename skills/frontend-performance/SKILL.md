---
name: frontend-performance
description: Audit and optimize frontend performance for React, Preact, and Astro projects. Triggers on "performance audit", "optimize performance", "slow page", "core web vitals", "bundle size", "lighthouse", "performance budget".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# Frontend Performance — Audit & Optimize

Measure first, optimize second.

## CWV Targets

| Metric | Good | Poor |
|---|---|---|
| LCP | ≤2.5s | >4.0s |
| INP | ≤200ms | >500ms |
| CLS | ≤0.1 | >0.25 |

## Step 1: Images (biggest LCP impact)

```tsx
// Above-fold: eager, explicit dimensions
<img src="/hero.webp" alt="..." width={1200} height={600} fetchpriority="high" />

// Below-fold: lazy
<img src="/feature.webp" alt="..." width={600} height={400} loading="lazy" decoding="async" />
```

- All images: explicit `width`/`height` (prevents CLS)
- Modern formats: WebP/AVIF with `<picture>` fallback
- Astro: `<Image />` from `astro:assets`

## Step 2: Fonts

- `font-display: swap` for body, `optional` for decorative
- Preload critical: `<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>`
- Self-host, subset to used characters
- Astro 6: use built-in `fonts` config

## Step 3: Code Splitting

**React:** `lazy(() => import('./Dashboard'))` + `<Suspense>`
**Astro:** Automatic per-page. Islands load per `client:` directive.

Split at route boundaries. Lazy-load heavy libraries. Never lazy-load above-fold.

## Step 4: React Re-Renders

1. **Move state down**: Isolate state in the child that uses it
2. **Composition over memo**: Restructure so expensive children don't share parent state
3. **`useMemo`/`useCallback`**: Only when passing to memoized children or >1ms computation
4. **Zustand selectors**: `useCartStore(s => s.items.length)` not `useCartStore()`

### Preact: Signals Are the Win

```tsx
const count = signal(0)
return <span>{count}</span>  // DOM updates without component re-render
```

## Step 5: Bundle Size

```bash
npx vite-bundle-visualizer
```

Common bloat: full `lodash` (use `lodash-es`), `moment` (use `date-fns`), unused icon imports, CSS-in-JS runtime, barrel file re-exports defeating tree-shaking.

## Step 6: Astro-Specific

- Zero JS by default — don't add `client:load` to non-interactive content
- `client:visible` below-fold, `client:idle` non-critical
- `<Image />` for auto WebP + srcset
- View Transitions instead of client-side router

## Checklist

### LCP
- [ ] Hero image: `fetchpriority="high"`, explicit dimensions
- [ ] Fonts preloaded, `font-display: swap`
- [ ] No render-blocking scripts

### INP
- [ ] Event handlers <200ms
- [ ] Long tasks broken up
- [ ] Heavy compute in Web Worker if >50ms

### CLS
- [ ] All images/videos have dimensions
- [ ] No injected content above fold
- [ ] Font metric overrides

### Bundle
- [ ] Route-level splitting
- [ ] Tree-shaking verified
- [ ] No full library imports
