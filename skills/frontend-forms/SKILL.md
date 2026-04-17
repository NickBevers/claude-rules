---
name: frontend-forms
description: Build accessible, validated forms in React, Preact, or Astro. Triggers on "build form", "form validation", "form component", "login form", "signup form", "contact form", "form handling".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Forms — Accessible, Validated, Production-Ready

Build forms that work correctly for all users. Forms are where accessibility, validation, and UX intersect — most UI bugs live here.

## Framework Defaults (if no form library exists)

- **React 19+**: Native form actions + `useActionState` + `useFormStatus`
- **React 18 / Preact**: `react-hook-form` for complex forms, native `onSubmit` for simple ones
- **Astro 5+**: Astro Actions for server-side handling, framework island for the form UI

## Step 1: Form Architecture

### Simple Form (no library)
```tsx
export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const result = schema.safeParse(Object.fromEntries(data))

    if (!result.success) {
      setErrors(flattenErrors(result.error))
      return
    }

    setErrors({})
    // submit result.data
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* fields */}
    </form>
  )
}
```

### React 19 Form Actions
```tsx
import { useActionState, useFormStatus } from 'react'

async function submitAction(prev: FormState, formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) return { errors: flattenErrors(result.error) }
  await sendToAPI(result.data)
  return { errors: {}, success: true }
}

export function ContactForm() {
  const [state, action] = useActionState(submitAction, { errors: {} })

  return (
    <form action={action}>
      <FormFields errors={state.errors} />
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending}>
    {pending ? 'Sending…' : 'Send'}
  </button>
}
```

### Astro 5+ Actions
```ts
// src/actions/index.ts
import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email(),
      message: z.string().min(10).max(1000),
    }),
    handler: async ({ email, message }) => {
      // server logic
      return { success: true }
    },
  }),
}
```

## Step 2: Validation

**Always validate both client AND server.** Client validation is UX; server validation is security.

### Schema Definition (Zod)
```ts
import { z } from 'zod'  // or 'astro/zod' in Astro projects

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Enter a valid email'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be under 1000 characters'),
})
```

### Validation Timing
- **On submit**: Always. This is the primary validation pass.
- **On blur**: For fields with complex rules (email format, password strength). Show error after user leaves the field, not while typing.
- **On input (live)**: Only for character counters or "available" checks. Never show error messages while user is mid-keystroke.
- **Clear error**: When user starts editing a field that has an error, clear that field's error.

### Error Flattening
```ts
function flattenErrors(error: z.ZodError): Record<string, string> {
  const flat: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (!flat[key]) flat[key] = issue.message
  }
  return flat
}
```

## Step 3: Accessibility — Non-Negotiable

Every form field must meet WCAG 2.2 AA. This is the exact pattern:

```tsx
<div>
  <label htmlFor="email">Email address</label>
  <input
    id="email"
    name="email"
    type="email"
    autoComplete="email"
    required
    aria-describedby={errors.email ? 'email-error' : undefined}
    aria-invalid={!!errors.email}
  />
  {errors.email && (
    <p id="email-error" role="alert">
      {errors.email}
    </p>
  )}
</div>
```

**Required attributes:**
- `<label>` with `htmlFor` pointing to input `id` (or wrap input in label)
- `aria-describedby` linking to error message element
- `aria-invalid="true"` when field has error
- `role="alert"` on error messages (announces to screen readers)
- `autoComplete` with correct value (`name`, `email`, `tel`, `street-address`, etc.)
- Visible focus styles (`focus-visible`)

**Form-level error summary** (for >3 fields):
```tsx
{Object.keys(errors).length > 0 && (
  <div role="alert" aria-label="Form errors">
    <p>Please fix the following errors:</p>
    <ul>
      {Object.entries(errors).map(([field, msg]) => (
        <li key={field}>
          <a href={`#${field}`}>{msg}</a>
        </li>
      ))}
    </ul>
  </div>
)}
```

Focus the error summary on submit failure so screen reader users hear it immediately.

## Step 4: UX Patterns

### Loading State
- Disable submit button and show "Sending…" (not a spinner alone — state must be textual)
- Don't disable the entire form — user should be able to review what they entered
- Use `aria-busy="true"` on the form during submission

### Success State
- Clear confirmation message with `role="status"`
- Either reset the form or redirect — don't leave the filled form visible
- If the form stays on page, focus the success message

### Error Recovery
- Scroll to first error field (or focus it)
- Preserve all entered data — never clear the form on error
- Error messages explain what's wrong AND how to fix it: "Email is required" → "Enter your email address"

### Multi-Step Forms
- Show progress (Step 2 of 4)
- Validate each step before advancing
- Allow going back without losing data
- Submit only on final step

## Step 5: Preact-Specific Considerations

When building forms in Preact:
- Use `onInput` not `onChange` for text inputs (matches native DOM)
- Use `class` not `className`
- `onSubmit` works the same as React
- For controlled inputs with Signals:

```tsx
import { signal } from '@preact/signals'

const email = signal('')

function EmailInput() {
  return <input
    type="email"
    value={email}
    onInput={(e) => { email.value = e.currentTarget.value }}
  />
}
```

## Step 6: Self-Check

- [ ] Every input has a visible `<label>` (or `aria-label`)
- [ ] Error messages linked via `aria-describedby`
- [ ] `aria-invalid` set on fields with errors
- [ ] Error messages use `role="alert"`
- [ ] `autoComplete` attribute on all identity/address fields
- [ ] Validation on submit (always) + on blur (complex fields)
- [ ] Server-side validation mirrors client-side
- [ ] Loading state disables submit + shows text status
- [ ] Error recovery preserves entered data
- [ ] Focus management: error summary or first error field focused on submit failure
- [ ] Tab order is logical (follows visual order)
- [ ] Works without JavaScript (Astro: progressive enhancement via Actions)
