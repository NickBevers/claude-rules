---
name: astro-actions
description: Build type-safe Astro Actions for form handling, mutations, and server-side logic. Triggers on "astro action", "astro form", "defineAction", "server action astro", "form submission astro".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro Actions — Type-Safe Server Mutations

Astro Actions provide type-safe server-side functions callable from forms and client-side code. They handle validation, serialization, and error handling automatically.

## Requirements

- Astro 5+ (actions were experimental in 4.15, stable since 5)
- `output: 'server'` or `output: 'hybrid'` with an SSR adapter

## Step 1: Defining Actions

### Location

```
src/
  actions/
    index.ts         # Action definitions (required entry point)
```

### Basic Action

```ts
// src/actions/index.ts
import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'

export const server = {
  subscribe: defineAction({
    accept: 'form',           // Accepts FormData
    input: z.object({
      email: z.string().email('Please enter a valid email'),
    }),
    handler: async ({ email }) => {
      await addToNewsletter(email)
      return { subscribed: true }
    },
  }),

  updateProfile: defineAction({
    accept: 'json',           // Accepts JSON (default)
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

### Action with Context

The `handler` receives a second argument with the Astro request context:

```ts
handler: async (input, context) => {
  const { cookies, request, url, clientAddress } = context

  const session = cookies.get('session')?.value
  if (!session) {
    throw new ActionError({
      code: 'UNAUTHORIZED',
      message: 'You must be signed in',
    })
  }

  // ... logic
}
```

### Action Error Codes

```ts
import { ActionError } from 'astro:actions'

throw new ActionError({
  code: 'BAD_REQUEST',       // 400
  code: 'UNAUTHORIZED',      // 401
  code: 'FORBIDDEN',         // 403
  code: 'NOT_FOUND',         // 404
  code: 'CONFLICT',          // 409
  code: 'TOO_MANY_REQUESTS', // 429
  code: 'INTERNAL_SERVER_ERROR', // 500
  message: 'Human-readable error message',
})
```

## Step 2: Calling Actions from Forms

### Progressive Enhancement (HTML form, works without JS)

```astro
---
import { actions } from 'astro:actions'
---
<form method="POST" action={actions.subscribe}>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />
  <button type="submit">Subscribe</button>
</form>
```

### Handling the Result (after redirect)

```astro
---
import { actions, getActionResult } from 'astro:actions'

const result = await getActionResult(actions.subscribe)
const inputErrors = result?.error?.fields
---
<form method="POST" action={actions.subscribe}>
  <label for="email">Email</label>
  <input
    id="email"
    name="email"
    type="email"
    required
    aria-invalid={!!inputErrors?.email}
    aria-describedby={inputErrors?.email ? 'email-error' : undefined}
  />
  {inputErrors?.email && (
    <p id="email-error" role="alert">{inputErrors.email.join(', ')}</p>
  )}

  {result?.data?.subscribed && (
    <p role="status">Successfully subscribed!</p>
  )}

  <button type="submit">Subscribe</button>
</form>
```

## Step 3: Calling Actions from Client-Side Code

### In Preact Islands

```tsx
import { actions } from 'astro:actions'
import { signal } from '@preact/signals'

const loading = signal(false)
const error = signal<string | null>(null)
const success = signal(false)

export function SubscribeForm() {
  async function handleSubmit(e: Event) {
    e.preventDefault()
    loading.value = true
    error.value = null

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    const { data, error: actionError } = await actions.subscribe(formData)

    if (actionError) {
      error.value = actionError.message
    } else {
      success.value = true
      form.reset()
    }

    loading.value = false
  }

  return (
    <form onSubmit={handleSubmit}>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required />

      {error.value && <p role="alert" class="error">{error}</p>}
      {success.value && <p role="status">Subscribed!</p>}

      <button type="submit" disabled={loading.value}>
        {loading.value ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  )
}
```

### JSON Actions (from Islands)

```tsx
import { actions } from 'astro:actions'

async function updateProfile() {
  const { data, error } = await actions.updateProfile({
    name: 'Ada Lovelace',
    bio: 'Mathematician and writer',
  })

  if (error) {
    if (error.code === 'UNAUTHORIZED') {
      window.location.href = '/login'
      return
    }
    showError(error.message)
    return
  }

  showSuccess('Profile updated')
}
```

## Step 4: File Uploads

```ts
// src/actions/index.ts
export const server = {
  uploadAvatar: defineAction({
    accept: 'form',
    input: z.object({
      avatar: z.instanceof(File)
        .refine(f => f.size <= 5_000_000, 'File must be under 5MB')
        .refine(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type), 'Must be JPEG, PNG, or WebP'),
    }),
    handler: async ({ avatar }, { cookies }) => {
      const user = await getUser(cookies.get('session')?.value)
      if (!user) throw new ActionError({ code: 'UNAUTHORIZED' })

      const buffer = await avatar.arrayBuffer()
      const path = await saveFile(buffer, avatar.name)
      await updateUser(user.id, { avatarUrl: path })

      return { avatarUrl: path }
    },
  }),
}
```

```astro
<form method="POST" action={actions.uploadAvatar} enctype="multipart/form-data">
  <label for="avatar">Profile photo</label>
  <input id="avatar" name="avatar" type="file" accept="image/jpeg,image/png,image/webp" required />
  <button type="submit">Upload</button>
