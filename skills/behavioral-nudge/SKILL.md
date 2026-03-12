---
name: behavioral-nudge
description: Apply behavioral psychology patterns to improve UX conversion and engagement. Triggers on "nudge", "conversion optimization", "behavioral design", "psychology", "persuasion patterns", "increase conversions", "user engagement".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit
---

# Behavioral Nudge Engine — Psychology-Driven UX

Apply evidence-based behavioral patterns to improve conversion, engagement, and user satisfaction. Ethical by default — enhance decision quality, never manipulate.

## Step 1: Identify Opportunity

Ask the user:
- What behavior are we trying to encourage? (signup, purchase, engagement, retention)
- Current conversion rate or pain point (if known)
- Target audience and their motivation level
- Existing flow to optimize (read the code)

## Step 2: Analyze Current Flow

Read the relevant pages/components and map:
- Decision points (where users choose to act or abandon)
- Friction points (where effort or confusion exists)
- Reward points (where users get value or feedback)
- Drop-off risk (where users are most likely to leave)

## Step 3: Apply Nudge Patterns

### Reducing Friction
- **Progressive disclosure**: Show only what's needed now. Hide advanced options behind "More options."
- **Smart defaults**: Pre-select the most common/recommended option.
- **One-thing-per-screen**: Mobile especially — one decision per step.
- **Pre-fill**: Use known data to reduce typing (location, email from auth).
- **Chunking**: Break long forms into 2-3 steps with progress indicator.

### Building Motivation
- **Social proof**: "1,234 people signed up this week" — use real numbers, not fake ones.
- **Loss aversion**: Frame as what they'll miss, not what they'll gain. "Don't lose your progress" > "Save your progress."
- **Anchoring**: Show the premium option first so the standard feels reasonable.
- **Reciprocity**: Give value before asking (free tool, useful content, preview).
- **Commitment cascade**: Start with a tiny ask, then escalate. (Email → profile → payment.)

### Triggering Action
- **Urgency (ethical)**: Real deadlines only. "Offer ends March 31" not "Only 2 left!"
- **Clear CTA hierarchy**: One primary action per screen. Secondary actions visually diminished.
- **Reduce choice paralysis**: Max 3-4 options. Recommend one. Comparison tables for more.
- **Exit intent**: Offer value on abandon (save progress, email reminder), not guilt.

### Rewarding Behavior
- **Immediate feedback**: Confirm actions instantly (checkmark animation, success state).
- **Progress indicators**: Show how far they've come, not how far to go.
- **Celebration moments**: Subtle animation on completion (confetti is cliché — use something unique).
- **Streak mechanics**: "You've been active 5 days" — only if genuinely valuable to user.

## Step 4: Implementation

For each recommended nudge:
- **Pattern**: Which behavioral principle
- **Where**: Specific file/component
- **Implementation**: Code changes (CSS/HTML/logic)
- **Measurement**: How to verify it works (metric to track)
- **Ethical check**: Does this help the user make a better decision?

## Step 5: Present to User

Show recommendations ranked by expected impact:
1. Quick wins (CSS/copy changes, high impact)
2. Medium effort (new component/state, moderate impact)
3. Requires research (A/B test needed to validate)

## Ethical Guardrails

- **Never**: Dark patterns, fake urgency, hidden costs, misleading copy, forced continuity
- **Never**: Shame-based design ("No thanks, I don't want to save money")
- **Never**: Fake social proof, fake scarcity, fake countdown timers
- **Always**: Make opt-out as easy as opt-in
- **Always**: Respect user's time and attention
- **Test**: "Would I feel manipulated if I noticed this pattern?" If yes, don't use it.

## Rules

- No emojis or icons unless user requests them
- Real data for social proof (or clearly mark as placeholder)
- Every nudge must pass the ethical check
- Cite the behavioral principle for each recommendation
