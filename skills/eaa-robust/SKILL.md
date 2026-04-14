---
name: eaa-robust
description: EAA / EN 301 549 / WCAG 2.2 AA — Robust (POUR axis 4). Parsing, semantics, name/role/value, status messages, ARIA authoring. Triggers on "aria", "role", "semantic html", "screen reader support", "name role value", "aria-live", "status message", "assistive technology", "EAA robust", "WCAG 4.".
allowed-tools: Read, Glob, Grep, Edit
---

# EAA Robust — POUR Axis 4

Covers **WCAG Principle 4 / EN 301 549 §9.4**. Content must be reliably parsable by assistive tech — now and as AT evolves.

Always load `rules/accessibility.md` first.

## Success Criteria Checklist (AA)

| SC | Name | What must be true |
|---|---|---|
| 4.1.1 (A, obsolete in 2.2 but kept in EN 301 549) | Parsing | Unique IDs, closed tags, no duplicate attributes. Modern frameworks handle this — still verify. |
| 4.1.2 (A) | Name, Role, Value | Every UI control exposes its role, its accessible name, and its state/value to AT. |
| 4.1.3 (AA) | Status messages | Info presented visually as a status (save confirmation, validation errors, search result count) is announced to AT without moving focus — via `role="status"`, `role="alert"`, or `aria-live`. |

These three look short. In practice 4.1.2 is the single largest bucket of real-world violations after images without alt.

## Common Problems

- Custom `<div role="button">` without `tabindex="0"`, `aria-pressed`, or keyboard handlers.
- Toggle switches with no `role="switch"` + `aria-checked`.
- Tabs pattern with no `role="tablist" / tab / tabpanel`, `aria-selected`, and `aria-controls`.
- Sliders/listboxes/comboboxes hand-rolled with no ARIA pattern — reinventing the spec badly.
- "Saved!" toast that only appears visually — never announced.
- Search results count updated silently: "Showing 3 of 240" changes but AT never knows.
- Duplicate `id` after SSR hydration (e.g., `id="email"` rendered twice in the same document).
- `aria-label` and visible label disagree ("Submit" visible, `aria-label="Buy now"`) — breaks voice control (SC 2.5.3).
- Over-ARIA: `role="button"` on an actual `<button>`, `aria-required="true"` on an already-`required` input.
- Inline SVG icon inside link text: link name duplicated because SVG not `aria-hidden`.

## Pitfalls

- Hydration-introduced ID collisions (same component mounted twice in different islands). Use `useId()` (React/Preact 10.12+) or a scoped prefix per island.
- `aria-live="polite"` on a region that mounts dynamically → not announced. The region must exist in the DOM *before* the update.
- `role="alert"` implies `aria-live="assertive"` + `aria-atomic="true"` — don't add both manually.
- `role="status"` is polite and atomic. Good for non-critical confirmations.
- `hidden` attribute removes from AT; `aria-hidden="true"` on a *focusable* element is a bug (screen reader hidden but keyboard-reachable).
- `inert` is the correct way to silence a modal's background — better than `aria-hidden="true"` on the siblings.
- ARIA booleans are strings: `aria-expanded="true"`, not `aria-expanded={true}` in plain HTML (JSX handles this).
- If you must hand-roll an ARIA pattern (combobox, tree, grid), follow APG 1.2 exactly or use a maintained library. Partial ARIA is worse than none.
- Radix / Ark UI / Kobalte / Headless UI expose these primitives correctly for Preact/React — prefer them.

## Detection Patterns

```bash
# role="button" on non-button elements
rg 'role="button"' -g '*.{astro,tsx,jsx,html}'
# aria-hidden on focusable element
rg 'aria-hidden="true"[^>]*(tabindex|href=|onClick)' --pcre2 -g '*.{astro,tsx,jsx,html}'
# duplicate-looking ids (hard to catch statically; flag suspects)
rg 'id="(email|password|name|submit)"' -g 'src/**/*.{astro,tsx,jsx}'
# live region used but maybe not present at mount
rg 'aria-live' -g 'src/**/*' -B2 -A2
# <div role=...> reimplementations of native controls
rg 'role="(tab|tablist|tabpanel|switch|combobox|listbox|option|slider|menu|menuitem|dialog)"' -g '*.{astro,tsx,jsx}'
```

## Fix Patterns

**Toggle switch:**
```tsx
{/* a11y [WCAG 4.1.2]: switch role + aria-checked + keyboard + visible label */}
<button
  type="button"
  role="switch"
  aria-checked={on}
  aria-labelledby="notif-lbl"
  onClick={() => setOn(!on)}
>
  <span className={styles.track}><span className={styles.thumb} /></span>
</button>
<span id="notif-lbl">Email notifications</span>
```

**Live status after async save:**
```tsx
{/* a11y [WCAG 4.1.3]: polite announcement, no focus change */}
<p role="status" aria-live="polite" className="visually-hidden">
  {saveMessage /* "Saved" | "" */}
</p>
```

**Dynamic search-result count:**
```tsx
{/* a11y [WCAG 4.1.3]: AT hears the new count without user having to re-focus */}
<p role="status" aria-live="polite">
  Showing {results.length} of {total} results
</p>
```

**Modal background silencing:**
```tsx
{/* a11y [WCAG 4.1.2 / 2.4.3]: inert disables pointer + AT + focus on background */}
<div inert={isOpen ? "" : undefined}>
  {/* page content behind the modal */}
</div>
```

**SVG icon inside labelled button:**
```tsx
{/* a11y [WCAG 4.1.2]: visible text names the button; icon decorative */}
<button type="button">
  <IconDownload aria-hidden="true" />
  Download report
</button>
```

**Hand-rolled pattern — don't. Use a library:**
```tsx
// a11y [WCAG 4.1.2]: comboboxes per APG are >200 lines of keyboard/role glue.
// Prefer @ark-ui/preact or @headlessui/react — they pass axe + NVDA out of the box.
import { Combobox } from "@ark-ui/preact";
```

**useId for collision-free ids under hydration:**
```tsx
import { useId } from "preact/hooks";
// a11y [WCAG 4.1.1]: unique ids survive multiple islands on the same page
const id = useId();
return (
  <>
    <label htmlFor={`${id}-name`}>Name</label>
    <input id={`${id}-name`} />
  </>
);
```

## Reporting

```
## Robust fixes
- src/components/Toggle.tsx:4 — WCAG 4.1.2 — added role="switch" + aria-checked + keyboard activation
- src/components/SearchResults.tsx:28 — WCAG 4.1.3 — result-count region now role="status" aria-live="polite"
- src/components/Modal.tsx:51 — WCAG 4.1.2 — switched background from aria-hidden to inert
```

Flag any hand-rolled ARIA widget to the user — they almost always need migration to a maintained library.
