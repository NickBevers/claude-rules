---
name: astro-view-transitions
description: Implement Astro View Transitions for SPA-like navigation with page animations. Triggers on "view transitions", "page transitions", "astro transitions", "transition animate", "persist state".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Astro View Transitions — SPA-Like Navigation

View Transitions give Astro MPA sites SPA-like navigation with animated page changes — no client-side router needed.

## Component

Use `<ClientRouter />` from `astro:transitions`. The old `<ViewTransitions />` name was removed in Astro 6.

Also in Astro 6: the `handleForms` prop was removed — form handling during transitions is now default behavior.

## Step 1: Basic Setup

### Enable View Transitions

Add the router component to your base layout:

```astro
---
// src/layouts/Base.astro
import { ClientRouter } from 'astro:transitions'
---
<html lang="en">
<head>
  <ClientRouter />
</head>
<body>
  <slot />
</body>
</html>
```

Once added, **all navigation between pages using this layout becomes client-side** with animated transitions. No per-page opt-in needed.

### Fallback Behavior

Browsers without View Transitions API support get instant navigation (no animation, but still client-side SPA behavior). No polyfill needed — progressive enhancement by default.

## Step 2: Transition Directives

### `transition:name` — Shared Element Transitions

Morph an element from one page into its counterpart on the next:

```astro
<!-- Page A: Blog list -->
<img
  src={post.data.image}
  alt={post.data.title}
  transition:name={`hero-${post.slug}`}
/>

<!-- Page B: Blog detail -->
<img
  src={post.data.image}
  alt={post.data.title}
  transition:name={`hero-${post.slug}`}
/>
```

**Rules:**
- Names must be unique per page (no two elements with the same `transition:name` on one page)
- Both elements must exist on their respective pages
- Works on any element (images, headings, cards, buttons)
- The browser automatically animates size, position, and opacity between the two states

### `transition:animate` — Animation Type

```astro
<main transition:animate="slide">
  <slot />
</main>
```

Built-in animations:
| Value | Effect |
|---|---|
| `initial` | Default: new page fades in, old fades out |
| `fade` | Cross-fade between pages |
| `slide` | Old slides out left, new slides in from right |
| `none` | No animation (instant swap) |

### Custom Animations

```astro
---
import { fade } from 'astro:transitions'
---
<main transition:animate={fade({ duration: '0.3s' })}>
  <slot />
</main>
```

Full custom animation:

```astro
---
import type { TransitionAnimationPair } from 'astro:transitions'

const customSlide: TransitionAnimationPair = {
  old: {
    name: 'slideOut',
    duration: '0.3s',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fillMode: 'forwards',
  },
  new: {
    name: 'slideIn',
    duration: '0.3s',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fillMode: 'backwards',
  },
}
---
<main transition:animate={customSlide}>
  <slot />
</main>

<style is:global>
  @keyframes slideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(-100px); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
  }
</style>
```

**Animation constraints** (same as project design rules):
- Only animate `transform` and `opacity` — never layout properties
- Custom `cubic-bezier()` easing — never `ease` or `linear`
- `@media (prefers-reduced-motion: reduce)` to disable or minimize:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0s !important;
  }
}
```

### `transition:persist` — Keep Elements Across Navigation

```astro
<!-- Audio player that keeps playing across pages -->
<audio-player transition:persist id="player" />

<!-- Island that preserves its state -->
<VideoPlayer client:load transition:persist />
```

Use cases:
- Media players that shouldn't restart
- Forms with unsaved data
- Chat widgets
- Video embeds

**Persisted elements must have the same `id` or `transition:name` on both pages.**

## Step 3: Lifecycle Events

View Transitions fire events you can hook into:

```astro
<script>
  document.addEventListener('astro:before-preparation', (event) => {
    // Before the new page is fetched
    // Use: show loading indicator
  })

  document.addEventListener('astro:after-preparation', (event) => {
    // New page fetched, before swap
    // Use: prepare the new DOM
  })

  document.addEventListener('astro:before-swap', (event) => {
    // Just before the DOM swap
    // Use: persist state, transfer data between pages
  })

  document.addEventListener('astro:after-swap', (event) => {
    // DOM swapped, before animations play
    // Use: reinitialize scripts, update analytics
  })

  document.addEventListener('astro:page-load', (event) => {
    // Page fully loaded (including animations)
    // Use: initialize page-specific JS
    // ALSO fires on initial page load (not just transitions)
  })
