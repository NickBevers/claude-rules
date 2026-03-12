---
paths:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/e2e/**"
  - "**/tests/**"
  - "**/test/**"
  - "**/vitest*"
  - "**/playwright*"
---

# Testing Rules

## Tools

- Backend: `bun:test`. Frontend: Vitest + `@testing-library/preact` + jsdom. E2E: Playwright.

## What to Test

- Business logic, data transformations, API handlers (happy + error)
- Auth/authz flows, input validation edge cases
- Critical user journeys (E2E)
- Accessibility: run axe-core checks in component tests

## What NOT to Over-Test

- Framework boilerplate, simple CRUD, third-party internals, CSS

## Patterns

- Factories over fixtures — generate test data programmatically
- Real test database for integration (not mocks). Transaction-based isolation.
- Testing Library: query by role/label, not implementation details
- `data-testid` for E2E selectors. Keep E2E suite focused on high-value flows.

## Accessibility Checklist (E2E)

- All images have alt text (decorative = `alt=""`)
- All interactive elements keyboard-reachable
- Color contrast meets WCAG AA (4.5:1 normal, 3:1 large)
- No focus traps. Logical tab order.
- Screen reader landmarks: `main`, `nav`, `header`, `footer`
