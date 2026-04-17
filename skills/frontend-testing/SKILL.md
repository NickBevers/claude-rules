---
name: frontend-testing
description: Write component tests, integration tests, and E2E tests for React/Preact/Astro projects. Triggers on "test component", "write tests", "testing strategy", "test this", "add tests", "e2e test", "vitest setup".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# Frontend Testing

Tests should break when behavior changes, not when code is refactored.

**Default stack**: Vitest + Testing Library + happy-dom. E2E: Playwright. A11y: axe-core.

Read 2-3 existing tests to match conventions before writing new ones.

## What to Test / Skip

**Test**: User-visible behavior, form validation, conditional rendering, interactions, accessibility, critical journeys.
**Skip**: Implementation details, third-party library internals, styling, static content, pass-through components.

## Step 1: Component Tests

Query by what users perceive:
```tsx
// Priority: getByRole → getByLabelText → getByText → getByTestId (last resort)
screen.getByRole('button', { name: 'Save changes' })
screen.getByLabelText('Email address')
screen.getByRole('heading', { name: 'Dashboard', level: 2 })
```

```tsx
describe('UserCard', () => {
  test('displays user name and email', () => {
    render(<UserCard user={{ name: 'Ada', email: 'ada@example.com' }} />)
    expect(screen.getByRole('heading', { name: 'Ada' })).toBeInTheDocument()
  })

  test('calls onSelect when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<UserCard user={testUser} onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: 'Select Ada' }))
    expect(onSelect).toHaveBeenCalledWith(testUser.id)
  })
})
```

### Forms
```tsx
test('shows validation errors on empty submit', async () => {
  const user = userEvent.setup()
  render(<ContactForm />)
  await user.click(screen.getByRole('button', { name: 'Send' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Email is required')
  expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
})
```

### Accessibility
```tsx
test('has no a11y violations', async () => {
  const { container } = render(<UserCard user={testUser} />)
  expect(await axe(container)).toHaveNoViolations()
})
```

Run axe on every component test.

## Step 2: Hook Tests

```tsx
test('useToggle flips state', () => {
  const { result } = renderHook(() => useToggle(false))
  expect(result.current[0]).toBe(false)
  act(() => result.current[1]())
  expect(result.current[0]).toBe(true)
})
```

## Step 3: E2E (Playwright)

```ts
test('completes purchase', async ({ page }) => {
  await page.goto('/products')
  await page.getByRole('button', { name: 'Add to cart' }).first().click()
  await page.getByRole('link', { name: 'Cart (1)' }).click()
  await page.getByRole('button', { name: 'Checkout' }).click()
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible()
})

test('checkout has no a11y violations', async ({ page }) => {
  await page.goto('/checkout')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```

## Step 4: Test Data & Mocking

**Factories over fixtures:**
```ts
function createUser(overrides?: Partial<User>): User {
  return { id: crypto.randomUUID(), name: 'Ada', email: 'ada@example.com', ...overrides }
}
```

**Mock at boundary, not internally:**
```tsx
vi.mock('../api/users', () => ({ fetchUser: vi.fn().mockResolvedValue({ id: '1', name: 'Ada' }) }))
// Never mock: React/Preact internals, your hooks, Zod schemas
```

## Self-Check

- [ ] Queries by role/label, not testid or CSS
- [ ] axe-core scan on every component test
- [ ] `userEvent` not `fireEvent`
- [ ] Async: `waitFor` or `findBy*`
- [ ] No implementation detail testing
- [ ] Factories for test data
- [ ] Mocks at boundary only
