
# Ticketing Rules

## Required Fields

1. **ID** — Prefix-number: `BE-003`, `FE-007`, `ARCH-001`
2. **Title** — Action-oriented: "Implement session auth"
3. **Phase** — Phase 0, 1, 2, etc.
4. **Dependencies** — Ticket IDs that must complete first
5. **Acceptance Criteria** — Testable: "Given X, when Y, then Z"
6. **Out of Scope** — What this does NOT cover

## Prefixes

`ARCH-` architecture, `DEV-` tooling, `BE-` backend, `FE-` frontend, `BILL-` billing, `PRIV-` privacy, `QA-` testing, `AI-` AI features

## Organization

- `.claude/tickets/` by phase: `phase-0/`, `phase-1/`, etc.
- Research in `.claude/research/`
- No circular dependencies. No TBD in critical fields. No multi-feature tickets.
