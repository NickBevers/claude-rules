---
name: astro-actions
description: Build type-safe Astro Actions for form handling, mutations, and server-side logic. Triggers on "astro action", "astro form", "defineAction", "server action astro", "form submission astro".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro Actions — Type-Safe Server Mutations

Type-safe server functions callable from forms and client code. Handles validation, serialization, errors automatically.

**Requires**: Astro 5+, `output: 'server'` or `'hybrid'` with SSR adapter.

## Step 1: Defining Actions

```ts
// src/actions/index.ts (required entry point)
import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro/zod'

export const server = {
  subscribe: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email('Please enter a valid email'),
    }),
    handler: async ({ email }) => {
      await addToNewsletter(email)
      return { subscribed: true }
    },
  }),

  updateProfile: defineAction({
    accept: 'json',  // default
    input: z.object({
      name: z.string().min(1).max(100),
      bio: z.string().max(500).optional(),
    }),
    handler: async ({ name, bio }, context) => {
      const user = await getUser(context.cookies.get('session')?.value)
      if (!user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'Not signed in' })
      await updateUser(user.id, { name, bio })
      return { updated: true }
    },
  }),
}
```

### Error Codes

`BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `TOO_MANY_REQUESTS` (429), `INTERNAL_SERVER_ERROR` (500)

## Step 2: Forms (Progressive Enhancement)

```astro
---
import { actions, getActionResult } from 'astro:actions'
const result = await getActionResult(actions.subscribe)
const inputErrors = result?.error?.fields
---
<form method="POST" action={actions.subscribe}>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required
    aria-invalid={!!inputErrors?.email}
    aria-describedby={inputErrors?.email ? 'email-error' : undefined} />
  {inputErrors?.email && (
    <p id="email-error" role="alert">{inputErrors.email.join(', ')}</p>
  )}
  {result?.data?.subscribed && <p role="status">Subscribed!</p>}
  <button type="submit">Subscribe</button>
</form>
```

## Step 3: Client-Side Calls (Islands)

```tsx
import { actions } from 'astro:actions'
import { signal } from '@preact/signals'

const loading = signal(false)
const error = signal<string | null>(null)

export function SubscribeForm() {
  async function handleSubmit(e: Event) {
    e.preventDefault()
    loading.value = true
    error.value = null
    const form = e.currentTarget as HTMLFormElement
    const { data, error: actionError } = await actions.subscribe(new FormData(form))
    if (actionError) error.value = actionError.message
    else form.reset()
    loading.value = false
  }

  return (
    <form onSubmit={handleSubmit}>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required />
      {error.value && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading.value}>
        {loading.value ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  )
}
```

### JSON calls
```tsx
const { data, error } = await actions.updateProfile({ name: 'Ada', bio: '...' })
if (error?.code === 'UNAUTHORIZED') window.location.href = '/login'
```

## Step 4: File Uploads

```ts
uploadAvatar: defineAction({
  accept: 'form',
  input: z.object({
    avatar: z.instanceof(File)
      .refine(f => f.size <= 5_000_000, 'Under 5MB')
      .refine(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type), 'JPEG/PNG/WebP only'),
  }),
  handler: async ({ avatar }, { cookies }) => { /* ... */ },
}),
```

Form: `<form method="POST" action={actions.uploadAvatar} enctype="multipart/form-data">`

## Step 5: Organizing Actions

```ts
export const server = {
  auth: { login: defineAction({...}), logout: defineAction({...}) },
  profile: { update: defineAction({...}), uploadAvatar: defineAction({...}) },
}
// Called as: actions.auth.login, actions.profile.update
```

## Step 6: Reusable Schemas

```ts
// src/schemas/user.ts
import { z } from 'astro/zod'

export const emailSchema = z.string().email('Enter a valid email')
export const passwordSchema = z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[0-9]/, 'Must contain number')

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords must match', path: ['confirmPassword'],
})
```

## Self-Check

- [ ] Actions in `src/actions/index.ts` with `export const server`
- [ ] SSR adapter configured
- [ ] Inputs validated with `astro/zod`
- [ ] `accept: 'form'` for HTML forms, `'json'` for client calls
- [ ] Auth checks in handler, not client-side guards
- [ ] `ActionError` with appropriate code
- [ ] Progressive enhancement: forms work without JS
- [ ] Field errors use `aria-invalid` + `aria-describedby`
