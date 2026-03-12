---
name: proposal-writer
description: Write client proposals with scoping, pricing, and timelines. Triggers on "write proposal", "create proposal", "pitch", "project proposal", "quote", "estimate".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit
---

# Proposal Writer — Client Proposals & Scoping

Structured proposal creation using paired subagents for scope estimation. Output is a polished, persuasive document.

## Step 1: Gather Context

Ask the user (skip what's already known):
- Client name and industry
- What they need (new build, redesign, feature, ongoing retainer)
- Known constraints (budget range, deadline, tech requirements)
- Decision maker(s) and their priorities (speed, quality, cost)
- Competitors or reference sites they mentioned
- Any RFP or brief document to review

## Step 2: Scope Estimation (parallel agents)

**Agent A — "Optimistic Scope"**: Minimum viable delivery. What can be cut? What's the fastest path to value? Lean timeline, phased approach, deferring nice-to-haves.

**Agent B — "Thorough Scope"**: Full delivery with quality. What's actually needed? Buffer for unknowns, testing, revisions, deployment. Realistic timeline with contingency.

Both MUST produce:
- Feature breakdown (must-have / should-have / nice-to-have)
- Phase structure with deliverables per phase
- Time estimate per phase (days/weeks)
- Risk factors and assumptions
- Dependencies on client (content, access, feedback turnaround)

## Step 3: Pricing Strategy

Based on scope, suggest pricing approach:
- **Fixed price**: Best for well-defined scope. Include change request clause.
- **Time & materials**: Best for evolving scope. Set weekly/monthly caps.
- **Value-based**: Best for high-impact projects. Price on outcome, not hours.
- **Retainer**: Best for ongoing work. Monthly hours with rollover policy.

Include: what's included, what's explicitly excluded, payment milestones.

## Step 4: Generate Proposal Document

Structure:
```
1. Executive Summary (2-3 sentences — the "why us" hook)
2. Understanding (restate their problem to show you listened)
3. Approach (phased plan with deliverables)
4. Timeline (visual or table)
5. Investment (pricing with payment schedule)
6. What We Need From You (client responsibilities)
7. What's Not Included (scope boundaries)
8. Next Steps (clear CTA)
```

## Step 5: Present to User

Show draft. Ask:
- "Is the scope right or should we adjust phases?"
- "Does the pricing strategy match the client relationship?"
- "Anything to add/remove from exclusions?"

## Rules

- Professional but not corporate. Match the user's voice.
- Never undersell — include realistic timelines with buffer.
- Always define what's OUT of scope explicitly.
- No emojis or icons in the document.
- Include revision rounds (typically 2 per phase).
