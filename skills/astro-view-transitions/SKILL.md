---
name: astro-view-transitions
description: Implement Astro View Transitions for SPA-like navigation with page animations. Triggers on "view transitions", "page transitions", "astro transitions", "transition animate", "persist state".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro View Transitions — SPA-Like Navigation

SPA-like navigation with animated page changes — no client-side router.

Use `<ClientRouter />` from `astro:transitions`. `<ViewTransitions />` was removed in Astro 6. `handleForms` prop also removed — form handling is now default.

## Step 1: Setup

```astro
---
import { ClientRouter } from 'astro:transitions'
---
<html lang="en">
<head><ClientRouter /></head>
<body><slot /></body>
</html>
```

All navigation between pages using this layout becomes client-side. No per-page opt-in.

## Step 2: Directives

### `transition:name` — Shared Element Transitions

```astro
<!-- Same name on both pages morphs between them -->
<img src={post.data.image} transition:name={`hero-${post.slug}`} />
```

Names must be unique per page. Works on any element.

### `transition:animate`

| Value | Effect |
|---|---|
| `initial` | Default fade |
| `fade` | Cross-fade |
| `slide` | Old out left, new in right |
| `none` | Instant |

Custom: `transition:animate={fade({ duration: '0.3s' })}`

Full custom:
```astro
---
import type { TransitionAnimationPair } from 'astro:transitions'
const anim: TransitionAnimationPair = {
  old: { name: 'slideOut', duration: '0.3s', easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fillMode: 'forwards' },
  new: { name: 'slideIn', duration: '0.3s', easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fillMode: 'backwards' },
}
---
<main transition:animate={anim}><slot /></main>
```

Only animate `transform` and `opacity`. Always respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
    animation-duration: 0s !important;
  }
}
```

### `transition:persist`

Keep elements alive across navigation:
```astro
<audio-player transition:persist id="player" />
<VideoPlayer client:load transition:persist />
```

Must have same `id` or `transition:name` on both pages.

## Step 3: Lifecycle Events

```astro
<script>
  document.addEventListener('astro:before-preparation', () => { /* before fetch */ })
  document.addEventListener('astro:after-swap', () => { /* DOM swapped, reinit scripts */ })
  document.addEventListener('astro:page-load', () => { /* every navigation + initial load */ })
</script>
```

Scripts in Astro components run once on first load, NOT on subsequent navigations. Use `astro:page-load` for scripts that must run every page.

## Step 4: Islands + Transitions

Islands are **destroyed and recreated** on navigation by default.

Preserve state:
- `transition:persist` on the island
- External state (Nanostores/Signals at module level) survives automatically

## Step 5: Accessibility

- Focus moves to `<main>` after navigation (Astro default, verify)
- `<title>` change announces new page to screen readers
- Honor `prefers-reduced-motion`
- Skip-to-main link must work on every transition

## Common Patterns

```astro
<!-- Direction-aware slide -->
<main transition:animate={slide()}><slot /></main>

<!-- Persistent nav with active state update -->
<nav transition:persist>...</nav>
<script>
  document.addEventListener('astro:after-swap', () => {
    document.querySelectorAll('nav a').forEach(link => {
      const href = link.getAttribute('href')
      link.classList.toggle('active',
        href === '/' ? location.pathname === '/' : location.pathname.startsWith(href!))
    })
  })
</script>

<!-- Force full reload -->
<a href="/api/download" data-astro-reload>Download</a>
```

## Self-Check

- [ ] Using `<ClientRouter />` (not `<ViewTransitions />`)
- [ ] `transition:name` unique per page
- [ ] `prefers-reduced-motion` respected
- [ ] Scripts reinit via `astro:page-load`
- [ ] Stateful islands use `transition:persist` or external stores
- [ ] Focus management works after navigation
- [ ] Custom animations only use `transform` and `opacity`
