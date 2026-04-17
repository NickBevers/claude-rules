---
name: preact-compat
description: Use React libraries in Preact projects via preact/compat — aliasing, debugging, isolation, and workarounds. Triggers on "preact compat", "react library in preact", "preact/compat", "react compatibility", "preact alias react", "hydration mismatch preact".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# Preact/Compat — Running React Libraries in Preact

`preact/compat` is a thin compatibility layer that lets React libraries run in Preact. It adds ~3KB but unlocks the entire React ecosystem. Use it surgically — not globally.

## Step 0: Do You Actually Need Compat?

Before reaching for `preact/compat`, check:

1. **Does a Preact-native alternative exist?**
   - Charts: `@preact/charts`, raw SVG, or `<canvas>` → try before compat
   - UI primitives: build them — Preact's API covers most patterns
   - Animation: CSS transitions + Signals → no library needed
   - Forms: native Preact + Zod → no React form library needed

2. **Does the library only use basic React APIs?**
   Many libraries work with Preact directly (no compat) if they only use:
   - `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`
   - `createElement`, `Fragment`, `cloneElement`
   - Basic prop types

3. **Does the library require these React-specific APIs?** Then you need compat:
   - `forwardRef`, `createPortal`, `React.memo`
   - `useImperativeHandle`, `useLayoutEffect`, `useSyncExternalStore`
   - `createContext` with `displayName`
   - `React.Children` utilities
   - `ReactDOM.findDOMNode`, `ReactDOM.createRoot`
   - `Suspense`, `lazy`
   - Synthetic event system assumptions (`.nativeEvent`, `event.persist()`)

Refer to preactjs.com/guide/v10/switching-to-preact for the full compatibility matrix.

## Step 1: Aliasing Setup

### Astro (simplest)

```ts
// astro.config.ts
import preact from '@astrojs/preact'

export default defineConfig({
  integrations: [
    preact({
      compat: true,  // Aliases react → preact/compat globally
    }),
  ],
})
```

**Problem**: This makes ALL islands pay the compat cost. Prefer scoped aliasing (Step 3).

### Vite (standalone Preact projects)

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
})
```

### Bun / esbuild

```ts
// bunfig.toml (Bun)
[resolve]
alias = { "react" = "preact/compat", "react-dom" = "preact/compat", "react/jsx-runtime" = "preact/jsx-runtime" }
```

### TypeScript Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "react": ["./node_modules/preact/compat"],
      "react-dom": ["./node_modules/preact/compat"],
      "react/jsx-runtime": ["./node_modules/preact/jsx-runtime"]
    }
  }
}
```

## Step 2: Library Compatibility Tiers

### Tier 1: Works Flawlessly with Compat

These libraries are widely tested with `preact/compat`:
- **react-hook-form**: Forms — works perfectly
- **@tanstack/react-query**: Data fetching — full compatibility
- **@tanstack/react-table**: Tables — works perfectly
- **@tanstack/react-virtual**: Virtualization — works perfectly
- **framer-motion**: Animation — works (but heavy, consider CSS instead)
- **react-router-dom**: Routing — works (but Astro routing is better in Astro projects)
- **zustand**: State — works natively (no compat needed)
- **jotai**: State — works natively (no compat needed)

### Tier 2: Works with Minor Workarounds

- **Radix UI**: Primitives — mostly works. Some components use `ReactDOM.flushSync` (stub it). Portals may need adjustment.
- **Headless UI**: Works, but uses `Transition` internally which has edge cases.
- **react-select**: Works with compat. Emotion peer dep may need attention.
- **VisX**: Charts — works with compat. Bundle is large; consider if you really need it.
- **Recharts**: Works. Uses `ReactDOM.findDOMNode` in some paths (deprecated but compat supports it).

### Tier 3: Problematic / Not Recommended

- **React Three Fiber (R3F)**: Heavy, uses React reconciler directly — stick to Three.js raw.
- **React Native Web**: Won't work — too deeply tied to React internals.
- **Formik**: Works but is unmaintained — use react-hook-form instead.
- **Next.js-specific libraries**: (next/image, next/link) — don't work outside Next.js regardless.
- **Libraries using `use()` hook** (React 19): Not supported in preact/compat yet — may change.

## Step 3: Scoped Compat (Astro — Recommended Pattern)

Don't pay the compat cost everywhere. Scope React libraries to their own island directory:

```ts
// astro.config.ts
import preact from '@astrojs/preact'
import react from '@astrojs/react'

export default defineConfig({
  integrations: [
    preact({ compat: false }),                    // Preact for most islands
    react({ include: ['**/react-islands/**'] }),   // Real React for specific islands
  ],
})
```

```
src/
  islands/              # Preact (native, fast, small)
    Counter.tsx
    SearchBar.tsx
    CartDrawer.tsx
  react-islands/        # React (compat libraries, heavier)
    DataChart.tsx        # Uses VisX → needs React
    RichTextEditor.tsx   # Uses Tiptap → needs React
```

**This is better than global compat** because:
- Preact islands stay small (no compat overhead)
- React islands get full React compatibility
- Clear boundary between native Preact and React-dependent code
- Bundle splitting keeps compat cost isolated

## Step 4: Common Compat Issues & Fixes

### Event Handling Differences

Preact uses native DOM events. React libraries may expect synthetic events:

```tsx
// React library expects event.persist() (removed in React 17+ but some libs still call it)
// preact/compat stubs this, but if it doesn't:
const patchedEvent = Object.assign(event, {
  persist: () => {},
  nativeEvent: event,
})
```

