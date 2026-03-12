# Testing Rules

## Test Strategy

- **Backend:** `bun:test` (native to Bun, no extra dependencies)
- **Frontend:** Vitest + `@testing-library/preact` + jsdom
- **E2E:** Playwright
- **Linting:** Oxlint (fast, Rust-based)
- **Formatting:** Prettier

## What to Test

### Must Test
- Business logic and data transformations
- API endpoint handlers (happy path + error cases)
- Authentication and authorization flows
- Input validation (boundary values, malformed input)
- Database queries with edge cases (empty results, duplicates, constraints)
- Critical user flows (E2E)

### Don't Over-Test
- Framework boilerplate (Hono routing, Astro page rendering)
- Simple CRUD with no business logic
- Third-party library internals
- CSS / visual styling (use visual regression tests only for critical components)

## Test Patterns

- **Arrange-Act-Assert** — Clear structure in every test
- **One assertion per concept** — Tests should fail for one reason
- **Descriptive names** — `test("returns 401 when session is expired")` not `test("auth test 3")`
- **No test interdependence** — Each test sets up and tears down its own state
- **Factories over fixtures** — Generate test data programmatically, don't rely on static JSON files

## Database Testing

- Use a real test database (not mocks) for integration tests
- Transaction-based isolation: wrap each test in a transaction, rollback after
- Seed minimal data per test — don't rely on shared seed data
- Test constraint violations (unique, foreign key, not null)

## API Testing

- Test the full request/response cycle through the Hono handler
- Verify status codes, response shapes, and error messages
- Test auth: unauthenticated, wrong role, expired session, revoked credentials
- Test rate limiting behavior
- Test pagination (first page, middle page, last page, empty results)

## Frontend Testing

- Use Testing Library queries that reflect how users interact (getByRole, getByLabelText)
- Don't test implementation details (internal state, private methods)
- Test user interactions: click, type, submit, navigate
- Test loading, error, and empty states
- Test keyboard accessibility for interactive components

## E2E Testing

- Cover critical user journeys (signup, login, core feature workflow, billing)
- Run against a real backend with a test database
- Keep E2E tests stable — avoid flaky selectors, use data-testid attributes
- E2E tests are slow — keep the suite focused on high-value flows

## Test Organization

- Colocate tests with source files: `auth.service.ts` + `auth.service.test.ts`
- E2E tests in a top-level `e2e/` or `tests/` directory
- Shared test utilities in `test/helpers/` or `test/factories/`

## CI Integration

- All tests run on every PR
- Linting and formatting checks run before tests
- Failed tests block merge
- Test output should clearly indicate what failed and why
