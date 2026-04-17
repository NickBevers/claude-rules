---
name: frontend-react
description: Write production-grade React components with current API patterns. Triggers on "react component", "build in react", "react page", "react hook", "react context".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# React — Modern Component Authoring

Write React components using current, idiomatic patterns. Check the project's React version in `package.json` — patterns differ significantly between React 17, 18, and 19.

## Version-Specific APIs

| Feature | React 19+ | React 18 | React 17 |
|---|---|---|---|
| Read promises in render | `use()` | Not available | Not available |
| Form actions | `useActionState`, `useFormStatus` | Not available | Not available |
| Optimistic UI | `useOptimistic` | Not available | Not available |
| Ref forwarding | `ref` is a regular prop | `forwardRef` required | `forwardRef` required |
| Context provider | `<Context>` directly | `<Context.Provider>` | `<Context.Provider>` |
| Concurrent | Full | `useTransition`, `useDeferredValue` | Not available |
| Class components | Supported but discouraged | Common | Expected |

## Step 1: Gather Context

Before writing code, establish:
- Component purpose and where it sits (page, feature, shared)
- State requirements (local, shared, server)
- Data source (props, fetch, context, URL params)
- Existing patterns in the codebase — `Glob("**/components/**/*.tsx")` and read 2-3 existing components to match conventions

## Step 2: Component Architecture

### File Structure

Follow the project's existing structure. If none exists, use:
```
components/
  ComponentName/
    ComponentName.tsx          # component
    ComponentName.module.css   # styles (or .css if Tailwind)
    ComponentName.test.tsx     # tests
    index.ts                   # re-export (only if project uses barrel files)
```

### Component Patterns

**Function components only.** No class components unless the project uses them.

```tsx
// Named export, not default export (better refactoring, grep-friendly)
export function UserCard({ user, onSelect }: UserCardProps) {
  // ...
}
```

**Props**: Define an explicit `Props` type (or `ComponentNameProps` if exported). Use TypeScript discriminated unions for variant props, not boolean flags:

```tsx
// Good: discriminated union
type ButtonProps =
  | { variant: 'primary'; loading?: boolean }
  | { variant: 'ghost'; compact?: boolean }

// Bad: boolean soup
type ButtonProps = { primary?: boolean; ghost?: boolean; loading?: boolean; compact?: boolean }
```

**Children**: Use `PropsWithChildren` or explicit `children: ReactNode`. Never `children: any`.

### Hooks

- Extract custom hooks when logic is reused or complex (>15 lines of stateful logic)
- Name hooks `use[Domain][Action]`: `useCartItems`, `useFormValidation`
- Hooks return `[data, actions]` tuple or a named object — never a bare array of >2 items
- Never call hooks conditionally — if you need conditional logic, put it inside the hook

### State Management

**Local state** (`useState`, `useReducer`):
- `useReducer` when state transitions are complex or related values update together
- Never store derived state — compute it during render
- Never sync state between components with `useEffect` — lift state up or use context

**Shared state**: Follow the project's pattern (Context, Zustand, Jotai, Redux, Nanostores). If no library exists and shared state is needed, recommend Zustand for its simplicity, or Context for auth/theme-level globals.

**Server state**: If the project uses TanStack Query, SWR, or similar — use it. Don't mix fetch patterns.

### Effects

**`useEffect` is the last resort, not the first tool.**

- Fetching: use the project's data library (TanStack Query, SWR, useSWR) or React 19's `use()`. Raw `useEffect` + `fetch` only if no library exists.
- Derived values: compute during render, or `useMemo` if expensive
- Event responses: handle in event handlers, not effects
- Subscriptions: `useSyncExternalStore`
- Valid uses: DOM measurement, third-party library integration, cleanup timers

When you write a `useEffect`, state why it can't be done another way.

### React 19 Specific (when detected)

- `use()` for reading promises and context in render
- `useActionState` for form submission state (replaces `useFormState`)
- `useFormStatus` for pending states in form children
- `useOptimistic` for optimistic UI updates
- `ref` is a regular prop — no `forwardRef` needed
- `<Context>` renders directly as provider — no `<Context.Provider>`
- `<title>`, `<meta>`, `<link>` in component return hoist to `<head>`
- Server Components are the default in frameworks like Next.js 15+; add `'use client'` only when the component uses hooks, event handlers, or browser APIs

## Step 3: Performance Defaults

- `React.memo` only when profiling shows re-render cost — not preventatively
- `useMemo`/`useCallback` only when passing to memoized children or genuinely expensive computation (>1ms)
- Code-split routes with `React.lazy` + `Suspense`
- Images: explicit `width`/`height`, `loading="lazy"` below fold
- Lists: stable `key` from data ID, never array index (unless static and never reordered)

## Step 4: Error Handling

- Error Boundaries for component tree failures — at route level minimum
- Form validation: validate on submit, show inline errors, use `aria-describedby` to link error to input
- Async errors: handle in the data layer (TanStack Query `onError`, SWR `onError`), surface via UI state — never `catch` and `console.log` silently

## Step 5: Accessibility Baseline

Every component must meet WCAG 2.2 AA:
- Semantic HTML first (`<button>`, `<a>`, `<input>`, `<dialog>`, `<details>`)
- `aria-*` only when HTML semantics are insufficient
- Keyboard navigable: all interactive elements reachable via Tab, operable via Enter/Space
- `focus-visible` for keyboard focus styles
- Form inputs: visible `<label>` or `aria-label`, error messages linked via `aria-describedby`
- Live regions (`aria-live`) for dynamic content updates (toasts, loading states)

## Step 6: Self-Check

Before presenting code:
- [ ] Verified React version and API compatibility
- [ ] Matches existing project patterns (naming, file structure, state management)
- [ ] No unnecessary `useEffect` — each one has a clear reason
- [ ] No derived state stored in `useState`
- [ ] TypeScript types are precise (no `any`, no overly broad unions)
- [ ] Accessible (semantic HTML, keyboard, screen reader)
- [ ] Performance: no premature memoization, no missing keys, images sized
- [ ] Error states handled (loading, error, empty)
