---
name: proposal-writer
description: Write client proposals with scoping, pricing, and timelines. Triggers on "write proposal", "create proposal", "pitch", "project proposal", "quote", "estimate".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit
---

# Proposal Writer — Client Proposals & Scoping

Structured proposal creation using paired subagents for scope estimation.

## Step 1: Gather Context

Ask (skip what's known): client name/industry, project type (new build, redesign, feature, retainer), constraints (budget, deadline, tech), decision maker priorities, competitors/references, any RFP document.

## Step 2: Scope Estimation (parallel agents)

**Agent A — "Optimistic Scope"**: Minimum viable delivery. Fastest path to value, phased approach, defer nice-to-haves.

**Agent B — "Thorough Scope"**: Full delivery with quality. Buffer for unknowns, testing, revisions, deployment.

Both produce: feature breakdown (must/should/nice-to-have), phase structure with deliverables, time estimates, risk factors, client dependencies.

## Step 3: Pricing Strategy

Suggest approach based on scope:
- **Fixed price**: Well-defined scope. Include change request clause.
- **Time & materials**: Evolving scope. Set weekly/monthly caps.
- **Value-based**: High-impact projects. Price on outcome.
- **Retainer**: Ongoing work. Monthly hours with rollover.

Include: what's included, what's excluded, payment milestones.

## Step 4: Generate Proposal Document

Structure: Executive Summary, Understanding (restate their problem), Approach (phased plan), Timeline, Investment (pricing + payment schedule), Client Responsibilities, What's Not Included, Next Steps (clear CTA).

## Step 5: Present to User

Show draft. Ask about scope adjustments, pricing strategy fit, and exclusion completeness.

## Rules

- Professional but not corporate. Match the user's voice.
- Never undersell — include realistic timelines with buffer.
- Always define what's OUT of scope explicitly.
- No emojis or icons. Include revision rounds (typically 2 per phase).
