# Claude Rules

Personal AI coding agent configuration for a freelance frontend creative developer. Claude Code native format with a built-in conversion step for Windsurf, Copilot, and Aider.

## Add to an Existing Project

Already have a codebase? Run one command to copy the rules into it:

```bash
cd your-project

# Pick your package manager — all work the same
bunx @nickbevers/claude-rules init
npx @nickbevers/claude-rules init
pnpm dlx @nickbevers/claude-rules init
yarn dlx @nickbevers/claude-rules init
```

This copies three things into your project root:

| What                | Where        | Effect                                                      |
| ------------------- | ------------ | ----------------------------------------------------------- |
| `CLAUDE.md`         | Project root | Always-on rules (~68 lines), loaded every interaction       |
| `rules/*.md`        | `rules/`     | Path-scoped rules, loaded only when touching matching files |
| `skills/*/SKILL.md` | `skills/`    | On-demand skills, zero cost until triggered                 |

Running `init` is safe on existing projects — it merges and adds, never overwrites:

- **`CLAUDE.md`** — if one already exists, the global rules are merged on top and your project-specific content is preserved below a `# --- Project Rules ---` marker. Re-running `init` updates the global section while keeping your project rules intact.
- **`rules/`** — new rule files are added by name. Existing rules you've customized are kept as-is.
- **`skills/`** — new skills are added by name. Existing skills are kept as-is.

After init, add any project-specific configuration below the `# --- Project Rules ---` marker in `CLAUDE.md`, then commit the `rules/` and `skills/` directories alongside your code.

### Re-running init (updating an existing project)

Running `init` again is safe and encouraged when new rules or skills are added upstream:

```bash
bunx @nickbevers/claude-rules init
```

**What happens:**

| Component | First run | Re-run |
|---|---|---|
| `CLAUDE.md` (no existing) | Copied from package | — |
| `CLAUDE.md` (existing) | Merged: global rules on top + project rules below marker | Global section updated, project rules preserved |
| `rules/frontend.md` (new) | Added | — |
| `rules/frontend.md` (exists) | Kept as-is | Kept as-is |
| `skills/code-review/` (new) | Added | — |
| `skills/code-review/` (exists) | Kept as-is | Kept as-is |

### Force re-init (overwrite everything)

If you want to reset all rules and skills to the latest package versions — for example after a major update — use `--force`:

```bash
bunx @nickbevers/claude-rules init --force
```

This overwrites all existing rule and skill files with the package versions and re-merges `CLAUDE.md` (your project-specific rules below the `# --- Project Rules ---` marker are still preserved).

The merged `CLAUDE.md` looks like this:

```markdown
# Global Rules
... (package global rules, updated on each init) ...

# --- Project Rules ---

... (your project-specific rules, never touched by init) ...
```

### Also using Windsurf, Copilot, or Aider?

```bash
# Add another agent during init
bunx @nickbevers/claude-rules init claude windsurf

# Or all at once
bunx @nickbevers/claude-rules init all
```

Or convert later from an existing project that already has `rules/`:

```bash
bunx @nickbevers/claude-rules convert cursor       # -> .cursorrules
bunx @nickbevers/claude-rules convert windsurf     # -> .windsurfrules
bunx @nickbevers/claude-rules convert copilot      # -> .github/copilot-instructions.md
bunx @nickbevers/claude-rules convert aider        # -> .aider.conf.yml + CONVENTIONS.md
bunx @nickbevers/claude-rules convert all          # All of the above
```

Replace `bunx` with `npx`, `pnpm dlx`, or `yarn dlx` as needed.

The conversion strips YAML frontmatter from `rules/` and `skills/`, concatenates into the flat format each agent expects, and appends agent-specific guidance automatically.

## Start a New Project with These Defaults

Two approaches depending on whether you want rules applied globally or per-project.

### Global Install (all projects get these rules)

```bash
git clone git@github.com:NickBevers/claude-rules.git ~/.config/claude-rules
~/.config/claude-rules/setup.sh
```

This creates three symlinks in `~/.claude/`:

| Symlink               | Target      | Purpose                       |
| --------------------- | ----------- | ----------------------------- |
| `~/.claude/CLAUDE.md` | `CLAUDE.md` | Always-on global rules        |
| `~/.claude/rules/`    | `rules/`    | Path-scoped conditional rules |
| `~/.claude/skills/`   | `skills/`   | On-demand skills              |

Every Claude Code session on this machine now loads these rules. No per-project setup needed.

To uninstall: `~/.config/claude-rules/setup.sh --uninstall`

### Per-Project Install (rules live in the repo)

```bash
mkdir my-project && cd my-project
git init
bunx @nickbevers/claude-rules init
```

Then edit `CLAUDE.md` to define your project's stack:

