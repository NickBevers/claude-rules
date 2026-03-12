
# Testing Rules

## Tools

- Backend: `bun:test`. Frontend: Vitest + `@testing-library/preact` + jsdom. E2E: Playwright.

## What to Test

- Business logic, data transformations, API handlers (happy + error)
- Auth/authz flows, input validation edge cases
- Critical user journeys (E2E)

## What NOT to Over-Test

- Framework boilerplate, simple CRUD, third-party internals, CSS

## Patterns

- Factories over fixtures — generate test data programmatically
- Real test database for integration (not mocks). Transaction-based isolation.
- Testing Library: query by role/label, not implementation details
- `data-testid` for E2E selectors. Keep E2E suite focused on high-value flows.
