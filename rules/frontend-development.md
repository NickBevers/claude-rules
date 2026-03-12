# Frontend Development Rules

## Framework Preferences

- **Astro** for multi-page apps and content-heavy sites (islands architecture)
- **Preact** for interactive islands (lighter than React, compatible API)
- Use `preact/compat` only when a library requires React (e.g., VisX charts)
- Never use full React when Preact suffices

## Component Architecture

- Astro pages in `.astro` files, interactive components in `.tsx` (Preact)
- Marketing/static pages: pre-rendered at build time (static output)
- App pages: server islands for dynamic content (SSR)
- Keep components small and focused — one responsibility per component
- Colocate component, styles, and tests in the same directory when possible

## Styling

- **CSS Modules** (`.module.css`) — scoped by default, no runtime cost
- Never use inline styles for anything beyond truly dynamic values
- Never use `!important` — fix specificity issues properly
- Support both light and dark mode — validate all visual components in both
- Use CSS custom properties (variables) for theming
- Mobile-first responsive design with `min-width` media queries

## State Management

- State shared across islands MUST use **Nanostores** (`@nanostores/preact`)
- Local component state: Preact's `useState` / `useReducer`
- Never prop-drill more than 2 levels — extract to a nanostore instead
- Never use React Context in Preact islands (use nanostores)

## Icons

- Use **Tabler Icons** (`@tabler/icons-preact`)
- Import individual icons, NEVER import the full icon set
- Example: `import { IconSearch } from '@tabler/icons-preact'`

## Charts & Data Visualization

- Use **VisX** (Airbnb) — SVG-based, built on D3
- Requires `preact/compat` alias in bundler config
- Validate chart rendering in both light and dark mode
- Ensure charts are responsive and handle empty/loading states gracefully

## Performance

- Minimize JavaScript sent to the client — use Astro islands to hydrate only what's interactive
- Lazy-load components below the fold
- Optimize images (use Astro's built-in image optimization)
- Avoid layout shifts — set explicit dimensions on media elements

## Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, etc.)
- Images need alt text, decorative images use `alt=""`
- Form inputs need associated labels
- Color alone should never convey meaning — use icons or text alongside
- Maintain sufficient color contrast (WCAG AA minimum)

## Imports & Dependencies

- Prefer native browser APIs over npm packages when possible
- Audit bundle size impact before adding new frontend dependencies
- Tree-shake aggressively — named imports only, no barrel file re-exports
