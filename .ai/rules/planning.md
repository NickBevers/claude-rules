
# Planning Rules

## Architecture Decisions

Document each with:
- **ID** — Categorized: A (Architecture), B (Database), C (Security), D (API), E (Feasibility), F (Billing), G (Scope), H (Infrastructure)
- **Context** / **Decision** / **Rationale** / **Consequences** / **Status**
- Track in central decisions log. Reflect in relevant tickets.

## Phases

- Phase 0: Setup, decisions, schema. Phase 1: Foundation (auth, CRUD, basic UI).
- Phase 2: Core features. Phase 3: Polish, QA. Phase 4: Expansion.
- No phase starts until previous blockers resolved.

## Feasibility

- Verify API capabilities BEFORE designing features around them
- Document rate limits, auth requirements, known limitations
- Never assume an API exists — check official docs
