---
name: aria-authoring
description: ARIA authoring deep-dive — attributes, roles, widget patterns, and pitfalls per WAI-ARIA 1.2 and APG 1.2. Covers aria-label, aria-labelledby, aria-describedby, aria-hidden, aria-live, aria-expanded, aria-controls, aria-current, aria-invalid, aria-required, landmark roles, widget roles, and composite widget patterns (tabs, combobox, dialog, menu, accordion, carousel, tree). Triggers on "aria", "aria-label", "aria-live", "aria-expanded", "role=", "ARIA pattern", "widget pattern", "accessible name", "screen reader announces", "landmark", "live region", "combobox pattern", "tablist pattern", "dialog pattern", "menu pattern".
allowed-tools: Read, Glob, Grep, Edit
---

# ARIA Authoring — WAI-ARIA 1.2 & APG 1.2

Deep reference for ARIA attributes, roles, and widget patterns. Use alongside the `eaa-robust` skill (which covers WCAG 4.1.2 name/role/value at a checklist level). This skill goes deeper into *how* to author ARIA correctly.

Always load `rules/accessibility.md` first.

## Golden Rule

> If you can use a native HTML element or attribute with the semantics and behavior you need, do so instead of adding ARIA. — WAI-ARIA spec §1

ARIA doesn't add behavior — it only adds semantics. A `<div role="button">` still needs `tabindex="0"`, `keydown` for Enter/Space, and `click`. A `<button>` gives you all of that for free.

## When to use ARIA

- When HTML has no native element for the pattern (combobox, tablist, tree, toolbar, feed).
- When a native element is used but its implicit role/state needs overriding (e.g. `aria-expanded` on a `<button>` controlling a disclosure).
- When dynamic state must be communicated to AT and no native mechanism exists (live regions, busy states).
- When labelling relationships can't be expressed with `<label for>` alone (e.g. multiple labels via `aria-labelledby`).

## Never

