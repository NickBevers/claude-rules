---
name: frontend-performance
description: Audit and optimize frontend performance for React, Preact, and Astro projects. Triggers on "performance audit", "optimize performance", "slow page", "core web vitals", "bundle size", "lighthouse", "performance budget".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# Frontend Performance — Audit & Optimize

Measure first, optimize second. Never optimize without evidence of a problem.

## Step 0: Establish Baseline

Before any optimization, establish what's actually slow:

```bash
# Bundle analysis (if Vite/webpack)
npx vite-bundle-visualizer  # or npx webpack-bundle-analyzer
```

Check for existing performance monitoring:
```bash
grep -rE '(web-vitals|@vercel/analytics|plausible|lighthouse)' package.json
```

Read the project's build config: `Glob("**/vite.config.*")`, `Glob("**/next.config.*")`, `Glob("**/astro.config.*")`

## Step 1: Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤2.5s | ≤4.0s | >4.0s |
| INP (Interaction to Next Paint) | ≤200ms | ≤500ms | >500ms |
| CLS (Cumulative Layout Shift) | ≤0.1 | ≤0.25 | >0.25 |

These are the metrics that matter for SEO and user experience.

## Step 2: Loading Performance

### Images (biggest LCP impact)

```tsx
// Above-fold hero image: eager load, explicit dimensions, fetchpriority
<img
  src="/hero.webp"
  alt="Hero description"
  width={1200}
  height={600}
  fetchpriority="high"
/>

// Below-fold: lazy load
<img
  src="/feature.webp"
  alt="Feature description"
  width={600}
  height={400}
  loading="lazy"
  decoding="async"
/>
```

**Image checklist:**
- All images have explicit `width` and `height` (prevents CLS)
- Above-fold LCP image: `fetchpriority="high"`, no `loading="lazy"`
- Below-fold: `loading="lazy"` + `decoding="async"`
- Use modern formats: WebP or AVIF (with `<picture>` fallback)
- Responsive: `srcset` + `sizes` for different viewports
- Astro: Use `<Image />` component (auto-optimizes)
- Next.js: Use `next/image` (auto-optimizes)

### Fonts

```css
/* Preload critical fonts */
@font-face {
  font-family: 'Heading Font';
  src: url('/fonts/heading.woff2') format('woff2');
  font-display: swap;
  font-weight: 700;
  /* size-adjust, ascent-override, descent-override for metric override */
}
```

- **`font-display: swap`** for body text (shows fallback immediately)
- **`font-display: optional`** for decorative fonts (skip if slow)
- Preload critical fonts: `<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>`
- Subset fonts to used character ranges
- Self-host (no Google Fonts CDN — one fewer connection)

### Code Splitting

**React:**
```tsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Dashboard />
    </Suspense>
  )
}
```

**Astro:** Automatic per-page splitting. Islands only load when their `client:` directive triggers.

**Rules:**
- Split at route boundaries (each page is a chunk)
- Split heavy libraries: `lazy(() => import('chart-library').then(m => ({ default: m.Chart })))`
- Never lazy-load above-fold content

### Third-Party Scripts

```html
<!-- Defer non-critical scripts -->
<script src="/analytics.js" defer></script>

<!-- Or load after interaction -->
<script>
  document.addEventListener('scroll', () => {
    import('./heavy-widget.js')
  }, { once: true })
</script>
```

- Audit all `<script>` tags — `async`/`defer` on non-critical
- Move analytics to `requestIdleCallback` or load on scroll
- No render-blocking `<script>` in `<head>` without `defer`

## Step 3: Runtime Performance

### React Re-Render Optimization

**Diagnosis first:**
```tsx
// Temporary: add to suspect component
if (process.env.NODE_ENV === 'development') {
  console.count('ComponentName render')
}
```

Or use React DevTools Profiler to identify expensive re-renders.

**Common fixes:**

1. **Move state down**: If a state change re-renders a large tree, move the state into the child that uses it.

2. **Composition over memoization**: Instead of `React.memo`, restructure:
```tsx
// BAD: ExpensiveList re-renders when isOpen changes
function Page() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <Modal isOpen={isOpen} />
      <ExpensiveList />
    </div>
  )
}

// GOOD: ExpensiveList doesn't re-render
function Page() {
  return (
    <div>
      <ModalWrapper />
      <ExpensiveList />
    </div>
  )
}
function ModalWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  return <Modal isOpen={isOpen} />
}
```

3. **`useMemo` / `useCallback`**: Only when passing to `React.memo` children or genuinely expensive (>1ms). Profile first.

4. **Zustand selectors**: Select individual fields, not the whole store:
```tsx
// BAD: re-renders on any store change
const store = useCartStore()
// GOOD: re-renders only when count changes
const count = useCartStore(s => s.items.length)
```

### Preact: Signals Are the Performance Win

Signals update DOM directly, skipping VDOM diffing. Use them for frequently-updating values:
```tsx
const count = signal(0)
// This JSX text node updates without re-rendering the component
return <span>{count}</span>
```

### List Performance
- Stable `key` from data ID (never array index for reorderable lists)
- Virtualize long lists (>100 items): `@tanstack/react-virtual` or `react-window`
- Paginate or infinite-scroll rather than rendering 1000+ items

## Step 4: Bundle Size

### Audit
```bash
# Check what's in the bundle
npx vite-bundle-visualizer
# or for Next.js
ANALYZE=true next build
```

### Common Bloat Sources
- Full `lodash` instead of `lodash-es` or individual imports
- Full `moment` (use `date-fns` or `Temporal`)
- Unused icon library imports (always named imports: `import { IconX } from '@tabler/icons-preact'`)
- CSS-in-JS runtime (styled-components/Emotion add 10-15KB)
- Unused polyfills

### Tree-Shaking Rules
- Named imports only: `import { debounce } from 'lodash-es'`
- No barrel file re-exports (they defeat tree-shaking)
- Check with `npx import-cost` or bundle analyzer

## Step 5: Astro-Specific Performance

Astro is fast by default — don't pessimize it:

- **Zero JS by default**: Don't add `client:load` to things that don't need interactivity
- **`client:visible`** for below-fold islands (defer JS until user scrolls)
- **`client:idle`** for non-critical (analytics, chat, secondary features)
- **Content Collections**: Pre-rendered at build time — no runtime cost
- **Image optimization**: Use `<Image />` from `astro:assets` (generates WebP, srcset automatically)
- **View Transitions**: SPA-like navigation without a client-side router bundle

## Step 6: Performance Checklist

### Loading (LCP)
- [ ] LCP element loads in ≤2.5s
- [ ] Hero image has `fetchpriority="high"` and explicit dimensions
- [ ] Fonts preloaded with `font-display: swap`
- [ ] No render-blocking scripts in `<head>`
- [ ] Critical CSS inlined or prioritized

### Interactivity (INP)
- [ ] Event handlers respond in <200ms
- [ ] Long tasks broken up with `requestIdleCallback` or `scheduler.yield()`
- [ ] No synchronous layout thrashing (read then write DOM, not interleaved)
- [ ] Heavy computation offloaded to Web Worker if >50ms

### Visual Stability (CLS)
- [ ] All images/videos have explicit `width`/`height`
- [ ] No injected content above existing content
- [ ] Fonts use metric overrides or `size-adjust` to match fallback
- [ ] Dynamic content has reserved space (skeleton screens)

### Bundle
- [ ] Route-level code splitting
- [ ] Tree-shaking verified (no barrel re-exports)
- [ ] No full library imports where individual imports work
- [ ] CSS is scoped (Modules or Astro scoped), no unused global CSS
