# Executable handoff

Build the smallest document set that makes execution independent of this chat. Use existing repository conventions where present. Scale task count and detail to scope; there is no required 21-task shape or fixed model lineup.

## Files and authority

| Artifact | Contents |
|---|---|
| `PLAN.md` | Objective, milestone, scope exclusions, critical decisions, ordered task/subtask table, dependency/quality gates and on-demand reference index. |
| `AGENTS.md` | Shared behavioral contract: source authority, stack/package constraints, scope, evidence, ownership, communication, Git and authorized boundaries. Preserve existing guidance; resolve conflicts explicitly. |
| `CLAUDE.md` | Thin Claude entrypoint referencing shared rules and plan through supported syntax; avoid duplicating policy. |
| `docs/decisions.md` | Confirmed answers, proposals, deferred choices, coverage state and superseded decisions; stable IDs. |
| `docs/execution.md` | Model routing, dispatch/return format, state transitions, ownership, retry/escalation limits and Git workflow. |
| `docs/progress.md` | Initial/resumed task ledger: state, branch/PR, checked revision, evidence or blocker. Never pre-mark future work complete. |
| Scoped references | Architecture, content/API contracts, design/component map, quality, delivery or other domains only when applicable and too detailed for PLAN. |
| Project rules/skills | Small scoped instructions and portable selected skills; see skill-curation reference. |
| README / validation note | Start/resume command, navigation and what the planning session actually validated. |

For a tiny project, combine scoped references. Do not add empty code/config directories to make the plan look complete. Record a proposed future tree only when it clarifies ownership. The handoff must work without private home paths or the original conversation; identify any references the next worker must obtain.

## Task shape

Use `T00`, `T01`, … and numbered subtasks (`T01.1`, etc.). Every subtask inherits its row's model unless explicitly overridden.

| ID | Model/role | Needs | Subtasks | Owns / acceptance |
|---|---|---|---|---|
| T00 | coordinator | — | 1 Verify repo/tool/model access. 2 Reconcile ledger and permissions. | Metadata; verified destination and execution boundary. |
| T01 | builder | T00 | 1 Resolve bounded compatibility question if present. 2 Establish only required foundation. | Named paths; observed compatibility/build evidence. |

Replace this illustrative start with actual project tasks; do not leave placeholders in a ready manifest. Follow foundations/contracts → fixtures → feature vertical slices → integration → independent review → repair → reproducibility/handoff. Each feature includes its own validation; final quality work is not the first accessibility or failure-state check.

For each task specify concrete output, file/interface ownership, dependencies, measurable acceptance and relevant references. Include edge cases from decisions: zero/one/many, long copy, missing/deleted/replaced data, failures and responsive/locale states as applicable. Add evidence-producing spikes for unknowns; downstream work waits for their result. Check every in-scope feature/control has a task and every exclusion is intentional.

## Models and execution

Choose role mapping with the user: coordinator, substantive builder, routine/mechanical worker and optional expert advisor. These need not be different providers/models. Verify exact IDs and installed runner syntax at handoff/execution time; a model's name in an old plan is not proof it exists or is available. Record configured vs verified access separately. Do not invent dispatch APIs, moving aliases or unsupported settings. Do not make paid probe calls just to fill the table. If unavailable, report the blocker and recommend a replacement; no silent substitution.

A useful cost policy: one modest coordinator, strong builder for architecture/domain/code/review, cheaper worker for constrained fixtures/docs/mechanical edits. Optional advisor defaults to zero calls; use only for a consequential unresolved choice, a demonstrated blocker after focused diagnosis, or unresolved review disagreement. One scoped read-only consult per distinct issue; builder implements/tests. No loops without new evidence.

Generate only supported profiles/settings actually needed by the chosen runner. Keep generic task/role contracts usable if another LLM executes the plan. Profile files may request roles/tools but do not enforce permissions by themselves.

Sequential execution is the default. Bounded concurrency is allowed only for dependency-ready work with disjoint writes. Shared schema/config/lockfile/routes have one owner; workers do not recursively spawn others. A fresh reviewer should inspect important work independently when supported and authorized. If independent review cannot run, report it as pending; self-review is not equivalent evidence.

Typical compact dispatch (budget adaptable, not a reason to omit facts):

`ID | subtasks | model | read paths | write scope | prerequisite interfaces | acceptance | return format`

Typical return:

`ID | state | files | checks + evidence paths | blocker/decision`

Keep full logs/screenshots on disk, not in chatter. Use no full-conversation dumps. Coordinator verifies evidence and owns the ledger/integration. Repair within the task, rerun affected checks, then the required integrated gate; do not repeatedly run everything without new cause.

## State, Git and launch

Use `TODO → RUNNING → REVIEW → DONE` for PR-delivered work; `BLOCKED` records a dependency/access/decision. REVIEW means checked and awaiting merge; DONE means merged and verified. For non-PR artifacts define the equivalent accepted-delivery gate. Never equate a worker's assertion or pending test with completion.

Recommend a topic branch and separate PR per major feature; small coherent changes also go through PRs. Confirm the current project's policy. Preserve local work, existing remote and custom hooks; use worktrees for isolation. Reuse an existing repository rather than inventing a duplicate. Do not stack dependent branches or switch shared checkouts silently. Resume from fresh Git/ledger state.

When authorized, commit/push the concrete planning deliverable and open its PR. Use title-only commits without attribution if chosen; preserve Git identity. Merge/deploy authority is separate, especially if the base branch auto-deploys. Do not bypass hooks or force-push to solve routine conflicts. Resolve conflicts by preserving intent from both sides, validate and push the topic branch. After an authorized/user merge, switch/pull the intended checkout when requested, preserving dirty work. Do not automatically delete branches/repos/worktrees.

If branch protection is desired, inspect support and existing policy first. Local guards supplement server enforcement; report actual limitations without changing visibility/billing or claiming protection succeeded. Empty repositories may need an explicitly agreed initial-branch bootstrap path; never claim a PR can target a nonexistent base or quietly waive the no-direct-base rule.

Separate **handoff ready**, **implementation ready** and **production ready**. Missing live services, credentials, approved content, assets or device evidence must appear at the appropriate gate. Planning checks never prove the app works. End with a prompt naming PLAN, ledger, model routing and actual authorized actions, e.g. “Execute PLAN.md through the agreed milestone; resume docs/progress.md, follow AGENTS.md, dispatch scoped workers under docs/execution.md, and report blockers.” Include push/PR authority only when granted; do not smuggle merge/deploy consent into it.
