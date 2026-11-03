# Browser measurement and reporting

## Coverage ledger

Maintain a ledger in the audit output directory. Add rows as exploration reveals new UI. Each row identifies route/template, component variant, data/role, theme, browser/viewport, state, reproduction steps, evidence, and status (`pending`, `pass`, `fail`, `exempt`, or `blocked`). Record the reason for any grouping, exclusion, or exemption. An untested row never counts as passing.

Cover supported combinations that can change rendering. At minimum investigate navigation, page headings/body/help text, buttons and links, form values/placeholders/errors, menus/selects, dialogs/drawers, tooltips/toasts, tables and badges, icon controls, charts, and meaningful graphics. Inventory dynamic/transient states, responsive replacements, nested scroll regions, and shared components on different surfaces. Component stories help expose variants but do not replace checks in the actual application.

Use normal application interactions and assertions. Moving focus by script may not reproduce keyboard focus-visible styling; use Tab/Shift+Tab and the widget's keyboard controls. Capture mouse-down active states before releasing, where relevant and safe. Check browser autofill/visited presentations when supported and relevant; visited styling has privacy restrictions, so computed style may not expose the actual visited color. Record what could be observed without bypassing those restrictions.

## Measure the actual colors

1. Inspect the rendered element, ancestors, pseudo-elements, and any overlapping layer. Record foreground color, effective background, font size/weight, relevant fill/stroke/border/outline, and opacity. Computed CSS is evidence about individual layers, not proof of the final composite.
2. Resolve backgrounds all the way to a known opaque surface. Include background images, gradients, scrims, overlays, semi-transparent fills, parent opacity, filters, blending, and stacking order. Do not assume transparent means white. Parent/group opacity can composite a subtree differently from assigning opacity only to its text.
3. For a solid sRGB pair, use `scripts/contrast.mjs` or another verified WCAG calculator. It accepts hex colors or numeric RGB(A) arrays; it intentionally rejects unresolved CSS functions. For `oklch()`, `color(display-p3 ...)`, and other spaces, use browser/color-management tooling to resolve the rendered colors into the measurement color space, documenting conversion or gamut uncertainty. Never reinterpret non-sRGB channels as sRGB.
4. For gradients, photographs, video, textured backgrounds, and overlays, measure the lowest contrast behind the actual text or essential graphic over relevant locations/frames. Do not average the whole background. Use full interior glyph/fill colors rather than antialiased edge pixels for normative color comparison; thin strokes may still merit a usability note.
5. If screenshot sampling is needed, preserve the original screenshot and record sample coordinates/regions, scale, and method. A temporary diagnostic rendering that hides only the foreground can expose the background, but preserve layout, restore styling, and confirm the diagnostic matches the original composition. Screenshot eyeballing is not a measured ratio.
6. For icons, focus indicators, borders, and graphics, establish which shape conveys the required information, then measure it against the relevant adjacent colors. Check different surrounding surfaces. Do not invent a requirement that every shade or decorative border passes.
7. Record unresolved complex backgrounds, inaccessible frames/shadow roots, or missing state evidence as manual review needed. Do not turn an uncertain estimate into a passing value.

Keep ratios at full precision in raw evidence. Round only for display and include an explicit pass/fail comparison to prevent a displayed `4.50` from concealing a failure below 4.5. The calculator's display truncates rather than rounds at the threshold.

## Checks automation often misses

- Text input values and placeholders, text selection, CSS-generated text, text in images/canvas/SVG, and text rendered after scrolling or interaction.
- Meaningful icon fill/stroke, chart lines/segments/legends, progress indicators, selected tabs, checks/radio dots, toggle thumbs, and validation symbols.
- Actual focus-visible appearance, ring contrast on each surface, clipped rings, and sticky/fixed content covering the focused control. AA requires focus not be entirely hidden by authored content; stronger visibility is a useful recommendation, not the exact AA criterion.
- Color as the only cue for errors, selected state, links, or chart meaning. Prefer persistent underlines for body links; if the design uses the color/luminance technique, verify 3:1 differentiation from surrounding text as well as text-to-background contrast. Additional hover/focus cues are useful recommendations. Do not require link-to-body 3:1 when an adequate persistent non-color cue already identifies the link. See [W3C technique G183](https://www.w3.org/WAI/WCAG22/Techniques/general/G183).
- Forced colors/high-contrast mode where available, especially controls whose only border/indicator is a box shadow. Record this as a supplemental rendering check; it does not replace ordinary theme checks.

## Review artifact

Write `contrast-review.md` alongside raw results and screenshots, using the project's established artifact location or a temporary output folder. Avoid committing reports or identifiable screenshot data unless requested; use fixture data and do not copy credentials or storage-state contents into the report.

Include:

1. **Result and scope:** Pass within reviewed scope / Fail / Incomplete, target WCAG 2.2 AA contrast, tested revision and dirty-worktree note, base URL, browser/tool versions, and date. Do not call a contrast review a full accessibility audit.
2. **Coverage:** the ledger or link to it, with checked/pending/blocked counts, themes, routes, states, viewports, and grouping reasons. Name missing authentication roles, unsupported frames, unmeasurable content, and omitted variants.
3. **Findings table:** ID, criterion, page/component/state, selector, foreground/background, raw ratio, required ratio, evidence, and proposed fix or current status. Include rendered font size/weight for text and measurement method for complex rendering. Link to source/token locations when found.
4. **Resolved findings when fixing:** before/after pairs and ratios, screenshot links, changed shared tokens/components, and affected combinations retested.
5. **Manual results and exemptions:** measured non-text/focus/complex pairs, how each axe incomplete item was resolved, and justified exemptions. Group identical pairs with their covered occurrences. Keep usability suggestions separate from AA failures.
6. **Reproduction and artifacts:** server command, dependency setup if any, config/script path, run command, and relative screenshot/raw JSON links. A completed automated run still needs a completed manual ledger.

Prioritize confirmed failures by impact and reach: primary actions, navigation, form/error text, and widespread tokens usually precede isolated secondary content. Preserve every affected occurrence even when deduplicating the explanation by shared cause.
