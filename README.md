# Claude Rules

Personal AI coding agent configuration for a freelance frontend creative developer. Optimized for token efficiency across Claude Code, with cross-agent support for Cursor, Windsurf, Copilot, and Aider.

## Quick Start

```bash
# Clone
git clone git@github.com:NickBevers/claude-rules.git ~/.config/claude-rules

# Install (symlinks into ~/.claude/)
~/.config/claude-rules/setup.sh

# Verify: start a new Claude Code session — stack defaults should appear
```

To uninstall:

```bash
~/.config/claude-rules/setup.sh --uninstall
```

### Setup on Another Device

```bash
git clone git@github.com:NickBevers/claude-rules.git ~/.config/claude-rules
~/.config/claude-rules/setup.sh
```

The setup script creates three symlinks in `~/.claude/`:

| Symlink | Target | Purpose |
|---|---|---|
| `~/.claude/CLAUDE.md` | `CLAUDE.md` | Always-on global rules |
| `~/.claude/rules/` | `rules/` | Path-scoped conditional rules |
| `~/.claude/skills/` | `skills/` | On-demand skills |

Existing files are backed up before overwriting.

## How It Works

### Three Loading Tiers

The system is designed around Claude Code's context window — every token in always-on rules costs on every interaction AND every subagent spawn.

**Tier 1 — Always-On (`CLAUDE.md`, ~39 lines)**

Loaded on every single interaction. Contains only:
- Stack defaults table (Bun, Astro, Preact, CSS Modules, etc.)
- Hard constraints Claude actually gets wrong without them (Astro Zod import path, preact/compat, animation performance rules)
- Workflow rules (no drive-by refactors, ask when unsure)
- Subagent sparring instructions

**Tier 2 — Path-Scoped Rules (`rules/`, ~420 lines total, ~30-60 per file)**

Each file has YAML `paths:` frontmatter. Claude Code only loads them when touching matching files. Editing a `.tsx` file loads `frontend.md` and `design.md` but NOT `backend.md`, `database.md`, or `security.md`.

| Rule File | Triggers On |
|---|---|
| `frontend.md` | `*.tsx`, `*.astro`, `*.module.css`, `components/`, `pages/`, `layouts/` |
| `design.md` | `*.module.css`, `*.css`, `tokens*`, `theme*`, `design*` |
| `backend.md` | `api/`, `routes/`, `services/`, `middleware/`, `*.server.ts` |
| `database.md` | `drizzle/`, `*schema*`, `*migration*`, `*.sql`, `db/` |
| `security.md` | `auth/`, `session*`, `*guard*`, `*crypt*`, `*password*` |
| `testing.md` | `*.test.*`, `*.spec.*`, `e2e/`, `vitest*`, `playwright*` |
| `devops.md` | `Dockerfile*`, `docker-compose*`, `deploy*`, `.github/` |
| `git.md` | `.gitignore`, `.gitattributes`, `.github/` |
| `ticketing.md` | `.claude/tickets/` |
| `planning.md` | `.claude/research/`, `decisions*`, `architecture*` |
| `research.md` | `.claude/research/`, `spike*` |

**Tier 3 — On-Demand Skills (`skills/`, zero cost until triggered)**

Proper Claude Code skills with `SKILL.md` + YAML frontmatter. Only loaded when invoked by name or when Claude's description matching triggers them.

| Skill | Triggers On | What It Does |
|---|---|---|
| `design-discovery` | "pick fonts", "choose colors", "visual identity" | Spawns paired subagents (Bold vs. Refined) to explore design directions, cross-critique, and present 2-3 options |
| `micro-animations` | "add animations", "hover effects", "add polish" | Spawns paired subagents (Expressive vs. Precise) to create animation systems, cross-critique, and output production CSS |

### Token Budget

| Scenario | Lines Loaded | vs. Monolithic |
|---|---|---|
| Marketing site — editing components | ~100 (CLAUDE.md + frontend + design) | **92% reduction** |
| Marketing site — simple question | ~39 (CLAUDE.md only) | **97% reduction** |
| App with auth — editing API routes | ~130 (CLAUDE.md + backend + security) | **89% reduction** |
| Design Discovery (5 subagents) | ~39 x 5 = 195 base | **97% reduction** |

Compared to a monolithic 1,200-line CLAUDE.md that loads everything on every interaction.

## Directory Structure