### `ref` Forwarding

Preact 10 passes `ref` as a regular prop. Some React libraries use `forwardRef` explicitly. `preact/compat` polyfills `forwardRef`, but if you see ref issues:

```tsx
// Wrapper that explicitly forwards ref
import { forwardRef } from 'preact/compat'

const WrappedLibComponent = forwardRef((props, ref) => (
  <LibraryComponent {...props} ref={ref} />
))
```

### Hydration Mismatches

Symptoms: content flickers, components render twice, console warnings about hydration.

**Common causes:**
1. **Date/time rendering**: Server and client produce different timestamps.
   ```tsx
   // BAD: Different on server vs client
   <span>{new Date().toLocaleDateString()}</span>

   // GOOD: Render on client only, or pass as prop from Astro
   const [mounted, setMounted] = useState(false)
   useEffect(() => setMounted(true), [])
   if (!mounted) return <span>Loading…</span>
   ```

2. **Browser-only APIs**: `window`, `localStorage`, `matchMedia` don't exist during SSR.
   ```tsx
   // GOOD: Guard with useEffect
   const [theme, setTheme] = useState('light')
   useEffect(() => {
     setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
   }, [])
   ```

3. **Random IDs**: `crypto.randomUUID()` produces different values on server vs client.
   ```tsx
   // Use useId() for stable IDs (preact/compat supports this)
   import { useId } from 'preact/compat'
   const id = useId()
   ```

4. **Extension/plugin injection**: Browser extensions inject DOM nodes → mismatch.
   ```tsx
   // Suppress with client-only rendering for affected components
   // or accept the warning (it's cosmetic)
   ```

### `createPortal` Issues

```tsx
import { createPortal } from 'preact/compat'

function Modal({ children, open }) {
  if (!open) return null

  // Ensure target exists (SSR won't have it)
  const target = typeof document !== 'undefined'
    ? document.getElementById('modal-root')
    : null

  if (!target) return null
  return createPortal(children, target)
}
```

Add the portal target in your Astro layout:
```astro
<body>
  <slot />
  <div id="modal-root"></div>
</body>
```

### `Suspense` and `lazy`

`preact/compat` supports `Suspense` and `lazy`:

```tsx
import { lazy, Suspense } from 'preact/compat'

const HeavyChart = lazy(() => import('./HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart />
    </Suspense>
  )
}
```

This works in client-side Preact. **SSR with Suspense is not supported in Preact** — use Astro's server-side rendering + `client:visible` instead.

### `useSyncExternalStore`

Some libraries (Zustand, TanStack) use `useSyncExternalStore`. `preact/compat` provides a shim:

```tsx
import { useSyncExternalStore } from 'preact/compat'
// Works — compat polyfills this
```

If you get errors, ensure `preact/compat` is the aliased `react`, not a mixed import.

## Step 5: Debugging Compat Issues

### Check What's Actually Imported

```bash
# Verify aliases are working
grep -rn "from 'react'" src/ --include="*.tsx" --include="*.ts"
# Should resolve to preact/compat in node_modules

# Check bundle for duplicate React/Preact
npx vite-bundle-visualizer
# Look for both 'preact' and 'react' chunks — if both exist, aliasing failed
```

### Common Diagnostic Steps

1. **Library works in React but not Preact?**
   - Check if all aliases are set (react, react-dom, react/jsx-runtime)
   - Check TypeScript paths match bundler aliases
   - Check if the library uses a React API not supported by compat

2. **Component renders but behaves wrong?**
   - Event handler differences (onInput vs onChange)
   - `className` vs `class` mismatch
   - Missing `key` prop warnings (Preact is stricter about this)

3. **Build succeeds but runtime error?**
   - Check browser console for `Cannot read property of undefined`
   - Usually means a React API is called that compat doesn't support
   - Search for the specific error + "preact compat" in GitHub issues

4. **Performance regression after adding compat?**
   - Check bundle size (compat adds ~3KB)
   - Check if synthetic event system is re-creating events
   - Consider scoped compat (Step 3) to isolate the cost

## Step 6: Migration Patterns

### Adding a React Library to an Existing Preact Project

1. Install the library: `bun add library-name`
2. Check if it works without compat first
3. If not, enable compat scoped to one island:
   - Astro: Use `react({ include: [...] })` integration
   - Vite: Use conditional aliases or a separate entry point
4. Create the island in the scoped directory
5. Verify bundle size impact

### Replacing a React Library with a Preact-Native Solution

1. Identify what the React library provides
2. Check if Preact Signals + native APIs can replace it
3. If building a replacement:
   - Match the public API (props, return shape)
   - Use Preact-native patterns (Signals, `class`, `onInput`)
   - Drop `preact/compat` alias once the replacement is in

## Self-Check

- [ ] Verified library actually needs compat (not just basic React API usage)
- [ ] Compat is scoped, not global (Astro: `include` on React integration)
- [ ] TypeScript paths match bundler aliases
- [ ] No duplicate React + Preact in the bundle (checked with analyzer)
- [ ] Hydration mismatches diagnosed (date/time, browser APIs, random IDs)
- [ ] Portal target exists in Astro layout (`<div id="modal-root">`)
- [ ] Event handling tested (onClick, onInput, onSubmit)
- [ ] Bundle size impact measured and acceptable
- [ ] Compat-dependent code isolated in its own directory/island
