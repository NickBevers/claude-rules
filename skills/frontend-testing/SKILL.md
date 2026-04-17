---
name: frontend-testing
description: Write component tests, integration tests, and E2E tests for React/Preact/Astro projects. Triggers on "test component", "write tests", "testing strategy", "test this", "add tests", "e2e test", "vitest setup".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Bash
---

# Frontend Testing — Components, Integration, E2E

Write tests that catch real bugs, not tests that mirror the implementation. Every test should break when behavior changes, not when code is refactored.

## Default Stack (if no test tools exist yet)

- Component tests: Vitest + Testing Library + happy-dom
- E2E: Playwright
- Accessibility: axe-core via `@axe-core/playwright` (E2E) or `vitest-axe` (component)

Read 2-3 existing test files to match project conventions before writing new tests.

## Step 1: What to Test

### Always Test
- User-visible behavior (what the user sees and interacts with)
- Form validation (valid input, invalid input, edge cases)
- Conditional rendering (loading, error, empty, populated states)
- User interactions (click, type, submit, keyboard navigation)
- Accessibility (axe-core scans on every component test)
- Critical user journeys (E2E: signup → dashboard → action → result)

### Never Over-Test
- Implementation details (internal state, private methods, hook internals)
- Third-party libraries (if Zod validates correctly, don't re-test Zod)
- Styling (CSS changes shouldn't break tests)
- Static content that rarely changes
- Simple pass-through components with no logic

## Step 2: Component Tests (Testing Library)

### Core Principle: Test Like a User

Query by what the user perceives, not by implementation:

```tsx
// Priority order (Testing Library docs):
// 1. getByRole — what screen reader users see
// 2. getByLabelText — form fields
// 3. getByPlaceholderText — only if no label
// 4. getByText — non-interactive content
// 5. getByTestId — LAST RESORT only

// GOOD
screen.getByRole('button', { name: 'Save changes' })
screen.getByLabelText('Email address')
screen.getByRole('heading', { name: 'Dashboard', level: 2 })
screen.getByRole('alert')

// BAD
screen.getByTestId('submit-btn')
container.querySelector('.btn-primary')
screen.getByText('Save changes')  // if it's a button, use getByRole
```

### Test Structure

```tsx
import { render, screen } from '@testing-library/react'  // or preact
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest'
import { UserCard } from './UserCard'

describe('UserCard', () => {
  test('displays user name and email', () => {
    render(<UserCard user={{ name: 'Ada', email: 'ada@example.com' }} />)

    expect(screen.getByRole('heading', { name: 'Ada' })).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })

  test('calls onSelect when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<UserCard user={testUser} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'Select Ada' }))

    expect(onSelect).toHaveBeenCalledWith(testUser.id)
  })

  test('shows loading skeleton while data is pending', () => {
    render(<UserCard user={null} loading />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
```

### Testing Async Components

```tsx
import { render, screen, waitFor } from '@testing-library/react'

test('loads and displays user data', async () => {
  render(<UserProfile id="123" />)

  expect(screen.getByRole('status')).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
  })
})
```

### Testing Forms

```tsx
test('shows validation errors on empty submit', async () => {
  const user = userEvent.setup()
  render(<ContactForm />)

  await user.click(screen.getByRole('button', { name: 'Send' }))

  expect(screen.getByRole('alert')).toHaveTextContent('Email is required')
  expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
})

test('submits valid form data', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()
  render(<ContactForm onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.type(screen.getByLabelText('Message'), 'Hello, world!')
  await user.click(screen.getByRole('button', { name: 'Send' }))

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'ada@example.com',
    message: 'Hello, world!',
  })
})
```

### Accessibility Testing in Components

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'  // or vitest-axe

expect.extend(toHaveNoViolations)

test('UserCard has no accessibility violations', async () => {
  const { container } = render(<UserCard user={testUser} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

Run axe on every component test. It catches missing labels, contrast issues, and ARIA misuse automatically.

## Step 3: Hook Tests

```tsx
import { renderHook, act } from '@testing-library/react'

test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter(0))

  act(() => result.current.increment())

  expect(result.current.count).toBe(1)
})

test('useDebounced updates after delay', async () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useDebouncedValue('hello', 300))

  expect(result.current).toBe('hello')

  // Rerender with new value
  const { rerender } = renderHook(
    ({ value }) => useDebouncedValue(value, 300),
    { initialProps: { value: 'hello' } }
  )

  rerender({ value: 'world' })
  expect(result.current).toBe('hello')  // not yet

  act(() => vi.advanceTimersByTime(300))
  expect(result.current).toBe('world')

  vi.useRealTimers()
})
```

## Step 4: E2E Tests (Playwright)

### Structure

```ts
import { test, expect } from '@playwright/test'

test.describe('Checkout flow', () => {
  test('completes purchase with valid card', async ({ page }) => {
    await page.goto('/products')
    await page.getByRole('button', { name: 'Add to cart' }).first().click()
    await page.getByRole('link', { name: 'Cart (1)' }).click()
    await page.getByRole('button', { name: 'Checkout' }).click()

    await page.getByLabel('Card number').fill('4242424242424242')
    await page.getByLabel('Expiry').fill('12/28')
    await page.getByLabel('CVC').fill('123')
    await page.getByRole('button', { name: 'Pay' }).click()

    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible()
  })
})
```

### E2E Accessibility Audit

```ts
import AxeBuilder from '@axe-core/playwright'

test('checkout page has no a11y violations', async ({ page }) => {
  await page.goto('/checkout')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```

### E2E Best Practices
- Use `getByRole`, `getByLabel`, `getByText` — same philosophy as Testing Library
- `data-testid` only when no accessible selector exists
- Test critical user journeys, not every page
- Use `test.describe` to group related flows
- Run in CI against a real (or seeded) environment

## Step 5: Test Data

**Factories over fixtures:**

```ts
function createUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    ...overrides,
  }
}

// Usage
const admin = createUser({ role: 'admin' })
const deleted = createUser({ deletedAt: new Date() })
```

Factories make tests self-documenting — the override shows exactly what matters for this test.

## Step 6: Mocking Strategy

**Mock at the boundary, not internally:**

```tsx
// GOOD: Mock the API layer
vi.mock('../api/users', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: '1', name: 'Ada' }),
}))

// BAD: Mock hooks or internal state
vi.mock('react', () => ({
  ...vi.importActual('react'),
  useState: vi.fn(),  // never do this
}))
```

- Mock: API calls, timers, `window.matchMedia`, `IntersectionObserver`
- Don't mock: React/Preact internals, your own hooks, your own components, Zod schemas

## Self-Check

- [ ] Tests query by role/label (not testid or CSS selectors)
- [ ] Every component test includes an axe-core accessibility scan
- [ ] User interactions use `userEvent` (not `fireEvent`)
- [ ] Async assertions use `waitFor` or `findBy*`
- [ ] No testing of implementation details (internal state, CSS classes)
- [ ] Test factories for data, not inline object literals
- [ ] Mocks are at the boundary (API, timers), not internal
- [ ] E2E covers critical journeys, not every feature
