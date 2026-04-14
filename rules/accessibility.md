---
paths:
  - "src/**/*.astro"
  - "src/**/*.tsx"
  - "src/**/*.jsx"
  - "src/**/*.html"
  - "src/**/*.css"
  - "src/**/*.module.css"
  - "src/pages/**/*"
  - "src/components/**/*"
  - "src/layouts/**/*"
---

# Accessibility Baseline — WCAG 2.2 AA

Shared rules loaded by every `a11y-*`, `eaa-*`, `uk-*`, `us-*` skill. This is the floor — individual jurisdiction skills layer on top.

## Minimum Standard

**WCAG 2.2 Level AA** applies by default across EAA, UK PSBAR, US ADA (DOJ 2024), and Section 508 (via WCAG 2.0 AA + strong AA expectations). Target AA, not A. Do not regress to WCAG 2.1 unless the user explicitly says so.

## Non-Negotiables

- Every interactive element has a visible `:focus-visible` style. Never `outline: none` without replacement.
- Every image has `alt` — meaningful or `alt=""` for decorative. No missing `alt`.
- Every form input has a programmatically associated `<label for>` or `aria-labelledby`.
- Semantic HTML first. ARIA only when HTML alone can't express the role.
- Color is never the sole means of conveying information.
- Contrast ratio: 4.5:1 body text, 3:1 large text (≥18pt or ≥14pt bold) and UI components.
- Target size: 24×24 CSS pixels minimum (WCAG 2.2 SC 2.5.8), 44×44 preferred.
- All functionality works via keyboard alone. No keyboard traps.
- `prefers-reduced-motion` respected on all non-essential animation.
- Page has one `<h1>`; heading order never skips (h2 → h4 is a bug).
- Page has a `lang` attribute on `<html>`.

## Legal Snapshot (2026-04)

| Jurisdiction | Law | Standard | Applies to |
|---|---|---|---|
| EU | European Accessibility Act (Directive 2019/882) | EN 301 549 → WCAG 2.1 AA minimum | Ecommerce, banking, transport, e-books, comms (private sector) — in force since 28 Jun 2025 |
| UK | Equality Act 2010 + PSBAR 2018 | WCAG 2.2 AA | Public sector + all goods/services to disabled people |
| US | ADA Title II (DOJ rule Apr 2024) | WCAG 2.1 AA | State/local gov — deadline Apr 2026 (large) / Apr 2027 (small) |
| US | ADA Title III | Case law → WCAG 2.1 AA de facto | Private businesses "places of public accommodation" |
| US | Section 508 | Revised 508 → WCAG 2.0 AA | US federal agencies + contractors |
| US | CVAA | FCC rules | Advanced comms, video programming |

## Fix & Comment Convention

When fixing an a11y violation, add a single-line comment next to the change citing the criterion:

```tsx
{/* a11y [WCAG 1.1.1 / EAA EN 301 549 §9.1.1.1]: decorative — empty alt prevents announcement */}
<img src="/flourish.svg" alt="" role="presentation" />
```

```ts
// a11y [WCAG 2.1.1]: Escape closes dialog via keyboard, not only click
onKeyDown={(e) => e.key === "Escape" && close()}
```

Format: `a11y [<CRITERION>]: <why, one line>`. Keep it one line. Reference the strongest criterion that applies — if EAA and WCAG both cite it, use WCAG shorthand plus the EAA reference if it's the reason we're fixing.

## Reporting Changes

After fixing, report in this shape (never silent fixes):

```
## A11y fixes applied
- <file>:<line> — <criterion> — <what changed and why>
```

Group by severity:
- **Blocker**: WCAG A failures, keyboard traps, missing labels/alt, focus hidden.
- **AA gap**: contrast, target size, reflow, autocomplete.
- **Polish**: AAA wins, UX nits.
