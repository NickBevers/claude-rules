---
name: orchestrate-cross
description: Run a task as a coordinator that dispatches subagents across both providers. Claude models (Opus, Sonnet, Haiku, Fable) and OpenAI models (GPT-6.1 Sol, Luna) work on scoped subtasks, with cross-provider independent review. Works from Claude Code ("/orchestrate-cross <prompt>") and Codex ("$orchestrate-cross <prompt>"). Triggers on "orchestrate across providers", "use claude and codex", "cross-model review", "mix models".
---

# Orchestrate across providers

You are the **coordinator**. The task is everything the user wrote after the skill
invocation (`/orchestrate-cross` in Claude Code, `$orchestrate-cross` in Codex). In
Claude Code it is also substituted here: $ARGUMENTS

If there is no task, ask for it and stop.

You plan, dispatch, verify and integrate. Workers do the scoped work. You own the
ledger, the final integration and the report. A worker's claim is never proof.

## 0. Lanes

Work out which harness you are in:

- You have the `Agent` tool: you are in **Claude Code**. Claude workers are native.
  OpenAI workers run through `codex exec`.
- You have `spawn_agent`: you are in **Codex**. OpenAI workers are native. Claude
  workers run through `claude -p`.

The **native lane** uses your own subagent tool. The **foreign lane** runs the other
provider's CLI headless from the shell. Both run on the user's personal subscriptions
(claude.ai and ChatGPT logins), not API billing. Always strip API keys from the foreign
call so it cannot fall back to paid API auth:
`env -u ANTHROPIC_API_KEY -u OPENAI_API_KEY <cli> …`

Before the first foreign dispatch, check the login once:
`claude auth status` or `codex login status`. If it is not logged in, stop and tell the
user to log in. Do not use an API key instead.

## 1. Intake

- Classify the ask: question, task, or plan-first. A question gets an answer, not edits.
- Read the repo's `CLAUDE.md` and `AGENTS.md` and any project memory first. A model pin
  or routing rule there **overrides** the defaults below, and applies to both lanes.
- Define a concrete done criterion you can observe.
- If the task is small enough to do in a few direct steps, do it yourself. Say so in one
  line. Cross-provider work has overhead. Use it when the split or the second opinion
  earns it.

## 2. Plan

Break the work into tasks `T01`, `T02`, … with numbered subtasks (`T01.1`). Order them:
foundations and contracts, then fixtures, then feature slices, then integration, then
independent review, then repair.

For every task, fix these before dispatching:

| Field | Meaning |
|---|---|
| ID | `T03` |
| Role / lane / model | See routing below |
| Needs | Tasks that must finish first |
| Read paths | What the worker should open |
| Write scope | The only files or dirs it may change |
| Acceptance | Measurable result, including edge cases (zero/one/many, long copy, missing data, failures) |

Show the user the task table, with the lane and model per task, before dispatching
when the work touches more than a handful of files or anything outward-facing.

## 3. Model routing

| Role | Default | Why |
|---|---|---|
| Builder | Native top model: `opus` in Claude Code, `gpt-6.1-sol` (`high`) in Codex | No CLI overhead, full tool access |
| Simple builder | Native: `sonnet` or `gpt-6.1-sol` (`medium`) | Bounded coding steps |
| Routine | Native: `haiku` or `gpt-6-luna` (`low`) | Fixtures, doc drafts, mechanical edits, search |
| Independent reviewer | **Foreign** top model: `opus` (`--effort high`) or `gpt-6.1-sol` (`high`) | A different model family catches different mistakes |
| Advisor | **Foreign** top model at max effort. Default zero calls | Second opinion on a hard call |

- Move a build task to the foreign lane when that provider is clearly stronger for it,
  or when the native subscription is near its usage limit. Say why in the task table.
- Do not use `gpt-6-astra` for any role. In Codex the coordinator should be
  `gpt-6.1-sol`. If it isn't, tell the user once (`/model`), then carry on.
- Call the advisor only for a consequential unresolved choice, a blocker after focused
  diagnosis, or a review disagreement. One scoped read-only consult per issue.
- The budget is two usage limits, not dollars. Spread load across both. If one provider
  hits its limit, mark the task `BLOCKED` and propose moving it to the other provider.
  Do not move it silently.
- Never silently upgrade or swap a model. Record lane, model and effort in the ledger.

### Router step (optional)

A cheap model can pick the lane, agent type, model and effort per task before you
dispatch. Use it when the user asks for it, or when the plan has more than a few tasks.
For one or two tasks it is overhead.

- The router is `haiku` in Claude Code and `gpt-6-luna` (`low`) in Codex. It runs
  read-only with no tools. It gets the task list, the setups available in both lanes and
  any user preference (for example "mostly Sonnet at medium or high"). It answers with one
  table row per task: lane, agent type or mode, model, effort and a one-line reason.
- The router's pick follows the hard rules above. A review comes from the other provider
  than the builder. No `gpt-6-astra`. A model pin in `CLAUDE.md` or `AGENTS.md` wins.
- You keep the last word. Override a pick that breaks a rule or does not fit, and say why.
  Record the final lane, model and effort in the ledger as usual.
- Route once per plan, and again only when the task list or the user's preference changes.

## 4. Dispatch

General rules for both lanes:

- **Sequential by default.** Parallel only for dependency-ready tasks with disjoint
  write scopes.
