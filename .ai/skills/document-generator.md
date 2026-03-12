---
name: document-generator
description: Generate professional documents — SOWs, contracts, briefs, handoff docs. Triggers on "generate document", "write SOW", "project brief", "handoff document", "statement of work", "contract template".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit
---

# Document Generator — Professional Templates

Generate structured business documents from project context. Template-driven with variable injection.

## Step 1: Determine Document Type

- **SOW**: Formal scope, deliverables, timelines, payment terms
- **Project Brief**: Internal summary of what we're building and why
- **Handoff Document**: Technical docs for client or maintenance team
- **Sprint Summary**: What was done, what's next, blockers
- **Change Request**: Scope change with timeline/budget impact
- **Meeting Notes**: Structured notes with action items and owners

## Step 2: Gather Variables

Read project context (CLAUDE.md, tickets, architecture decisions) automatically. Ask for: client/project name, dates/deadlines, people/roles, specific terms.

## Step 3: Generate by Type

**SOW**: Project Overview, Scope (itemized), Out of Scope, Timeline & Milestones, Deliverables & Acceptance Criteria, Client Responsibilities, Assumptions, Change Request Process, Payment Schedule, Terms.

**Project Brief**: Name/Client, Problem Statement, Objectives & Metrics, Target Users, Scope (in/out), Technical Approach, Key Decisions, Timeline, Risks, Team.

**Handoff Document**: Overview, Architecture, Tech Stack & Versions, Environment Setup, Deployment, Env Vars (names only), DB schema/migrations, API endpoints/auth, Known Issues, Monitoring, Contacts.

**Sprint Summary**: Goal, Completed (with tickets), In Progress (% + blockers), Deferred (with reasons), Decisions, Next Focus, Risks needing client input.

**Change Request**: Description, Justification, Scope/Timeline/Budget Impact, Alternatives, Recommendation, Approval status.

## Step 4: Present & Iterate

Show draft. Ask: "Anything to adjust before finalizing?"

## Rules

- Professional, clear, no filler. No emojis or icons.
- Dates in absolute format (2026-03-15), never relative
- Documents must be standalone — readable without additional context
- Include version number and date at the top
