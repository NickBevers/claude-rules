---
name: eaa-perceivable
description: EAA / EN 301 549 / WCAG 2.2 AA — Perceivable (POUR axis 1). Text alternatives, time-based media, adaptable content, distinguishable visuals. Triggers on "alt text", "captions", "audio description", "contrast", "color", "reflow", "text resize", "images", "video accessibility", "EAA perceivable", "WCAG 1.".
allowed-tools: Read, Glob, Grep, Edit
---

# EAA Perceivable — POUR Axis 1

Covers **WCAG Principle 1 / EN 301 549 §9.1 & §10.1**. These are the criteria the EAA (Directive 2019/882) enforces for private-sector products & services across the EU since 28 June 2025.

Always load `rules/accessibility.md` first.

## Success Criteria Checklist (AA)

| SC | Name | What must be true |
|---|---|---|
| 1.1.1 (A) | Non-text content | Every `<img>`, `<svg>`, `<canvas>`, icon button, CAPTCHA, and media has a text alternative. Decorative → `alt=""` + `aria-hidden="true"` on inline SVG. |
| 1.2.1 (A) | Audio/video-only | Pre-recorded audio-only has a transcript; video-only has a description track or transcript. |
| 1.2.2 (A) | Captions (prerecorded) | Synchronised captions on every pre-recorded video with audio. |
| 1.2.3 (A) | Audio description OR transcript | Pre-recorded video has audio description OR full text alternative covering visual info. |
| 1.2.4 (AA) | Captions (live) | Live-streamed audio is captioned. |
| 1.2.5 (AA) | Audio description (prerecorded) | Pre-recorded video has an audio description track (transcript alone is not enough at AA). |
| 1.3.1 (A) | Info & relationships | Headings, lists, tables, landmarks, form associations are in the markup — not just visual. |
| 1.3.2 (A) | Meaningful sequence | DOM order matches the reading order; no `order:`/`flex-direction: row-reverse` that reverses meaning. |
| 1.3.3 (A) | Sensory characteristics | Don't rely on shape/size/position alone ("click the round button on the right"). |
| 1.3.4 (AA) | Orientation | Works in portrait and landscape. No `orientation: lock`. |
| 1.3.5 (AA) | Identify input purpose | `autocomplete` attr on fields collecting name, email, address, phone, cc, etc. |
| 1.4.1 (A) | Use of color | Errors, links in body text, status — never color-only. Add icon, underline, or text. |
| 1.4.2 (A) | Audio control | Any audio playing > 3s has pause/stop/volume independent of system volume. |
| 1.4.3 (AA) | Contrast (minimum) | 4.5:1 body, 3:1 large (≥18pt or ≥14pt bold). |
| 1.4.4 (AA) | Resize text | Text zoomable to 200% without loss of content/function. No fixed `px` that break on zoom. |
| 1.4.5 (AA) | Images of text | No text baked into images (logos & essential exempt). |
| 1.4.10 (AA) | Reflow | No horizontal scroll at 320 CSS px (except tables/code/maps). |
| 1.4.11 (AA) | Non-text contrast | UI components + graphical info: 3:1 against adjacent colors. Covers focus rings, icon-only buttons, chart segments. |
| 1.4.12 (AA) | Text spacing | User override of line-height (1.5×), paragraph (2×), letter (0.12×), word (0.16×) must not break layout. |
| 1.4.13 (AA) | Content on hover/focus | Tooltips/popovers must be dismissible (Escape), hoverable, persistent until dismissed. |

## Common Problems (what violators ship)

- `<img>` with no `alt` attribute at all (not even empty). Screen reader reads the URL.
- Decorative SVG inline without `aria-hidden="true"` — every icon announced twice.
- Icon-only `<button>` (trash can, search) with no `aria-label`.
- Video embedded with `<iframe>` and no captions + no transcript below.
- "Error: please fix" highlighted only in red, no icon, no text prefix.
- Contrast 4.49:1 from a brand grey-on-white. Fails AA by rounding.
- Focus ring `outline: none` + no replacement.
- Hero text set in `px`; user zoom breaks the layout at 150%.
- `<div class="heading">` with no `<h2>` semantics — screen reader nav broken.
- Background image of text for marketing banners — no reflow, no translate.

