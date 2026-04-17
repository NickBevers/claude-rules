---
name: frontend-forms
description: Build accessible, validated forms in React, Preact, or Astro. Triggers on "build form", "form validation", "form component", "login form", "signup form", "contact form", "form handling".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Forms — Accessible, Validated, Production-Ready

## Framework Defaults

- **React 19+**: `useActionState` + `useFormStatus`
- **React 18 / Preact**: `react-hook-form` or native `onSubmit`
- **Astro 5+**: Astro Actions + framework island

## Step 1: Validation

**Always validate client AND server.** Client = UX, server = security.

```ts
import { z } from 'zod'  // or 'astro/zod'
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Enter a valid email'),
  message: z.string().min(10).max(1000),
})
```

**Timing**: On submit (always), on blur (complex fields), on input (only counters/availability checks). Clear error when user edits field.

## Step 2: Accessibility — Non-Negotiable

```tsx
<div>
  <label htmlFor="email">Email address</label>
  <input id="email" name="email" type="email" autoComplete="email" required
    aria-describedby={errors.email ? 'email-error' : undefined}
    aria-invalid={!!errors.email} />
  {errors.email && <p id="email-error" role="alert">{errors.email}</p>}
</div>
```

Required: `<label>` with `htmlFor`, `aria-describedby` → error, `aria-invalid`, `role="alert"` on errors, `autoComplete`, visible focus.

Form-level error summary (>3 fields): links to each errored field, focused on submit failure.

## Step 3: React 19 Form Actions

```tsx
async function submitAction(prev: FormState, formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) return { errors: flattenErrors(result.error) }
  await sendToAPI(result.data)
  return { errors: {}, success: true }
}

export function Form() {
  const [state, action] = useActionState(submitAction, { errors: {} })
  return <form action={action}>...</form>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? 'Sending…' : 'Send'}</button>
}
```

## Step 4: UX Patterns

- **Loading**: Disable submit, show text status ("Sending…"), `aria-busy="true"`
- **Success**: Clear message with `role="status"`, reset or redirect
- **Error**: Scroll/focus first error, preserve all entered data, explain how to fix

## Preact Specifics

- `onInput` not `onChange` for text inputs
- `class` not `className`
- Controlled with Signals:
```tsx
const email = signal('')
<input type="email" value={email} onInput={e => { email.value = e.currentTarget.value }} />
```

## Self-Check

- [ ] Every input has `<label>` (or `aria-label`)
- [ ] Errors linked via `aria-describedby`
- [ ] `aria-invalid` on errored fields
- [ ] `role="alert"` on error messages
- [ ] `autoComplete` on identity fields
- [ ] Server validation mirrors client
- [ ] Error recovery preserves data
- [ ] Focus management on submit failure
