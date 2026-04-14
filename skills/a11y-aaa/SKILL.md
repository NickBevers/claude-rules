---
name: a11y-aaa
description: Opt-in WCAG 2.2 Level AAA uplift — additive to the default AA baseline across EAA, UK, US jurisdictions. Use when user wants to exceed AA on a page, section, or whole product. Triggers on "AAA", "WCAG AAA", "triple-A", "enhanced accessibility", "exceed AA", "maximum accessibility".
allowed-tools: Read, Glob, Grep, Edit
---

# A11y AAA — Enhanced Accessibility (opt-in)

**Default mode is AA.** AAA is only applied when the user explicitly asks — or when this skill is invoked by name. AAA is not universally achievable (WCAG itself says so) — apply per-component or per-page, not globally by default.

This skill is additive: run the relevant `eaa-*` AA skill first, then layer the AAA SCs below.

Always load `rules/accessibility.md` first.

## Why not default-on AAA

- WCAG 2.2 itself: "It is not recommended that Level AAA conformance be required as a general policy for entire sites."
- Content types have natural ceilings (sign-language video for all prerecorded audio — infeasible for most sites).
- AAA text contrast (7:1) constrains brand palettes severely.
- Some AAA SCs conflict with conversion optimization expectations — the user's call.

## When to apply AAA

- A single page or flow with a disability-first audience (medical info, emergency info, government benefit applications, accessible-travel booking).
- A product positioning as "accessibility-first".
- Legal exposure past baseline (e.g., UK government "critical" services, agency procurement explicit AAA requirement).
- Long-form reading experiences (docs, legal, education).

Ask the user for scope before sweeping: which page(s), which flow(s), whole product?

## AAA Success Criteria (added on top of AA)

### Perceivable
| SC | Name | What AAA asks |
|---|---|---|
| 1.2.6 | Sign language (prerecorded) | Sign-language interpretation for all prerecorded audio content. |
| 1.2.7 | Extended audio description | AD may pause video where dialogue is too dense for AA's gaps. |
| 1.2.8 | Media alternative (prerecorded) | Full text alternative for time-based media + video-only. |
| 1.2.9 | Audio-only (live) | Alt for live audio-only content (transcript / live captions). |
| 1.3.6 | Identify purpose | Purpose of components, icons, regions programmatically determinable (via ARIA landmarks + purpose tokens). |
| 1.4.6 | Contrast (enhanced) | 7:1 body, 4.5:1 large text. |
| 1.4.7 | Low / no background audio | Background audio ≤ 20 dB below foreground speech, or removable. |
| 1.4.8 | Visual presentation | Blocks of text: user-controlled fore/background colors, width ≤ 80 chars, no full-justify, 1.5 line height, paragraph spacing 1.5× line height, resize to 200% without horizontal scroll. |
| 1.4.9 | Images of text (no exception) | No images of text at all (except logos/essential). |

### Operable
| SC | Name | What AAA asks |
|---|---|---|
| 2.1.3 | Keyboard (no exception) | All functionality keyboard-operable without timing. |
| 2.2.3 | No timing | Timing is not essential anywhere (except real-time events). |
| 2.2.4 | Interruptions | User can postpone/suppress interruptions (notifications, auto-refresh). |
| 2.2.5 | Re-authenticating | After session expiry, data is preserved when user re-auths. |
| 2.2.6 | Timeouts | If data loss could occur, user is warned at start about timeout duration. |
| 2.3.2 | Three flashes (no exception) | No flashing above threshold at all. |
| 2.3.3 | Animation from interactions | User can disable motion from interactions (beyond prefers-reduced-motion, offer explicit toggle). |
| 2.4.8 | Location | User's location within the site (breadcrumbs, sitemap, you-are-here). |
| 2.4.9 | Link purpose (link only) | Every link's purpose determinable from link text alone — no context needed. |
| 2.4.10 | Section headings | Every section has a heading. |
| 2.4.12 (2.2) | Focus not obscured (enhanced) | Focused element entirely un-obscured (not just partially). |
| 2.4.13 (2.2) | Focus appearance | Focus indicator 2 CSS px minimum outline, 3:1 contrast, solid — stricter than AA. |
| 2.5.5 | Target size (enhanced) | 44×44 CSS px minimum. |
| 2.5.6 | Concurrent input mechanisms | Don't restrict to one input type (touch + mouse + keyboard all accepted). |

