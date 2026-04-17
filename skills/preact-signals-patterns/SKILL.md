---
name: preact-signals-patterns
description: Advanced Preact Signals patterns — derived state, effects, async, cross-component, testing, and migration from hooks. Triggers on "signals pattern", "preact signals advanced", "signal effect", "computed signal", "signal store", "migrate to signals".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Preact Signals — Advanced Patterns

Signals are Preact's reactive primitive. They bypass the VDOM for fine-grained DOM updates. This skill covers advanced patterns beyond basic `signal()` / `computed()`.

## Packages

- `@preact/signals`: Core Preact integration (for Preact projects)
- `@preact/signals-core`: Framework-agnostic core (for libraries)
- `@preact/signals-react`: React adapter (not relevant for Preact projects)

## Step 1: Signal Fundamentals — Mental Model

A Signal is a **reactive container** with `.value`. Reading `.value` subscribes the caller. Writing `.value` notifies subscribers.

```tsx
import { signal, computed, effect } from '@preact/signals'

const count = signal(0)                    // writable signal
const doubled = computed(() => count.value * 2)  // read-only derived signal

effect(() => {
  console.log(`Count is ${count.value}`)   // runs when count changes
})

count.value = 5  // triggers computed + effect
```

**Key insight**: When a Signal is placed directly in JSX, Preact subscribes at the **DOM node level** — the component doesn't re-render. This is Preact's main performance advantage over React.

```tsx
function Counter() {
  // Component renders ONCE. DOM text node updates when count changes.
  return <span>{count}</span>  // Pass signal, not count.value
}
```

## Step 2: Store Patterns

### Simple Store (module-level signals)

```tsx
// stores/cart.ts
import { signal, computed } from '@preact/signals'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

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

  remove(id: string) {
    items.value = items.value.filter(i => i.id !== id)
  },

  updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) return cart.remove(id)
    items.value = items.value.map(i =>
      i.id === id ? { ...i, quantity } : i
    )
  },

  clear() {
    items.value = []
  },
}
```

```tsx
// islands/CartBadge.tsx
import { cart } from '../stores/cart'

export function CartBadge() {
  return <span class="badge">{cart.count}</span>
}
```

### Immutable Updates

Signals require new references to trigger updates for objects/arrays:

```tsx
// BAD: mutating — won't trigger subscribers
items.value.push(newItem)

// GOOD: new array reference
items.value = [...items.value, newItem]

// BAD: mutating object
user.value.name = 'Ada'

// GOOD: new object reference
user.value = { ...user.value, name: 'Ada' }
```

### Batch Updates

```tsx
import { batch } from '@preact/signals'

// Without batch: triggers 3 separate updates
name.value = 'Ada'
email.value = 'ada@example.com'
role.value = 'admin'

// With batch: triggers ONE update
batch(() => {
  name.value = 'Ada'
  email.value = 'ada@example.com'
  role.value = 'admin'
})
```

Use `batch()` when updating multiple signals that are read by the same computed or component.

## Step 3: Async Data with Signals

### Fetch Pattern

```tsx
import { signal, computed } from '@preact/signals'

interface AsyncState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

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
    load,
    reload: load,
  }
}

// Usage
const users = createAsyncSignal(() =>
  fetch('/api/users').then(r => r.json())
)

// In component
export function UserList() {
  if (users.loading.value) return <Skeleton />
  if (users.error.value) return <Error message={users.error.value.message} retry={users.reload} />
  return <ul>{users.data.value?.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### Polling

```tsx
import { signal, effect } from '@preact/signals'

const pollInterval = signal<number | null>(null)
const stockLevel = signal<number | null>(null)

effect(() => {
  const ms = pollInterval.value
  if (!ms) return

  const id = setInterval(async () => {
    const res = await fetch('/api/stock')
    stockLevel.value = (await res.json()).level
  }, ms)

  return () => clearInterval(id)
})

// Start polling
pollInterval.value = 5000

// Stop polling
pollInterval.value = null
```

## Step 4: Signals + Preact Hooks (interop)

### Using Signals in Hook-Based Code

```tsx
import { useSignal, useComputed, useSignalEffect } from '@preact/signals'

export function Counter() {
  // Component-scoped signal (created per instance, cleaned up on unmount)
  const count = useSignal(0)
  const doubled = useComputed(() => count.value * 2)

  useSignalEffect(() => {
    document.title = `Count: ${count.value}`
  })

  return <button onClick={() => count.value++}>{doubled}</button>
}
```

**When to use `useSignal` vs module-level `signal`:**
- `useSignal`: Component-scoped state (like `useState` but reactive). Each instance gets its own signal. Cleaned up on unmount.
- Module-level `signal`: Shared state. All components reading it share the same value. Lives forever (or until manually cleared).

### Converting Between Hooks and Signals

```tsx
// useState → useSignal
const [count, setCount] = useState(0)  // before
const count = useSignal(0)              // after (update: count.value++)

// useMemo → useComputed
const doubled = useMemo(() => count * 2, [count])      // before
const doubled = useComputed(() => count.value * 2)      // after

