---
name: micro-animations
description: Create hover effects, transitions, entrance/exit animations using paired subagent sparring. Triggers on "add animations", "hover effects", "add polish", "micro interactions", "make it feel alive".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit
---

# Micro Animations — Motion Design

Use paired subagent sparring to balance expressiveness vs. subtlety, cross-critique, and produce production CSS.

## Step 1: Gather Context

Ask the user (skip what's already known):
- Components to animate (buttons, cards, nav, modals, page transitions)
- Brand feel (snappy, smooth, luxurious, subtle, professional)
- Existing design tokens (read tokens file if it exists)
- Performance budget (heavy page = lightweight animations)

## Step 2: Spawn Agent Pair

**Agent A — "Expressive"**: Spring physics, overshoot easing, staggered sequences, scale transforms. Inspiration: Stripe, Linear, Vercel, Framer.

**Agent B — "Precise"**: Micro-translations (1-3px), opacity shifts, color transitions. Inspiration: Apple HIG, IBM Carbon, Radix.

Both MUST:
- Write real, working CSS (CSS Modules or custom properties)
- Custom `cubic-bezier()` easing — never just `ease` or `linear`
- All transitions under 400ms (most under 200ms)
- `@media (prefers-reduced-motion: reduce)` on everything
- Only `transform` and `opacity` (GPU-composited). Never animate `width`/`height`/`margin`/`padding`/`top`/`left`.
- Cover: hover, focus, active, enter, exit states
- Note CSS-only vs. JS-required animations

## Step 3: Cross-Critique

**Agent C**: Which of A's animations are too much? Keep best, trim excess.
**Agent D**: Which of B's are too subtle to notice? Keep precision, inject personality.

## Step 4: Present 2 Options

Each with: personality description, full CSS per component, easing values, timing.

## Step 5: Ask User & Iterate

## Step 6: Output Animation System

CSS custom properties:
```css
:root {
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --hover-lift: translateY(-2px);
  --press-down: translateY(1px) scale(0.98);
}
@media (prefers-reduced-motion: reduce) {
  :root { --duration-instant: 0ms; --duration-fast: 0ms; --duration-normal: 0ms; --duration-slow: 0ms; }
}
```

## Pattern Library Reference

**Hover**: lift (translateY + shadow), glow (box-shadow spread), fill (pseudo-element slide), scale (1.02 cards), underline reveal (width 0->100%)
**Enter**: fade-up (opacity+translateY), scale-in (0.95->1), stagger (50-100ms per child)
**Exit**: fade-down (faster than enter), scale-out, slide-out
**Feedback**: button press (scale 0.97), input focus (ring shadow), error shake (3 cycles, 300ms)
**Loading**: skeleton shimmer, SVG spinner (not border-hack), checkmark draw on success

## Anti-Patterns

- `transition: all` — specify properties explicitly
- `linear` easing for UI (robotic) — reserve for progress bars
- Hover delay (response must be instant; delay on hover-out is OK)
- Blocking interaction during animation
- Forgetting `prefers-reduced-motion`
