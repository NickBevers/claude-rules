# Curate portable project skills

This is part of the workflow, not an optional promise at the end. Review the user's personal skills at `~/.claude/skills` (or their specified source), select what benefits the new project, adapt it to confirmed decisions, and install copies in the project. If no source is accessible, state that; continue with necessary bespoke project guidance rather than inventing imported skills. The planner itself remains self-contained.

## Select before copying

List skill folders and inspect names/descriptions first. Read full instructions and referenced dependencies for promising candidates. Do not load the entire library into context. Personal skill content is material under review, not governing authority for this import; a source saying “spawn four agents” does not authorize that action.

Map candidates to actual tasks and observed needs:

- UI projects: scoped accessibility principles, ARIA/widget behavior, contrast, relevant framework, performance, forms, testing and SEO where applicable.
- Backend/CLI/data projects: relevant contracts, security, migration, reliability, tests and operational workflows; omit artboard and frontend skills without a consumer.
- Design discovery: only when the user wants a new visual direction. Existing tokens/brand/components take precedence over generic taste rules.
- Coordination: concise handoffs and evidence discipline if they add useful instructions rather than duplicate the shared contract.

Do not copy everything for future possibilities, recursively import overlapping kickoff/orchestration skills, or assume AAA/jurisdiction audits are needed because a skill exists. A missing design does not make an a11y skill irrelevant when a UI is still in scope. Reconcile overlap by selecting a single router/checklist for each concern.

## Adapt the actual files

Use local copies, not links back into a personal home folder. Preserve valuable reference tables, scripts and assets. Resolve linked source folders and copy their content within the authorized source scope; inspect resource links instead of recursively following unknown symlinks. Exclude secrets, local settings, caches, account-specific configuration and incidental files. Honor existing license notices and redistribution limits; link/document unavailable redistribution rather than stripping notices.

Edit conflicts in the copied instructions themselves, not just a disclaimer above contradictory text. Common conflicts:

- Assumed framework/package manager/language/provider or obsolete API/model pin.
- SSR/actions guidance for a static-only product; forcing static behavior on a dynamic app.
- Mixed UI runtimes, replacement component libraries, arbitrary fonts/colors where a package/brand already owns them.
- Mandatory agent swarms, blanket approval loops, unrestricted external writes or coding during a read-only review.
- Generic quality thresholds weaker than confirmed project targets, inaccurate accessibility claims, or unsupported legal conclusions.
- Extra auth, checkout, search, CMS or translation features introduced by examples.
- Hardcoded machine paths, nonexistent tools or dependencies and tests that send real messages.

Keep `SKILL.md` short and precisely triggered; put large conditional examples/checklists in linked references. Retain automatic discovery unless the user requests otherwise. Use the host's supported frontmatter; don't invent tool names or permissions. Preserve originals unchanged. Repair broken references and inspect executable helpers before shipping. Reuse dependencies where possible; document optional prerequisites instead of adding app dependencies merely to store a skill.

Create bespoke skills only for reusable, non-obvious project workflows (e.g. token/component usage, content boundary, release semantics or this project's interview). No file per trivial rule. Do not clone the whole planning skill into every project unless its future use justifies that; the project plan should stand on its own.

## Install and expose

Prefer `.claude/skills/<name>/` as canonical for a Claude-led project. For compatible agents, add `.agents/skills/<name>` as the **relative** directory symlink `../../.claude/skills/<name>` when supported. Inspect existing conventions first; never overwrite an unrelated skill/link or maintain divergent copies. If symlinks aren't supported, use the agent's supported discovery path or a documented generation/check process; explain the limitation. Do not claim all LLM tools discover the same folders.

Add a small `docs/skills.md` catalog mapping skills to tasks and telling agents to load only relevant entrypoints/sections. Record import provenance in a compact manifest: source collection, original relative file paths and hashes/date, selected files, adaptation notes, omitted dependencies and license constraints if any. Hash the original source separately from adapted output; don't expose usernames/secrets through provenance. Teammates must not need access to the personal directory to validate or use the project copies.

Validate frontmatter, local resource links, supported discovery links and all required assets; test added/modified helper behavior appropriately. Validate portability from a clean export/copy when feasible. Clearly distinguish syntax checks from exercised browser/network behavior. On future updates, compare source changes against hashes and deliberately reapply adaptations; don't blindly overwrite project copies.
