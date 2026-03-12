---
name: project-kickoff
description: Plan and structure a new project with phased execution. Triggers on "new project", "project kickoff", "start project", "plan project", "project planning", "kickoff".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Project Kickoff — Discovery to Execution

Structured project planning inspired by NEXUS methodology. Produces actionable tickets, architecture decisions, and a phased roadmap.

## Step 1: Discovery & User Research

Ask the user (skip what's already known):
- What are we building? (one-liner + expanded description)
- Who is it for? (target users, stakeholders)
- What are the hard constraints? (timeline, budget, tech, compliance)
- What external APIs/services are needed?
- Is there an existing codebase or starting fresh?
- What does success look like? (measurable outcomes)
- Budget range and decision-making process (who approves?)

### User Research Prompts (if user has direct client contact)
- "Who are the 3 types of people who will use this most?"
- "What are they doing today without this product? What's painful?"
- "What would make them tell a colleague about it?"
- "What competitor do they use now and what do they hate about it?"
- "Walk me through their typical day — where does this product fit?"

## Step 2: Feasibility Check

Spawn **two subagents in parallel**:

**Agent A — "Technical Feasibility"**:
- Verify all required APIs exist and check: auth method, rate limits, pricing, data freshness, known limitations
- Check Bun compatibility for all proposed dependencies
- Identify technical risks and unknowns
- Propose architecture: single container (Hono API + Astro frontend) or split?

**Agent B — "Scope & Prioritization"**:
- Break features into must-have (MVP) vs. nice-to-have
- Identify dependencies between features
- Estimate complexity per feature (S/M/L)
- Flag features that need research spikes

## Step 3: Architecture Decisions

Document decisions using ADR format:
- **ID**: A-001 (Architecture), B-001 (Database), C-001 (Security), etc.
- **Context** / **Decision** / **Rationale** / **Consequences** / **Status**

Key decisions to make:
- Data model (entities, relationships, ownership)
- Auth strategy (if applicable)
- Deployment target (Coolify/Docker Compose, Hetzner/other)
- Third-party integrations

## Step 4: Generate Phased Roadmap

**Phase 0 — Setup**: Project scaffold, CI/CD, database schema, architecture decisions
**Phase 1 — Foundation**: Auth (if needed), core CRUD, basic UI shell
**Phase 2 — Core Features**: Primary user journeys, integrations
**Phase 3 — Polish**: Error handling, loading states, accessibility, performance
**Phase 4 — Launch**: Final QA, deployment, monitoring

Each phase has:
- Acceptance criteria (testable)
- Dependencies on previous phases
- Quality gate: what must pass before advancing

## Step 5: Generate Tickets

Create tickets in `.claude/tickets/phase-{N}/`:
- Follow ticketing rules (ID, title, phase, dependencies, acceptance criteria, out of scope)
- Use prefixes: ARCH-, DEV-, BE-, FE-, BILL-, PRIV-, QA-, AI-
- No circular dependencies. No multi-feature tickets.

## Step 6: Present Plan to User

Output:
1. Architecture overview (1 paragraph)
2. Key decisions (table: ID, decision, rationale)
3. Phased roadmap (visual list)
4. Risk register (what could go wrong + mitigation)
5. First 5 tickets to start with

Ask: "Does this plan match your vision? Any phases to reorder or features to add/remove?"

## Step 7: Status Update Format (for ongoing use)

When user asks for a status update or sprint summary:
```
## Status Update — [Date]
**Phase**: [current] | **Health**: [On Track / At Risk / Blocked]

### Completed
- [ticket] [description]

### In Progress
- [ticket] [description] — [% / blocker]

### Next Up
- [ticket] [description]

### Needs Client Input
- [question or decision needed]
```

## Quality Gate

- [ ] All external APIs verified (not assumed)
- [ ] Architecture decisions documented
- [ ] Tickets have no TBD in critical fields
- [ ] No circular dependencies
- [ ] Phase 0 is immediately actionable
- [ ] Risks identified with mitigations
