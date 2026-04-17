---
name: frontend-preact
description: Write production-grade Preact components with Preact-specific optimizations. Triggers on "preact component", "build in preact", "preact island", "preact hook", "preact signal".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Preact — Lightweight Component Authoring

Write Preact components using Preact-native APIs. Preact is NOT just "small React" — it has its own idioms.

## Preact vs. React — Key Divergences

These are the things Claude gets wrong when writing Preact like React:
- `class` not `className` (both work, but `class` is idiomatic Preact)
- `onInput` not `onChange` for text inputs (matches native DOM events)
- `ref` callback receives the DOM node directly
- No synthetic event system — events are native DOM events
- `preact/hooks` is a separate import (not bundled in core)
- Signals (`@preact/signals`) are a first-class reactive primitive — prefer over `useState` for shared or frequently-updating state
- `preact/compat` only when a library requires React APIs — don't enable it globally

## Step 1: Gather Context

- Component purpose and location in the project
- Is this an Astro island or standalone Preact app?
- State requirements: local (`useState`), reactive (`signal`), cross-component (`@nanostores/preact` or `@preact/signals`)
- Read 2-3 existing components: `Glob("**/components/**/*.tsx")` or `Glob("**/islands/**/*.tsx")`

## Step 2: Component Architecture

### Preact-Idiomatic Patterns

```tsx
import { signal, computed } from '@preact/signals'
import styles from './Counter.module.css'

const count = signal(0)
const doubled = computed(() => count.value * 2)

export function Counter() {
  return (
    <div class={styles.wrapper}>
      <output>{doubled}</output>
      <button onClick={() => count.value++}>
        Increment ({count})
      </button>
    </div>
  )
}
```

**Signals vs. useState:**
- `signal()` for state shared between components or updated frequently (no re-render of entire tree)
- `useState` for truly local, ephemeral UI state (modal open, input focus)
- `computed()` for derived values from signals
- `effect()` for side effects from signal changes (use sparingly — same philosophy as `useEffect`)
- Signals can be passed as JSX text/attribute values directly — Preact subscribes at the DOM node level, skipping VDOM diffing

**Props**: Explicit TypeScript types. Use `ComponentProps<'button'>` from `preact` for extending native elements:

```tsx
import type { ComponentProps } from 'preact'

type ButtonProps = ComponentProps<'button'> & {
  variant: 'primary' | 'ghost'
}
```

### Astro Island Integration

When building islands for Astro:
- Keep islands small — only the interactive parts
- Use `client:visible` for below-fold, `client:load` for above-fold, `client:idle` for non-critical
- Cross-island state: Nanostores (`@nanostores/preact`) or Preact Signals at module scope
- Never put an entire page in an island — only the interactive pieces

```astro
---
import { Counter } from '../islands/Counter'
---
<Counter client:visible />
```

### File Structure

Match project conventions. Default:
```
islands/           # Astro islands (interactive components)
  Counter.tsx
  SearchBar.tsx
components/        # Static/shared components
  Card.tsx
  Layout.tsx
```

## Step 3: Preact-Specific Performance

Preact is already fast. Don't pessimize it:
- **No `memo()` by default** — Preact's diffing is fast enough. Only add when profiling proves a bottleneck.
- **Signals skip the VDOM** — when a signal is used directly in JSX, Preact updates the DOM node without re-rendering the component. This is Preact's primary performance advantage. Use it.
- **Keep components small** — Preact re-renders the whole component on state change. Smaller components = smaller re-render scope.
- **Avoid `preact/compat` unless needed** — it adds ~3KB and a compatibility layer. Use native Preact APIs.
- Named imports only — no barrel re-exports
- `loading="lazy"` + `decoding="async"` on below-fold images

## Step 4: State Patterns

### Local State (component-scoped, ephemeral)
```tsx
import { useState } from 'preact/hooks'
const [open, setOpen] = useState(false)
```

### Reactive State (shared or frequently updated)
```tsx
import { signal } from '@preact/signals'
// Module-level: shared between components automatically
export const searchQuery = signal('')
```

### Cross-Island State (Astro projects)
```tsx
// stores/cart.ts
import { atom, map } from 'nanostores'
export const cartItems = map<Record<string, CartItem>>({})
export const cartTotal = computed(cartItems, items =>
  Object.values(items).reduce((sum, item) => sum + item.price, 0)
)

// islands/CartButton.tsx
import { useStore } from '@nanostores/preact'
import { cartItems } from '../stores/cart'
export function CartButton() {
  const items = useStore(cartItems)
  // ...
}
```

## Step 5: Preact/Compat Boundary

Only use `preact/compat` when a third-party library requires React APIs:
- Chart libraries (VisX, Recharts)
- Complex component libraries (Radix, Headless UI)

When using compat:
- Alias in bundler config, don't import React directly
- Isolate compat-dependent code into its own island/component
- Document why compat is needed with a one-line comment

## Step 6: Self-Check

- [ ] Verified Preact version and API compatibility
- [ ] Using `class` not `className`, `onInput` not `onChange`
- [ ] Signals for shared/frequent state, `useState` for ephemeral local state
- [ ] No unnecessary `preact/compat` imports
- [ ] Islands are small (only interactive parts)
- [ ] Cross-island state uses Nanostores or module-scope Signals
- [ ] Matches existing project patterns
- [ ] Accessible (semantic HTML, keyboard, screen reader)
- [ ] No premature `memo()` — Preact is already fast