// useEffect → useSignalEffect
useEffect(() => {                                       // before
  document.title = `Count: ${count}`
}, [count])
useSignalEffect(() => {                                 // after
  document.title = `Count: ${count.value}`
  // Dependencies tracked automatically — no dep array
})
```

## Step 5: Cross-Island Communication (Astro)

### Option A: Module-Level Signals (same framework)

```tsx
// stores/theme.ts
import { signal } from '@preact/signals'

export const theme = signal<'light' | 'dark'>('light')

export function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
```

```tsx
// islands/ThemeToggle.tsx
import { theme, toggleTheme } from '../stores/theme'

export function ThemeToggle() {
  return <button onClick={toggleTheme}>{theme.value === 'light' ? '🌙' : '☀️'}</button>
}

// islands/ThemedCard.tsx
import { theme } from '../stores/theme'

export function ThemedCard() {
  return <div class={theme.value === 'dark' ? 'card-dark' : 'card-light'}>Content</div>
}
```

Both islands share the same `theme` signal — updating in one instantly reflects in the other.

### Option B: Nanostores (cross-framework)

When islands use different frameworks (Preact + Vue, Preact + Svelte):

```ts
// stores/auth.ts
import { atom } from 'nanostores'

export const $user = atom<User | null>(null)

export function login(user: User) { $user.set(user) }
export function logout() { $user.set(null) }
```

```tsx
// Preact island
import { useStore } from '@nanostores/preact'
import { $user } from '../stores/auth'

export function UserBadge() {
  const user = useStore($user)
  return user ? <span>{user.name}</span> : <a href="/login">Sign in</a>
}
```

### Option C: Custom Events (lightest, no library)

```tsx
// islands/AddToCart.tsx
export function AddToCartButton({ productId }: { productId: string }) {
  function handleClick() {
    document.dispatchEvent(new CustomEvent('cart:add', { detail: { productId } }))
  }
  return <button onClick={handleClick}>Add to Cart</button>
}

// islands/CartCount.tsx
import { signal } from '@preact/signals'
import { useEffect } from 'preact/hooks'

const count = signal(0)

export function CartCount() {
  useEffect(() => {
    const handler = () => { count.value++ }
    document.addEventListener('cart:add', handler)
    return () => document.removeEventListener('cart:add', handler)
  }, [])

  return <span>{count}</span>
}
```

## Step 6: Persistence

### localStorage Sync

```tsx
import { signal, effect } from '@preact/signals'

function persistedSignal<T>(key: string, initial: T) {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null
  const s = signal<T>(stored ? JSON.parse(stored) : initial)

  if (typeof window !== 'undefined') {
    effect(() => {
      localStorage.setItem(key, JSON.stringify(s.value))
    })
  }

  return s
}

// Usage
export const preferences = persistedSignal('user-prefs', {
  theme: 'light' as 'light' | 'dark',
  fontSize: 16,
  sidebarOpen: true,
})
```

## Step 7: Testing Signals

```tsx
import { signal, computed } from '@preact/signals'
import { describe, test, expect } from 'vitest'

describe('cart store', () => {
  test('add item increments count', () => {
    const items = signal<CartItem[]>([])
    const count = computed(() => items.value.length)

    items.value = [...items.value, { id: '1', name: 'Widget', price: 10, quantity: 1 }]

    expect(count.value).toBe(1)
  })

  test('computed total reflects items', () => {
    const items = signal([
      { id: '1', price: 10, quantity: 2 },
      { id: '2', price: 5, quantity: 1 },
    ])
    const total = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))

    expect(total.value).toBe(25)
  })
})
```

Testing signals is simple — they're just values. No `renderHook`, no `act()`. Read and write `.value` directly.

For component tests with signals, use Testing Library:
```tsx
import { render, screen } from '@testing-library/preact'
import userEvent from '@testing-library/user-event'

test('counter increments', async () => {
  render(<Counter />)
  await userEvent.click(screen.getByRole('button'))
  expect(screen.getByText('1')).toBeInTheDocument()
})
```

## Step 8: Anti-Patterns

- **Reading `.value` in JSX when you can pass the signal directly**: `<span>{count}</span>` (signal) is better than `<span>{count.value}</span>` (value) — the former skips VDOM diffing.
- **Mutating signal contents**: Always create new references for objects/arrays.
- **Too many effects**: Effects are for side effects (DOM, logging, persistence). Not for derived state — use `computed()`.
- **Signals for truly ephemeral state**: Input focus, animation frame, drag position — `useState` or direct DOM manipulation is fine.
- **Forgetting `batch()`**: Multiple signal writes in one synchronous block trigger multiple updates without batching.

## Self-Check

- [ ] Module-level signals for shared state, `useSignal` for component-scoped
- [ ] `computed()` for derived state (not `effect` that writes to another signal)
- [ ] Immutable updates (new array/object references, never mutate)
- [ ] `batch()` used when updating multiple related signals synchronously
- [ ] Signals passed directly in JSX (not `.value`) for optimal DOM updates
- [ ] Cross-island state works (tested: update in one island, see change in another)
- [ ] Async signals handle loading, error, and success states
- [ ] SSR safety: `window`/`localStorage` access guarded with `typeof window !== 'undefined'`
