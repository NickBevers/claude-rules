---
name: preact-compat
description: Use React libraries in Preact projects via preact/compat — aliasing, debugging, isolation, and workarounds. Triggers on "preact compat", "react library in preact", "preact/compat", "react compatibility", "preact alias react", "hydration mismatch preact".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# Preact/Compat — Running React Libraries in Preact

`preact/compat` adds ~3KB to unlock React ecosystem. Use surgically — not globally.

## Do You Need Compat?

1. **Preact-native alternative exists?** Charts: raw SVG/canvas. Forms: native + Zod. Animation: CSS + Signals.
2. **Library uses only basic React APIs?** (`useState`, `useEffect`, `useRef`, `createElement`) → works without compat.
3. **Library needs these?** → compat required: `forwardRef`, `createPortal`, `memo`, `useImperativeHandle`, `useSyncExternalStore`, `React.Children`, `Suspense`/`lazy`, synthetic event assumptions.

## Step 1: Aliasing

### Astro
```ts
preact({ compat: true })  // global — all islands pay compat cost
```

### Vite
```ts
resolve: {
  alias: {
    'react': 'preact/compat',
    'react-dom': 'preact/compat',
    'react/jsx-runtime': 'preact/jsx-runtime',
  },
}
```

### tsconfig.json
```json
{ "compilerOptions": { "paths": {
  "react": ["./node_modules/preact/compat"],
  "react-dom": ["./node_modules/preact/compat"]
}}}
```

## Step 2: Compatibility Tiers

**Tier 1 — Works flawlessly:** react-hook-form, @tanstack/react-query, @tanstack/react-table, @tanstack/react-virtual, react-router-dom, zustand (no compat needed), jotai (no compat needed)

**Tier 2 — Minor workarounds:** Radix UI (stub `flushSync`), Headless UI, react-select, Recharts

**Tier 3 — Problematic:** React Three Fiber (use Three.js raw), React Native Web, Formik (use react-hook-form), libraries using React 19 `use()` hook

## Step 3: Scoped Compat (Recommended)

Don't pay compat cost everywhere:

```ts
// astro.config.ts
integrations: [
  preact({ compat: false }),                  // Preact for most islands
  react({ include: ['**/react-islands/**'] }), // React for specific islands
]
```

```
src/
  islands/              # Preact native (fast, small)
  react-islands/        # React compat (heavier)
```

## Step 4: Common Issues

### Event handling
Preact uses native DOM events. If a library expects `event.persist()`:
```tsx
const patchedEvent = Object.assign(event, { persist: () => {}, nativeEvent: event })
```

### Hydration mismatches
- Date/time rendering: differs server vs client → render client-only or pass as prop
- Browser APIs (`window`, `localStorage`): guard with `useEffect`
- Random IDs: use `useId()` from `preact/compat`

### Portals
```tsx
import { createPortal } from 'preact/compat'
const target = typeof document !== 'undefined' ? document.getElementById('modal-root') : null
if (target) return createPortal(children, target)
```

Add `<div id="modal-root"></div>` in Astro layout.

### Suspense/lazy
Works client-side. SSR with Suspense not supported in Preact — use Astro's SSR + `client:visible`.

## Step 5: Debugging

```bash
# Verify aliases work
grep -rn "from 'react'" src/ --include="*.tsx"

# Check for duplicate React + Preact in bundle
npx vite-bundle-visualizer
```

**Library works in React but not Preact?** Check all aliases set (react, react-dom, react/jsx-runtime), TypeScript paths match bundler aliases.

**Component renders but behaves wrong?** Event differences (onInput vs onChange), `className` vs `class`, missing `key` prop.

## Self-Check

- [ ] Verified library actually needs compat
- [ ] Compat scoped, not global
- [ ] TypeScript paths match bundler aliases
- [ ] No duplicate React + Preact in bundle
- [ ] Portal target exists in layout
- [ ] Event handling tested
- [ ] Bundle size impact measured
