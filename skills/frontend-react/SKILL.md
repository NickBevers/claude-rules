---
name: frontend-react
description: Write production-grade React components with current API patterns. Triggers on "react component", "build in react", "react page", "react hook", "react context".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# React — Modern Component Authoring

Check React version in `package.json` — patterns differ between 17, 18, 19.

| Feature | React 19+ | React 18 | React 17 |
|---|---|---|---|
| Read promises | `use()` | N/A | N/A |
| Form actions | `useActionState`, `useFormStatus` | N/A | N/A |
| Ref forwarding | `ref` is regular prop | `forwardRef` | `forwardRef` |
| Context provider | `<Context>` directly | `<Context.Provider>` | `<Context.Provider>` |

## Step 1: Components

Named exports. Explicit `Props` type. Discriminated unions for variants, not boolean flags.

```tsx
export function UserCard({ user, onSelect }: UserCardProps) { ... }
```

Read 2-3 existing components to match project conventions.

## Step 2: State & Effects

**Local**: `useState`, `useReducer` (complex transitions). Never store derived state.
**Shared**: Follow project pattern (Context, Zustand, Jotai). Recommend Zustand if none exists.
**Server**: Use project's data library (TanStack Query, SWR).

**`useEffect` is last resort:**
- Fetching → data library or `use()`
- Derived values → compute during render
- Events → handle in event handlers
- Subscriptions → `useSyncExternalStore`
- Valid: DOM measurement, third-party lib init, cleanup timers

### React 19 Specific
- `use()` for promises/context in render
- `useActionState` for form state
- `ref` as regular prop
- `<Context>` as provider
- Metadata tags hoist to `<head>`
- Server Components default in Next.js 15+

## Step 3: Performance

- `React.memo` only when profiling shows cost
- `useMemo`/`useCallback` only for memoized children or expensive computation
- Code-split routes with `lazy` + `Suspense`
- Stable `key` from data ID, never array index

## Step 4: Error Handling

- Error Boundaries at route level minimum
- Form validation: inline errors with `aria-describedby`
- Async errors: handle in data layer, surface via UI

## Step 5: Accessibility

- Semantic HTML first (`<button>`, `<dialog>`, `<details>`)
- `aria-*` only when HTML semantics insufficient
- Keyboard navigable, `focus-visible` styles
- Form inputs: `<label>`, `aria-invalid`, `aria-describedby`
- `aria-live` for dynamic updates

## Self-Check

- [ ] Correct React version APIs
- [ ] Matches project patterns
- [ ] No unnecessary `useEffect`
- [ ] No derived state in `useState`
- [ ] No `any` types
- [ ] Accessible
- [ ] Error states handled
