# Planning Rules

## Architecture Decisions

- Every significant technical choice gets a documented decision with:
  - **Decision ID** — Categorized (e.g., A1 for Architecture, B7 for Database, C12 for Security)
  - **Context** — What problem are we solving?
  - **Decision** — What did we choose?
  - **Rationale** — Why this over alternatives?
  - **Consequences** — What are the trade-offs?
  - **Status** — Proposed, Accepted, Deprecated
- Decisions are tracked in a central decisions log
- All decisions must be reflected in relevant tickets
- Categories: Architecture (A), Database (B), Auth/Security (C), API Design (D), Feasibility (E), Billing (F), Scope (G), Infrastructure (H)

## Phase Planning

- **Phase 0** — Architecture decisions, project setup, schema design, dev environment
- **Phase 1** — Core foundation: auth, CRUD, basic UI, billing integration
- **Phase 2** — Primary features: data sync, dashboards, alerts
- **Phase 3** — Polish: email system, advanced UI, QA, accessibility
- **Phase 4** — Expansion: additional integrations, team features, advanced analytics
- Each phase has a clear theme and boundary
- No phase starts until all blockers from the previous phase are resolved

## Research Process

1. **Identify the question** — What do we need to decide?
2. **Evaluate options** — At least 2-3 alternatives per decision
3. **Prototype if needed** — Spike for high-risk or unfamiliar technology
4. **Document the decision** — In the decisions log with full rationale
5. **Update affected tickets** — Reflect the decision in implementation tickets

## Feasibility Checks

- Verify API capabilities BEFORE designing features around them
- Check rate limits, authentication requirements, and data availability
- Document known limitations with mitigation strategies
- Never assume an API exists — verify with official documentation

## Schema Design Principles

- Design the full schema upfront, even if tables are populated in later phases
- Use TEXT over VARCHAR for unbounded data
- Hash-based indexes for long text uniqueness constraints
- Normalize by default — denormalize only with measured performance justification
- Separate tables per dimension/concern (don't overload a single table)
- Subscription/billing columns live on accounts, not users
- Ownership resolved through joins, never denormalized onto child entities

## Risk Assessment

For each phase, identify:
- **Blockers** — Must resolve before work can start
- **External dependencies** — Third-party approvals, API access, review timelines
- **Technical risks** — Unproven technology, compatibility issues, performance concerns
- **Scope risks** — Features that might expand beyond estimates

## Review Process

- After initial planning: conduct a comprehensive review for gaps, contradictions, and missing items
- Track all findings (issues, questions, missing items) in a structured document
- Categorize by severity: Critical (blocks progress), High (must fix soon), Medium (fix before launch), Low (nice to have)
- Re-review after major decision changes