</form>
```

## Step 5: Organizing Actions

For larger projects, group related actions:

```ts
// src/actions/index.ts
import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'

export const server = {
  // Auth actions
  auth: {
    login: defineAction({ /* ... */ }),
    logout: defineAction({ /* ... */ }),
    register: defineAction({ /* ... */ }),
  },

  // Profile actions
  profile: {
    update: defineAction({ /* ... */ }),
    uploadAvatar: defineAction({ /* ... */ }),
    deleteAccount: defineAction({ /* ... */ }),
  },

  // Content actions
  blog: {
    create: defineAction({ /* ... */ }),
    publish: defineAction({ /* ... */ }),
  },
}
```

Called as: `actions.auth.login`, `actions.profile.update`, `actions.blog.create`.

## Step 6: Validation Patterns

### Reusable Schemas

```ts
// src/schemas/user.ts
import { z } from 'astro/zod'

export const emailSchema = z.string().email('Enter a valid email address')
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  data => data.password === data.confirmPassword,
  { message: 'Passwords must match', path: ['confirmPassword'] }
)
```

```ts
// src/actions/index.ts
import { loginSchema, registerSchema } from '../schemas/user'

export const server = {
  auth: {
    login: defineAction({
      accept: 'form',
      input: loginSchema,
      handler: async ({ email, password }) => { /* ... */ },
    }),
    register: defineAction({
      accept: 'form',
      input: registerSchema,
      handler: async ({ email, password }) => { /* ... */ },
    }),
  },
}
```

## Step 7: Error Handling in Forms

### Full Accessible Error Pattern

```astro
---
import { actions, getActionResult } from 'astro:actions'

const result = await getActionResult(actions.auth.register)
const fieldErrors = result?.error?.fields ?? {}
const formError = result?.error?.code === 'CONFLICT' ? 'An account with this email already exists.' : null
---
<form method="POST" action={actions.auth.register}>
  {formError && (
    <div role="alert" class="form-error">
      <p>{formError}</p>
    </div>
  )}

  <div>
    <label for="email">Email</label>
    <input
      id="email" name="email" type="email" autocomplete="email" required
      aria-invalid={!!fieldErrors.email}
      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
    />
    {fieldErrors.email && (
      <p id="email-error" role="alert">{fieldErrors.email.join(', ')}</p>
    )}
  </div>

  <div>
    <label for="password">Password</label>
    <input
      id="password" name="password" type="password" autocomplete="new-password" required
      aria-invalid={!!fieldErrors.password}
      aria-describedby={fieldErrors.password ? 'password-error' : undefined}
    />
    {fieldErrors.password && (
      <p id="password-error" role="alert">{fieldErrors.password.join(', ')}</p>
    )}
  </div>

  <button type="submit">Create account</button>
</form>
```

## Self-Check

- [ ] Actions defined in `src/actions/index.ts` with `export const server`
- [ ] SSR adapter configured and `output: 'hybrid'` or `'server'`
- [ ] All inputs validated with Zod schema (`astro/zod`)
- [ ] `accept: 'form'` for HTML form submissions, `'json'` for client-side calls
- [ ] Auth checks in handler (not relying on client-side guards)
- [ ] `ActionError` thrown with appropriate code for error responses
- [ ] Progressive enhancement: forms work without JS (`method="POST"` + `action={}`)
- [ ] Field errors displayed with `aria-invalid` + `aria-describedby`
- [ ] Error messages use `role="alert"` for screen reader announcement
- [ ] File uploads use `enctype="multipart/form-data"` and validate size/type