```markdown
## Project Stack

- Runtime: Bun
- Frontend: Astro 6 + Preact
- Styling: CSS Modules
- Backend: Hono
- Database: PostgreSQL 16 + Drizzle ORM
```

Commit everything — teammates and CI get the same rules automatically.

## How It Works

### Three Loading Tiers

The system is designed around Claude Code's context window — every token in always-on rules costs on every interaction AND every subagent spawn.

**Tier 1 — Always-On (`CLAUDE.md`, ~68 lines)**

Loaded on every single interaction. Contains only:

- Stack defaults (Bun, Astro, Preact, CSS Modules, etc.)
- Rule index for cross-context loading
- Hard constraints Claude gets wrong without them (OKLCH colors, animation performance, Tabler Icons default)
- Anti-AI-slop guardrails (no generic gradients, no pure grays, tinted neutrals)
- Workflow rules (no drive-by refactors, ask when unsure)
- Subagent sparring instructions

**Tier 2 — Path-Scoped Rules (`rules/`, ~676 lines total, ~26-79 per file)**

Each file has YAML `paths:` frontmatter. Claude Code only loads them when touching matching files. Editing a `.tsx` file loads `frontend.md` and `design.md` but NOT `backend.md`, `database.md`, or `security.md`.

| Rule File        | Triggers On                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| `frontend.md`    | `*.tsx`, `*.astro`, `*.module.css`, `components/`, `pages/`, `layouts/` |
| `design.md`      | `*.module.css`, `*.css`, `tokens*`, `theme*`, `design*`                 |
| `backend.md`     | `api/`, `routes/`, `services/`, `middleware/`, `*.server.ts`            |
| `database.md`    | `drizzle/`, `*schema*`, `*migration*`, `*.sql`, `db/`                   |
| `security.md`    | `auth/`, `session*`, `*guard*`, `*crypt*`, `*password*`                 |
| `testing.md`     | `*.test.*`, `*.spec.*`, `e2e/`, `vitest*`, `playwright*`                |
| `devops.md`      | `Dockerfile*`, `docker-compose*`, `deploy*`, `.github/`                 |
| `git.md`         | `.gitignore`, `.gitattributes`, `.github/`                              |
| `laravel.md`     | `*.php`, `livewire/`, `*.blade.php`, `composer.json`                    |
| `compliance.md`  | `privacy*`, `cookie*`, `consent*`, `gdpr*`, `legal*`                    |
| `incident.md`    | `incident*`, `postmortem*`, `runbook*`, `status*`, `ops/`               |
| `copywriting.md` | `components/`, `pages/`, `content/`, `copy*`, `*.astro`                 |
| `ticketing.md`   | `.claude/tickets/`                                                      |
| `planning.md`    | `.claude/research/`, `decisions*`, `architecture*`                      |
| `research.md`    | `.claude/research/`, `spike*`                                           |

**Tier 3 — On-Demand Skills (`skills/`, zero cost until triggered)**

Proper Claude Code skills with `SKILL.md` + YAML frontmatter. Only loaded when invoked by name or when Claude's description matching triggers them.

| Skill                    | Triggers On                                         |
| ------------------------ | --------------------------------------------------- |
| `design-discovery`       | "pick fonts", "choose colors", "visual identity"    |
| `micro-animations`       | "add animations", "hover effects", "add polish"     |
| `frontend-design`        | "build page", "create component", "design UI"       |
| `code-review`            | "review code", "check my code", "audit code"        |
| `project-kickoff`        | "new project", "plan project", "kickoff"            |
| `seo-audit`              | "SEO audit", "meta tags", "structured data"         |
| `stack-detect`           | "detect stack", "what stack", "scan project"        |
| `content-strategy`       | "write blog post", "case study", "content plan"     |
| `proposal-writer`        | "write proposal", "pitch", "estimate"               |
| `document-generator`     | "write SOW", "project brief", "handoff document"    |
| `qa-audit`               | "audit", "QA check", "accessibility audit"          |
| `analytics-reporter`     | "analytics", "dashboard", "tracking"                |
| `app-store-optimization` | "ASO", "app store optimization", "app listing"      |
| `behavioral-nudge`       | "nudge", "conversion optimization", "persuasion"    |
| `data-consolidation`     | "migrate data", "ETL", "merge databases"            |
| `mcp-builder`            | "build MCP", "MCP server", "agent tool"             |
| `threat-detection`       | "threat model", "security review", "attack surface" |
| `workflow-optimizer`     | "optimize workflow", "speed up build", "DX"         |
| `merge-conflict`         | "merge conflict", "resolve conflict", "fix conflicts"|
| `frontend-react`         | "react component", "build in react", "react hook"   |
| `frontend-preact`        | "preact component", "preact island", "preact signal" |
| `frontend-astro`         | "astro page", "astro layout", "content collection"  |
| `frontend-hooks`         | "custom hook", "extract hook", "useEffect help"     |
| `frontend-forms`         | "build form", "form validation", "form component"   |
| `frontend-state`         | "state management", "global state", "zustand"        |
| `frontend-testing`       | "test component", "write tests", "testing strategy" |
| `frontend-routing`       | "routing", "add route", "dynamic route"              |
| `frontend-performance`   | "performance audit", "core web vitals", "bundle size"|
| `frontend-data-fetching` | "fetch data", "tanstack query", "data loading"       |
| `frontend-typescript`    | "type this", "fix types", "generic component"        |
| `frontend-scaffold`      | "scaffold feature", "new feature", "set up feature"  |
| `frontend-doc-sync`      | "check docs", "is this current", "verify api"        |
| `astro-middleware`       | "astro middleware", "auth middleware", "onRequest"    |
| `astro-view-transitions` | "view transitions", "page transitions", "persist"    |
| `astro-integrations`    | "astro integration", "astro adapter", "astro config"  |
| `astro-i18n`            | "astro i18n", "multilingual", "locale routing"        |
| `astro-server-islands`  | "server island", "server:defer", "personalized"       |
| `astro-actions`         | "astro action", "defineAction", "astro form"          |
| `preact-compat`         | "preact compat", "react library in preact", "alias"   |
| `preact-signals-patterns`| "signals pattern", "computed signal", "signal store" |
| `pagespeed-audit`        | "pagespeed", "lighthouse", "core web vitals"          |

