---
name: micro-animations
description: Create hover effects, transitions, entrance/exit animations using paired subagent sparring. Triggers on "add animations", "hover effects", "add polish", "micro interactions", "make it feel alive".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit
---

# Micro Animations — Motion Design

Paired subagent sparring: expressive vs. precise, cross-critique, produce production CSS.

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
- Write real CSS (CSS Modules or custom properties)
- Custom `cubic-bezier()` easing — never `ease` or `linear`
- Duration: 100ms micro, 200-300ms standard, 500ms complex
- `@media (prefers-reduced-motion: reduce)` on everything
- Only `transform` and `opacity`. Never layout properties.
- `grid-template-rows: 0fr → 1fr` for height animations
- Cover: hover, focus-visible, active, enter, exit states
- No decorative icons or emojis unless user requested

## Step 3: Cross-Critique

**Agent C**: Which of A's are too much? Trim excess.
**Agent D**: Which of B's are too subtle? Inject personality.

## Step 4: Present 2 Options

Each with: personality description, full CSS per component, easing values, timing.

## Step 5: Ask User & Iterate

## Step 6: Output Animation System

```css
:root {
  --duration-micro: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-complex: 500ms;
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --hover-lift: translateY(-2px);
  --press-down: translateY(1px) scale(0.98);
}
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-micro: 0ms; --duration-fast: 0ms;
    --duration-normal: 0ms; --duration-slow: 0ms;
    --duration-complex: 0ms;
  }
}
```

## Pattern Library

**Hover**: lift, glow, fill, scale (1.02), underline reveal (scaleX)
**Enter**: fade-up, scale-in, stagger (50-100ms/child)
**Exit**: fade-down (faster), scale-out, slide-out
**Feedback**: press (0.97), focus ring, error shake (3 cycles)
**Loading**: skeleton shimmer, SVG spinner, checkmark draw
**Height**: `grid-template-rows: 0fr → 1fr`

## Anti-Patterns

- `transition: all`, `linear` easing for UI, hover delay, blocking interaction, missing `prefers-reduced-motion`, bounce/elastic easing