## Pitfalls (easy to miss)

- SVG used as `<img src>` vs inline `<svg>` — different alt mechanisms (`alt` attr vs `<title>` + `role="img"` + `aria-labelledby`).
- `alt` text that duplicates adjacent caption → screen reader hears it twice. Prefer `alt=""` when a caption already conveys it.
- CSS `content: "→"` generated content is read by some screen readers. Use `speak: never` or real text.
- `figure` + `figcaption` alone doesn't name the image for AT — still set `alt` on the `<img>`.
- `<video autoplay muted>` without controls — fails 1.4.2 the moment user unmutes.
- Live-region updates announcing too much or too often.
- Brand gradient over text: contrast must hold at *every* pixel, not average.
- Using `currentColor` for focus ring inside a colored card → invisible on some themes.

## Detection Patterns

```bash
# Missing alt
rg '<img(?!.*alt=)' --pcre2 -g '*.{astro,tsx,jsx,html}'
# Icon-only buttons without accessible name
rg '<button[^>]*>\s*<(Icon|svg)' -g '*.{astro,tsx,jsx}'
# outline: none without replacement
rg 'outline:\s*(none|0)' -g '*.{css,scss}'
# px font sizes in body copy
rg 'font-size:\s*\d+px' -g '*.{css,scss,module.css}'
# videos without <track>
rg '<video(?![^>]*<track)' --multiline -g '*.{astro,tsx,jsx,html}'
# color-only error indicators
rg 'color:\s*(red|#ff|oklch\(0\.[0-5]\s+0\.[2-9])' -g '*.css'
```

## Fix Patterns

**Empty alt on decorative image:**
```tsx
{/* a11y [WCAG 1.1.1 / EAA EN 301 549 §9.1.1.1]: decorative — screen reader skips */}
<img src="/assets/flourish.svg" alt="" aria-hidden="true" />
```

**Meaningful alt:**
```tsx
{/* a11y [WCAG 1.1.1]: conveys content equivalent to the image */}
<img src="/team/jane.jpg" alt="Jane Okonkwo, CEO, speaking at the 2026 summit" />
```

**Icon-only button:**
```tsx
{/* a11y [WCAG 4.1.2]: button needs an accessible name; text visually hidden */}
<button type="button" aria-label="Delete item" onClick={remove}>
  <IconTrash aria-hidden="true" />
</button>
```

**Video with captions:**
```html
<!-- a11y [WCAG 1.2.2 / EAA §7.1.1]: synchronised captions required -->
<video controls>
  <source src="/intro.mp4" type="video/mp4" />
  <track kind="captions" srclang="en" src="/intro.en.vtt" default />
  <track kind="descriptions" srclang="en" src="/intro.desc.vtt" />
</video>
```

**Non-color error identification:**
```tsx
{/* a11y [WCAG 1.4.1]: icon + text prefix so color isn't the sole cue */}
<p role="alert" className={styles.error}>
  <IconAlertCircle aria-hidden="true" /> Error: email is required.
</p>
```

**Focus ring that survives theme changes:**
```css
/* a11y [WCAG 1.4.11 / 2.4.7]: 3:1 against adjacent colors, visible both modes */
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

**Reflow-safe typography:**
```css
/* a11y [WCAG 1.4.4 / 1.4.10]: rem scales with user zoom, no horizontal scroll < 320px */
body { font-size: 1rem; }
.container { max-width: 100%; padding-inline: clamp(1rem, 4vw, 2rem); }
```

## Reporting

```
## Perceivable fixes
- src/components/Hero.astro:12 — WCAG 1.1.1 — added alt="" to decorative shape SVG
- src/pages/about.astro:41 — WCAG 1.4.3 — raised body text from oklch(0.62 …) to 0.55, now 4.62:1
- src/components/VideoEmbed.tsx:8 — WCAG 1.2.2 — added <track kind="captions">; user must supply VTT file
```

Flag explicitly any fix that requires user-supplied assets (VTT files, transcripts, audio description tracks) — don't pretend they exist.
