# Project Management Rules

## Workflow

- Work in phases — complete foundational work before building features on top
- Each phase has clear entry/exit criteria and deliverables
- Identify blockers early — don't start work that depends on unresolved decisions
- Parallel work streams (frontend + backend) where dependencies allow

## Prioritization

- **Critical path first** — Identify the longest dependency chain and prioritize items on it
- **Blockers before features** — Architectural decisions and infrastructure before feature code
- **Security before polish** — Auth, encryption, and input validation before UI refinements
- **Launch-blocking before nice-to-have** — Maintain a clear "must have for launch" list

## Communication

- Status updates at natural milestones, not on a schedule
- Surface blockers immediately — don't wait for a standup
- When reporting progress: what's done, what's next, what's blocked
- Decisions need rationale documented — not just the "what" but the "why"

## Scope Management

- Scope changes are documented as explicit decisions with rationale
- Deferred features get their own tickets in a future phase — they don't disappear
- "Phase N" labels prevent scope creep — if it's not in this phase, it waits
- Single-user at launch is OK — defer team features until product-market fit is validated

## Risk Management

- Identify external dependencies early (API limitations, third-party approvals, review timelines)
- Time-sensitive items (e.g., Google OAuth verification: 6-week lead time) get flagged immediately
- Known API limitations are documented upfront — never discover them during implementation
- Have fallback strategies for third-party service outages

## Definition of Done

A feature is done when:
1. Code is written and passes linting/formatting
2. Tests are written and passing
3. Security considerations are addressed
4. It works in both light and dark mode (frontend)
5. It handles error and empty states
6. Documentation is updated if needed (API docs, env vars, etc.)
