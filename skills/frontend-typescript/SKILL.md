---
name: frontend-typescript
description: Write precise TypeScript types for React, Preact, and Astro components. Triggers on "type this", "fix types", "typescript help", "generic component", "type-safe props", "discriminated union".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Frontend TypeScript — Precise Types for UI

Make illegal states unrepresentable. Expect `strict: true` and `noUncheckedIndexedAccess: true`.

## Step 1: Component Props

### Discriminated Unions
```tsx
type NotificationProps =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string; retry: () => void }
  | { type: 'loading'; progress?: number }
```

### Extending Native Elements
```tsx
// React
type ButtonProps = ComponentPropsWithoutRef<'button'> & { variant: 'primary' | 'ghost' }
// Preact
type ButtonProps = ComponentProps<'button'> & { variant: 'primary' | 'ghost' }
```

### Polymorphic
```tsx
type AsProps<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>
function Box<T extends ElementType = 'div'>({ as, ...props }: AsProps<T>) {
  const Component = as ?? 'div'
  return <Component {...props} />
}
```

## Step 2: Generics

```tsx
interface SelectProps<T> {
  options: T[]
  value: T
  onChange: (value: T) => void
  getLabel: (option: T) => string
  getKey: (option: T) => string
}
function Select<T>({ options, value, onChange, getLabel, getKey }: SelectProps<T>) { /* ... */ }
```

## Step 3: Event Types

**React:** `React.MouseEvent<HTMLButtonElement>`, `React.ChangeEvent<HTMLInputElement>`, `React.FormEvent<HTMLFormElement>`

**Preact:**
```tsx
import type { JSX } from 'preact'
function handleInput(e: JSX.TargetedEvent<HTMLInputElement>) { }
```

Inline handlers infer types automatically — only annotate extracted named functions.

## Step 4: API Types with Zod

```tsx
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'viewer']),
})
type User = z.infer<typeof UserSchema>

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  return UserSchema.parse(await res.json())
}
```

## Step 5: Utility Patterns

```tsx
type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

function assertNever(x: never): never { throw new Error(`Unexpected: ${x}`) }

function getIcon(status: Status) {
  switch (status) {
    case 'success': return <IconCheck />
    case 'error': return <IconX />
    default: return assertNever(status)
  }
}
```

## Anti-Patterns

- **`any`**: Use `unknown` + narrow
- **`as` assertions**: Fix the type design. Exception: DOM queries
- **`!` non-null**: Handle null explicitly
- **Overly complex generics**: If type sig is harder to read than implementation, simplify

## Self-Check

- [ ] `strict: true` in tsconfig
- [ ] No `any`
- [ ] Discriminated unions for variant props
- [ ] Generics infer from usage
- [ ] API responses validated with Zod
- [ ] Event types match framework
- [ ] `assertNever` in exhaustive switches
