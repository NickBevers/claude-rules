# Global Claude Rules

These rules apply to ALL projects. They define my workflow preferences, coding standards, and expectations for AI-assisted development.

## Rule Files

Rules are organized by domain. Each file contains mandatory instructions for that area:

- [Frontend Development](./rules/frontend-development.md) — Component architecture, styling, state management, accessibility
- [Backend Development](./rules/backend-development.md) — API design, database patterns, error handling, security
- [Design](./rules/design.md) — UI/UX principles, design systems, visual standards
- [Project Management](./rules/project-management.md) — Workflow, prioritization, communication
- [Ticketing](./rules/ticketing.md) — Ticket structure, acceptance criteria, dependency tracking
- [Planning](./rules/planning.md) — Architecture decisions, research, technical planning
- [Research](./rules/research.md) — Evaluating tools, libraries, APIs, and architectural options
- [Testing](./rules/testing.md) — Test strategy, coverage expectations, test patterns
- [Security](./rules/security.md) — Authentication, encryption, OWASP, compliance
- [DevOps](./rules/devops.md) — Deployment, Docker, CI/CD, infrastructure
- [Git](./rules/git.md) — Commit conventions, branching, PR workflow

### Skills (Paired Subagent Workflows)

These skills use paired subagents that independently generate ideas, then spar/critique each other to converge on a superior result. The user always has final say.

- [Design Discovery](./rules/skill-design-discovery.md) — Font selection, color palettes, visual identity. Two agents explore bold vs. refined directions, cross-critique, and present 2-3 polished options.
- [Micro Animations](./rules/skill-micro-animations.md) — Hover effects, entrance/exit transitions, interactive feedback. Two agents explore expressive vs. subtle motion, cross-critique, and produce a complete animation system.

**How the sparring pattern works:**
1. Gather context from the user (or project)
2. Spawn **Agent A** and **Agent B** in parallel with the same brief but different creative lenses
3. Spawn **Agent C** and **Agent D** in parallel — each critiques the other's proposal using the opposing agent's strengths
4. Synthesize into 2-3 options and present to the user
5. Iterate based on feedback (re-spar if major changes needed)
6. Output production-ready code (CSS custom properties, CSS Modules, etc.)

## Universal Principles

1. **Simplicity over cleverness** — Write the simplest code that works. No premature abstractions, no over-engineering.
2. **Explicit over implicit** — Favor clear, readable code. Name things well. Avoid magic.
3. **Fix root causes** — Never paper over bugs with workarounds. Investigate and fix the actual problem.
4. **Minimal changes** — Only change what's needed. Don't refactor adjacent code, add unsolicited comments, or "improve" things that weren't asked about.
5. **Security by default** — Never introduce OWASP top 10 vulnerabilities. Validate at system boundaries.
6. **Read before writing** — Always read existing code before modifying it. Understand context first.
7. **No guessing** — If unsure about a requirement, ask. Don't assume.

## Tech Preferences

- **Runtime:** Bun (preferred over Node.js)
- **Package manager:** Bun
- **Linting:** Oxlint (preferred over ESLint for speed)
- **Formatting:** Prettier
- **Backend frameworks:** Hono (preferred for cross-runtime portability)
- **Frontend frameworks:** Astro + Preact (islands architecture preferred)
- **Database:** PostgreSQL + Drizzle ORM
- **Styling:** CSS Modules (preferred over Tailwind, styled-components, etc.)
- **State management:** Nanostores for cross-island state
- **Icons:** Tabler Icons
- **Charts:** VisX (SVG-based, D3 foundation)

## Communication Style

- Be concise. Lead with answers, not reasoning.
- No emojis unless explicitly requested.
- No time estimates or predictions.
- Reference code locations with `file_path:line_number` format.
- When blocked, suggest alternatives instead of retrying the same approach.
