---
name: qa-audit
description: Systematic quality audit across accessibility, performance, security, and UX. Triggers on "audit", "QA check", "quality check", "review quality", "accessibility audit", "performance audit".
allowed-tools: Agent, Read, Glob, Grep
---

# QA Audit — Evidence-Based Quality Assessment

Report-only. No auto-fixes. Evidence required for every finding.

## Audit Agents (parallel)

**Agent A — Accessibility**: Semantic HTML, alt text, keyboard navigation, focus styles, contrast, motion.
**Agent B — Performance**: Bundle size, images, hydration, CSS, fonts, Core Web Vitals.
**Agent C — Security** (when backend): Auth, input validation, headers, secrets, rate limiting.
**Agent D — UX Quality**: Component states, typography, layout, error messages, dark mode.

## Rules
- Every finding: file:line, evidence, impact, severity (Critical/Important/Suggestion).
- Default verdict: NEEDS WORK. PASS only with overwhelming evidence.
- Never suggest adding icons or decorative elements.
