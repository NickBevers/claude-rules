---
name: document-generator
description: Generate professional documents — SOWs, contracts, briefs, handoff docs. Triggers on "generate document", "write SOW", "project brief", "handoff document", "statement of work", "contract template".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit
---

# Document Generator — Professional Templates

Generate structured business documents from project context. Template-driven with variable injection.

## Step 1: Determine Document Type

Ask if not clear:
- **SOW (Statement of Work)**: Formal scope, deliverables, timelines, payment terms
- **Project Brief**: Internal document summarizing what we're building and why
- **Handoff Document**: Technical documentation for client or maintenance team
- **Sprint Summary**: What was done, what's next, blockers
- **Change Request**: Scope change with impact on timeline/budget
- **Meeting Notes**: Structured notes with action items and owners

## Step 2: Gather Variables

Read project context (CLAUDE.md, tickets, architecture decisions) automatically. Ask user for:
- Client/project name
- Relevant dates and deadlines
- People involved and their roles
- Any specific terms or conditions

## Step 3: Generate by Type

### SOW
```
1. Project Overview
2. Scope of Work (itemized deliverables)
3. Out of Scope (explicit exclusions)
4. Timeline & Milestones
5. Deliverables & Acceptance Criteria
6. Client Responsibilities
7. Assumptions
8. Change Request Process
9. Payment Schedule
10. Terms & Conditions
```

### Project Brief
```
1. Project Name & Client
2. Problem Statement
3. Objectives & Success Metrics
4. Target Users
5. Scope (in/out)
6. Technical Approach
7. Key Decisions Made
8. Timeline & Phases
9. Risks & Mitigations
10. Team & Responsibilities
```

### Handoff Document
```
1. Project Overview
2. Architecture (diagram description or reference)
3. Tech Stack & Versions
4. Environment Setup (step by step)
5. Deployment Process
6. Environment Variables (names only, not values)
7. Database: schema overview, migration process
8. API: endpoint summary, auth method
9. Known Issues / Technical Debt
10. Monitoring & Alerting
11. Contact for Questions
```

### Sprint Summary
```
1. Sprint Goal
2. Completed (with ticket references)
3. In Progress (with % and blockers)
4. Not Started (deferred and why)
5. Key Decisions Made
6. Next Sprint Focus
7. Risks / Blockers Needing Client Input
```

### Change Request
```
1. Requested Change (description)
2. Reason / Business Justification
3. Impact on Scope
4. Impact on Timeline (+N days/weeks)
5. Impact on Budget (+$X or included)
6. Alternatives Considered
7. Recommendation
8. Approval: [Pending / Approved / Rejected]
```

## Step 4: Present & Iterate

Show draft. Ask: "Anything to adjust before finalizing?"

## Rules

- Professional, clear, no filler
- No emojis or icons
- Dates in absolute format (2026-03-15), never relative ("next Thursday")
- All documents should be standalone — readable without additional context
- Include version number and date at the top
