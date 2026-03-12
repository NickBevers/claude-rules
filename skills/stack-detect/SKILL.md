---
name: stack-detect
description: Detect project technologies and write stack profile. Auto-runs on first interaction with any project. Triggers on "detect stack", "what stack", "scan project", "stack-detect".
allowed-tools: Read, Glob, Grep, Write, Bash
user-invokable: true
---

# Stack Detect — Project Technology Scanner

Scan the project root to identify all technologies in use. Write findings to `.claude/stack.md` so every future conversation knows the stack without re-scanning.

**This skill runs automatically when `.claude/stack.md` doesn't exist.**

## Step 1: Scan Project Files

Check for these files (read if they exist, skip if they don't):

### Package Managers & Runtimes
- `package.json` → dependencies, devDependencies, scripts, engines
- `bun.lockb` or `bun.lock` → Bun runtime
- `yarn.lock` → Yarn
- `package-lock.json` → npm
- `pnpm-lock.yaml` → pnpm
- `composer.json` → PHP / Laravel
- `Cargo.toml` → Rust
- `go.mod` → Go
- `pyproject.toml` or `requirements.txt` → Python
- `Gemfile` → Ruby

### Frameworks & Config
- `astro.config.*` → Astro (check version in package.json)
- `next.config.*` → Next.js
- `nuxt.config.*` → Nuxt
- `vite.config.*` → Vite
- `svelte.config.*` → SvelteKit
- `angular.json` → Angular
- `remix.config.*` → Remix
- `artisan` → Laravel
- `manage.py` → Django
- `tsconfig.json` → TypeScript (check target, paths, aliases)

### Styling
- `tailwind.config.*` → Tailwind CSS
- `postcss.config.*` → PostCSS
- `*.module.css` presence → CSS Modules
- `styled-components` or `@emotion` in deps → CSS-in-JS

### Database & ORM
- `drizzle.config.*` → Drizzle ORM
- `prisma/schema.prisma` → Prisma
- `knexfile.*` → Knex
- `database/migrations/` → Laravel migrations
- `sequelize` in deps → Sequelize
- `typeorm` in deps → TypeORM

### Infrastructure
- `Dockerfile` → Docker
- `docker-compose.*` → Docker Compose
- `.github/workflows/` → GitHub Actions
- `vercel.json` → Vercel
- `netlify.toml` → Netlify
- `fly.toml` → Fly.io
- `coolify.*` or `coolify` references → Coolify

### Testing
- `vitest.config.*` → Vitest
- `jest.config.*` → Jest
- `playwright.config.*` → Playwright
- `cypress.config.*` → Cypress
- `phpunit.xml` → PHPUnit

### Other
- `.env.example` or `.env.local` → environment variables (read var names, not values)
- `README.md` → may describe architecture
- Project-level `CLAUDE.md` → existing AI instructions

## Step 2: Analyze & Classify

From scanned files, determine:

1. **Runtime**: Bun / Node.js / Deno / PHP / Python / Ruby / Go / Rust
2. **Package manager**: Bun / yarn / npm / pnpm / Composer / Cargo / pip
3. **Framework**: Astro / Next.js / Nuxt / SvelteKit / Laravel / Django / etc.
4. **UI library**: Preact / React / Vue / Svelte / Alpine.js / none
5. **Styling**: CSS Modules / Tailwind / styled-components / Sass / plain CSS
6. **State management**: Nanostores / Zustand / Redux / Pinia / Vuex / none
7. **Backend**: Hono / Express / Fastify / Laravel / Django / none (static)
8. **Database**: PostgreSQL / MySQL / SQLite / MongoDB / none
9. **ORM**: Drizzle / Prisma / Eloquent / TypeORM / none
10. **Testing**: Vitest / Jest / bun:test / Playwright / Cypress / PHPUnit
11. **Deployment**: Docker / Vercel / Netlify / Coolify / Fly.io / unknown
12. **Linting**: Oxlint / ESLint / Biome / Prettier / PHP-CS-Fixer
13. **Language**: TypeScript / JavaScript / PHP / Python / Go / Rust

## Step 3: Write Stack Profile

Create `.claude/stack.md`:

```markdown
# Project Stack

Detected [date]. Re-run `/stack-detect` to refresh.

## Technologies

| Layer | Technology | Version |
|---|---|---|
| Runtime | [detected] | [version if found] |
| Package Manager | [detected] | |
| Framework | [detected] | [version] |
| UI Library | [detected] | [version] |
| Styling | [detected] | |
| State | [detected or "none"] | |
| Backend | [detected or "none / static site"] | |
| Database | [detected or "none"] | |
| ORM | [detected or "none"] | |
| Testing | [detected] | |
| Deployment | [detected or "unknown"] | |
| Linting | [detected] | |
| Language | [detected] | |

## Key Patterns

- [Any notable patterns found: monorepo structure, API prefix, env var patterns, etc.]

## Relevant Rules

Based on this stack, these rules are most applicable:
- [list only the rules from the Rule Index that match this project's tech]
```

## Step 4: Update Project CLAUDE.md (if it exists)

If the project has its own `CLAUDE.md`, do NOT overwrite it. Just note in `.claude/stack.md` that a project CLAUDE.md exists and to defer to it.

If no project `CLAUDE.md` exists, suggest creating one but do NOT auto-create it.

## Rules

- **NEVER read `.env` files** — only `.env.example` or `.env.local` for variable names
- Read `package.json` dependencies but don't install or modify anything
- Don't assume technologies — only report what's actually detected
- If uncertain about a technology, say "possibly [X]" and explain why
- Keep `.claude/stack.md` concise — this file may be read on every interaction
- Target under 40 lines for the stack file
