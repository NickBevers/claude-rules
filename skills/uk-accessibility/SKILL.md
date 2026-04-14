---
name: uk-accessibility
description: UK accessibility law — Equality Act 2010 + Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018 (PSBAR). WCAG 2.2 AA target. Triggers on "UK accessibility", "PSBAR", "Equality Act", "GOV.UK accessibility", "reasonable adjustments", "EHRC", "UK accessibility statement".
allowed-tools: Read, Glob, Grep, Edit
---

# UK Accessibility — Equality Act 2010 + PSBAR 2018

Two overlapping UK regimes:

1. **Equality Act 2010 (EqA)** — applies to *everyone* providing goods, facilities, or services to the public. Duty to make **reasonable adjustments** for disabled users. No fixed technical standard, but WCAG 2.2 AA is the defensible benchmark for web/mobile.
2. **Public Sector Bodies Accessibility Regulations 2018** (PSBAR) — applies to central + local government, NHS, police, universities, etc. Mandates **WCAG 2.2 AA** (updated from 2.1 AA on 1 Oct 2024) + an **accessibility statement**.

EU EAA no longer applies to UK services post-Brexit for private sector, but **EAA rules still bind UK businesses that trade into the EU**.

Always load `rules/accessibility.md` first.

## What UK-specific changes vs EAA

- **Target**: WCAG 2.2 AA (same as EAA now). UK moved to 2.2 on 2 Oct 2024.
- **Enforcement**: UK uses **EHRC** (Equality and Human Rights Commission) / EASS. Scotland: EHRC Scotland. N. Ireland: ECNI.
- **Statement model**: PSBAR prescribes a specific template (see GOV.UK "Sample accessibility statement"). Must be:
  - Published in a prominent place.
  - Reviewed at least annually.
  - Feedback response within **reasonable timeframe** (GOV.UK convention: 10 working days).
- **Reasonable adjustment duty (EqA s.20)**: anticipatory — you must consider disabled users *before* they ask, not only after a complaint.
- **Indirect discrimination (EqA s.19)**: a neutral rule that disadvantages disabled users without justification is unlawful.

## GOV.UK Design System

If the project uses GOV.UK patterns (or has public-sector scope):
- Use **GOV.UK Design System** components where possible — they're audited.
- Use **GOV.UK Frontend** 5.x+ (WCAG 2.2 AA).
- Follow **GOV.UK Service Manual** accessibility guidance.
- Crown Commercial Service / Digital Marketplace requires WCAG 2.2 AA on public-sector procurement.

## Success criteria (on top of POUR)

- **Readability**: plain English (Gunning fog ≤ 12 is GOV.UK target). This is a service-manual rule, not WCAG, but a common UK audit criterion.
- **Alternative formats**: must offer large print, easy-read, audio, braille within the feedback loop (EqA s.20 — reasonable adjustments).
- **Cookie banner**: ICO guidance says reject must be as easy as accept; don't obstruct main content.
- **Welsh-language** public services: parity for Welsh speakers (Welsh Language (Wales) Measure 2011) if in scope — not an a11y rule but a statutory requirement affecting the same templates.

## Common Problems (UK-specific)

- Using the old EHRC statement wording post-2024 — must reference WCAG 2.2.
- PSBAR statement that names a single owner with no fallback inbox.
- Making disabled users go through an "accessibility portal" instead of using the normal service — usually indirect discrimination under s.19.
- "We can make adjustments on request" — fine as a backstop, not as the primary strategy.
- Cookie banner sticky over focused form input (also WCAG 2.4.11).

## Pitfalls

- EqA covers non-web contexts too — copy/content-only changes (phone scripts, email templates) can matter.
- PSBAR exempts some third-party content you neither fund nor develop — but you must list it in the statement.
- "Disproportionate burden" is a narrow exemption under PSBAR reg. 7 — you must document the assessment.
- Live audio-only content (podcasts live-streamed) is exempt from PSBAR captions SC but only if published later with captions within 14 days.
- Pre-2020 PDFs on public-sector sites: partial exemption — but you must provide accessible alternative on request.

## Detection

```bash
# Old PSBAR references to 2.1
rg 'WCAG 2\.1' -g 'src/**/*.{astro,md,mdx,html}'
# Accept-all cookie flow without reject parity
rg -i 'accept.*cookies' -g 'src/**/*' -A5 | rg -i -c 'reject'
# GOV.UK stack detection
rg -l 'govuk-frontend|@govuk' package.json src/
```

## Fix Patterns

**Cookie banner reject parity:**
```tsx
{/* a11y [UK ICO guidance + WCAG 2.4.11]: reject must be equal-weight to accept */}
<div role="dialog" aria-labelledby="c-title">
  <h2 id="c-title">Cookies on Stikr</h2>
  <p>We use cookies for analytics and preferences.</p>
  <button type="button" onClick={acceptAll}>Accept all cookies</button>
  <button type="button" onClick={rejectAll}>Reject all cookies</button>
  <a href="/cookies">Manage cookies</a>
</div>
```

**GOV.UK-style error summary (top of page after submit):**
```astro
{/* a11y [UK GOV.UK pattern + WCAG 3.3.1]: error summary focuses user, lists all problems */}
<div
  class="govuk-error-summary"
  role="alert"
  tabindex="-1"
  aria-labelledby="err-sum-title"
>
  <h2 id="err-sum-title" class="govuk-error-summary__title">There is a problem</h2>
  <ul class="govuk-error-summary__list">
    {errors.map((e) => (
      <li><a href={`#${e.field}`}>{e.message}</a></li>
    ))}
  </ul>
</div>
```

**Anticipatory adjustment — offer alt format proactively:**
```astro
<p>
  <a href="/accessibility#alt-formats">
    Need this page in large print, easy-read, audio, or braille?
  </a>
</p>
```

**PSBAR statement link in footer (required in prominent place):**
```astro
{/* a11y [PSBAR 2018 reg. 8]: statement link on every page */}
<a href="/accessibility-statement">Accessibility statement</a>
```

## Reporting

```
## UK accessibility fixes
- src/components/CookieBanner.tsx:12 — UK ICO + WCAG 2.4.11 — added "Reject all" with equal weight
- src/pages/accessibility-statement.astro — updated to reference WCAG 2.2 AA (PSBAR 2024 update)
- src/layouts/Base.astro:33 — added footer link to accessibility statement (PSBAR reg. 8)
- follow-up: confirm alt-format response SLA (GOV.UK default = 10 working days)
```
