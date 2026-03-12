---
name: stack-detect
description: Detect project technologies and write stack profile. Auto-runs on first interaction with any project. Triggers on "detect stack", "what stack", "scan project", "stack-detect".
allowed-tools: Read, Glob, Grep, Write, Bash
user-invokable: true
---

# Stack Detect — Project Technology Scanner

Scan project root to identify all technologies. Write to `.claude/stack.md` so every future conversation knows the stack.

**Auto-runs when `.claude/stack.md` doesn't exist.**

## Scan These Files (if present)

**Package managers**: package.json, bun.lockb, yarn.lock, package-lock.json, composer.json, Cargo.toml, go.mod, pyproject.toml, Gemfile
**Frameworks**: astro.config.*, next.config.*, nuxt.config.*, vite.config.*, svelte.config.*, artisan, manage.py
**Styling**: tailwind.config.*, postcss.config.*, *.module.css presence, CSS-in-JS in deps
**Database**: drizzle.config.*, prisma/schema.prisma, database/migrations/
**Infra**: Dockerfile, docker-compose.*, .github/workflows/, vercel.json, netlify.toml, fly.toml
**Testing**: vitest.config.*, jest.config.*, playwright.config.*, phpunit.xml
**Other**: .env.example (var names only, NEVER .env), tsconfig.json, project CLAUDE.md

## Classify

Runtime, package manager, framework, UI library, styling, state, backend, database, ORM, testing, deployment, linting, language.

## Write `.claude/stack.md`

Technology table + key patterns + which rules from the Rule Index apply. Keep under 40 lines. Never read .env files. Don't assume — only report what's detected.
