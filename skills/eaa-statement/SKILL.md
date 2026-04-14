---
name: eaa-statement
description: EAA accessibility statement generator — mandatory disclosure for in-scope services under Directive 2019/882 + EN 301 549 statement template. Triggers on "accessibility statement", "EAA statement", "a11y statement", "publish accessibility", "compliance disclosure", "EN 301 549 statement".
allowed-tools: Read, Glob, Grep, Edit, Write
---

# EAA Accessibility Statement — Mandatory Disclosure

Under the EAA (Directive 2019/882) in-scope services must publish an accessibility statement. EN 301 549 + the EU model statement describe the contents. Under UK PSBAR and ADA Title II (DOJ 2024) similar statements are expected — we reuse one document with jurisdiction-aware language.

This skill produces and maintains `/src/pages/accessibility.astro` (or equivalent for the project stack).

## Required content (EAA / EN 301 549 §10.2.2 + EU model statement)

1. **Commitment statement** — that you aim to make the service accessible per the EAA, referencing the directive.
2. **Conformance claim** — one of:
   - "fully conformant with EN 301 549 v3.2.1" (= WCAG 2.1 AA minimum — AA of 2.2 recommended)
   - "partially conformant" (list non-conformances)
   - "non-conformant" (rare; list which parts + plan to fix)
3. **Inaccessible content** — specific sections/features that don't conform, per WCAG SC + reason (disproportionate burden, out of scope, third-party).
4. **Preparation of the statement** — date prepared, method (self-assessment / third-party audit + auditor name), date of last review. Review annually at minimum.
5. **Feedback mechanism** — an email or form for users to report accessibility issues. **Must receive a response within 30 days (UK PSBAR) / reasonable time (EAA)**.
6. **Enforcement procedure** — how users escalate if unsatisfied. Each EU member state has its own enforcement body; UK uses EHRC / Equality Advisory Service.
7. **Alternative formats** — offer to provide information in an accessible format on request (large print, easy-read, braille, audio).
8. **Scope** — which domains, subdomains, mobile apps, documents the statement covers.

## Jurisdiction add-ons

- **EAA**: state the enforcement body of the Member State where the service is provided.
- **UK PSBAR** (if public sector): cite "Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018" and link EHRC / ECNI.
- **US ADA Title II (DOJ 2024)**: include procedure to request auxiliary aids; link state ADA coordinator. Not strictly required but expected.
- **Section 508** (US federal): include Government-wide Section 508 Program and a link to the agency's 508 program office.

## Generation process

1. Ask the user:
   - What's the legal entity name and contact email?
   - Which jurisdictions apply? (EU member states, UK, US, all?)
   - Self-assessed or third-party audited? (get auditor details if so)
   - List known non-conformances (import from latest a11y audit if one exists).
   - Preparation date + next review date (default +12 months).
2. Read existing pages (if any) to detect the stack's page format.
3. Generate or update `/src/pages/accessibility.<ext>` and link it from the site footer.
4. Add a machine-readable hook: `<link rel="help" href="/accessibility" />` in the main layout `<head>`.

## Template (Astro)

```astro
---
// a11y [EAA Art. 13 / EN 301 549 §10.2.2 / UK PSBAR 2018 reg. 8]: mandatory statement
import Layout from "../layouts/Base.astro";

const preparedOn = "2026-04-14";
const lastReviewed = "2026-04-14";
const nextReview = "2027-04-14";
---
<Layout title="Accessibility statement — Stikr">
  <h1>Accessibility statement for stikr.example</h1>

  <p>This statement applies to the Stikr website at <code>stikr.example</code> and its
  mobile apps. It is published to meet our obligations under the European
  Accessibility Act (Directive 2019/882) and, for UK visitors, the Equality Act
  2010.</p>

  <h2>Conformance status</h2>
  <p>We target <strong>WCAG 2.2 Level AA</strong>, which also meets EN 301 549
  v3.2.1. The site is <strong>partially conformant</strong>: parts of the content
  do not yet meet the standard, as listed below.</p>

  <h2>Non-accessible content</h2>
  <ul>
    <li><strong>PDF receipts before 2026-04:</strong> older order receipts are
    not tagged PDFs (WCAG 1.1.1). We are re-issuing them on request — see below.</li>
    <li><strong>Third-party checkout iframe:</strong> step-up auth is provided
    by our payment processor; we have requested their roadmap (WCAG 2.1.1).</li>
    {/* …auto-populate from latest audit */}
  </ul>

  <h2>Preparation of this statement</h2>
  <p>This statement was prepared on <time datetime={preparedOn}>{preparedOn}</time>
  based on <strong>a self-assessment using axe-core + manual NVDA / VoiceOver
  testing</strong>. Last reviewed on <time datetime={lastReviewed}>{lastReviewed}</time>.
  Next review: <time datetime={nextReview}>{nextReview}</time>.</p>

  <h2>Feedback</h2>
  <p>If you find an accessibility problem on this site, or need information in an
  alternative format (large print, easy-read, audio, braille), please contact us:</p>
  <ul>
    <li>Email: <a href="mailto:accessibility@stikr.example">accessibility@stikr.example</a></li>
    <li>Phone: +XX XXX XXX XXX (Mon–Fri 09:00–17:00 CET)</li>
  </ul>
  <p>We aim to respond within 10 working days.</p>

  <h2>Enforcement</h2>
  <p>If you are not satisfied with our response:</p>
  <ul>
    <li><strong>EU residents</strong>: contact the accessibility enforcement body
    of your Member State (list and links at the
    <a href="https://ec.europa.eu/social/main.jsp?catId=1202">European
    Commission accessibility page</a>).</li>
    <li><strong>UK residents</strong>: contact the
    <a href="https://www.equalityadvisoryservice.com/">Equality Advisory and
    Support Service (EASS)</a>.</li>
  </ul>
</Layout>
```

## Link from footer

```astro
{/* a11y [EAA Art. 13]: statement must be easy to find — footer link on every page */}
<a href="/accessibility">Accessibility statement</a>
```

## Common Problems

- Statement buried 4 clicks deep — link it from the footer.
- Statement is a PDF (ironically inaccessible).
- Generic template from a vendor with placeholder text like "insert auditor name here".
- Out of date by > 1 year.
- No feedback email, or email bounces.
- Conformance claim says "fully" but axe reports 40 violations.

## Pitfalls

- Conservatively claim "partially conformant" unless you have a current third-party audit.
- Statement version must track the site — re-review after any large design/nav change, not just annually.
- Feedback inbox needs an owner. A blackhole inbox is worse than none.
- Under EAA, "disproportionate burden" is a narrow exemption — you must have assessed cost vs. benefit in writing. Don't wave it around casually.
- UK PSBAR model statement has a specific wording schema — use GOV.UK's template if the project is public-sector UK.

## Reporting

```
## Accessibility statement
- src/pages/accessibility.astro — created, linked from footer
- src/layouts/Base.astro:NN — added footer link + <link rel="help">
- Follow-ups for user:
  - confirm legal contact email + phone
  - schedule next review (default 2027-04-14)
  - decide: self-assessment only, or commission third-party audit
```
