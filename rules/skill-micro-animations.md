# Skill: Micro Animations

## When to Trigger

Invoke this workflow when:
- Building interactive UI components that need polish
- The user asks for hover effects, transitions, entrance/exit animations
- Creating buttons, cards, modals, tooltips, navigation, or any interactive element
- The user says "add animations", "make it feel alive", "add polish", "micro interactions", etc.

## Process: Paired Subagent Sparring

Like the Design Discovery skill, this uses **paired subagents** that independently create animation sets, then critique each other to produce the best result.

### Step 1: Gather Context

Before spawning agents, identify:
- **Components to animate** — Which elements? (buttons, cards, nav items, modals, page transitions, etc.)
- **Existing design tokens** — Current colors, spacing, typography (animations should complement, not fight the design)
- **Brand feel** — Snappy and energetic? Smooth and luxurious? Subtle and professional?
- **Framework** — CSS Modules, Astro, Preact (determines implementation approach)
- **Performance budget** — Are we on a heavy page? Keep it lightweight? Or is this a hero section where we can go bigger?

If context is missing, ask the user.

### Step 2: Spawn Agent Pair — Independent Creation

Launch **two subagents simultaneously**:

**Agent A — "Expressive Motion"**
- Pushes toward more noticeable, delightful animations
- Explores spring physics, overshoot easing, staggered sequences, scale transforms
- Thinks about what makes award-winning sites feel premium
- Must produce complete CSS for every requested component
- Must include: hover, focus, active, enter, exit states where applicable
- Should reference or draw inspiration from sites known for excellent motion (Stripe, Linear, Vercel, Framer)

**Agent B — "Subtle Precision"**
- Leans toward barely-there, functional animations
- Focuses on easing curves, opacity shifts, micro-translations (1-3px), color transitions
- Thinks about what makes a UI feel responsive without being distracting
- Must produce complete CSS for every requested component
- Must include: hover, focus, active, enter, exit states where applicable
- Should reference or draw inspiration from design systems known for restraint (Apple HIG, IBM Carbon, Radix)

Both agents MUST:
- Write real, working CSS (CSS Modules format or CSS custom properties)
- Use `cubic-bezier()` custom easing — never just `ease` or `linear` for primary animations
- Keep all transitions under 400ms (most under 200ms)
- Include `@media (prefers-reduced-motion: reduce)` fallbacks that disable or simplify every animation
- Use `transform` and `opacity` only where possible (GPU-composited, no layout thrash)
- Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` (causes reflow)
- Consider animation on both mouse AND keyboard interaction (`:focus-visible`)
- Note which animations are CSS-only vs. which need JS (e.g., staggered children, scroll-triggered)

### Step 3: Spawn Agent Pair — Cross-Critique (Sparring Round)

Launch **two new subagents simultaneously**, each receiving BOTH animation sets:

**Agent C — Reviews Agent A through Agent B's lens**
- Which of Agent A's animations are too much? Distracting? Slow?
- Where does Agent A's expressiveness genuinely improve the UX?
- Propose a merged version: keep the best of A's personality, trim the excess
- Refine easing curves and timing to be production-ready

**Agent D — Reviews Agent B through Agent A's lens**
- Which of Agent B's animations are too subtle to notice? Too boring?
- Where does Agent B's restraint actually make the UI feel dead?
- Propose a merged version: keep B's precision, inject personality where it's missing
- Suggest 1-2 "signature" animations that give the UI character

### Step 4: Present Animation Options to User

Show **2 options** with full code:

```
## Option 1: [Name — e.g., "Energetic Precision"]
Personality: [1-sentence description]

### Button Hover
- Transform: translateY(-1px), subtle shadow lift
- Easing: cubic-bezier(0.34, 1.56, 0.64, 1) — slight overshoot
- Duration: 150ms
- Code: [full CSS]

### Card Hover
...

### Modal Enter/Exit
...

### Navigation Item
...

## Option 2: [Name — e.g., "Quiet Confidence"]
...
```

### Step 5: User Feedback Loop

Present and ask:
- "Which set feels right for this project?"
- "Any specific animations you want more/less of?"
- "Should I mix elements from both options?"
- "Any components I missed that need animation?"

Iterate based on feedback. Re-spar if needed.

### Step 6: Generate Final Animation System

Once approved, output as a complete, reusable animation system:

```css
/* ============================================
   Animation Tokens (custom properties)
   ============================================ */
:root {
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-enter: 250ms;
  --duration-exit: 200ms;

  /* Easing curves */
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.27, 1.55);

  /* Transforms */
  --hover-lift: translateY(-2px);
  --hover-lift-subtle: translateY(-1px);
  --press-down: translateY(1px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
    --duration-enter: 0ms;
    --duration-exit: 0ms;
  }
}
```

Plus individual component animation classes/modules.

## Animation Library: Common Patterns

### Hover Effects
- **Lift** — `translateY(-2px)` + box-shadow increase
- **Glow** — `box-shadow` color spread on hover
- **Fill** — Background color slides in from left/bottom via pseudo-element
- **Scale** — Subtle `scale(1.02)` on cards, `scale(1.05)` on thumbnails
- **Color shift** — Smooth background/text color transition
- **Underline reveal** — Pseudo-element width animates from 0 to 100%

### Entrance Animations
- **Fade up** — `opacity: 0` + `translateY(8px)` to `opacity: 1` + `translateY(0)`
- **Fade in** — Simple opacity transition
- **Scale in** — `scale(0.95)` + `opacity: 0` to `scale(1)` + `opacity: 1`
- **Slide in** — From off-screen edge with deceleration easing
- **Stagger** — Sequential delay on child elements (50-100ms between items)

### Exit Animations
- **Fade down** — Reverse of fade up (faster — exits should be quicker than entrances)
- **Scale out** — `scale(0.95)` + `opacity: 0`
- **Slide out** — Toward edge with acceleration easing

### Interactive Feedback
- **Button press** — `scale(0.97)` on `:active`
- **Input focus** — Border color + subtle ring shadow transition
- **Toggle** — Smooth thumb slide with spring easing
- **Checkbox** — Scale pop + checkmark draw (SVG stroke-dashoffset)
- **Ripple** — Radial expansion from click point (needs JS)

### Loading & State
- **Skeleton pulse** — Shimmer gradient animation on placeholder blocks
- **Spinner** — Rotating arc (use SVG, not border-hack)
- **Progress** — Width transition with easing
- **Success** — Checkmark draw + green flash
- **Error shake** — Short horizontal oscillation (3 cycles, 300ms total)

## Performance Rules

- Only animate `transform` and `opacity` (composited by GPU)
- Use `will-change` sparingly and only on elements that will definitely animate
- Remove `will-change` after animation completes (if set via JS)
- Never animate layout properties (`width`, `height`, `margin`, `padding`, `top`, `left`)
- Test on low-end devices — 60fps or it gets simplified
- `contain: layout` on animated containers to limit repaint scope
- Prefer CSS animations over JS for simple transitions
- Use JS only for: staggered sequences, scroll-triggered, physics-based, or interactive animations

## Anti-Patterns

- Animations longer than 400ms for UI interactions (feels sluggish)
- Easing: never plain `linear` for UI motion (feels robotic) — reserve for progress bars
- Animating everything — restraint is what makes key animations noticeable
- Blocking user interaction during animations (user should always be able to click/type)
- Forgetting `prefers-reduced-motion` — mandatory, not optional
- Using `transition: all` — animate specific properties only (performance + predictability)
- Delays on hover effects — hover response should be instant (delay on hover-out is OK)
