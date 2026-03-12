---
name: design-discovery
description: Pick fonts and colors for a project using paired subagent sparring. Triggers on "pick fonts", "choose colors", "design direction", "visual identity", "color palette".
allowed-tools: Agent, Read, Glob, Grep, WebSearch, WebFetch
---

# Design Discovery — Font & Color Selection

Paired subagent sparring: bold vs. refined, cross-critique, present 2-3 options. User has final say.

## Step 1: Gather Context

Ask the user (skip what's already known):
- Project type, target audience, mood adjectives
- Color scheme provided? Use as foundation.
- Existing brand assets (logo, colors, fonts)
- Competitors to differentiate from

## Step 2: Spawn Agent Pair — Independent Exploration

Launch **two subagents in parallel**:

**Agent A — "Bold"**: Distinctive, unconventional. Display/serif headings, unexpected color combos. Prioritize memorability.

**Agent B — "Refined"**: Polished, timeless. Clean sans-serifs, harmonious palettes. Prioritize readability and trust.

Both MUST:
- Verify fonts on Google Fonts (free) or note premium with free fallback
- Avoid: Inter, Roboto, Open Sans, Lato (overused). Try: Instrument Sans, Figtree, Fraunces, Geist, Space Grotesk, Bricolage Grotesque
- Use OKLCH for all color values (hex for final output only)
- WCAG AA contrast check (4.5:1 normal, 3:1 large)
- Light AND dark mode palette (dark = separate design, not inversion)
- Tinted neutrals (OKLCH chroma 0.01-0.02), never pure gray
- 60-30-10 split: 60% dominant, 30% secondary, 10% accent
- Name real-world inspiration (specific sites/brands)
- Propose: 1 heading font, 1 body font, full palette (primary, secondary, accent, neutrals, semantic)

## Step 3: Spawn Agent Pair — Cross-Critique

**Agent C**: Critique A using B's strengths. Keep distinctiveness, fix weaknesses.
**Agent D**: Critique B using A's strengths. Keep polish, add personality.

## Step 4: Synthesize 2-3 Options

Present each with: fonts, full palette (OKLCH + hex), dark mode, inspiration, what makes it stand out.

## Step 5: Ask User

- "Which direction resonates?"
- "Colors you love or hate?"
- "Typography feel more [X] or [Y]?"

Re-spar if major changes needed.

## Step 6: Output Design Tokens

Generate CSS custom properties (`:root` + `[data-theme="dark"]`):
- Colors in OKLCH with hex fallback
- Font families with metric-override fallbacks for FOUT prevention
- Fluid font sizes using `clamp()`

## Anti-Generic Rules

Agents MUST avoid:
- Generic blue SaaS (#3B82F6), Bootstrap/Tailwind defaults
- Purple-to-blue gradients, cyan-on-dark palettes
- Pure #000 on #FFF without nuance
- Gray text on colored backgrounds
- Cards-in-cards, glassmorphism as decoration
- Rounded rectangles with thick colored borders
- "Dark mode = just invert it"

Push toward: unexpected harmonious primaries, tinted neutrals, distinctive dark backgrounds.

## Step 7: AI Image Prompts (when user needs visual assets)

If the project needs hero images, illustrations, or social media assets:
- **Style consistency**: Reference the chosen design direction (bold/refined) in every prompt
- **Prompt structure**: `[Subject], [Style], [Mood], [Color palette reference], [Composition], [Technical: aspect ratio, no text]`
- **Negative prompts**: "no text, no watermarks, no stock photo feel, no AI artifacts"
- **Aspect ratios**: Hero 16:9, Social OG 1200x630, Square 1:1, Portrait 4:5
- **Batch consistency**: Include "consistent style with [previous image description]" in follow-up prompts
- Generate 3-5 prompt variants per asset need. Present to user for selection.

## Quality Gate

- [ ] Fonts on Google Fonts (with metric-override fallbacks)
- [ ] WCAG AA contrast passes
- [ ] Works in light + dark mode (dark is separate design)
- [ ] At least one option is genuinely distinctive
- [ ] Colorblind-safe
- [ ] Semantic colors included (success, warning, error, info)
- [ ] No icons added unless user requested them
