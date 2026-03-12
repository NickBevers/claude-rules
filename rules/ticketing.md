# Ticketing Rules

## Ticket Structure

Every ticket MUST include:

1. **ID** — Unique prefix-number identifier (e.g., BE-003, FE-007, SEO-002)
2. **Title** — Clear, action-oriented (e.g., "Implement session-based authentication")
3. **Phase** — Which phase this belongs to (Phase 0, 1, 2, etc.)
4. **Dependencies** — Explicit list of ticket IDs that must complete first
5. **Description** — What needs to be built and why
6. **Acceptance Criteria** — Specific, testable conditions for "done"
7. **Technical Notes** — Implementation hints, relevant decisions, constraints
8. **Out of Scope** — What this ticket explicitly does NOT cover

## Ticket Prefixes by Domain

- `ARCH-` — Architecture decisions and setup
- `DEV-` — Developer experience and tooling
- `BE-` — Backend implementation
- `FE-` — Frontend implementation
- `SEO-` — SEO-specific features and integrations
- `BILL-` — Billing and subscription
- `PRIV-` — Privacy and compliance
- `QA-` — Quality assurance and testing
- `AI-` — AI integration features

## Dependency Tracking

- Every ticket explicitly lists its dependencies by ID
- Circular dependencies are bugs — break them immediately when found
- A ticket cannot start until ALL its dependencies are complete
- Cross-phase dependencies are highlighted and tracked separately

## Acceptance Criteria Rules

- Written as testable statements ("Given X, when Y, then Z")
- Cover happy path AND error cases
- Include security considerations where applicable
- Frontend tickets include: responsive behavior, dark mode, loading/empty/error states

## Ticket Lifecycle

1. **Draft** — Written but not yet reviewed for completeness
2. **Ready** — Dependencies met, acceptance criteria clear, can be started
3. **In Progress** — Actively being worked on
4. **Review** — Code complete, awaiting review
5. **Done** — Merged, tested, acceptance criteria verified

## Organization

- Tickets stored in `.claude/tickets/` organized by phase subdirectories
- Phase directories: `phase-0/`, `phase-1/`, `phase-2/`, etc.
- One markdown file per ticket
- Research and architecture decisions in `.claude/research/`

## Anti-Patterns

- Never create a ticket without acceptance criteria
- Never start a ticket with unresolved dependencies
- Never put multiple unrelated features in one ticket
- Never leave "TBD" in critical fields — resolve it or create a blocker ticket
- Never delete deferred features — move them to a later phase
