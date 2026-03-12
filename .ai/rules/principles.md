# Universal Principles

## Project Stack

**On first interaction with any project, check for `.claude/stack.md`. If it doesn't exist, run the `stack-detect` skill before doing anything else.** Never assume a stack.

If the user's question relates to a domain rule that wasn't auto-loaded by file path, read the relevant rule file before answering.

Preferences for NEW projects only (no existing codebase):
- Runtime: Bun. Frontend: Astro 6 + Preact. Styling: CSS Modules. State: Nanostores.
- Backend: Hono. Database: PostgreSQL 16 + Drizzle ORM. Lint: Oxlint + Prettier.

**Always defer to detected stack in `.claude/stack.md` or project CLAUDE.md.**

## Hard Constraints

- **No icons/emojis/decorative elements** unless user explicitly requests them. Text-only by default.
- CSS custom properties for theming — never hardcode colors/spacing
- OKLCH for color definitions — not HSL, not hex (hex for final output only)
- Light + dark mode: design and validate both simultaneously
- Mobile-first: `min-width` media queries
- Only animate `transform` and `opacity` — never layout properties
- `@media (prefers-reduced-motion: reduce)` on all non-essential animation

## Anti-AI-Slop

- No Inter/Roboto defaults without explicit user choice
- No purple-to-blue gradients, no cyan-on-dark palettes
- No cards-in-cards, no center-aligned everything
- Tinted neutrals (OKLCH chroma 0.01-0.02), never pure gray

## Workflow

- Only change what was asked. No drive-by refactors.
- Read existing code before modifying.
- If unsure, ask. Do not assume.
