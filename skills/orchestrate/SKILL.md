---
name: orchestrate
description: Claude Code only. Run a task as a coordinator that splits it into scoped subtasks, dispatches subagents with the right model per role, verifies their work and owns integration. Call as "/orchestrate <your prompt>". Triggers on "orchestrate", "use subagents", "split this across agents", "coordinate agents", "dispatch workers".
argument-hint: <the task to orchestrate>
user-invocable: true
allowed-tools: Agent, SendMessage, Read, Glob, Grep, Bash, Edit, Write, Skill
---

# Orchestrate

You are the **coordinator**. The task is:

> $ARGUMENTS

If the task above is empty, ask the user for it and stop.

You plan, dispatch, verify and integrate. Workers do the scoped work. You own the
ledger, the final integration and the report. A worker's claim is never proof.

## 1. Intake

- Classify the ask: question, task, or plan-first. A question gets an answer, not edits.
- Read the project's `CLAUDE.md`, `AGENTS.md` and project memory first. Any model
  pin or routing rule there **overrides** the defaults below. Example: a repo that says
  "subagents on Opus only" means every spawn passes that model.
- Define a concrete done criterion you can observe (a passing check, a rendered page,
  a file that exists with the right content).
- If the task is small enough to do in a few direct steps, do it yourself. Say so in
  one line. Orchestration is for work that genuinely splits.

## 2. Plan

Break the work into tasks `T01`, `T02`, … with numbered subtasks (`T01.1`). Order them:
foundations and contracts, then fixtures, then feature slices, then integration, then
independent review, then repair.

For every task, fix these before dispatching:

| Field | Meaning |
|---|---|
| ID | `T03` |
| Role / model | See routing below |
| Needs | Tasks that must finish first |
| Read paths | What the worker should open |
| Write scope | The only files or dirs it may change |
| Acceptance | Measurable result, including edge cases (zero/one/many, long copy, missing data, failures) |

Add a short evidence spike for any real unknown. Downstream tasks wait for its result.
Show the user the task table before dispatching when the work touches more than a
handful of files or anything outward-facing.

## 3. Model routing

Defaults, unless project rules say otherwise:

| Role | Use for | Agent `model` |
|---|---|---|
| Coordinator | You. Planning, verification, integration | (current session) |
| Builder | Architecture, domain logic, non-trivial code, reviews | `opus` |
| Simple builder | Explicitly bounded, simple coding steps | `sonnet` |
| Routine | Fixtures, doc drafts, mechanical edits, broad file search | `haiku` |
| Advisor | Rare escalation only. Default zero calls | `fable` |

- Pick the subagent type to match the job: `Explore` for read-only search, `Plan` for a
  design pass, `general-purpose` for work that edits files.
- Call the advisor only for a consequential unresolved choice, a blocker after focused
  diagnosis, or a review disagreement. One scoped read-only consult per issue. The
  builder then implements. No loops without new evidence.
- Spawns run on the user's Claude subscription, not API billing. The budget is the
  usage limit, not dollars. Keep fan-out proportional, push mechanical work to `haiku`,
  and don't spawn agents to re-read files you already have. If a worker hits a usage
  limit, mark its task `BLOCKED` and report it. Don't retry in a loop.
- Never silently upgrade or swap a model. If the chosen one is unavailable, report it
  and recommend a replacement.
- Record the model actually used in every task's ledger line.

## 4. Dispatch

- **Sequential by default.** Run tasks in parallel only when they are dependency-ready
  and their write scopes do not overlap. Send parallel tasks in one message.
- **At most three workers or reviewers at once**, plus you.
- **Workers never spawn their own agents.** Say so in every prompt.
- Shared schema, config, lockfiles and routes have **one owner**. Nobody else writes them.
- Use `isolation: "worktree"` when parallel workers edit the same repo.

Each worker prompt is self-contained. The worker has not seen this conversation. Use
this shape:

```
Task: T03 <title>
Subtasks: T03.1 …, T03.2 …
Read: <paths>
Write scope: <paths>. Do not touch anything else.
Prerequisites: <interfaces or results from earlier tasks, pasted in>
Acceptance: <measurable criteria>
Rules: Do not spawn subagents. Do not commit, push or run outward-facing actions.
  Run targeted checks only. Keep full logs on disk, not in your reply.
Return exactly:
  ID | state (DONE/BLOCKED) | files changed | checks run + result | blocker or decision needed
```

Pass along the user's global rules that apply to the worker (writing style, verification
limits, commit rules). Workers do not inherit them.

## 5. Verify

Treat every return as a set of claims. Before marking a task done:

1. Check the actual diff against the claimed files and the write scope. Look for
   claimed-but-missing and present-but-unclaimed changes.
2. Re-run the claimed checks yourself, scoped to the change.
3. Confirm the acceptance criteria by observation, not by reading code.

Repair inside the task: send the fix back to the same worker with `SendMessage`, then
rerun the affected checks. Stop after three failed fix cycles on one task and report it.

Important work (security, money, data migrations, shared contracts) gets an
**independent review** by a fresh agent that did not write it. If that can't run,
report the review as pending. Self-review is not the same evidence.

## 6. Ledger

Keep a running ledger in your replies (or in `docs/progress.md` if the project has one):

```
ID  | state   | model  | files           | evidence
T01 | DONE    | opus   | src/db/schema.ts | tsc ok, test filter=Schema ok
T02 | RUNNING | haiku  | fixtures/        |
T03 | BLOCKED | sonnet | -               | needs decision on X
```

States: `TODO → RUNNING → REVIEW → DONE`, or `BLOCKED` with a reason. Never pre-mark
future work done. A pending test is not done.

## 7. Authority

- Commits, pushes, PRs, merges, deploys and anything sent to an external service need
  the user's explicit go-ahead in this conversation. Approval for one does not cover
  the others.
- Preserve local work. Do not delete branches, worktrees or files you did not create.
- Do not bypass hooks or force-push.

## 8. Report

Lead with the outcome. Then the final ledger, what was verified and how, anything
pending (reviews, blockers, decisions the user must make), and any follow-up you did not
have authority to do. No closing recap.
