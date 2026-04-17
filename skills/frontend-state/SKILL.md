---
name: frontend-state
description: Choose and implement state management patterns for React, Preact, or Astro projects. Triggers on "state management", "global state", "zustand", "nanostores", "signals", "context", "redux", "jotai", "state architecture".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# State Management — Choose the Right Tool

## Classification

| Type | Scope | Solution |
|---|---|---|
| UI state (modal, hover) | Single component | `useState` |
| Component state (form, wizard) | Component tree | `useState` / `useReducer` |
| Shared UI (theme, sidebar) | Cross-component | Context / Signals / Zustand |
| Server state (API data) | Global cached | TanStack Query / SWR |
| URL state (filters, pagination) | Global persistent | URL search params |
| Cross-island (Astro) | Multiple islands | Nanostores |

**Most common mistake**: using global state for what should be URL state or server state.

## React

**Context** for infrequent globals (theme, locale, auth). Wrong for frequent updates.

**Zustand** (recommended for shared mutable state):
```tsx
const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set(s => ({ items: [...s.items, item] })),
  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
}))

// Select granularly
const count = useCartStore(s => s.items.length)
```

**TanStack Query** for server state. Never store fetched data in `useState` manually.

## Preact

**Signals** (first-class):
```tsx
const count = signal(0)
const doubled = computed(() => count.value * 2)
function Counter() { return <button onClick={() => count.value++}>{count}</button> }
```

Signals for shared/frequent. `useState` for ephemeral local.

**Nanostores** for cross-island (Astro):
```ts
export const $cartItems = map<Record<string, CartItem>>({})
export const $cartCount = computed($cartItems, items => Object.keys(items).length)
```

## Derived State — Never Store It

```tsx
// BAD
const [items, setItems] = useState([])
const [total, setTotal] = useState(0)
useEffect(() => setTotal(items.reduce(...)), [items])

// GOOD: compute during render
const total = items.reduce((sum, i) => sum + i.price, 0)

// GOOD: Signals
const total = computed(() => items.value.reduce(...))
```

## URL State

Filters, search, pagination belong in the URL:
```tsx
const [params, setParams] = useSearchParams()
const page = Number(params.get('page') ?? '1')
```

Benefits: shareable URLs, back/forward works, survives refresh.

## Self-Check

- [ ] No duplicate/derived state in `useState`
- [ ] No `useEffect` syncing two state values
- [ ] Server state uses a library, not manual fetch + useState
- [ ] URL-worthy state in URL
- [ ] One state library per concern
- [ ] Zustand selectors are granular
- [ ] Nanostores for cross-island in Astro
