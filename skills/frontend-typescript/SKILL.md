---
name: frontend-typescript
description: Write precise TypeScript types for React, Preact, and Astro components. Triggers on "type this", "fix types", "typescript help", "generic component", "type-safe props", "discriminated union".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Frontend TypeScript — Precise Types for UI Code

Write TypeScript that makes illegal states unrepresentable. The type system should catch bugs at compile time, not runtime.

## tsconfig Expectations

- `strict: true` — if it's off, recommend enabling it
- `noUncheckedIndexedAccess: true` — catches `array[i]` returning `undefined`

## Step 1: Component Props

### Basic Pattern
```tsx
interface UserCardProps {
  user: User
  onSelect: (userId: string) => void
  variant?: 'compact' | 'expanded'
}

export function UserCard({ user, onSelect, variant = 'compact' }: UserCardProps) {
  // ...
}
```

### Discriminated Unions (for variant props)
```tsx
// Instead of boolean flags, use discriminated unions
type NotificationProps =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string; retry: () => void }
  | { type: 'loading'; progress?: number }

function Notification(props: NotificationProps) {
  switch (props.type) {
    case 'success': return <div class="success">{props.message}</div>
    case 'error': return <div class="error">{props.message} <button onClick={props.retry}>Retry</button></div>
    case 'loading': return <div class="loading">Loading{props.progress ? ` ${props.progress}%` : '…'}</div>
  }
}
```

TypeScript narrows the type in each branch — `props.retry` is only accessible in the `error` case.

### Extending Native Elements
```tsx
// React
import type { ComponentPropsWithoutRef } from 'react'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant: 'primary' | 'ghost'
  loading?: boolean
}

// Preact
import type { ComponentProps } from 'preact'

type ButtonProps = ComponentProps<'button'> & {
  variant: 'primary' | 'ghost'
}
```

This forwards all native button props (`onClick`, `disabled`, `type`, `aria-*`) without manually listing them.

### Polymorphic Components (render as different elements)
```tsx
type AsProps<T extends ElementType> = {
  as?: T
} & ComponentPropsWithoutRef<T>

function Box<T extends ElementType = 'div'>({ as, ...props }: AsProps<T>) {
  const Component = as ?? 'div'
  return <Component {...props} />
}

// Usage
<Box as="section" id="hero">content</Box>
<Box as="a" href="/about">link</Box>  // TypeScript knows href is valid
```

### Children Types
```tsx
// Accepts any renderable content
interface LayoutProps {
  children: ReactNode  // React
  children: ComponentChildren  // Preact
}

// Render prop pattern
interface DataListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
}
```

## Step 2: Generic Components

```tsx
interface SelectProps<T> {
  options: T[]
  value: T
  onChange: (value: T) => void
  getLabel: (option: T) => string
  getKey: (option: T) => string
}

function Select<T>({ options, value, onChange, getLabel, getKey }: SelectProps<T>) {
  return (
    <select
      value={getKey(value)}
      onChange={(e) => {
        const selected = options.find(o => getKey(o) === e.currentTarget.value)
        if (selected) onChange(selected)
      }}
    >
      {options.map(option => (
        <option key={getKey(option)} value={getKey(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  )
}

// Type is inferred from usage
<Select
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  getLabel={u => u.name}
  getKey={u => u.id}
/>
```

## Step 3: Event Types

### React
```tsx
function handleClick(e: React.MouseEvent<HTMLButtonElement>) { }
function handleChange(e: React.ChangeEvent<HTMLInputElement>) { }
function handleSubmit(e: React.FormEvent<HTMLFormElement>) { }
function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) { }
```

### Preact
```tsx
import type { JSX } from 'preact'

function handleInput(e: JSX.TargetedEvent<HTMLInputElement>) { }
function handleClick(e: JSX.TargetedMouseEvent<HTMLButtonElement>) { }
function handleSubmit(e: JSX.TargetedEvent<HTMLFormElement>) { }
```

### Inline handlers (let TypeScript infer)
```tsx
// Type is inferred — no annotation needed
<button onClick={(e) => { /* e is MouseEvent<HTMLButtonElement> */ }}>
```

Only annotate event types when extracting handlers to named functions.

## Step 4: API Response Types

### Zod-Inferred Types (recommended)
```tsx
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'viewer']),
  createdAt: z.coerce.date(),
})

type User = z.infer<typeof UserSchema>

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  const data = await res.json()
  return UserSchema.parse(data)
}
```

Zod validates at runtime AND generates types — single source of truth.

### Without Zod
```tsx
interface ApiResponse<T> {
  data: T
  meta: { page: number; total: number }
}

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  createdAt: string
}

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`)
  return res.json() as Promise<User>
}
```

## Step 5: Utility Types for UI

```tsx
// Make specific fields required
type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

// Extract component props
type ButtonProps = ComponentPropsWithoutRef<typeof Button>

// Restrict to specific keys
type Theme = 'light' | 'dark'
type ThemeColors = Record<Theme, { bg: string; fg: string }>

// Exhaustive switch helper
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`)
}

function getIcon(status: Status) {
  switch (status) {
    case 'success': return <IconCheck />
    case 'error': return <IconX />
    case 'loading': return <IconLoader />
    default: return assertNever(status)
  }
}
```

## Step 6: Anti-Patterns

- **`any`**: Never. Use `unknown` if the type is truly unknown, then narrow.
- **`as` assertions**: Avoid. If you need a cast, the type design is wrong. Exception: DOM queries (`document.querySelector('input') as HTMLInputElement`).
- **`!` non-null assertion**: Avoid. Handle the `null` case explicitly.
- **Overly complex generics**: If the type signature is harder to read than the implementation, simplify.
- **`interface` vs `type`**: Use `interface` for objects that might be extended, `type` for unions, intersections, and mapped types. Be consistent within the project.
- **Barrel file type re-exports**: Don't re-export types through index files — import from the source.

## Self-Check

- [ ] `strict: true` in tsconfig
- [ ] No `any` — use `unknown` and narrow instead
- [ ] No `as` assertions (except DOM queries)
- [ ] Discriminated unions for variant props (not boolean flags)
- [ ] Generic components infer types from usage
- [ ] API responses validated with Zod (runtime + type safety)
- [ ] Event types match the framework (React vs. Preact)
- [ ] `assertNever` in exhaustive switches
