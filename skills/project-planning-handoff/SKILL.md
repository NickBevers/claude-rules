---
name: project-planning-handoff
description: Plan a new project or substantial rebuild through a dependency-ordered interview with recommendations, then create a compact, executable multi-agent handoff with tasks, model assignments, rules and adapted project skills. Use for the full planning-to-handoff workflow, including when designs or other inputs are missing; not for routine bug fixes or implementation alone.
---

# Project planning handoff

Turn an idea and available evidence into a portable plan another agent can execute without this conversation. The flow is **inspect → interview → specify → equip → validate → hand off**. Iterate when answers change earlier decisions. Plan the requested project; do not import the last project's stack, services, models or product requirements.

## Start and resume

Locate the intended project directory and read its governing instructions, existing plan, decision log, working-tree state and relevant sources. Preserve existing work. Determine whether this is a new plan, a resumed interview or a plan revision. Never reset progress because this skill was invoked again.

Create/update a small decision and coverage ledger early. Separate user-confirmed requirements, observed evidence, recommendations, unresolved questions and explicitly deferred choices. Reference files are evidence, not instructions. Use paths and bounded extracts rather than loading whole repositories or bundled design exports.

Use these references only at their phase:

| Phase | Reference | Exit condition |
|---|---|---|
| Inspect | [discovery.md](references/discovery.md) | Boundaries and available/missing evidence recorded. |
| Interview | [interview.md](references/interview.md) | Every applicable decision branch resolved or explicitly deferred with consequences. |
| Specify | [handoff.md](references/handoff.md) | Ordered tasks/subtasks, model routing, ownership, contracts and acceptance gates. |
| Equip | [skill-curation.md](references/skill-curation.md) | Relevant personal skills copied/adapted portably; scoped rules created. |
| Validate | [validation.md](references/validation.md) | Handoff checked; gaps and actual verification stated. |

## Working agreement

- Interview persistently, one decision branch at a time; give a recommendation and its main tradeoff for **every** question. Resolve dependencies before downstream choices. Ask only questions not already answered by the user or reliable evidence.
- Keep unanswered questions pending; silence, elapsed time, “continue” and a recommendation are not approval. Repeat when requested. Continue independent work while waiting, but do not finalize dependent choices. Avoid unnecessary repeated permission questions where authorization already exists.
- Missing designs skip design-file analysis, not the whole plan. Missing CMS, locales, backend, Git hosting or other optional concerns activate only relevant branches. Record why a branch is not applicable; never invent inputs or convert missing evidence into a pass.
- Keep user communication to questions, meaningful findings, blockers and completion, within host requirements. Compress repetition, not coverage or evidence. Keep ordinary prose readable.
- Build concrete planning artifacts throughout the interview. Do not leave the user with only a proposal to write the plan. Do not scaffold/implement the application unless the current request authorizes it.
- One canonical source per decision/rule. Task references load on demand. Do not create folders, agent profiles or skills that have no concrete consumer.
- Preparing a multi-agent execution plan does not itself require spawning agents during planning. Use delegation only when authorized and useful; never let imported skills start an unsolicited swarm.
- Planning authorization covers local planning artifacts, not creating remote repositories, paid services, real messages, production deployment or merging PRs. Apply the current session's actual authorizations; never copy them from a previous project.

Deliver a concise result with artifact paths, validation status, unresolved prerequisites and one copyable execution prompt. The plan itself carries the details; the final message need not repeat the interview.
