---
name: frontend-hooks
description: Write custom React/Preact hooks with correct dependency management and testing. Triggers on "custom hook", "write a hook", "extract hook", "useEffect help", "hook pattern".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Custom Hooks — React & Preact

**React**: `import { useState } from 'react'`
**Preact**: `import { useState } from 'preact/hooks'`

## When to Extract a Hook

**Yes**: Uses other hooks AND reused across components, or >15 lines of stateful logic.
**No**: Pure data transforms, one-off logic, state that should be a Signal/store.

## Structure

Name: `use[Domain][Action]` — `useCartItems`, `useMediaQuery`. Never generic `useData`.

Return: tuple for 2 values, named object for 3+.

## Dependency Arrays

1. Include every reactive value. The `exhaustive-deps` linter is right 95% of the time.
2. Stable callback refs for prop callbacks:
```tsx
function useInterval(callback: () => void, ms: number) {
  const saved = useRef(callback)
  useEffect(() => { saved.current = callback })
  useEffect(() => {
    const id = setInterval(() => saved.current(), ms)
    return () => clearInterval(id)
  }, [ms])
}
```
3. Never lie about deps. If you omit one to "prevent re-running," fix the design.
4. Object deps: destructure to primitives, `useMemo` upstream, or move inside effect.

## Common Patterns

### Fetch (with cleanup)
```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetch(url, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() })
      .then(setData)
      .catch(err => { if (err.name !== 'AbortError') setError(err) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [url])

  return { data, error, loading }
}
```

### Media Query
```tsx
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
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

## Anti-Patterns

- `useEffect` for derived state → compute during render
- `useEffect` to sync two state values → lift up or merge into `useReducer`
- Suppressing `exhaustive-deps` → fix the dep issue
- Timer without cleanup → every `setInterval`/`setTimeout` needs `return () => clear*`

## Self-Check

- [ ] `use[Domain][Action]` naming
- [ ] Tuple (2) or named object (3+) return
- [ ] Honest dependency arrays
- [ ] Cleanup for subscriptions, timers, abort controllers
- [ ] Tested with `renderHook` + `act`
