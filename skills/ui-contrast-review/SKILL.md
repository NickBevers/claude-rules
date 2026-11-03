---
name: ui-contrast-review
description: Review a running web UI for WCAG 2.2 AA color contrast using browser automation, screenshots, measured color pairs, and interaction-state coverage. Use for a full contrast audit, UI contrast review, or fixing contrast failures; covers text, controls, icons, focus indicators, themes, and responsive layouts.
---

# UI contrast review

Run the actual project in a browser and produce an evidence-backed review of all applicable contrast requirements in the requested scope. The minimum target is WCAG 2.2 AA. A clean automated text scan alone cannot establish that the UI passes.

This skill uses the portable Agent Skills format. Resolve supporting files relative to this `SKILL.md`; no particular agent, browser connector, operating system, or project framework is required. Use the available browser tools or the bundled Playwright runner.

## Establish scope and run the app

1. Read the repository's instructions and inspect its scripts, routes, existing browser tests, component stories, and theme configuration. Reuse the project's package manager, runtime, fixtures, and authentication setup. A review request authorizes investigation and review artifacts; change application code when the user requests fixes or asks to make contrast pass.
2. Reuse a healthy development server or start the documented command and wait for its actual ready URL. Check that the intended app rendered rather than an error page, login redirect, or loading shell. Keep ownership of any process you start so it can be stopped afterward without terminating unrelated servers.
3. Build a coverage inventory before scanning. Include every in-scope route/page template, distinct component variant, theme, responsive layout, and reachable state. Use real test data to expose empty, populated, validation, error, success, loading, selected, and expanded presentations. Exercise hover, keyboard focus, pressed/active, checked, and disabled states where present. Cover menus, dialogs, tooltips, toasts, tables, pagination, charts, and content below the fold.
4. Default to the whole project's UI when the user asks for a full review. Group repeated instances only when their rendering, styling, adjacent background, and state are equivalent; identify the represented occurrences and check exceptions. For a large app, work through the inventory in batches and report remaining coverage instead of quietly reducing it to the homepage.
5. Use the app's real light/dark/custom theme mechanism. Test each supported theme at desktop and mobile widths, plus layout breakpoints that change content or backgrounds. Browser color-scheme emulation alone does not activate every app's theme. Include supported browser engines when rendering differs materially. Do not invent unsupported themes or multiply identical combinations without benefit.

Navigate and interact with safe local/test fixtures. Do not submit purchases, send messages, delete records, or change production data to reveal a state. If a needed state requires unavailable access or data, continue other checks and record that gap explicitly.

## Collect browser evidence

Read [references/browser-review.md](references/browser-review.md) for the measurement procedure, coverage ledger, and report format. If using the bundled runner, also read [references/runner.md](references/runner.md).

- Run axe-core's `color-contrast` rule against each rendered state. Preserve `violations`, `incomplete`, `passes`, and `inapplicable` results. Use full-page scans by default; narrowed scans must have an explicit coverage reason. Do not exclude failing elements or disable rules to achieve a clean result.
- Wait for the intended UI state, loaded fonts, and relevant images before stable-state measurements. Scan deliberate loading states separately. Use keyboard navigation to verify actual `:focus-visible` behavior, and assert that dialogs, focus, hover, and selections really activated before recording them.
- Capture screenshots with the state still active, including viewport/context and detail crops for findings. Scroll through lazy content, exercise virtualized lists, and scan newly rendered content. A full-page screenshot does not render every virtualized or unopened state.
- Inspect the actual rendered foreground/background pairs and all required non-text indicators. Resolve automated `incomplete` results manually. Explicitly check placeholders, SVGs, pseudo-elements, canvas, image text, gradients, opacity, overlays, focus rings, and selected/validation indicators; automated text rules do not cover all of them.
- Keep raw measurements, selectors, source/token locations, state reproduction steps, and evidence paths. If browser execution is blocked, finish available source inspection and report the browser review as incomplete; do not substitute a source-only pass.

## Apply AA accurately

| Content | Minimum and interpretation |
| --- | --- |
| Normal text and images of text | 4.5:1 against the background actually behind the text. Includes muted/helper text, placeholders, labels, links, badges, tooltips, and error messages. |
| Large text | 3:1 at at least 24 CSS px regular, or at least 18 2/3 CSS px bold (14 pt). Check the rendered font and weight; a heading tag or semibold label alone does not establish large bold text. |
| Required non-text information | 3:1 against adjacent colors for visual information needed to identify controls, states, and meaningful graphical content. Identify the indicator that actually conveys the information before judging a border or fill. |
| Authored focus indicators | Apply non-text contrast to the required visible indicator in its actual surroundings; also verify keyboard focus is visible and not entirely hidden by authored content. |

Use the WCAG relative-luminance calculation for the AA decision. Compare unrounded ratios to the threshold: 4.499:1 fails 4.5:1. APCA may supplement analysis but does not replace WCAG 2.x ratios. The dependency-free [scripts/contrast.mjs](scripts/contrast.mjs) calculates exact ratios for supplied sRGB color pairs; it does not discover page colors or certify complex rendering.

Handle exemptions explicitly. Inactive/disabled controls, decorative content, and logotypes can be exempt from relevant contrast criteria; label the reason and optionally report usability concerns separately. Read-only content is not automatically disabled. Decorative borders and arbitrary surface pairs need not all contrast at 3:1. Unmodified browser controls have a non-text contrast exception. Do not hide actionable failures under these exceptions.

Evaluate each state against its adjacent colors; AA does not generally require 3:1 between a control's default color and its nonadjacent hover color. Do not mislabel the AAA focus-area and focused-versus-unfocused requirements of 2.4.13 as AA. Check color-only communication under 1.4.1 alongside contrast, especially links, errors, status, and charts; a numerical ratio does not always supply the missing meaning.

## Fix when authorized and verify

For requests to fix contrast or make it pass, continue through implementation and browser verification. Prefer the responsible semantic token or shared component and check every affected usage on its actual backgrounds, themes, and states. Preserve the design intent and choose a small practical margin above AA thresholds. Do not inflate text, disable controls, remove information, or add audit exclusions just to pass.

Rerun the failing states and affected shared-component/theme combinations after changes. Capture before/after colors, ratios, and screenshots. Use existing targeted checks when the change warrants them; do not install a new CI framework for a review unless requested. For review-only requests, provide concrete proposed replacements and verified candidate ratios without changing app code.

## Finish with an honest result

Deliver the report and evidence described in the browser reference. Use one of these conclusions:

- **Pass within reviewed scope:** every inventoried in-scope presentation was checked; all applicable measured pairs meet AA; automated uncertainties and manual checks are resolved; exemptions have reasons.
- **Fail:** at least one confirmed applicable contrast failure remains. Also disclose any unreviewed coverage.
- **Incomplete:** no confirmed failures remain, but access, rendering, measurements, or coverage is unresolved.

Never describe this contrast review as certification of full WCAG accessibility or legal compliance. State what was tested, what failed or changed, and any remaining gaps. Link the report and screenshots, and stop only processes started for the review.

## Standards and tooling references

- [W3C: Contrast (Minimum), 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [W3C: Non-text Contrast, 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [W3C: Use of Color, 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [W3C: Focus Visible, 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) and [Focus Not Obscured (Minimum), 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [W3C: Focus Appearance, 2.4.13 (AAA)](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [WCAG 2.2 normative definitions and luminance formula](https://www.w3.org/TR/WCAG22/)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