- Put `role="button"` on a `<button>` (redundant).
- Put `aria-required="true"` on an element that already has `required` (redundant, unless supporting very old AT — generally not needed).
- Put `aria-hidden="true"` on a focusable element (creates ghost focus — AT can't see it but keyboard lands on it).
- Use `role="link"` on a `<div>` when you could use `<a href>`.
- Invent roles — only use roles defined in WAI-ARIA 1.2.

---

## Accessible Name Computation

AT resolves an element's accessible name in this priority order (simplified from the accname spec):

1. `aria-labelledby` (references IDs; wins over everything)
2. `aria-label` (string; wins over native label)
3. Native label (`<label for>`, `alt`, `<caption>`, `<legend>`, `<figcaption>` in certain contexts)
4. `title` attribute (last resort, unreliable on non-interactive elements, avoid for primary naming)
5. Contents (for roles that allow naming from content: `button`, `link`, `tab`, `menuitem`, etc.)

### aria-label

Provides an accessible name directly as a string. Use when there is no visible text or when the visible text alone is insufficient.

```html
<!-- Icon button without visible text -->
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>

<!-- Enriched name beyond visible text -->
<button type="button" aria-label="Add to cart: Blue T-Shirt, Size M, EUR 29.99">
  Add to Cart
</button>
```

**Pitfall**: `aria-label` on a non-interactive, non-landmark element (plain `<div>`, `<span>`) is ignored by most AT. Only works on interactive elements, landmarks, `role="img"`, and a few others.

**Pitfall**: if the visible text says "Send" but `aria-label` says "Submit form", voice-control users saying "click Send" get nothing (SC 2.5.3 Label in Name). The `aria-label` must *contain* the visible text.

### aria-labelledby

References one or more element IDs to compose a name. Wins over all other naming methods.

```html
<h2 id="billing-title">Billing address</h2>
<form aria-labelledby="billing-title">
  <!-- form content -->
</form>

<!-- Multiple labels concatenated -->
<span id="action">Delete</span>
<span id="target">draft email</span>
<button aria-labelledby="action target">
  <svg aria-hidden="true"><!-- trash icon --></svg>
</button>
<!-- AT announces: "Delete draft email" -->
```

**Pitfall**: referenced IDs must exist in the same DOM. Shadow DOM boundaries block `aria-labelledby`.

### aria-describedby

Adds a *description* (secondary info, read after the name). Does not replace the name.

```html
<label for="pw">Password</label>
<input
  type="password"
  id="pw"
  aria-describedby="pw-rules pw-strength"
/>
<p id="pw-rules">At least 8 characters with uppercase, lowercase, and a number.</p>
<p id="pw-strength" role="status" aria-live="polite">Strength: weak</p>
<!-- AT: "Password, edit. At least 8 characters... Strength: weak" -->
```

### aria-hidden

Removes an element and its descendants from the accessibility tree. Visual rendering is unaffected.

```html
<!-- Decorative icon next to text -->
<button type="button">
  <svg aria-hidden="true"><!-- icon --></svg>
  Save Document
</button>

<!-- Visually duplicated price -->
<div class="card">
  <span aria-hidden="true" class="price-display">EUR 99</span>
  <span class="visually-hidden">Price: 99 euros</span>
</div>
```

**Never** hide focusable elements:
```html
<!-- BUG: keyboard reaches it, but AT can't see it -->
<button aria-hidden="true">Hidden but focusable</button>
```

Use `inert` to silence a region *and* remove it from focus order (e.g. behind a modal).

---

## State & Property Attributes

### aria-expanded

Communicates whether a controlled region is visible. Use on the *trigger*, not on the region.

```html
<button
  type="button"
  aria-expanded="false"
  aria-controls="menu-list"
  onclick="toggle()"
>
  Options
</button>
<ul id="menu-list" role="menu" hidden>
  <li role="menuitem"><button type="button">Edit</button></li>
  <li role="menuitem"><button type="button">Delete</button></li>
</ul>
```

### aria-controls

Points to the ID of the element this control operates on. Supplements `aria-expanded`, `aria-activedescendant`, and tab/tabpanel pairings. Browser support is incomplete (JAWS ignores it, NVDA uses it) — always pair with other patterns; don't rely on it alone.

```html
<button role="tab" aria-controls="panel-1" aria-selected="true" id="tab-1">
  Overview
</button>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  Panel content.
</div>
```

### aria-current

Identifies the current item within a set. Values: `page`, `step`, `location`, `date`, `time`, `true`.

```html
<!-- Current page in navigation -->
<nav aria-label="Main">
  <a href="/">Home</a>
  <a href="/products" aria-current="page">Products</a>
  <a href="/about">About</a>
</nav>

<!-- Current step in a process -->
<ol class="steps">
  <li>Cart</li>
  <li aria-current="step">Shipping</li>
  <li>Payment</li>
  <li>Review</li>
</ol>
```

### aria-invalid

Marks a field as invalid. Set dynamically on validation; clear when the error is resolved.

```html
<label for="email">Email</label>
<input
  type="email"
  id="email"
  aria-invalid="true"
  aria-describedby="email-err"
/>
<p id="email-err" role="alert">Please enter a valid email address.</p>
```

**Don't** set `aria-invalid="false"` proactively on load — omit the attribute when the field hasn't been validated yet.

### aria-required

Indicates a field is mandatory. Pair with the native `required` attribute for behavioral enforcement.

```html
<label for="name">
  Full Name <span aria-hidden="true">*</span>
</label>
<input type="text" id="name" required aria-required="true" />
```

### aria-live

Creates a live region whose content changes are announced by AT.

| Value | Behavior | Use when |
|---|---|---|
| `polite` | Announced when user is idle | Status updates, saved confirmations, search counts |
| `assertive` | Announced immediately, interrupting | Errors, auth failures, session expiry |
| `off` | Not announced (default) | Content updating silently |

```html
<!-- The region must exist in the DOM BEFORE content updates -->
<p role="status" aria-live="polite">
  <!-- dynamically updated: "Showing 12 of 240 results" -->
</p>
```

**Pitfall**: mounting a new element with `aria-live` *and* content in the same render = silent. The container must be in the DOM first; then update its text content.

**Pitfall**: `role="alert"` implies `aria-live="assertive"` + `aria-atomic="true"` — don't add them manually on top.

### aria-atomic

When `true`, AT re-reads the *entire* live region on any change. When `false` (default for most), AT reads only the changed nodes.

```html
<!-- Atomic: re-announce the whole sentence when count changes -->
<p role="status" aria-live="polite" aria-atomic="true">
  Found <span id="count">23</span> results for "accessibility"
</p>

<!-- Non-atomic: only the new message is announced -->
<div role="log" aria-live="polite" aria-atomic="false">
  <p>User joined the chat</p>
  <!-- new messages appended -->
</div>
```

### aria-busy

Signals that a region is being updated and AT should wait before announcing.

```html
<div role="status" aria-live="polite" aria-busy="true">
  Loading content...
</div>
<!-- Set aria-busy="false" when done; AT then announces the final content -->
```

---

## Landmark Roles

Landmarks let AT users jump between major page sections. Prefer semantic HTML elements — they carry implicit roles.

| HTML Element | Implicit Role | Notes |
|---|---|---|
| `<header>` (top-level) | `banner` | Only one per page at top level |
| `<nav>` | `navigation` | Label with `aria-label` if > 1 on page |
| `<main>` | `main` | Only one per page |
| `<aside>` | `complementary` | |
| `<footer>` (top-level) | `contentinfo` | Only one per page at top level |
| `<section>` with accessible name | `region` | Needs `aria-labelledby` or `aria-label` to be a landmark |
| `<form>` with accessible name | `form` | Only a landmark when labelled |
| `<search>` (HTML 5.2+) | `search` | Use `role="search"` on `<form>` for older support |

**Don't** add `role="navigation"` to a `<nav>` — it's redundant.

**Do** label multiple landmarks of the same type:

```html
<nav aria-label="Main"><!-- primary nav --></nav>
<nav aria-label="Footer"><!-- footer nav --></nav>
```

---

## Widget Roles — Quick Reference

### Single-purpose roles

| Role | Paired with | Keyboard | Use native instead? |
|---|---|---|---|
| `button` | `aria-pressed` (toggle), `aria-expanded` (disclosure) | Enter, Space | `<button>` |
| `link` | — | Enter | `<a href>` |
| `checkbox` | `aria-checked` (`true`/`false`/`mixed`) | Space | `<input type="checkbox">` |
| `radio` | `aria-checked`, inside `radiogroup` | Arrow keys | `<input type="radio">` in `<fieldset>` |
| `switch` | `aria-checked` | Space, Enter | `<button role="switch">` |
| `slider` | `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` | Arrow keys, Home, End | `<input type="range">` |
| `spinbutton` | `aria-valuemin`, `aria-valuemax`, `aria-valuenow` | Arrow keys | `<input type="number">` |
| `progressbar` | `aria-valuemin`, `aria-valuemax`, `aria-valuenow` | — (non-interactive) | `<progress>` |
| `img` | `aria-label` or `aria-labelledby` | — | `<img alt>` |
| `alertdialog` | `aria-labelledby`, `aria-describedby` | Focus trap, Escape | `<dialog>` |

### Composite widget roles

These combine a *container role* with *child roles* and specific keyboard contracts.

---

## Composite Widget Patterns (APG 1.2)

### Tabs

```html
<div class="tabs">
  <div role="tablist" aria-label="Account settings">
    <button role="tab" id="t1" aria-selected="true" aria-controls="p1" tabindex="0">
      Profile
    </button>
    <button role="tab" id="t2" aria-selected="false" aria-controls="p2" tabindex="-1">
      Security
    </button>
    <button role="tab" id="t3" aria-selected="false" aria-controls="p3" tabindex="-1">
      Billing
    </button>
  </div>

  <div role="tabpanel" id="p1" aria-labelledby="t1" tabindex="0">
    Profile content.
  </div>
  <div role="tabpanel" id="p2" aria-labelledby="t2" tabindex="0" hidden>
    Security content.
  </div>
  <div role="tabpanel" id="p3" aria-labelledby="t3" tabindex="0" hidden>
    Billing content.
  </div>
</div>
```

**Keyboard**: Arrow Left/Right between tabs. Home/End to first/last tab. Tab moves focus into the active panel.

**Pitfall**: only the selected tab has `tabindex="0"`; others have `tabindex="-1"`. Arrow keys move focus *and* activate (automatic activation) or just move focus (manual activation — needs Enter to activate). APG recommends automatic activation for simple tabs.

### Dialog (Modal)

Prefer native `<dialog>` — it provides focus trap, Escape dismiss, and `inert` backdrop for free.

```html
<dialog id="confirm-dlg" aria-labelledby="dlg-title" aria-describedby="dlg-desc">
  <h2 id="dlg-title">Confirm deletion</h2>
  <p id="dlg-desc">This will permanently delete 3 items. This action cannot be undone.</p>
  <form method="dialog">
    <button type="button" onclick="this.closest('dialog').close()">Cancel</button>
    <button value="confirm">Delete</button>
  </form>
</dialog>
```

If hand-rolling (not recommended):

- `role="dialog"` + `aria-modal="true"`.
- On open: move focus to first focusable element inside.
- Trap Tab/Shift+Tab within the dialog.
- Escape closes and returns focus to the trigger.
- Background gets `inert` (preferred) or `aria-hidden="true"` on sibling containers.

### Menu & Menubar

Use for *application* menus, not site navigation. Navigation is `<nav>` + `<ul>`, not `role="menu"`.

```html
<button
  type="button"
  id="actions-btn"
  aria-haspopup="true"
  aria-expanded="false"
  aria-controls="actions-menu"
>
  Actions
</button>
<ul role="menu" id="actions-menu" aria-labelledby="actions-btn" hidden>
  <li role="none"><button role="menuitem" type="button">Edit</button></li>
  <li role="none"><button role="menuitem" type="button">Duplicate</button></li>
  <li role="separator"></li>
  <li role="none"><button role="menuitem" type="button">Delete</button></li>
</ul>
```

**Keyboard**: Enter/Space activates item. Arrow Down/Up moves between items. Escape closes menu and returns focus to trigger. Home/End to first/last item. Type-ahead jumps to matching item.

**Pitfall**: wrapping `<li>` needs `role="none"` to strip its implicit `listitem` role.

### Combobox (autocomplete / select with search)

The most complex ARIA pattern. ~200 lines of keyboard/role glue. **Prefer a library** — @ark-ui/preact, @headlessui/react, Radix UI, Kobalte.

```html
<label id="cb-label">City</label>
<div class="combobox-wrapper">
  <input
    type="text"
    role="combobox"
    aria-labelledby="cb-label"
    aria-controls="cb-listbox"
    aria-expanded="false"
    aria-autocomplete="list"
    aria-activedescendant=""
  />
  <ul id="cb-listbox" role="listbox" aria-labelledby="cb-label" hidden>
    <li role="option" id="opt-1">Amsterdam</li>
    <li role="option" id="opt-2">Antwerp</li>
    <li role="option" id="opt-3">Brussels</li>
  </ul>
</div>
```

**Keyboard**: Arrow Down opens list and moves to first option. Arrow Up/Down navigates options. Enter selects. Escape closes. `aria-activedescendant` tracks the visually focused option without moving DOM focus.

### Accordion (Disclosure Group)

```html
<div class="accordion">
  <h3>
    <button
      type="button"
      aria-expanded="false"
      aria-controls="acc-panel-1"
      id="acc-header-1"
    >
      Shipping information
    </button>
  </h3>
  <div
    id="acc-panel-1"
    role="region"
    aria-labelledby="acc-header-1"
    hidden
  >
    <p>We ship to all EU countries within 3-5 business days.</p>
  </div>
</div>
```

**Keyboard**: Enter/Space toggles the panel. Optionally: Arrow Down/Up between headers, Home/End to first/last header.

### Carousel / Slider

```html
<section
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="controls">
    <button type="button" aria-label="Previous slide">&#8249;</button>
    <button type="button" aria-label="Pause auto-play">Pause</button>
    <button type="button" aria-label="Next slide">&#8250;</button>
  </div>

  <div aria-live="polite">
    <div role="group" aria-roledescription="slide" aria-label="1 of 4">
      <img src="/product-1.jpg" alt="Blue running shoes, EUR 89" />
    </div>
  </div>

  <div role="tablist" aria-label="Slide controls">
    <button role="tab" aria-selected="true" aria-label="Go to slide 1">1</button>
    <button role="tab" aria-selected="false" aria-label="Go to slide 2">2</button>
    <button role="tab" aria-selected="false" aria-label="Go to slide 3">3</button>
    <button role="tab" aria-selected="false" aria-label="Go to slide 4">4</button>
  </div>
</section>
```

**Requirements**: Pause button mandatory if auto-advancing (WCAG 2.2.2). `aria-live="polite"` on the slide container so AT hears the new slide. Auto-play must respect `prefers-reduced-motion`.

### Breadcrumb

```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/products/shoes">Shoes</a></li>
    <li><a href="/products/shoes/running" aria-current="page">Running</a></li>
  </ol>
</nav>
```

No special roles needed — `<nav>` + `<ol>` + `aria-current="page"` on the last link.

### Tree View

```html
<ul role="tree" aria-label="File browser">
  <li role="treeitem" aria-expanded="true">
    src/
    <ul role="group">
      <li role="treeitem" aria-expanded="false">
        components/
        <ul role="group">
          <li role="treeitem" class="leaf">Button.tsx</li>
        </ul>
      </li>
      <li role="treeitem" class="leaf">index.ts</li>
    </ul>
  </li>
</ul>
```

**Keyboard**: Arrow Up/Down between visible items. Arrow Right expands / moves to first child. Arrow Left collapses / moves to parent. Home/End to first/last visible item. Type-ahead.

---

## Visually Hidden Content (screen-reader-only)

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Becomes visible on focus (for skip links) */
.visually-hidden-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

Use for:
- Extra context on links: `<a href="/article">Read more<span class="visually-hidden"> about accessible design</span></a>`
- Skip links that appear on focus.
- Screen-reader-only status text when a visual indicator is already present.

**Don't** use `display: none` or `visibility: hidden` as a "screen reader only" technique — both remove the element from the accessibility tree.

---

## Common Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| `role="button"` on `<button>` | Redundant ARIA; no harm but code smell | Remove the `role` |
| `<div role="button" onclick>` without `tabindex` or keyboard | Not focusable or activatable by keyboard | Use `<button>` |
| `aria-label` on a `<div>` (no role) | Ignored by most AT | Add `role="region"` or use an appropriate element |
| `aria-hidden="true"` on a focusable element | Ghost focus — AT users get stuck | Use `inert` or remove from tab order first |
| `aria-live` region mounted dynamically with initial content | First render is silent | Render the container empty, then update content |
| `role="alert"` + `aria-live="assertive"` + `aria-atomic="true"` | Triple redundancy — `role="alert"` implies the other two | Just use `role="alert"` |
| `role="menu"` for site navigation | Menu role implies application-menu keyboard model (arrow keys, no Tab) | Use `<nav>` + `<ul>` for site navigation |
| `tabindex="5"` to "fix" focus order | Breaks natural tab order for every user | Reorder the DOM; only use `tabindex="0"` or `tabindex="-1"` |
| `<input placeholder="Email">` with no `<label>` | Placeholder vanishes on focus; fails contrast; not announced consistently | Add a visible `<label>` |
| Inline SVG icon inside a link without `aria-hidden` | Link name reads icon title + link text (doubled) | Add `aria-hidden="true"` on the SVG |

---

## Detection Patterns

```bash
# role="button" on actual <button> elements (redundant)
rg '<button[^>]*role="button"' -g '*.{astro,tsx,jsx,html}'

# aria-hidden on focusable elements (ghost focus)
rg 'aria-hidden="true"[^>]*(tabindex|href=|onClick)' --pcre2 -g '*.{astro,tsx,jsx,html}'

# div/span with onclick but no role or tabindex (inaccessible)
rg '<(div|span)[^>]*on(C|c)lick' --pcre2 -g '*.{astro,tsx,jsx,html}' | rg -v 'role=\|tabindex='

# aria-label on elements without a role (likely ignored)
rg '<(div|span|p)[^>]*aria-label=' --pcre2 -g '*.{astro,tsx,jsx,html}' | rg -v 'role='

# role="menu" used for navigation (likely wrong pattern)
rg 'role="menu"' -g '*.{astro,tsx,jsx,html}'

# Duplicate IDs (breaks aria-labelledby/describedby)
rg 'id="(email|password|name|submit)"' -g 'src/**/*.{astro,tsx,jsx}'

# aria-live region that might be mounted dynamically
rg 'aria-live' -g 'src/**/*' -B2 -A2

# tabindex > 0 (breaks natural tab order)
rg 'tabindex=["\x27]?[1-9]' -g '*.{astro,tsx,jsx,html}'

# Placeholder used as label (no visible label)
rg '<input(?![^>]*id=)[^>]*placeholder=' --pcre2 -g '*.{astro,tsx,jsx,html}'
```

---

## ARIA Boolean Values in JSX vs HTML

In plain HTML, ARIA booleans are strings:
```html
<button aria-expanded="true">Menu</button>
```

In JSX/TSX (Preact/React), you can pass booleans — they're coerced to strings:
```tsx
<button aria-expanded={isOpen}>Menu</button>
// renders aria-expanded="true" or aria-expanded="false"
```

**Pitfall**: `aria-expanded={undefined}` removes the attribute entirely, which is different from `aria-expanded="false"`. Use `false` when the control *can* expand but is currently collapsed. Omit only when the concept of expanding doesn't apply.

---

## Choosing the Right Pattern

| UI you're building | Use this pattern | Avoid |
|---|---|---|
| Toggle button (bold, mute) | `<button aria-pressed>` | `role="checkbox"` on a button |
| On/off switch (notifications) | `<button role="switch" aria-checked>` | Toggle with `aria-pressed` (semantically different) |
| Expandable section | `<button aria-expanded>` + `<div>` | `role="tab"` (tabs are for switching views, not disclosures) |
| Tab bar switching views | `tablist` / `tab` / `tabpanel` | Multiple accordions pretending to be tabs |
| Autocomplete search | `combobox` + `listbox` + `option` | `role="menu"` (wrong keyboard model) |
| Site navigation | `<nav>` + `<ul>` + `<a>` | `role="menu"` + `role="menuitem"` |
| App-style action menu | `role="menu"` + `role="menuitem"` | `<nav>` + `<ul>` (wrong semantics) |
| File tree | `tree` + `treeitem` + `group` | Nested accordions |
| Data grid | `grid` + `row` + `gridcell` | `<table>` without keyboard (for interactive cells) |
| Static data table | `<table>` + `<th scope>` | `role="grid"` (adds unnecessary keyboard expectations) |

---

## Reporting

```
## ARIA authoring fixes
- src/components/Nav.tsx:14 — removed role="navigation" from <nav> (redundant)
- src/components/Toggle.tsx:8 — changed from aria-pressed to role="switch" + aria-checked (correct semantics for on/off)
- src/components/Search.tsx:22 — live region container rendered on mount, content updated dynamically (was silent before)
- src/components/Sidebar.tsx:4 — added aria-label="Sidebar" to <nav> (disambiguates from main nav)
```

When recommending a hand-rolled ARIA widget, flag it and suggest a maintained library instead (Ark UI, Radix, Headless UI). Partial ARIA is worse than no ARIA — incomplete keyboard contracts confuse AT users more than a plain `<div>`.
