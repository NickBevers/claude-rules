---
name: eaa-operable
description: EAA / EN 301 549 / WCAG 2.2 AA — Operable (POUR axis 2). Keyboard, timing, seizures, navigation, input modalities, target size. Triggers on "keyboard accessibility", "focus", "tab order", "skip link", "focus trap", "timing", "session timeout", "flashing", "target size", "drag and drop accessibility", "EAA operable", "WCAG 2.".
allowed-tools: Read, Glob, Grep, Edit
---

# EAA Operable — POUR Axis 2

Covers **WCAG Principle 2 / EN 301 549 §9.2 & §10.2**. Keyboard access is the most-litigated axis in EAA/ADA/UK cases — treat it as non-negotiable.

Always load `rules/accessibility.md` first.

## Success Criteria Checklist (AA)

| SC | Name | What must be true |
|---|---|---|
| 2.1.1 (A) | Keyboard | All functionality reachable and operable via keyboard. No mouse-only interactions. |
| 2.1.2 (A) | No keyboard trap | Focus can always move away using Tab / Shift+Tab / documented key (e.g. Escape). |
| 2.1.4 (A) | Character key shortcuts | Single-key shortcuts (e.g. "k") must be remappable OR only active on focus. |
| 2.2.1 (A) | Timing adjustable | Session timeouts: user can turn off, adjust, or extend (unless <20h real-time / essential). |
| 2.2.2 (A) | Pause, stop, hide | Anything auto-updating, moving, blinking, or scrolling > 5s has pause. |
| 2.3.1 (A) | Three flashes | Nothing flashes more than 3× per second (seizure risk). |
| 2.4.1 (A) | Bypass blocks | Skip-link to main, or landmarks that achieve the same. |
| 2.4.2 (A) | Page titled | Every page has a unique, descriptive `<title>`. |
| 2.4.3 (A) | Focus order | Tab order follows visual/logical order; no `tabindex` >0. |
| 2.4.4 (A) | Link purpose (in context) | Link text or its context makes the destination clear ("read more" alone = fail). |
| 2.4.5 (AA) | Multiple ways | More than one way to find pages (nav + search + sitemap). |
| 2.4.6 (AA) | Headings & labels | Headings and labels describe topic/purpose; not `<h2>Section</h2>`. |
| 2.4.7 (AA) | Focus visible | Always visibly focused. `:focus-visible` indicator with 3:1 contrast. |
| 2.4.11 (AA, 2.2) | Focus not obscured (minimum) | Focused element isn't fully hidden by sticky header/cookie banner. |
| 2.5.1 (A) | Pointer gestures | Any multi-point/path-based gesture has a single-pointer alternative. |
| 2.5.2 (A) | Pointer cancellation | `click`/`touchend` — action fires on up-event, abortable by moving off. |
| 2.5.3 (A) | Label in name | Accessible name includes visible label text (so voice-control works). |
| 2.5.4 (A) | Motion actuation | If shake/tilt triggers an action, provide a button alternative + disable. |
| 2.5.7 (AA, 2.2) | Dragging movements | Any drag has a single-click/single-tap alternative. |
| 2.5.8 (AA, 2.2) | Target size (minimum) | Interactive targets ≥ 24×24 CSS px, or have 24px spacing from neighbors. |

## Common Problems