### Token Budget

| Scenario                            | Lines Loaded                          | vs. Monolithic    |
| ----------------------------------- | ------------------------------------- | ----------------- |
| Marketing site — editing components | ~176 (CLAUDE.md + frontend + design)  | **76% reduction** |
| Marketing site — simple question    | ~68 (CLAUDE.md only)                  | **91% reduction** |
| App with auth — editing API routes  | ~162 (CLAUDE.md + backend + security) | **78% reduction** |
| Design Discovery (5 subagents)      | ~68 x 5 = 340 base                    | **91% reduction** |

Compared to loading all 744 lines on every interaction.

## Directory Structure

```
~/.config/claude-rules/
├── package.json
├── CLAUDE.md                          # Always-on global rules (~68 lines)
├── setup.sh                           # Symlink into ~/.claude/ (git-clone workflow)
├── README.md
│
├── bin/
│   └── cli.js                         # CLI: init, setup, convert
│
├── rules/                             # Source of truth (Claude Code native)
│   ├── frontend.md                    #   Astro, Preact, CSS Modules, state
│   ├── design.md                      #   Spacing, tokens, motion, a11y
│   ├── backend.md                     #   Hono, API design, auth, middleware
│   ├── database.md                    #   PostgreSQL, Drizzle, md5 indexes
│   ├── security.md                    #   Rate limiting, headers, encryption
│   ├── testing.md                     #   bun:test, Vitest, Playwright
│   ├── devops.md                      #   Docker, Coolify, CI/CD
│   ├── git.md                         #   Branching, .gitignore
│   ├── laravel.md                     #   PHP, Laravel, Livewire
│   ├── compliance.md                  #   GDPR, cookies, licenses
│   ├── incident.md                    #   Severity levels, postmortem
│   ├── copywriting.md                 #   Error messages, empty states
│   ├── ticketing.md                   #   Ticket structure, prefixes
│   ├── planning.md                    #   Architecture decisions, phases
│   └── research.md                    #   Library/API evaluation
│
└── skills/                            # On-demand skills (Claude Code native)
    ├── design-discovery/SKILL.md
    ├── micro-animations/SKILL.md
    ├── frontend-design/SKILL.md
    ├── code-review/SKILL.md
    ├── project-kickoff/SKILL.md
    ├── seo-audit/SKILL.md
    ├── stack-detect/SKILL.md
    ├── frontend-react/SKILL.md
    ├── frontend-preact/SKILL.md
    ├── frontend-astro/SKILL.md
    ├── frontend-hooks/SKILL.md
    ├── frontend-forms/SKILL.md
    ├── frontend-state/SKILL.md
    ├── frontend-testing/SKILL.md
    ├── frontend-routing/SKILL.md
    ├── frontend-performance/SKILL.md
    ├── frontend-data-fetching/SKILL.md
    ├── frontend-typescript/SKILL.md
    ├── frontend-scaffold/SKILL.md
    ├── frontend-doc-sync/SKILL.md
    ├── astro-middleware/SKILL.md
    ├── astro-view-transitions/SKILL.md
    ├── astro-integrations/SKILL.md
    ├── astro-i18n/SKILL.md
    ├── astro-server-islands/SKILL.md
    ├── astro-actions/SKILL.md
    ├── preact-compat/SKILL.md
    ├── preact-signals-patterns/SKILL.md
    ├── pagespeed-audit/SKILL.md
    └── ... (55 total)
```

