# Skill: Design Discovery (Fonts & Colors)

## When to Trigger

Invoke this workflow when:
- Starting a new project's visual identity
- The user asks to pick fonts, colors, or a color scheme
- A project has no established design tokens yet
- The user says "pick a design direction", "choose a palette", "find fonts", etc.

## Process: Paired Subagent Sparring

This skill uses **two subagents working in parallel** that independently generate ideas, then critique each other's work to converge on a superior result. The user has final say.

### Step 1: Gather Context

Before spawning agents, collect:
- **Project type** — SaaS dashboard, marketing site, e-commerce, blog, tool, etc.
- **Target audience** — Developers, businesses, consumers, creatives, etc.
- **Mood / adjectives** — Professional, playful, bold, minimal, luxurious, techy, warm, etc.
- **Color scheme provided?** — If yes, use it as the foundation. If no, generate from scratch.
- **Existing brand assets?** — Logo, existing colors, fonts already in use
- **Competitors to differentiate from** — What should this NOT look like?

If context is missing, ask the user before proceeding.

### Step 2: Spawn Agent Pair — Independent Exploration

Launch **two subagents simultaneously** with the same brief but different creative directions:

**Agent A — "The Bold One"**
- Leans toward distinctive, unconventional choices
- Explores display/serif fonts for headings, unexpected color combinations
- Prioritizes standing out and memorability
- Searches for trending design references, award-winning sites, unique palettes
- Must propose: 1 heading font, 1 body font, full color palette (primary, secondary, accent, neutrals, semantic colors), reasoning for each choice

**Agent B — "The Refined One"**
- Leans toward polished, timeless choices
- Explores clean sans-serifs, sophisticated pairings, harmonious palettes
- Prioritizes readability, trust, and elegance
- Searches for proven design systems, typography best practices, color theory
- Must propose: 1 heading font, 1 body font, full color palette (primary, secondary, accent, neutrals, semantic colors), reasoning for each choice

Both agents MUST:
- Verify fonts are available on Google Fonts (free) or suggest premium alternatives with free fallbacks
- Provide exact hex/HSL values for every color
- Check WCAG AA contrast for all text/background combinations (4.5:1 normal, 3:1 large)
- Show the palette in both light and dark mode
- Explain why their choices stand out from generic/default designs
- Reference real-world inspiration (name specific sites, brands, or design systems)

### Step 3: Spawn Agent Pair — Cross-Critique (Sparring Round)

Launch **two new subagents simultaneously**, each receiving BOTH proposals:

**Agent C — Critiques Agent A's proposal using Agent B's strengths**
- What does Agent A's bold direction sacrifice in readability or professionalism?
- Where would Agent B's choices actually serve the project better?
- Propose a merged alternative that keeps Agent A's distinctiveness but addresses weaknesses
- Output: refined proposal with specific changes and justifications

**Agent D — Critiques Agent B's proposal using Agent A's strengths**
- What does Agent B's refined direction sacrifice in memorability or personality?
- Where would Agent A's choices actually serve the project better?
- Propose a merged alternative that keeps Agent B's polish but adds distinctiveness
- Output: refined proposal with specific changes and justifications

### Step 4: Synthesize & Present to User

Combine the sparring results into **2-3 final options** presented as:

```
## Option 1: [Name — e.g., "Bold Contrast"]
- Heading font: [Font Name] — [why]
- Body font: [Font Name] — [why]
- Palette:
  - Primary: #XXXXXX — [usage]
  - Secondary: #XXXXXX — [usage]
  - Accent: #XXXXXX — [usage]
  - Neutrals: #XXX, #XXX, #XXX, #XXX, #XXX
  - Success/Warning/Error/Info: #XXX, #XXX, #XXX, #XXX
- Dark mode adjustments: [specifics]
- Inspiration: [references]
- Stands out because: [what makes this not look like every other SaaS]

## Option 2: [Name]
...

## Option 3: [Name — hybrid/wildcard]
...
```

### Step 5: User Feedback Loop

Present options and ask:
- "Which direction resonates? Or should I combine elements from multiple options?"
- "Any colors you love or hate?"
- "Should the typography feel more [X] or [Y]?"

Iterate based on feedback. Spawn another sparring pair if the user wants significant changes.

### Step 6: Generate Design Tokens

Once approved, output as CSS custom properties:

```css
:root {
  /* Colors */
  --color-primary: #XXXXXX;
  --color-primary-hover: #XXXXXX;
  --color-secondary: #XXXXXX;
  /* ... full palette ... */

  /* Typography */
  --font-heading: 'Font Name', fallback, sans-serif;
  --font-body: 'Font Name', fallback, sans-serif;
  --font-mono: 'Font Name', monospace;

  /* Font sizes (fluid) */
  --text-xs: clamp(0.75rem, ...);
  --text-sm: clamp(0.875rem, ...);
  /* ... */
}

[data-theme="dark"] {
  --color-primary: #XXXXXX;
  /* ... dark overrides ... */
}
```

## When No Color Scheme is Provided

If the user gives no color direction, the agents MUST avoid:
- Generic blue SaaS (#3B82F6 and friends — the "every startup" palette)
- Default Bootstrap/Tailwind colors
- Pure black (#000) on white (#FFF) without nuance
- The "dark mode = just invert it" trap

Instead, push toward:
- Unexpected but harmonious primaries (deep teals, warm ambers, rich plums, electric greens)
- Intentional neutral tones (warm grays, cool slates, tinted backgrounds)
- Accent colors that pop against the primary without clashing
- Distinctive dark mode that isn't just "gray boxes" — consider tinted dark backgrounds

## Quality Checklist

Before presenting to the user, verify:
- [ ] All fonts available on Google Fonts (or premium with free fallback noted)
- [ ] WCAG AA contrast ratios pass for all text/background combos
- [ ] Palette works in both light and dark mode
- [ ] At least one option is genuinely distinctive (not generic SaaS)
- [ ] Color-blind safe (test with deuteranopia, protanopia simulators)
- [ ] Semantic colors (success, warning, error, info) are included
- [ ] Font pairing has clear hierarchy (heading vs body are visually distinct)
