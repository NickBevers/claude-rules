---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces. Triggers on "build page", "create component", "design UI", "build layout", "create interface", "build landing page".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# Frontend Design — Distinctive UI Creation

Build production-grade interfaces that pass the AI slop test. Text-only by default — no icons unless user requests them.

## Step 1: Gather Context

Before writing any code, establish:
- What is being built (page, component, section)
- Who is it for (audience, brand context)
- Existing design tokens / CSS custom properties (read if available)
- Reference sites or aesthetic direction (if provided)

If confidence is low, ask clarifying questions.

## Step 2: Commit to an Aesthetic Direction

Choose a BOLD direction — not safe defaults:
- Brutally minimal, editorial, neo-brutalist, retro-futuristic, organic/warm

State the chosen direction explicitly before coding.

## Step 3: Build with Anti-Slop Awareness

**Typography**: No Inter/Roboto defaults. Fluid `clamp()` sizes. Clear hierarchy.
**Color**: OKLCH. Tinted neutrals. 60-30-10. Dark mode as separate design.
**Layout**: Grid for structure, Flexbox for alignment. No cards-in-cards. Asymmetry is a tool.
**Spacing**: 4px scale tokens. Generous whitespace.
**States**: default, hover, focus-visible, active, disabled. `:focus-visible`, never `outline: none`.
**No icons** unless user explicitly requested them.

## Step 4: Code Standards

- Astro (`.astro`) + Preact islands (`.tsx`) for interactive parts
- CSS Modules (`.module.css`). CSS custom properties for theme values.
- Mobile-first. `prefers-reduced-motion`. Semantic HTML. WCAG AA contrast.

## Step 5: Self-Audit

- [ ] Passes AI slop test?
- [ ] No default fonts, no pure gray, no auto-added icons?
- [ ] Dark mode is separate design?
- [ ] Focus states visible? Mobile works? Reduced-motion fallback?
