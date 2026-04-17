---
name: frontend-hooks
description: Write custom React/Preact hooks with correct dependency management and testing. Triggers on "custom hook", "write a hook", "extract hook", "useEffect help", "hook pattern".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Custom Hooks — React & Preact

Write correct, reusable hooks. Hooks are the most error-prone part of React/Preact — dependency arrays, stale closures, and cleanup are where bugs hide.

## Import Paths

- **React**: Hooks are built-in (`import { useState } from 'react'`)
- **Preact**: Hooks are a separate module (`import { useState } from 'preact/hooks'`)
- **Preact with Signals**: Prefer Signals for shared/reactive state. Use hooks for local ephemeral state and side effects.

## Step 1: Should This Be a Hook?

A custom hook is warranted when:
- Logic uses other hooks (`useState`, `useEffect`, `useRef`) AND is reused across components
- Logic is complex enough (>15 lines of stateful code) that it obscures the component
- You need to compose multiple hooks into a cohesive unit

A custom hook is NOT warranted for:
- Pure data transformations (use a plain function)
- One-off logic in a single component (keep it inline)
- State that should be a Signal or store (Preact/Zustand/Nanostores)
- Formatting or computation (use `useMemo` or compute during render)

## Step 2: Hook Structure

### Naming
- `use[Domain][Action]`: `useCartItems`, `useFormValidation`, `useMediaQuery`
- Never generic names: `useData`, `useHelper`, `useCustom`

### Return Shape
```tsx
// Two values: tuple
function useToggle(initial = false): [boolean, () => void]

// Three+ values: named object
function useAsync<T>(fn: () => Promise<T>): {
  data: T | null
  error: Error | null
  loading: boolean
  retry: () => void
}
```

### Type Signature
- Generic hooks use explicit type parameters: `useAsync<T>`
- Return type should be explicit (not inferred) for public hooks
- Overloads for different call signatures if needed

## Step 3: Dependency Arrays — The Hard Part

**Rules that prevent bugs:**

1. **Include every reactive value** the effect/memo/callback reads. The linter (`react-hooks/exhaustive-deps`) is right 95% of the time — don't suppress it without a clear reason.

2. **Stable references for callbacks**: If a callback is passed in props and used in a dependency array, wrap with `useRef` + `useEffect` to keep a stable reference:

```tsx
function useInterval(callback: () => void, ms: number) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  })

  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), ms)
    return () => clearInterval(id)
  }, [ms])
}
```

3. **Never lie about dependencies.** If you omit a dependency to "prevent re-running," you have a design problem — fix the design, don't suppress the warning.

4. **Object/array dependencies**: These change reference every render. Solutions:
   - Destructure to primitives: `[user.id, user.name]` not `[user]`
   - `useMemo` to stabilize the object upstream
   - Move the object creation inside the effect

## Step 4: Common Hook Patterns

### Data Fetching (React — no library)
```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`)
        return res.json()
      })
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [url])

  return { data, error, loading }
}
```

Always include `AbortController` cleanup. Always handle the abort error case.

### Media Query
```tsx
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
```

### Debounced Value
```tsx
function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])

  return debounced
}
```

### Local Storage
```tsx
function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : fallback
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
```

## Step 5: Testing Hooks

Use `@testing-library/react` (or `@testing-library/preact`):

```tsx
import { renderHook, act } from '@testing-library/react'

test('useToggle flips state', () => {
  const { result } = renderHook(() => useToggle(false))

  expect(result.current[0]).toBe(false)

  act(() => result.current[1]())
  expect(result.current[0]).toBe(true)
})
```

Test:
- Initial state
- State transitions (wrap in `act`)
- Cleanup (unmount and verify no memory leaks / lingering timers)
- Edge cases (empty data, error states, rapid re-renders)

## Step 6: Anti-Patterns to Avoid

- **`useEffect` for derived state**: Compute during render instead
- **`useEffect` to sync two state values**: Lift state up or merge into one `useReducer`
- **Suppressing `exhaustive-deps`**: Fix the dependency issue instead
- **Returning unstable objects**: Wrap in `useMemo` or return a stable reference
- **Side effects during render**: All side effects go in `useEffect`, event handlers, or `useLayoutEffect`
- **Timer without cleanup**: Every `setInterval`/`setTimeout` needs a `return () => clear*` in the effect

## Self-Check

- [ ] Hook name follows `use[Domain][Action]` pattern
- [ ] Return shape is tuple (2 values) or named object (3+)
- [ ] All dependency arrays are honest — no suppressions without documented reason
- [ ] Cleanup function provided for subscriptions, timers, and abort controllers
- [ ] Tested with `renderHook` + `act` for all state transitions
- [ ] No `useEffect` that could be replaced by derived state or event handler