</script>
```

### Re-Initializing Scripts

With View Transitions, `<script>` tags in Astro components run once on first load but NOT on subsequent navigations. Use `astro:page-load` for scripts that need to run on every page:

```astro
<script>
  document.addEventListener('astro:page-load', () => {
    // This runs on every page navigation, including the first load
    const el = document.querySelector('#interactive-thing')
    if (el) initializeThing(el)
  })
</script>
```

## Step 4: Islands + View Transitions

### Island State During Navigation

By default, islands are **destroyed and recreated** on each navigation. Their state resets.

To preserve island state:
```astro
<!-- Option 1: transition:persist (keeps the entire island alive) -->
<Counter client:load transition:persist />

<!-- Option 2: External state (Nanostores / Signals persist at module level) -->
<Cart client:load />  <!-- State in nanostores survives navigation -->
```

### Island Hydration After Navigation

Islands hydrate correctly after View Transitions — Astro handles this. But if you're manually querying DOM in an island, use `astro:page-load`:

```tsx
import { useEffect } from 'preact/hooks'

export function ScrollTracker() {
  useEffect(() => {
    const handler = () => { /* ... */ }
    document.addEventListener('astro:page-load', handler)
    return () => document.removeEventListener('astro:page-load', handler)
  }, [])
}
```

## Step 5: Accessibility

View Transitions must not break the experience for assistive technology users:

- **Focus management**: After navigation, focus should move to `<main>` or the page `<h1>`. Astro does this by default with View Transitions, but verify:
  ```astro
  <script>
    document.addEventListener('astro:page-load', () => {
      const main = document.querySelector('main')
      if (main) main.focus()
    })
  </script>
  ```
- **Live region announcement**: Screen readers should announce the new page. The `<title>` change handles this in most readers.
- **Reduced motion**: Always honor `prefers-reduced-motion` (see animation section above)
- **Skip navigation**: The skip-to-main link should work on every page load

## Step 6: Common Patterns

### Back/Forward Navigation Direction

```astro
---
import { slide } from 'astro:transitions'
---
<main transition:animate={slide()}>
  <!-- Slides right on forward, left on back -->
  <slot />
</main>
```

### Page-Specific Transitions

```astro
---
// Blog detail page — slide in, photo page — fade
const animation = Astro.url.pathname.startsWith('/photos') ? 'fade' : 'slide'
---
<main transition:animate={animation}>
  <slot />
</main>
```

### Persistent Navigation with Active State

```astro
<nav transition:persist>
  <a href="/" class:list={[{ active: Astro.url.pathname === '/' }]}>Home</a>
  <a href="/blog" class:list={[{ active: Astro.url.pathname.startsWith('/blog') }]}>Blog</a>
</nav>

<script>
  document.addEventListener('astro:after-swap', () => {
    const links = document.querySelectorAll('nav a')
    links.forEach(link => {
      const href = link.getAttribute('href')
      link.classList.toggle('active',
        href === '/' ? location.pathname === '/' : location.pathname.startsWith(href!)
      )
    })
  })
</script>
```

### Opt-Out for Specific Links

```astro
<!-- Force full page reload (external links, download links) -->
<a href="/api/download" data-astro-reload>Download PDF</a>
```

## Self-Check

- [ ] Using `<ClientRouter />` (not the removed `<ViewTransitions />`)
- [ ] `transition:name` values are unique per page
- [ ] `prefers-reduced-motion` respected (animations disabled or minimized)
- [ ] Scripts re-initialize via `astro:page-load` (not inline `<script>` that runs once)
- [ ] Islands with important state use `transition:persist` or external stores
- [ ] Focus management works after navigation (focus moves to main content)
- [ ] Skip navigation link works on every page transition
- [ ] External/download links use `data-astro-reload`
- [ ] Custom animations only use `transform` and `opacity`