### Understandable
| SC | Name | What AAA asks |
|---|---|---|
| 3.1.3 | Unusual words | Mechanism for defining jargon / idioms. |
| 3.1.4 | Abbreviations | Expansion or definition available for abbreviations. |
| 3.1.5 | Reading level | Content readable at lower-secondary-education level, or alt provided. |
| 3.1.6 | Pronunciation | Pronunciation available for words whose meaning depends on pronunciation. |
| 3.2.5 | Change on request | Changes of context only on user request, or a mechanism to turn them off. |
| 3.3.5 | Help | Context-sensitive help available. |
| 3.3.6 | Error prevention (all) | Error prevention (reversible / checkable / confirmed) for *all* submissions, not just legal/financial. |
| 3.3.9 (2.2) | Accessible authentication (enhanced) | Auth has no cognitive test at all — no typed usernames/chars required anywhere in the flow. Passkeys + biometrics + magic links. |

### Robust
(AAA has no Robust-only SCs; follow AA `eaa-robust`.)

## Common Problems when aiming for AAA

- Brand palette fails 7:1 — team refuses to change. Common compromise: AAA-targeted theme (high-contrast mode) + default AA theme.
- AAA reading-level rule pushes copy into unrecognizable territory — deliver both a plain-language summary and the full text.
- "Mechanism for unusual words" added as tooltips only — fails AAA keyboard + discovery; use inline definitions + glossary page linked with `rel="glossary"`.

## Pitfalls

- Claiming AAA conformance requires meeting all A + AA + AAA SCs in scope. Partial AAA = AA + enhancements — describe it as such, don't label it AAA.
- AAA contrast (7:1) often makes placeholder and secondary text unreadable at normal sizes — enlarge before reducing contrast.
- Passkeys + magic-link satisfy AAA 3.3.9; any step that requires typing a username or matching a seed phrase kills the claim.
- AAA focus indicator 2.4.13 requires a **2-pixel solid outline with 3:1 contrast** and the indicator area at least 2 CSS px × perimeter. `outline: 2px solid` satisfies only if contrast is checked against *both* adjacent colors (the element and the background behind it).

## Detection

```bash
# Tooltips used as jargon explanation (likely insufficient for 3.1.3/3.1.4)
rg 'title=|tooltip' -g 'src/**/*' -l
# Hardcoded session timeouts
rg -i 'timeout|session.expires|TTL' -g 'src/**/*'
# Animations from interactions without explicit disable control
rg 'animate|transition' -g '*.css' -l
```

## Fix Patterns

**AAA contrast (7:1):**
```css
/* a11y [WCAG 1.4.6 AAA]: 7:1 body copy against surface. Verified with contrast checker. */
:root {
  --text: oklch(0.22 0.015 260);
  --surface: oklch(0.99 0.005 260);
}
body { color: var(--text); background: var(--surface); }
```

**AAA focus appearance (2.4.13):**
```css
/* a11y [WCAG 2.4.13 AAA]: 2px solid, 3:1 against both adjacent colors, fully visible */
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--surface); /* guarantees 3:1 against button bg */
}
```

**AAA target size (44×44):**
```css
/* a11y [WCAG 2.5.5 AAA]: 44×44 CSS px without visually enlarging the icon */
.icon-btn { min-block-size: 2.75rem; min-inline-size: 2.75rem; padding: 0.5rem; }
```

**AAA auth (no cognitive test anywhere):**
```tsx
{/* a11y [WCAG 3.3.9 AAA]: passkey-first, magic-link secondary, password/OTP removed entirely */}
<button onClick={passkey}>Sign in with passkey</button>
<button onClick={magicLink}>Email me a sign-in link</button>
```

**Inline term definition (not tooltip-only):**
```tsx
{/* a11y [WCAG 3.1.3 AAA]: inline definition + glossary fallback */}
<p>
  We apply <dfn><abbr title="European Accessibility Act">EAA</abbr></dfn> rules by default.
  See the <a href="/glossary" rel="glossary">glossary</a> for defined terms.
</p>
```

**User control to disable animation (beyond prefers-reduced-motion):**
```tsx
{/* a11y [WCAG 2.3.3 AAA]: explicit toggle, persists in localStorage, gates transform/opacity anims */}
<label>
  <input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.currentTarget.checked)} />
  Minimise animations on this site
</label>
```

## Reporting

When an AAA sweep is applied, be explicit about scope:

```
## AAA uplift — scope: /checkout flow
- src/pages/checkout/*.astro — WCAG 1.4.6 — body text now 7.3:1; secondary text re-tuned from 3.9:1 → 4.6:1 (AA) and excluded from AAA claim
- src/components/CheckoutAuth.tsx:12 — WCAG 3.3.9 — passkey + magic-link only
- src/components/CheckoutButton.tsx:4 — WCAG 2.5.5 — 48×48 targets
- not attempted: WCAG 1.2.6 (sign-language interpretation) — out of scope, noted in statement
```

If the user says "AAA everywhere" without scope, push back — it's rarely achievable and rarely the right investment. Recommend a per-flow scope and call that out in the accessibility statement's conformance claim ("AA across the site; AAA on checkout + account recovery").