- `<div onclick>` pretending to be a button — no focus, no Enter/Space, no keyboard.
- Modal opens but Tab escapes to the page behind. Escape key does nothing.
- Skip link missing or broken (`#main` doesn't exist).
- `tabindex="5"` sprinkled to "fix" order. It breaks it.
- Carousel auto-advances every 3s with no pause.
- Dropdown menu opens on hover only — keyboard users never see it.
- Drag-and-drop list reorder with no keyboard/button alternative.
- 16×16 px icon buttons (contact icons footer, close X) — fails target size.
- `:focus { outline: none }` with only `:hover` style replacing it.
- Sticky header covers the focused input when you Tab into the form.
- Session timeout of 10 min with no warning/extend button.
- Shortcuts like "j/k for next/prev" always on — blocks dictation users.

## Pitfalls

- `:focus-visible` is AA-acceptable; Safari < 15.4 needs `:focus` fallback for keyboard — test.
- Dialog (`<dialog>`) element gives focus trap + Escape for free. Use it over custom modals.
- `role="button"` on a `<div>` still needs `tabindex="0"` AND Enter/Space key handlers AND `onClick`. Using `<button>` is cheaper.
- Radix/Headless UI do most of this right — check you haven't disabled their keyboard behavior.
- Focus outline `outline-offset` negative values can hide rings behind overflow: hidden.
- Astro view transitions — after navigation, move focus to `<main>` or `<h1>` or announce the new page. Browsers don't by default.
- Target size ignores inline text links (exempt), but icon-only pagination chevrons are NOT exempt.
- "Drag only" sliders need keyboard arrow keys + visible value text.
- Swipe-only gestures (mobile nav) need button fallbacks.

## Detection Patterns

```bash
# div/span with onclick (not button/link)
rg '<(div|span)[^>]*onclick' --pcre2 -g '*.{astro,tsx,jsx,html}'
# tabindex > 0
rg 'tabindex=["\']?[1-9]' -g '*.{astro,tsx,jsx,html}'
# outline: none / 0
rg 'outline:\s*(none|0)' -g '*.{css,scss}'
# hover-only event handlers (no focus equivalent)
rg 'onMouseEnter|onHover' -g '*.{tsx,jsx,astro}' | rg -v 'onFocus'
# missing type on button
rg '<button(?![^>]*type=)' --pcre2 -g '*.{astro,tsx,jsx,html}'
# auto-advancing carousels / setInterval with DOM mutation
rg 'setInterval' -g 'src/**/*.{ts,tsx,astro}' -A2
```

## Fix Patterns

**Real button instead of div-onclick:**
```tsx
{/* a11y [WCAG 2.1.1 / 4.1.2]: native button → keyboard + AT support for free */}
<button type="button" onClick={toggle} aria-expanded={open}>
  {open ? "Hide" : "Show"} details
</button>
```

**Accessible dialog (use native):**
```tsx
// a11y [WCAG 2.1.2 / 2.4.3]: <dialog> provides focus trap + Escape dismiss + inert backdrop
<dialog ref={dialogRef} aria-labelledby="dlg-title" onClose={onClose}>
  <h2 id="dlg-title">Confirm delete</h2>
  {/* ... */}
  <form method="dialog">
    <button type="button" onClick={onClose}>Cancel</button>
    <button value="confirm">Delete</button>
  </form>
</dialog>
```

**Skip link:**
```astro
---
// a11y [WCAG 2.4.1]: bypass repeated nav blocks
---
<a href="#main" class="skip">Skip to main content</a>
<main id="main" tabindex="-1">
  <slot />
</main>
<style>
  .skip { position: absolute; inset-inline-start: 0; transform: translateY(-200%); }
  .skip:focus-visible { transform: translateY(0); }
</style>
```

**Focus visible, keyboard only:**
```css
/* a11y [WCAG 2.4.7 / 1.4.11]: 3:1 against page + offset so it isn't clipped */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 2px;
}
```

**Target size via padding, not scaling:**
```css
/* a11y [WCAG 2.5.8]: 24×24 min clickable area without enlarging visual icon */
.icon-button {
  padding: 0.5rem;
  display: inline-grid;
  place-items: center;
  min-block-size: 2.75rem; /* 44px */
  min-inline-size: 2.75rem;
}
```

**Session timeout with extend:**
```tsx
{/* a11y [WCAG 2.2.1]: warn user before expiring session; one-click extend */}
<div role="alertdialog" aria-labelledby="t-title" aria-describedby="t-desc">
  <h2 id="t-title">Session about to expire</h2>
  <p id="t-desc">You will be signed out in 60 seconds.</p>
  <button onClick={extend}>Stay signed in</button>
</div>
```

**Drag alternative:**
```tsx
{/* a11y [WCAG 2.5.7]: arrow-key reorder + Move-up/Move-down buttons as DnD alternative */}
<button aria-label={`Move ${item.name} up`} onClick={() => move(i, -1)}>▲</button>
<button aria-label={`Move ${item.name} down`} onClick={() => move(i, +1)}>▼</button>
```

**Astro view-transition focus:**
```astro
<script>
  document.addEventListener("astro:after-swap", () => {
    // a11y [WCAG 2.4.3]: move focus to main so screen reader announces new page
    const main = document.querySelector("main");
    if (main) { main.setAttribute("tabindex", "-1"); main.focus(); }
  });
</script>
```

## Reporting

```
## Operable fixes
- src/components/Menu.tsx:17 — WCAG 2.1.1 — converted <div onclick> to <button type="button">
- src/layouts/Base.astro:5 — WCAG 2.4.1 — added skip link + main#main landmark
- src/components/IconBtn.tsx:4 — WCAG 2.5.8 — min-size 44×44; padding instead of scaling icon
```

Mark any residual keyboard flow the user still needs to manually test with Tab / Shift+Tab / Escape — automated tools can't verify intent.