```
~/.config/claude-rules/
├── CLAUDE.md                          # Always-on global rules (39 lines)
├── setup.sh                           # Install/uninstall symlinks
├── README.md
│
├── rules/                             # Path-scoped rules (Claude Code native)
│   ├── frontend.md                    #   Astro, Preact, CSS Modules, state
│   ├── design.md                      #   Spacing, tokens, motion, a11y
│   ├── backend.md                     #   Hono, API design, auth, middleware
│   ├── database.md                    #   PostgreSQL, Drizzle, md5 indexes
│   ├── security.md                    #   Rate limiting, headers, encryption
│   ├── testing.md                     #   bun:test, Vitest, Playwright
│   ├── devops.md                      #   Docker, Coolify, CI/CD
│   ├── git.md                         #   Branching, .gitignore
│   ├── ticketing.md                   #   Ticket structure, prefixes
│   ├── planning.md                    #   Architecture decisions, phases
│   └── research.md                    #   Library/API evaluation
│
├── skills/                            # On-demand skills (Claude Code native)
│   ├── design-discovery/SKILL.md      #   Font + color selection (sparring)
│   └── micro-animations/SKILL.md      #   Animation system (sparring)
│
├── .ai/                               # Source of truth (agent-agnostic)
│   ├── manifest.yaml                  #   Config: agents, tech prefs
│   ├── rules/                         #   Plain markdown (no frontmatter)
│   │   ├── principles.md
│   │   ├── frontend-development.md
│   │   ├── backend-development.md
│   │   ├── design.md
│   │   ├── database.md
│   │   ├── security.md
│   │   ├── testing.md
│   │   ├── devops.md
│   │   ├── git.md
│   │   ├── ticketing.md
│   │   ├── planning.md
│   │   └── research.md
│   └── skills/
│       ├── design-discovery.md
│       ├── micro-animations.md
│       └── SKILL-FORMAT.md
│
├── adapters/                          # Agent-specific additions
│   ├── claude/extra.md
│   ├── cursor/extra.md
│   ├── windsurf/extra.md
│   ├── copilot/extra.md
│   └── aider/extra.md
│
├── scripts/
│   ├── sync-agents.sh                 # Generate agent configs from .ai/
│   └── init-project.sh                # Bootstrap a project with AI configs
│
└── project-templates/                 # Starter .claude/ directories
    ├── default/
    │   └── CLAUDE.md
    └── astro-hono/
        └── CLAUDE.md
```

### What Goes Where

| Content | Location | Why |
|---|---|---|
| Stack choices, universal constraints | `CLAUDE.md` | Must be in every interaction |
| Domain-specific rules | `rules/*.md` | Only load when touching those files |
| Complex multi-step workflows | `skills/*/SKILL.md` | Zero cost until triggered |
| Agent-agnostic source of truth | `.ai/` | Portable across Claude, Cursor, etc. |
| Agent-specific extras | `adapters/` | Thin overrides per tool |

## Paired Subagent Sparring

Both skills use the same creative process:

1. **Gather context** from the user (project type, audience, mood, existing brand)
2. **Spawn Agent A and Agent B** in parallel with opposing creative directions
3. **Spawn Agent C and Agent D** in parallel — each cross-critiques the other proposal
4. **Synthesize** into 2-3 options and present to the user
5. **Iterate** based on feedback (re-spar if needed)
6. **Output** production-ready CSS custom properties

The sparring prevents generic outputs. Agent A pushes for distinctiveness, Agent B pushes for polish, and the cross-critique forces the best of both.

## Cross-Agent Support

The `.ai/` directory is the single source of truth. Agent-specific configs are generated from it:

```bash
# Generate configs for other agents
./scripts/sync-agents.sh cursor      # Creates .cursorrules
./scripts/sync-agents.sh windsurf    # Creates .windsurfrules
./scripts/sync-agents.sh copilot     # Creates .github/copilot-instructions.md
./scripts/sync-agents.sh aider       # Creates .aider.conf.yml + CONVENTIONS.md
./scripts/sync-agents.sh all         # All enabled agents
```

Enable agents in `.ai/manifest.yaml` by setting `enabled: true`.

### Bootstrapping a New Project

```bash
# Claude only (default)
~/.config/claude-rules/scripts/init-project.sh /path/to/project

# Claude + Cursor
~/.config/claude-rules/scripts/init-project.sh /path/to/project claude cursor

# All agents
~/.config/claude-rules/scripts/init-project.sh /path/to/project all
```

This copies `.ai/` rules into the project and generates agent-specific configs. Project-level rules override global ones.

## Design Decisions

**Why not one big CLAUDE.md?**
Every token in CLAUDE.md costs on every interaction. With subagent spawning (e.g., 5 agents for design discovery), a 1,200-line file becomes 6,000 lines of wasted context. Path-scoped rules eliminate 90%+ of that waste.

**Why not just skills for everything?**
Skills require explicit triggering. Path-scoped rules load automatically when you touch matching files — no friction, no commands to remember.

**Why `.ai/` as source of truth?**
Claude Code uses `CLAUDE.md` + `rules/` + `skills/`. Cursor uses `.cursorrules`. Copilot uses `.github/copilot-instructions.md`. Rather than maintaining N copies, keep one set of rules in `.ai/` and generate the rest with `sync-agents.sh`.

**Why frontend-first?**
This setup is for a freelance frontend creative developer doing ~80% marketing sites and ~20% apps with auth. Backend/database/security rules only load when actually touching those files, saving tokens on the 80% of work that's pure frontend.

**Why were rules stripped so aggressively?**
9 agents analyzed the original setup and found 60% of rules were generic best practices Claude already follows by default ("use semantic HTML", "write clean code", "Arrange-Act-Assert"). Every such rule wastes tokens without changing behavior. Only rules that prevent actual mistakes survived.
