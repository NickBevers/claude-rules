---
name: project-kickoff
description: Plan and structure a new project with phased execution. Triggers on "new project", "project kickoff", "start project", "plan project", "project planning", "kickoff".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Project Kickoff — Discovery to Execution

Structured project planning. Produces actionable tickets, architecture decisions, phased roadmap.

## Step 1: Discovery
- What are we building? Who is it for? Hard constraints?
- External APIs/services needed? Existing codebase or fresh?
- What does success look like?

## Step 2: Feasibility (parallel agents)
**Agent A — Technical**: Verify APIs, check Bun compat, identify risks, propose architecture.
**Agent B — Scope**: MVP vs nice-to-have, dependencies, complexity estimates.

## Step 3: Architecture Decisions (ADR format)
ID, Context, Decision, Rationale, Consequences, Status.

## Step 4: Phased Roadmap
Phase 0: Setup. Phase 1: Foundation. Phase 2: Core. Phase 3: Polish. Phase 4: Launch.

## Step 5: Generate Tickets
In `.claude/tickets/phase-{N}/` with proper prefixes and acceptance criteria.

## Step 6: Present Plan
Architecture overview, key decisions, roadmap, risks, first 5 tickets.
