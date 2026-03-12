---
name: design-discovery
description: Pick fonts and colors for a project using paired subagent sparring. Triggers on "pick fonts", "choose colors", "design direction", "visual identity", "color palette".
allowed-tools: Agent, Read, Glob, Grep, WebSearch, WebFetch
---

# Design Discovery — Font & Color Selection

Use paired subagent sparring to explore bold vs. refined directions, cross-critique, and present 2-3 options. User has final say.

## Step 1: Gather Context

Ask the user (skip what's already known):
- Project type (SaaS, marketing site, portfolio, e-commerce, etc.)
- Target audience
- Mood adjectives (bold, minimal, luxurious, techy, warm, etc.)
- Color scheme provided? If yes, use as foundation.
- Existing brand assets (logo, colors, fonts)
- Competitors to differentiate from

## Step 2: Spawn Agent Pair — Independent Exploration

Launch **two subagents in parallel**:

**Agent A — "Bold"**: Distinctive, unconventional. Display/serif headings, unexpected color combos. Prioritize memorability.

**Agent B — "Refined"**: Polished, timeless. Clean sans-serifs, harmonious palettes. Prioritize readability and trust.

Both MUST:
- Verify fonts on Google Fonts (free) or note premium with free fallback
- Exact hex/HSL for every color
- WCAG AA contrast check (4.5:1 normal, 3:1 large)
- Light AND dark mode palette
- Name real-world inspiration (specific sites/brands)
- Propose: 1 heading font, 1 body font, full palette (primary, secondary, accent, neutrals, semantic)

## Step 3: Spawn Agent Pair — Cross-Critique

**Agent C**: Critique A using B's strengths. Merge: keep A's distinctiveness, fix weaknesses.
**Agent D**: Critique B using A's strengths. Merge: keep B's polish, add personality.

## Step 4: Synthesize 2-3 Options

Present each with: fonts, full palette (hex), dark mode adjustments, inspiration, what makes it stand out.

## Step 5: Ask User

- "Which direction resonates?"
- "Colors you love or hate?"
- "Typography feel more [X] or [Y]?"

Re-spar if major changes needed.

## Step 6: Output Design Tokens

Generate CSS custom properties (`:root` + `[data-theme="dark"]`): colors, font families, fluid font sizes.

## Anti-Generic Rules

When no color scheme provided, agents MUST avoid:
- Generic blue SaaS (#3B82F6 — the "every startup" palette)
- Default Bootstrap/Tailwind colors
- Pure #000 on #FFF without nuance
- "Dark mode = just invert it"

Push toward: unexpected harmonious primaries, tinted neutrals, distinctive dark backgrounds.

## Quality Gate

- [ ] Fonts on Google Fonts
- [ ] WCAG AA contrast passes
- [ ] Works in light + dark mode
- [ ] At least one option is genuinely distinctive
- [ ] Colorblind-safe
- [ ] Semantic colors included (success, warning, error, info)
