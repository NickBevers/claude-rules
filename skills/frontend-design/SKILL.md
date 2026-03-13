---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces. Triggers on "build page", "create component", "design UI", "build layout", "create interface", "build landing page".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Frontend Design — Distinctive UI Creation

Build production-grade interfaces that pass the AI slop test. Use Tabler Icons by default unless user specifies a different set.

## Step 1: Gather Context

Before writing any code, establish:
- What is being built (page, component, section)
- Who is it for (audience, brand context)
- Existing design tokens / CSS custom properties (read if available)
- Reference sites or aesthetic direction (if provided)

If confidence in direction is low, ask clarifying questions.

## Step 2: Commit to an Aesthetic Direction

Choose a BOLD direction — not safe defaults. Options include:
- Brutally minimal (whitespace as design element, typography-driven)
- Editorial (magazine-influenced, asymmetric grids, strong type hierarchy)
- Neo-brutalist (raw, exposed structure, visible grid)
- Retro-futuristic (vintage color palettes, modern layout)
- Organic/warm (natural colors, flowing shapes, soft edges)

State the chosen direction explicitly before coding.

### Landing Page Narrative Structure (when building landing/marketing pages)

Build a visual story arc, not just stacked sections:
1. **Hero**: Bold statement + one clear CTA. No generic "Welcome to..."
2. **Problem**: What pain does the audience feel? Make them nod.
3. **Solution**: How this product/service resolves it. Show, don't list.
4. **Proof**: Social proof, metrics, testimonials, logos. Real data preferred.
5. **How It Works**: 3-step simplification (if applicable)
6. **Differentiation**: Why this, not competitors? Unique angle.
7. **CTA repeat**: Same CTA as hero, different framing.

Each section should have a distinct visual rhythm — vary layout patterns, don't repeat the same grid.

## Step 3: Build with Anti-Slop Awareness

**Typography**: No Inter/Roboto defaults. Use project fonts or distinctive alternatives. Fluid `clamp()` sizes. Clear heading hierarchy (3-4 levels max).

**Color**: OKLCH values. Tinted neutrals (chroma 0.01-0.02). 60-30-10 ratio. Dark mode as separate design, not inversion.

**Layout**: CSS Grid for structure, Flexbox for alignment. No cards-in-cards. No center-aligned-everything. Asymmetry is a tool. Use `auto-fit`/`minmax()` for responsive grids.

**Spacing**: 4px scale tokens. Generous whitespace — let content breathe. Group related elements, separate unrelated ones.

**States**: Every interactive element needs: default, hover, focus-visible, active, disabled. Use `:focus-visible`, never `outline: none`.

**Content**: Placeholders should feel real — use realistic copy lengths, not "Lorem ipsum". Show empty states, loading states, error states.

**Icons**: Tabler Icons by default. Use icons where they aid comprehension (navigation, actions, status). No purely decorative icons. User can override with a different icon set.

## Step 4: Code Standards

- Astro pages (`.astro`) + Preact islands (`.tsx`) for interactive parts
- CSS Modules (`.module.css`) for all styling
- CSS custom properties for all theme values
- Mobile-first: `min-width` media queries
- `@media (prefers-reduced-motion: reduce)` on animations
- `loading="lazy"` + `decoding="async"` on below-fold images
- Semantic HTML: `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<article>`
- WCAG AA contrast on all text

## Step 5: Self-Audit Before Presenting

- [ ] Would someone say "AI made this"? If yes, make it more distinctive.
- [ ] Typography has clear hierarchy and is not a default font?
- [ ] Colors are tinted, not pure gray/black/white?
- [ ] Dark mode is a separate design, not inverted?
- [ ] Icons are functional (aid comprehension), not purely decorative?
- [ ] Layout has intentional asymmetry or structure, not generic cards?
- [ ] All interactive elements have visible focus states?
- [ ] Mobile layout works (min-width queries)?
- [ ] Reduced-motion fallback exists?
