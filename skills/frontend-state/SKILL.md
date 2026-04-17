---
name: frontend-state
description: Choose and implement state management patterns for React, Preact, or Astro projects. Triggers on "state management", "global state", "zustand", "nanostores", "signals", "context", "redux", "jotai", "state architecture".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# State Management — Choose the Right Tool

State is the #1 source of frontend bugs. The goal is to use the simplest solution that works, not the most powerful one available.

## Step 1: State Classification

Before writing any state code, classify what you're dealing with:

| Type | Lifetime | Scope | Example | Solution |
|---|---|---|---|---|
| **UI state** | Ephemeral | Single component | Modal open, hover, input focus | `useState` |
| **Component state** | Session | Single component tree | Form data, wizard step, filter selection | `useState` / `useReducer` |
| **Shared UI state** | Session | Multiple components | Theme, sidebar collapsed, active tab | Context (React) / Signals (Preact) / Zustand |
| **Server state** | Cached | Global | API data, user profile, list data | TanStack Query / SWR / `use()` |
| **URL state** | Persistent | Global | Search params, pagination, filters | URL search params |
| **Persistent state** | Permanent | Global | User preferences, onboarding complete | localStorage + state lib |
| **Cross-island state** | Session | Multiple islands | Cart, auth status | Nanostores (Astro) |

**The most common mistake is using global state for what should be URL state or server state.**

## Step 2: Framework-Specific Patterns

### React

**Local state:**
```tsx
const [count, setCount] = useState(0)
const [items, dispatch] = useReducer(itemsReducer, [])
```

Use `useReducer` when:
- Multiple related state values update together
- Next state depends on previous state
- State transitions are complex (add/remove/update/reorder)

**Context (for infrequent global values):**
```tsx
const ThemeContext = createContext<Theme>('light')

// React 19: use Context directly as provider
<ThemeContext value={theme}>
  {children}
</ThemeContext>

// React 18: use .Provider
<ThemeContext.Provider value={theme}>
  {children}
</ThemeContext.Provider>
```

Context is right for: theme, locale, auth status, feature flags. Context is wrong for: frequently updating values (causes full tree re-render), large state objects, anything fetched from an API.

**Zustand (recommended for shared mutable state):**
```tsx
import { create } from 'zustand'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  total: () => number
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
}))

// In component — select only what you need
function CartCount() {
  const count = useCartStore((s) => s.items.length)
  return <span>{count}</span>
}
```

Zustand advantages: no provider needed, selectors prevent re-renders, works outside React (vanilla store), small bundle.

**TanStack Query (for server state):**
```tsx
function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000,
  })
}
```

Never store fetched data in `useState` manually when a server-state library exists. The library handles caching, refetching, loading/error states, and deduplication.

### Preact

**Signals (first-class in Preact):**
```tsx
import { signal, computed, effect } from '@preact/signals'

// Module-level: shared automatically between components
const count = signal(0)
const doubled = computed(() => count.value * 2)

// Direct in JSX — subscribes at DOM level, skips VDOM
function Counter() {
  return <button onClick={() => count.value++}>{count}</button>
}
```

Signals vs. `useState`:
- Signals: shared state, frequently updating values, derived state, cross-component
- `useState`: truly local ephemeral state (modal open, input focus)

**Nanostores (for Astro island communication):**
```ts
// stores/cart.ts
import { atom, map, computed } from 'nanostores'

export const $cartItems = map<Record<string, CartItem>>({})
export const $cartCount = computed($cartItems, items => Object.keys(items).length)

// In Preact island
import { useStore } from '@nanostores/preact'
function CartBadge() {
  const count = useStore($cartCount)
  return <span>{count}</span>
}
```

Nanostores naming: prefix store variables with `$` (convention from Nano ecosystem).

### Astro

Astro has no client-side state of its own — state lives in the framework islands. Cross-island state requires a framework-agnostic solution:

- **Nanostores**: Works across Preact, React, Vue, Svelte islands in the same Astro project
- **Custom events**: `document.dispatchEvent(new CustomEvent('cart:update', { detail }))` for simple cross-island communication
- **URL state**: Search params for filter/sort/pagination state that should survive page navigation

## Step 3: Derived State

**Never store derived values in state.** This is the most common state bug:

```tsx
// BAD: derived state stored separately
const [items, setItems] = useState<Item[]>([])
const [total, setTotal] = useState(0)
useEffect(() => {
  setTotal(items.reduce((sum, i) => sum + i.price, 0))
}, [items])

// GOOD: compute during render
const [items, setItems] = useState<Item[]>([])
const total = items.reduce((sum, i) => sum + i.price, 0)

// GOOD: useMemo if computation is expensive (>1ms)
const total = useMemo(
  () => items.reduce((sum, i) => sum + i.price, 0),
  [items]
)

// GOOD: Preact signals — derived state is a computed signal
const items = signal<Item[]>([])
const total = computed(() => items.value.reduce((sum, i) => sum + i.price, 0))
```

## Step 4: URL State

Filters, search queries, pagination, and sort order belong in the URL — not in React/Preact state:

```tsx
// React (with react-router or Next.js)
const [searchParams, setSearchParams] = useSearchParams()
const page = Number(searchParams.get('page') ?? '1')
const sort = searchParams.get('sort') ?? 'date'

function setPage(p: number) {
  setSearchParams(prev => { prev.set('page', String(p)); return prev })
}
```

Benefits: shareable URLs, back/forward button works, survives refresh, SEO-friendly.

## Step 5: State Migration Guide

If the user asks to add or change state management:

1. **Audit current state**: `Grep` for `useState`, `useReducer`, `useContext`, `createContext`, `create(`, `signal(`, `atom(` to map all state in the project
2. **Classify each piece** using the table from Step 1
3. **Identify mismatches**: Server state in `useState`? Derived state stored? URL state in memory?
4. **Propose migration** with specific files and changes
5. **Migrate incrementally** — never rewrite all state at once

## Self-Check

- [ ] No duplicate state (nothing derived stored in `useState`)
- [ ] No `useEffect` that syncs two state values (lift state up instead)
- [ ] Server state uses a server-state library (not manual `useState` + `useEffect` + `fetch`)
- [ ] URL-worthy state is in the URL (filters, pagination, search)
- [ ] Only one state library in the project (no mixing Zustand + Redux + Context for similar things)
- [ ] Zustand selectors are granular (select one field, not the whole store)
- [ ] Preact Signals used for shared state, `useState` for ephemeral local state
- [ ] Nanostores used for cross-island communication in Astro
