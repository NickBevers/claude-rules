---
name: us-section-508
description: US Section 508 (Rehabilitation Act) — Revised 508 Standards (2018 refresh) for US federal agencies and contractors. WCAG 2.0 AA baseline + hardware/software/docs rules. Triggers on "Section 508", "508 compliance", "VPAT", "ACR", "federal accessibility", "ICT accessibility", "GSA Section 508".
allowed-tools: Read, Glob, Grep, Edit
---

# US Section 508 — Revised Standards

Section 508 of the Rehabilitation Act requires US federal agencies — and anyone selling ICT to them — to make electronic and information technology accessible. The **Revised 508 Standards** (US Access Board, effective 18 Jan 2018) harmonize with **WCAG 2.0 Level A + AA** and add hardware, software, and docs requirements.

Target WCAG 2.2 AA in practice (matches ADA Title II DOJ 2024 rule + future-proofs against 508 refresh).

Always load `rules/accessibility.md` first.

## Scope — when this skill applies

- The project is developed **by or for** a US federal agency.
- The project is **sold to** a federal agency (procurement / GSA Schedule).
- The project needs a **VPAT® / ACR** (Voluntary Product Accessibility Template → Accessibility Conformance Report) to bid on federal contracts.
- The project is built for an agency **contractor** (SAT programs, universities doing federal research, etc.).

If none of these apply, `us-ada` is the relevant US skill instead.

## What 508 requires beyond WCAG

- **E205 Electronic Content** — all public-facing + 9 categories of agency-official content meet WCAG 2.0 AA.
- **E207 Software** — platform accessibility services must be usable; user preferences honored (fonts, colors, focus, etc.).
- **E208 Support Documentation & Services** — manuals, help, training, customer service itself must be accessible.
- **503 Software** — a UA (user agent) specific: support AT via accessibility APIs, expose name/role/state, focus, keyboard, etc.
- **504 Authoring Tools** — authoring tools must support creating conforming content + prompt authors.
- **602 Support Documentation** — alternate formats available on request; accessibility features documented.
- **Chapter 7 — Hardware** (kiosks, phones, printers) if in scope.

## VPAT / ACR

If the user needs to ship a VPAT:

- Use the **latest VPAT template** from ITI (currently VPAT 2.5Rev): Section 508 edition.
- An ACR is the filled-in VPAT documenting your product's conformance.
- Report **per criterion** with status: Supports / Partially Supports / Does Not Support / Not Applicable.
- Each "Partial / Does Not" needs a remarks explanation.
- Date the ACR and refresh whenever the product's a11y posture changes materially.

## Success criteria overlay

- **WCAG 2.0 A + AA** (all SCs) — plus by convention ship WCAG 2.2 AA.
- **E204.1 Video** — closed captions on synchronized media (beyond WCAG, captions must be user-selectable on/off).
- **E205.3 Electronic documents** — agency-produced PDFs, PPTs, DOCX must be tagged / structured.
- **E207.2 WCAG conformance** — software built for agencies must meet WCAG as a UA-conformance target.
- **503.2 Privacy** — if the product offers privacy features (captions, AD, alternatives), they must have same privacy protections as normal features.
- **503.4 Caption controls / AD controls** — at least as easy to reach as the volume control.

## Federal stack notes

- **USWDS** (U.S. Web Design System) — if used, its components are 508-aligned. Check version (3.x+).
- **21st Century IDEA Act** — federal websites must be accessible, secure, consistent, searchable. Overlaps with 508.
- **Plain Writing Act 2010** — reading level guidance also required on federal sites.

## Common Problems (federal-specific)

- PDFs published to agency sites without tags (E205.3).
- Embedded video (YouTube) with auto-captions only — must be reviewed/corrected for 508.
- Dashboards built on unreleased charting libs with no ARIA (no roles, no keyboard nav).
- VPAT marked "Supports" wholesale without actual testing — both a compliance fail and a false cert risk.
- GSA form PDFs with flattened form fields — not fillable by AT.

## Detection

```bash
# USWDS detection
rg 'uswds|@uswds' package.json src/
# YouTube/Vimeo embeds (need caption review)
rg 'youtube\.com/embed|player\.vimeo' -g 'src/**/*'
# PDF / Office docs served
rg -i '\.(pdf|pptx?|docx?|xlsx?)' -g 'src/**/*' -g '!node_modules'
# Chart libraries without ARIA (common: chart.js, recharts older versions)
rg 'chart\.js|recharts|d3' package.json
```

## Fix Patterns

**User-selectable captions, meet 503.4 access parity:**
```tsx
{/* a11y [508 §503.4 / WCAG 1.2.2]: caption toggle no harder to reach than volume */}
<video controls aria-describedby="v-desc">
  <source src="/brief.mp4" type="video/mp4" />
  <track kind="captions" srclang="en" src="/brief.en.vtt" default />
</video>
```

**Accessible chart pattern:**
```tsx
{/* a11y [508 E207 / WCAG 1.1.1 + 1.3.1]: chart has text description + data table alternative */}
<figure>
  <figcaption id="chart-cap">Annual caseload, fiscal year 2020–2025</figcaption>
  <div role="img" aria-describedby="chart-cap chart-summary">
    {/* SVG chart */}
  </div>
  <p id="chart-summary">Caseload rose from 12,400 in FY20 to 18,900 in FY25, a 52% increase.</p>
  <details>
    <summary>View data as a table</summary>
    <table>{/* tabular data */}</table>
  </details>
</figure>
```

**Federal-style HTML-first doc serving:**
```astro
{/* a11y [508 E205.3 / DOJ Title II rule 2024]: HTML is primary; tagged PDF as alternate */}
<a href="/policies/x">Policy X (HTML)</a>
<a href="/policies/x.pdf" type="application/pdf">Download PDF (tagged)</a>
```

**VPAT-ready criterion comment in component:**
```tsx
/**
 * a11y [VPAT — WCAG 2.0 SC 2.1.1]: Supports. All interactions reachable via keyboard;
 * arrow keys navigate grid cells, Enter activates, Escape exits edit mode.
 */
export function DataGrid(/* … */) { /* … */ }
```

## Reporting

```
## Section 508 fixes
- src/components/Chart.tsx:14 — 508 E207 / WCAG 1.1.1 — added summary paragraph + data-table alternative
- src/components/Video.tsx:9 — 508 §503.4 — caption track default; controls exposed
- docs/508-acr.md — flagged: ACR last dated 2025-06; rerun after these fixes
- follow-up: retag 14 legacy PDFs in /public/forms before VPAT refresh
```

If the user needs a VPAT/ACR document scaffolded, prompt them — this skill can generate one on request but won't invent conformance claims without testing evidence.
