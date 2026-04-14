---
name: code-consistency
description: Inspect codebase for consistency issues across packages, naming conventions, patterns, and shared tokens. Triggers on "consistency check", "code consistency", "inspect consistency", "pattern check", "convention check".
allowed-tools: Agent, Read, Glob, Grep
---

# Code Consistency Inspection

Systematic cross-package and intra-package consistency audit. Finds drift between conventions, naming mismatches, duplicated logic, and token/config desync. Report-only — does NOT auto-fix.

## Step 1: Determine Scope

If not specified, inspect the full project. Otherwise narrow to what the user asks:
- Specific packages (e.g., web only, mobile only)
- Specific concern (naming, tokens, imports, patterns)

Read `.claude/stack.md` and `CLAUDE.md` first — these define the source of truth for conventions.

## Step 2: Spawn Inspection Agents

Launch **parallel subagents** by concern:

**Agent A — "Naming & Conventions"**:
- File naming: consistent casing across packages (kebab-case, PascalCase, camelCase)
- Export naming: default vs named exports — is there a dominant pattern per package?
- Function/variable naming: camelCase for functions, PascalCase for components/types, SCREAMING_SNAKE for constants
- Directory structure: parallel structure across packages where applicable
- TypeScript: consistent use of `type` vs `interface`, consistent use of `as const`

**Agent B — "Design Tokens & Theming"**:
- Color tokens: are hex values from the design system used consistently (not hardcoded alternatives)?
- Typography: DM Serif Display for headings, DM Sans for body — verify no rogue font families
- Spacing: consistent use of spacing tokens vs magic numbers
- Token sync: do web (Tailwind `@theme`) and mobile (unistyles) define the same tokens?
- Dark/light mode: tokens applied consistently, no raw color values in components

**Agent C — "Patterns & Architecture"**:
- Import style: relative vs alias paths — is there one pattern per package?
- Error handling: consistent pattern across API routes, components, and hooks
- State management: consistent approach within each package (nanostores for web, unistyles for mobile)
- API response shapes: consistent `{ error, message }` or equivalent across all endpoints
- Component structure: consistent ordering of imports, types, state, effects, render
- Shared logic: any duplicated utilities, types, or constants that should live in a shared package

**Agent D — "Configuration & Tooling"**:
- tsconfig: consistent compiler options across packages (strictness, target, module)
- Linting: same rules applied across packages, no package-specific overrides that cause drift
- Dependencies: same library versions across packages (e.g., `three`, `react`, TypeScript)
- Package.json scripts: consistent naming conventions across workspaces

## Step 3: Evidence Collection

Every finding MUST include:
- **Location**: exact file paths (both sides of an inconsistency)
- **Evidence**: the conflicting code snippets or config values
- **Pattern**: what the dominant convention is and what deviates from it
- **Severity**: Drift (actively harmful) / Inconsistency (confusing) / Nit (cosmetic)

No findings without evidence. "Feels inconsistent" is not a finding.

## Step 4: Identify the Dominant Pattern

For each finding, determine which side is the convention and which is the deviation:
- If CLAUDE.md or stack.md specifies a convention, that's authoritative
- If linter/formatter config enforces a pattern, that's authoritative
- Otherwise, majority rules — the most common pattern is the convention, outliers are deviations

## Step 5: Report

```
# Code Consistency Report

## Drift (N)
[Actively harmful — different behavior across packages or breaks conventions defined in CLAUDE.md]

## Inconsistencies (N)
[Confusing — same thing done different ways without reason]

## Nits (N)
[Cosmetic — wouldn't flag in review but worth knowing]

## Consistent Areas
[What's already well-aligned — brief]

## Verdict: [CONSISTENT / MINOR DRIFT / NEEDS ALIGNMENT]
```

Rules:
- Always show both sides of an inconsistency with file paths and line numbers.
- Group findings by category (naming, tokens, patterns, config).
- Prioritize: drift > inconsistency > nit.
- If a finding spans multiple files, list all affected files.
- Do NOT flag intentional platform differences (e.g., mobile uses StyleSheet, web uses CSS Modules — that's expected).
- Do NOT flag differences that are enforced by different runtimes (Bun vs Node vs Metro).
