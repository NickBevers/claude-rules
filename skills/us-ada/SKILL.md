---
name: us-ada
description: US Americans with Disabilities Act — Title II (state/local gov, DOJ Apr 2024 rule → WCAG 2.1 AA) and Title III (private places of public accommodation, case law → WCAG 2.1 AA de facto). Triggers on "ADA", "ADA Title III", "ADA Title II", "US accessibility", "Unruh", "Domino's", "web accessibility lawsuit", "DOJ rule".
allowed-tools: Read, Glob, Grep, Edit
---

# US ADA — Titles II & III

Two federal regimes + a heavy state-law overlay:

1. **ADA Title II** — state and local government services. **DOJ final rule issued April 24, 2024** sets a binding technical standard: **WCAG 2.1 Level AA**. Compliance dates:
   - Public entities with ≥50,000 population: **24 April 2026**.
   - Public entities <50,000 population + special district governments: **26 April 2027**.
2. **ADA Title III** — private "places of public accommodation" (retail, hospitality, healthcare, education, finance). No DOJ technical standard, but **WCAG 2.1 AA is the de facto benchmark** courts use (Robles v. Domino's, Gil v. Winn-Dixie, etc.).
3. **State civil rights acts** layer on:
   - **California Unruh Civil Rights Act** — very active plaintiff bar. Minimum statutory damages $4,000 per violation.
   - **NY State / NYC Human Rights Law** — similarly aggressive.
   - **Colorado HB21-1110** — public entities WCAG 2.1 AA (deadline July 2024).

Always load `rules/accessibility.md` first. WCAG 2.2 AA satisfies all of the above with margin.

## What US-specific means

- **No formal statement requirement** at federal level (Title III) — but a published statement reduces litigation risk.
- **Mobile apps count**: DOJ Title II rule explicitly covers mobile apps + kiosks + digital content.
- **PDFs count**: DOJ rule requires conventional PDFs to meet WCAG AA; archived/non-essential PDFs have narrow exemptions.
- **Third-party content**: Title II exempts content created by third parties and *not* "posted due to action or inaction" by the public entity. Tight test.
- **Captions on live streams**: required under 508 + ADA (via CVAA for comms) — see `us-cvaa`.

## Litigation-hot patterns (fix these first)

Based on the top actually-litigated web-ADA failures in 2023–2026:

1. **Screen-reader blocked checkout** — icon-only cart buttons, un-labelled form fields.
2. **Keyboard-inaccessible menus** — hover-only mega-menus.
3. **Missing alt on product images** — sighted-only product discovery.
4. **Inaccessible PDFs** (menus, manuals, financial statements) — no text layer / no tags.
5. **Color-only error indicators** on checkout / login.
6. **Video content without captions** (autoplay homepage hero, product demos).
7. **Focus invisibility** — `outline: none` on brand styles.
8. **Modal focus traps + background keyboard escape** — users get stuck.
9. **CAPTCHA with no alternative** — visual-only puzzle blocks login.

## Success criteria overlay

All of WCAG 2.1 AA (Title II rule) + target 2.2 AA for margin. Additional US conventions:

- **Tab-to-focus order** respected — courts treat broken focus order as a blocker.
- **`aria-label` on all icon-only controls** — screen-reader testing is standard plaintiff evidence.
- **Accessible CAPTCHA**: use reCAPTCHA v3 (invisible) or audio+visual, *plus* a no-test alternative (magic link / passkey).
- **Autoplay** anything over 3 seconds → pause control (WCAG 1.4.2) — courts cite this often.
- **Hover-only tooltips** with key information → WCAG 1.4.13 + 2.1.1 — keyboard users miss it.

## DOJ Title II specifics

- Applies to **web content and mobile apps**: owned, used, or controlled by a public entity.
- Exemptions (narrow):
  - Archived content (published pre-rule, not used/maintained, not needed for current service).
  - Pre-existing conventional documents posted before the compliance date.
  - Third-party content (see above — narrow).
  - Course content in password-protected sections for specific students (until current use).
  - Social-media posts posted before the compliance date.
- **Conforming alternate version** NOT allowed as a primary means — must be accessible at the primary URL.

## California Unruh specifics

- Any ADA Title III violation = Unruh violation = statutory damages.
- Plaintiffs need only show they encountered the barrier with bona fide intent to access — very low bar.
- **Structured test-plaintiff lawsuits** target the same patterns repeatedly; automated scans (axe) pick up most of what's sued on. Run axe in CI.

## Detection

```bash
# Same checks as WCAG POUR skills
# Plus US-specific:

# PDFs linked but not tagged (flag for manual review)
rg -i 'href=.*\.pdf' -g 'src/**/*.{astro,tsx,jsx,html}'
# Captcha components
rg -i 'recaptcha|captcha|hcaptcha' -g 'src/**/*'
# Autoplay media > 3s
rg 'autoplay' -g 'src/**/*.{astro,tsx,jsx,html}'
```

## Fix Patterns

Most fixes = WCAG fixes from `eaa-perceivable`, `eaa-operable`, `eaa-understandable`, `eaa-robust`. ADA-specific additions:

**Icon-only cart button with proper labelling:**
```tsx
{/* a11y [ADA Title III / WCAG 4.1.2]: icon buttons need accessible names — top Title III claim */}
<button type="button" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}>
  <IconShoppingCart aria-hidden="true" />
  {count > 0 && <span className={styles.badge} aria-hidden="true">{count}</span>}
</button>
```

**CAPTCHA with no-test alternative:**
```tsx
{/* a11y [ADA / WCAG 3.3.8]: avoid cognitive test; passkey + email-link as alternatives */}
<button onClick={passkey}>Continue with a passkey</button>
<button onClick={magicLink}>Email me a sign-in link</button>
{/* reCAPTCHA v3 (invisible) still runs in background for bot signal */}
```

**Autoplay hero with pause:**
```astro
{/* a11y [ADA / WCAG 1.4.2 + 2.2.2]: pause control required if > 3s */}
<video id="hero" muted loop playsinline autoplay aria-describedby="hero-desc">
  <source src="/hero.mp4" type="video/mp4" />
</video>
<button type="button" onclick="document.getElementById('hero').paused
  ? document.getElementById('hero').play()
  : document.getElementById('hero').pause()">Pause video</button>
<p id="hero-desc" class="visually-hidden">Ambient product showcase video.</p>
```

**Accessible PDF replacement:**
```astro
{/* a11y [ADA DOJ Title II rule 2024 / WCAG 1.1.1]: HTML equivalent takes precedence over PDF */}
<a href="/menu">View menu (HTML)</a>
<a href="/menu.pdf" type="application/pdf">Download tagged PDF</a>
```

## Reporting

```
## ADA fixes
- src/components/CartButton.tsx:6 — ADA Title III / WCAG 4.1.2 — added aria-label with count
- src/pages/menu.astro — added HTML menu; kept tagged PDF as alternate (DOJ 2024 rule)
- src/components/Hero.astro:14 — WCAG 1.4.2 — pause control on autoplay video
- follow-up: confirm all linked PDFs are tagged (PDF/UA) — 12 untagged PDFs detected
```

Note any California / NY targeting risk separately if user is US-facing — Unruh damages stack per violation.