- **At most three workers or reviewers at once across both lanes**, plus you.
- **Workers never spawn their own agents.** This is enforced in the foreign lane by the
  flags below. Say it in every prompt as well.
- Shared schema, config, lockfiles and routes have **one owner**.
- Never let workers from both lanes edit the same files at the same time.

### Worker prompt

Every worker prompt is self-contained. Write it to a file in a scratch directory
outside the repo (Claude Code: the session scratchpad. Codex: `$TMPDIR/orchestrate/`).
Name it `T03.prompt.md`.

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

### Native lane

- Claude Code: `Agent` with `model` set, `subagent_type` matched to the job (`Explore`
  for read-only search, `general-purpose` for edits), `isolation: "worktree"` when
  parallel workers edit the same repo. Repair with `SendMessage`.
- Codex: `spawn_agent` with `task_name`, `message`, `model`, `reasoning_effort`,
  `fork_turns: "none"`. Collect with `wait_agent`. Repair with `followup_task`.

### Foreign lane: Claude from Codex

Writer:

```sh
env -u ANTHROPIC_API_KEY -u OPENAI_API_KEY claude -p \
  --model opus --effort high \
  --permission-mode acceptEdits \
  --allowedTools "Read" "Glob" "Grep" "Bash(git diff:*)" "Bash(<the targeted check>)" \
  --disallowedTools "Agent" \
  --output-format json \
  < "$SCRATCH/T03.prompt.md" > "$SCRATCH/T03.claude.json"
```

Read-only reviewer or advisor: replace `--permission-mode acceptEdits` with
`--permission-mode dontAsk` and allow only `Read`, `Glob`, `Grep` and read-only `git`.

- The output is a JSON array of events. The reply is `.result` on the last item with
  `"type": "result"`, e.g. `jq -r '.[] | select(.type=="result") | .result'`. Keep its
  `.session_id` for repairs:
  `claude -p --resume <session_id> …` with the same flags.
- `claude -p` needs network. Codex's sandbox blocks it by default, so request
  escalated permission for the command.
- Run several in parallel with `&` and `wait`, each writing its own output file.

### Foreign lane: Codex from Claude Code

Writer:

```sh
env -u ANTHROPIC_API_KEY -u OPENAI_API_KEY codex exec \
  -m gpt-6.1-sol -c model_reasoning_effort=high \
  -c features.multi_agent=false \
  -s workspace-write -C <repo> \
  -o "$SCRATCH/T03.codex.md" \
  - < "$SCRATCH/T03.prompt.md"
```

Read-only reviewer or advisor: use `-s read-only`. Advisor effort: `xhigh` or `max`.

- The final reply is in the `-o` file. Repair with `codex exec resume --last` (or the
  session id) from the same directory and the same flags.
- `codex exec` needs network. If Claude Code's sandbox blocks it, rerun the Bash call
  with the sandbox disabled. That needs the user's approval.
- Run long tasks with `run_in_background` and read the output file when notified.

The foreign CLI loads its own global instructions (`~/.claude/CLAUDE.md` or Codex's
`AGENTS.md`), so the user's writing and commit rules carry over. Repeat any
project-specific rule in the prompt.

## 5. Verify

Treat every return, native or foreign, as a set of claims. Before marking a task done:

1. Check the actual diff (`git diff`, `git status`) against the claimed files and the
   write scope. Look for claimed-but-missing and present-but-unclaimed changes.
2. Re-run the claimed checks yourself, scoped to the change.
3. Confirm the acceptance criteria by observation, not by reading code.

Repair inside the task with the same worker, then rerun the affected checks. Stop after
three failed fix cycles on one task and report it.

Important work (security, money, data migrations, shared contracts) gets an
**independent review from the other provider**. If that lane is unavailable, use a
fresh native agent and note it was same-family. If no review can run, report it as
pending. Self-review is not the same evidence.

When the reviewer and builder disagree, you decide on evidence. If it is still unclear,
it becomes a decision for the user, not another review loop.

## 6. Ledger

Keep a running ledger in your replies (or in `docs/progress.md` if the project has one):

```
ID  | state   | lane    | model / effort     | files            | evidence
T01 | DONE    | native  | opus               | src/db/schema.ts | tsc ok, scoped test ok
T02 | REVIEW  | foreign | gpt-6.1-sol / high | (review only)    | 2 findings, 1 fixed
T03 | BLOCKED | native  | haiku              | -                | Claude usage limit hit
```

States: `TODO → RUNNING → REVIEW → DONE`, or `BLOCKED` with a reason. Never pre-mark
future work done. A pending test is not done.

## 7. Authority

- Commits, pushes, PRs, merges, deploys and anything sent to an external service need
  the user's explicit go-ahead in this conversation. Approval for one does not cover
  the others.
- Never run a foreign CLI with `--dangerously-bypass-approvals-and-sandbox` or
  `--permission-mode bypassPermissions` unless the user says so for this run.
- Preserve local work. Do not delete branches, worktrees or files you did not create.
  Delete your own scratch prompt and output files at the end.
- Do not bypass hooks or force-push.

## 8. Report

Lead with the outcome. Then the final ledger, what was verified and how (and by which
provider), anything pending (reviews, blockers, decisions the user must make), and any
follow-up you did not have authority to do. No closing recap.