### What Goes Where

| Content                              | Location                | Why                                            |
| ------------------------------------ | ----------------------- | ---------------------------------------------- |
| Stack choices, universal constraints | `CLAUDE.md`             | Must be in every interaction                   |
| Domain-specific rules                | `rules/*.md`            | Only load when touching those files            |
| Complex multi-step workflows         | `skills/*/SKILL.md`     | Zero cost until triggered                      |
| Other agent configs                  | Generated via `convert` | Derived from rules/, not maintained separately |

## Paired Subagent Sparring

Skills like `design-discovery`, `micro-animations`, and `frontend-design` use paired subagent sparring:

1. **Gather context** from the user (project type, audience, mood, existing brand)
2. **Spawn Agent A and Agent B** in parallel with opposing creative directions
3. **Spawn Agent C and Agent D** in parallel — each cross-critiques the other proposal
4. **Synthesize** into 2-3 options and present to the user
5. **Iterate** based on feedback (re-spar if needed)
6. **Output** production-ready CSS custom properties

The sparring prevents generic outputs. Agent A pushes for distinctiveness, Agent B pushes for polish, and the cross-critique forces the best of both.

## Converting to Other AI Agents

These rules are written in Claude Code's native format (`rules/*.md` with YAML `paths:` frontmatter + `skills/*/SKILL.md`). If you also use Cursor, Windsurf, Copilot, or Aider, the `convert` command generates their config from the same rules.

### Supported Agents

| Agent | Command | Output File |
|---|---|---|
| Cursor | `bunx @nickbevers/claude-rules convert cursor` | `.cursorrules` |
| Windsurf | `bunx @nickbevers/claude-rules convert windsurf` | `.windsurfrules` |
| GitHub Copilot | `bunx @nickbevers/claude-rules convert copilot` | `.github/copilot-instructions.md` |
| Aider | `bunx @nickbevers/claude-rules convert aider` | `.aider.conf.yml` + `CONVENTIONS.md` |
| All at once | `bunx @nickbevers/claude-rules convert all` | All of the above |

Replace `bunx` with `npx`, `pnpm dlx`, or `yarn dlx` as needed.

### How It Works

```
rules/*.md (with YAML frontmatter)  ──┬──>  Claude Code (native, no conversion needed)
skills/*/SKILL.md                     │
                                      ├──>  .cursorrules
                                      ├──>  .windsurfrules
                                      ├──>  .github/copilot-instructions.md
                                      └──>  CONVENTIONS.md + .aider.conf.yml
```

The `convert` command:
1. Reads `rules/*.md` and `skills/*/SKILL.md` from your local project (falls back to the package if no local rules exist)
2. Strips YAML `paths:` frontmatter
3. Concatenates everything into the flat format each agent expects
4. Appends agent-specific guidance (e.g., "Cursor can't spawn subagents — use sequential sparring")

### When to Re-run

Re-run `convert` after editing any rule or skill file so the other agent configs stay in sync:

```bash
# After editing rules/frontend.md
bunx @nickbevers/claude-rules convert all
```

No `.ai/` directory. No sync scripts. No stale copies. One source, one conversion step.

## Design Decisions

**Why not one big CLAUDE.md?**
Every token in CLAUDE.md costs on every interaction. With subagent spawning (e.g., 5 agents for design discovery), a monolithic file becomes thousands of wasted context lines. Path-scoped rules eliminate 76-91% of that waste.

**Why not just skills for everything?**
Skills require explicit triggering. Path-scoped rules load automatically when you touch matching files — no friction, no commands to remember.

**Why Claude Code native as source of truth?**
Claude Code's `rules/` format (markdown + YAML `paths:` frontmatter) is the most expressive: it supports conditional loading. Stripping frontmatter for other agents is trivial. Going the other direction (adding frontmatter to flat files) requires maintaining a separate path mapping. One direction is automatable; the other isn't.

**Why frontend-first?**
This setup is for a freelance frontend creative developer doing ~80% marketing sites and ~20% apps with auth. Backend/database/security rules only load when actually touching those files, saving tokens on the 80% of work that's pure frontend.

**Why are rules so specific?**
Generic best practices like "use semantic HTML", "write clean code", or "Arrange-Act-Assert" waste tokens — Claude already follows these by default. Every rule here exists because Claude gets it wrong without the instruction: OKLCH over hex, `env(c)` not `Bun.env`, MD5 hash indexes for TEXT columns, Argon2id via `Bun.password`, pgboss over BullMQ (Bun segfault). If a rule doesn't change Claude's actual behavior, it doesn't belong.
