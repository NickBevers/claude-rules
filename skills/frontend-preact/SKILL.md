---
name: frontend-preact
description: Write production-grade Preact components with Preact-specific optimizations. Triggers on "preact component", "build in preact", "preact island", "preact hook", "preact signal".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Preact — Lightweight Component Authoring

Preact is NOT "small React" — it has its own idioms:

- `class` not `className`
- `onInput` not `onChange` for text inputs
- Native DOM events (no synthetic event system)
- `preact/hooks` is a separate import
- Signals (`@preact/signals`) are first-class — prefer over `useState` for shared/frequent state
- `preact/compat` only when a library requires React APIs

## Step 1: Components

```tsx
import { signal, computed } from '@preact/signals'
import styles from './Counter.module.css'

const count = signal(0)
const doubled = computed(() => count.value * 2)

export function Counter() {
  return (
    <div class={styles.wrapper}>
      <output>{doubled}</output>
      <button onClick={() => count.value++}>Increment ({count})</button>
    </div>
  )
}
```

**Signals vs useState:** `signal()` for shared/frequent state (skips VDOM). `useState` for local ephemeral (modal open, focus). Pass signals directly in JSX — Preact subscribes at DOM level.

Extend native elements: `ComponentProps<'button'>` from `preact`.

### Astro Islands

- Keep islands small — only interactive parts
- `client:visible` below-fold, `client:load` above-fold, `client:idle` non-critical
- Cross-island state: Nanostores or module-scope Signals

## Step 2: State Patterns

**Local**: `useState` from `preact/hooks`
**Reactive**: `signal()` at module level — shared automatically
**Cross-island (Astro)**: Nanostores (`$` prefix convention)

```tsx
// stores/cart.ts
import { atom, map } from 'nanostores'
export const cartItems = map<Record<string, CartItem>>({})

// islands/CartButton.tsx
import { useStore } from '@nanostores/preact'
const items = useStore(cartItems)
```

## Step 3: Performance

- No `memo()` by default — Preact diffing is fast enough
- Signals skip VDOM — use them
- Small components = small re-render scope
- Avoid `preact/compat` unless needed (~3KB overhead)
- Named imports only, no barrel re-exports

## Self-Check

- [ ] `class` not `className`, `onInput` not `onChange`
- [ ] Signals for shared/frequent, `useState` for ephemeral
- [ ] No unnecessary `preact/compat`
- [ ] Islands are small
- [ ] Cross-island: Nanostores or module Signals
- [ ] Accessible
- [ ] No premature `memo()`
