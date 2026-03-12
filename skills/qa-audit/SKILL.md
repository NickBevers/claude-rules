---
name: qa-audit
description: Systematic quality audit across accessibility, performance, security, and UX. Triggers on "audit", "QA check", "quality check", "review quality", "accessibility audit", "performance audit".
allowed-tools: Agent, Read, Glob, Grep
---

# QA Audit — Evidence-Based Quality Assessment

Report-only audit. Identifies issues with evidence. Does NOT auto-fix — presents findings for user decision.

## Step 1: Determine Scope

Ask if not clear:
- Full project audit or specific area?
- Priority: accessibility, performance, security, UX, or all?

## Step 2: Spawn Audit Agents

Launch **parallel subagents** based on scope:

**Agent A — "Accessibility"**:
- Semantic HTML: proper headings (h1→h2→h3, no skips), landmarks, lists
- Images: all have meaningful `alt` (decorative = `alt=""`)
- Forms: labels linked to inputs, error messages in `aria-describedby`
- Keyboard: all interactive elements reachable, logical tab order, no traps
- Focus: `:focus-visible` styles on all interactive elements, never `outline: none`
- Color: WCAG AA contrast (4.5:1 normal, 3:1 large), not color-only indicators
- Motion: `prefers-reduced-motion` respected
- Screen reader: live regions for dynamic content, `aria-live="polite"` for updates

**Agent B — "Performance"**:
- Bundle: no barrel file imports, tree-shaking friendly, named imports only
- Images: explicit dimensions (no CLS), `loading="lazy"`, `decoding="async"`, responsive `srcset`
- Hydration: only interactive islands hydrated, static content pre-rendered
- CSS: no unused styles, no `@import` chains, custom properties over repeated values
- Fonts: `font-display: swap`, metric-override fallbacks, no FOUT/FOIT
- Core Web Vitals: LCP (largest paint), FID (interaction delay), CLS (layout shift)

**Agent C — "Security & Data"** (when backend exists):
- Auth: Argon2id, session cookies (HTTP-only/Secure/SameSite=Strict), token rotation
- Input: Zod validation on all API inputs, no raw SQL, parameterized queries
- Headers: X-Content-Type-Options, HSTS, CSP, X-Frame-Options
- Secrets: no hardcoded keys/tokens, `.env` in `.gitignore`
- Rate limiting: auth endpoints protected, global safety net

**Agent D — "UX & Design Quality"**:
- States: every component has hover, focus, active, disabled, loading, error, empty
- Typography: clear hierarchy, readable sizes, sufficient line-height
- Layout: works at mobile/tablet/desktop, no horizontal scroll
- Content: error messages explain what/why/how-to-fix, no "Error occurred"
- Dark mode: tested (not just inverted), readable contrast
- No auto-added icons/emojis — text-only unless user designed them in

## Step 3: Evidence Collection

Every finding MUST include:
- **File**: exact path and line number
- **Evidence**: what's wrong (code snippet or description)
- **Impact**: who is affected and how
- **Severity**: Critical / Important / Suggestion

No findings without evidence. No vague "could be improved."

## Step 4: Report

```
# QA Audit Report

## Critical Issues (N)
[Must fix — blocks production]

## Important Issues (N)
[Should fix — impacts quality]

## Suggestions (N)
[Nice to have — polish]

## Passing Areas
[What's already good — brief]

## Verdict: [PASS / PASS WITH CONDITIONS / NEEDS WORK]
```

Rules:
- Default verdict is NEEDS WORK. Only PASS with overwhelming evidence.
- Group findings by category (accessibility, performance, security, UX).
- Prioritize: critical → important → suggestion.
- Never suggest adding icons or decorative elements.
