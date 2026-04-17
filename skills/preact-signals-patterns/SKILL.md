---
name: preact-signals-patterns
description: Advanced Preact Signals patterns — derived state, effects, async, cross-component, testing, and migration from hooks. Triggers on "signals pattern", "preact signals advanced", "signal effect", "computed signal", "signal store", "migrate to signals".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Preact Signals — Advanced Patterns

Signals bypass VDOM for fine-grained DOM updates. This covers patterns beyond basic `signal()` / `computed()`.

## Packages

| Package | Use |
|---|---|
| `@preact/signals` | Preact integration |
| `@preact/signals-core` | Framework-agnostic (for libraries) |

## Step 1: Mental Model

Signal = reactive container with `.value`. Reading subscribes, writing notifies.

```tsx
import { signal, computed, effect } from '@preact/signals'

const count = signal(0)
const doubled = computed(() => count.value * 2)
effect(() => console.log(`Count is ${count.value}`))
count.value = 5  // triggers computed + effect
```

When placed directly in JSX, Preact subscribes at the **DOM node level** — component doesn't re-render:

```tsx
function Counter() {
  return <span>{count}</span>  // Pass signal, not count.value
}
```

## Step 2: Store Patterns

### Module-Level Store

```tsx
// stores/cart.ts
import { signal, computed } from '@preact/signals'

interface CartItem { id: string; name: string; price: number; quantity: number }

const items = signal<CartItem[]>([])

export const cart = {
  items,
  count: computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0)),
  total: computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0)),

  add(item: Omit<CartItem, 'quantity'>) {
    const existing = items.value.find(i => i.id === item.id)
    if (existing) {
      items.value = items.value.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      )
    } else {
      items.value = [...items.value, { ...item, quantity: 1 }]
    }
  },

  remove(id: string) { items.value = items.value.filter(i => i.id !== id) },
  clear() { items.value = [] },
}
```

### Immutable Updates

Signals require new references for objects/arrays:

```tsx
// BAD: mutating
items.value.push(newItem)
user.value.name = 'Ada'

// GOOD: new reference
items.value = [...items.value, newItem]
user.value = { ...user.value, name: 'Ada' }
```

### Batch Updates

```tsx
import { batch } from '@preact/signals'

batch(() => {
  name.value = 'Ada'
  email.value = 'ada@example.com'
  role.value = 'admin'
})
```

Use `batch()` when updating multiple signals read by the same computed or component.

## Step 3: Async Data

```tsx
import { signal, computed } from '@preact/signals'

interface AsyncState<T> { data: T | null; error: Error | null; loading: boolean }

function createAsyncSignal<T>(fetcher: () => Promise<T>) {
  const state = signal<AsyncState<T>>({ data: null, error: null, loading: false })

  async function load() {
    state.value = { ...state.value, loading: true, error: null }
    try {
      const data = await fetcher()
      state.value = { data, error: null, loading: false }
    } catch (error) {
      state.value = { data: null, error: error as Error, loading: false }
    }
  }

  return {
    state,
    data: computed(() => state.value.data),
    error: computed(() => state.value.error),
    loading: computed(() => state.value.loading),
    load, reload: load,
  }
}
```

## Step 4: Hooks Interop

```tsx
import { useSignal, useComputed, useSignalEffect } from '@preact/signals'

export function Counter() {
  const count = useSignal(0)
  const doubled = useComputed(() => count.value * 2)
  useSignalEffect(() => { document.title = `Count: ${count.value}` })
  return <button onClick={() => count.value++}>{doubled}</button>
}
```

- `useSignal`: Component-scoped (like `useState` but reactive). Cleaned up on unmount.
- Module-level `signal`: Shared state. Lives forever.

### Quick Conversion

```tsx
const [count, setCount] = useState(0)        →  const count = useSignal(0)
const doubled = useMemo(() => c * 2, [c])    →  const doubled = useComputed(() => count.value * 2)
useEffect(() => { ... }, [count])             →  useSignalEffect(() => { ... })  // auto-tracked deps
```

## Step 5: Cross-Island Communication (Astro)

**Option A: Module-level signals** (same framework)
```tsx
// stores/theme.ts — both islands import this, changes sync automatically
export const theme = signal<'light' | 'dark'>('light')
export function toggleTheme() { theme.value = theme.value === 'light' ? 'dark' : 'light' }
```

**Option B: Nanostores** (cross-framework — Preact + Vue, etc.)
```ts
import { atom } from 'nanostores'
export const $user = atom<User | null>(null)
```

**Option C: Custom Events** (lightest, no library)
```tsx
document.dispatchEvent(new CustomEvent('cart:add', { detail: { productId } }))
```

## Step 6: Persistence

```tsx
function persistedSignal<T>(key: string, initial: T) {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null
  const s = signal<T>(stored ? JSON.parse(stored) : initial)

  if (typeof window !== 'undefined') {
    effect(() => localStorage.setItem(key, JSON.stringify(s.value)))
  }
  return s
}

export const preferences = persistedSignal('user-prefs', {
  theme: 'light' as 'light' | 'dark',
  fontSize: 16,
})
```

## Step 7: Testing

Signals are plain values — no `renderHook` or `act()` needed:

```tsx
test('computed total reflects items', () => {
  const items = signal([
    { id: '1', price: 10, quantity: 2 },
    { id: '2', price: 5, quantity: 1 },
  ])
  const total = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
  expect(total.value).toBe(25)
})
```

## Anti-Patterns

- Pass signal in JSX (`{count}`) not `.value` (`{count.value}`) — former skips VDOM
- Always new references for objects/arrays
- `computed()` for derived state, not `effect` writing to another signal
- `useState` for truly ephemeral state (drag position, animation frame)
- `batch()` when updating multiple related signals

## Self-Check

- [ ] Module-level signals for shared state, `useSignal` for component-scoped
- [ ] `computed()` for derived state
- [ ] Immutable updates (new array/object references)
- [ ] `batch()` for multiple related signal writes
- [ ] Signals passed directly in JSX for optimal DOM updates
- [ ] Async signals handle loading, error, success states
- [ ] SSR safe: `typeof window !== 'undefined'` guards
