---
name: pr-review
description: End-to-end GitHub pull request review that waits for CI to finish before judging, then loops if CI fails. Triggers on "review PR", "review pull request", "review this PR", "look at PR #", "review github PR", "babysit PR", "wait for CI", "PR review with CI".
allowed-tools: Bash, Read, Glob, Grep, Agent, ScheduleWakeup, Skill
---

# PR Review — CI-Aware GitHub Pull Request Review

A complete, evidence-based review of a GitHub pull request that **does not pass judgment until CI has finished**. It fetches the diff, reviews the code, watches the checks, and — if CI fails — loops: it surfaces the failure, optionally re-reviews after a fix, and waits for CI again. It only renders a final verdict once the checks are green (or the user tells it to stop).

This skill is the union of three jobs that usually get done separately and badly:
1. **Code review** of the actual diff (correctness, security, performance, maintainability).
2. **CI gatekeeping** — never approve a PR while checks are pending or red.
3. **Patience** — wait for slow CI without burning the user's turn, using a scheduled wake-up.

---

## Prerequisites

Run these once at the start. Do not assume — verify.

```bash
gh auth status          # must be logged in; if not, tell user to run: gh auth login
gh --version            # need gh present
```

- If `gh` is missing: stop and tell the user to install it (`brew install gh`).
- If not authenticated: stop and tell the user to run `! gh auth login` in this session (the `!` prefix runs it inline so output lands here).
- All `gh` calls below assume the current repo, or an explicit `--repo owner/name` when the user names one. Resolve the repo with `gh repo view --json nameWithOwner -q .nameWithOwner` if unsure.

---

## Step 0 — Identify the PR

Resolve exactly which PR to review. Accept any of:
- An explicit number (`#42` / `42`) → `PR=42`.
- A URL (`https://github.com/owner/repo/pull/42`) → parse the number and repo.
- "my PR" / "this branch" → `gh pr view --json number,headRefName -q .number` (current branch's PR).
- Nothing → `gh pr list --json number,title,author,headRefName` and ask which one.

Set `PR` and (if cross-repo) `REPO="--repo owner/name"` for all later commands.

Pull the metadata once and keep it:

```bash
gh pr view "$PR" $REPO --json number,title,author,state,isDraft,baseRefName,headRefName,additions,deletions,changedFiles,mergeable,mergeStateStatus,url,body
```

- If `isDraft` is true: note it. Review anyway, but the final verdict is "draft — not ready to merge regardless of CI."
- If `state` is not `OPEN`: tell the user it's closed/merged and stop unless they insist.

---

## Step 1 — Fetch the diff

Get the full diff and the file list:

```bash
gh pr diff "$PR" $REPO                                  # full unified diff
gh pr view "$PR" $REPO --json files -q '.files[].path'  # changed file paths
```

For large PRs, also read the surrounding code (not just the diff) for the files with the most changes — a diff in isolation hides broken assumptions. Use `Read`/`Grep` on the checked-out branch when available:

```bash
gh pr checkout "$PR" $REPO   # only if the user wants local checkout / to run things
```

> Do not check out unless needed — reviewing from the diff is non-destructive and avoids touching the user's working tree.

---

## Step 2 — Review the code

Reuse the project's review discipline. **If the `code-review` skill is available, invoke it on the diff scope** rather than re-deriving criteria here — this skill owns the *workflow*, `code-review` owns the *rubric*.

For PRs spanning 5+ files, spawn parallel review agents (Agent tool), one message, concurrent:

- **Agent A — Security & Correctness**: auth flaws, injection, data leaks, race conditions, error handling, input validation, off-by-one, null/undefined paths.
- **Agent B — Performance & Architecture**: N+1 queries, re-renders, bundle impact, missing indexes, abstraction quality, dead code, API shape.
- **Agent C — Tests & Coverage**: are the changed paths tested? Do the new tests actually assert behavior, or just run? Edge cases missing?

Apply the project's stack-specific checks (from `code-review` / `rules/`):
- **Frontend (Astro/Preact)**: island hydration, CSS Modules, Nanostores for cross-island state, explicit image dimensions, no barrel imports, only `transform`/`opacity` animated.
- **Backend (Hono)**: `env(c)` not `Bun.env`, Zod on all inputs, `{ error, message }` error shape, no leaked stack traces.
- **Database (Drizzle)**: TEXT not VARCHAR, soft-delete filters, no destructive migrations without a backup plan, MD5 hash indexes for TEXT.
- **Security**: Argon2id via `Bun.password`, HTTP-only/Secure/SameSite=Strict cookies, rate limiting on auth, no secrets in code.
- **a11y**: any UI change runs through `a11y-hawk` (WCAG 2.2 AA) before "approve."

Rate every finding **Critical / Important / Suggestion**. Every finding cites `file:line` and gives a concrete fix. Skip praise, skip linter-handled style, skip things the PR didn't change.

**Hold the verdict.** Do not post or declare an outcome yet — CI comes first.

---

## Step 3 — Inspect CI status (the gate)

Read the current state of all checks:

```bash
gh pr checks "$PR" $REPO                                              # human-readable table
gh pr checks "$PR" $REPO --json name,state,bucket,link,completedAt    # machine-readable
```

Classify the aggregate state into exactly one bucket:

| Bucket | Meaning | Action |
|---|---|---|
| **PENDING** | any check is `IN_PROGRESS`, `QUEUED`, `PENDING`, `EXPECTED` | → **Step 4: wait** |
| **PASS** | every required check is `SUCCESS` (skipped/neutral OK) | → **Step 6: verdict** |
| **FAIL** | any check is `FAILURE`, `ERROR`, `CANCELLED`, `TIMED_OUT`, `ACTION_REQUIRED` | → **Step 5: handle failure** |
| **NONE** | no checks configured on this repo/PR | → note it, skip to **Step 6** with a "no CI configured" caveat |

> `gh pr checks` exits non-zero when checks are failing or pending. Capture the exit code AND parse the JSON — don't rely on exit code alone.

---

## Step 4 — Wait for CI (scheduled ping, not busy-wait)

**Do not block the turn polling in a tight loop.** Pick the right waiting mechanism:

### Preferred: scheduled wake-up (self-paced loop)
Use `ScheduleWakeup` to come back when CI is likely further along. CI feedback the harness can't notify you about is exactly the "external state" case — poll it, but at a cadence matched to the run, not every few seconds.

- Estimate remaining time from `completedAt`/typical run length. Most CI runs are minutes, not seconds.
- **Cadence**: if a typical run is ~8 min, sleep ~270s and re-check (twice) rather than every 60s — that keeps the prompt cache warm and avoids hammering. For longer pipelines, sleep 1200s+.
- Each wake-up: re-run **Step 3**. If still PENDING, schedule again. If PASS/FAIL, proceed.
- Tell the user what you're doing: "CI is running (`build`, `test` in progress). I'll check back in ~5 min and won't approve until it's green."

If the user invoked this via `/loop` (self-paced), honor that — `ScheduleWakeup` with the same loop prompt is the mechanism; omit the call to end the loop once CI resolves.

### Alternative: block on the run (only when the user is actively waiting and the run is short)
```bash
# Find the run for this PR's head SHA, then watch it to completion:
SHA=$(gh pr view "$PR" $REPO --json headRefOid -q .headRefOid)
gh run list $REPO --commit "$SHA" --json databaseId,status,name -q '.[0].databaseId'
gh run watch <run-id> $REPO --exit-status   # exits non-zero if the run fails
```
`gh run watch` streams to completion. Use it for a short run when the user explicitly wants to sit and wait; prefer the scheduled wake-up otherwise so you don't hold the turn.

> Never declare PASS while anything is PENDING. Waiting is the whole point of this skill.

---

## Step 5 — Handle CI failure, then loop

When CI is FAIL, do not just say "CI failed." Diagnose:

```bash
SHA=$(gh pr view "$PR" $REPO --json headRefOid -q .headRefOid)
RUN=$(gh run list $REPO --commit "$SHA" --json databaseId,conclusion,name \
        -q '.[] | select(.conclusion=="failure") | .databaseId' | head -1)
gh run view "$RUN" $REPO                         # job/step breakdown
gh run view "$RUN" $REPO --log-failed            # only the failing step logs
```

Then:
1. **Summarize the failure** in plain terms: which job, which step, the key error line(s) from `--log-failed`. Distinguish *flaky/infra* (timeout, runner died, network) from *real* (test assertion, type error, lint, build break).
2. **Decide the loop branch**:
   - **Flaky / infra** → offer to re-run: `gh run rerun "$RUN" $REPO --failed`. Then go back to **Step 4** (wait again).
   - **Real failure, fix is in scope and the user wants it** → fix it (respecting "only change what was asked"), push, and the new commit triggers fresh CI → back to **Step 4**.
   - **Real failure, not yours to fix** → report it as a **Critical** blocking finding and stop the wait loop; the verdict is BLOCK pending the author's fix.
3. **Re-review if the diff changed.** If a fix was pushed (by you or the author), the diff is different — re-run **Step 2** on the new diff before re-judging. Don't approve code you reviewed two commits ago.

**The loop is:** review → wait for CI → on fail, diagnose + (rerun | fix | report) → if code changed, re-review → wait for CI → … until **PASS** or the user stops it. Use `ScheduleWakeup` to drive the waits between iterations so each pass is cheap.

---

## Step 6 — Final verdict

Only reachable when CI is **PASS** (or NONE, with the caveat called out). Present:

```
## PR #<n> — <title>
**Author**: <author>   **Branch**: <head> → <base>   **Size**: +<add>/-<del>, <files> files
**CI**: ✅ all checks green (<list>)   |   ⚠️ no CI configured   |   (draft)

### Findings
## [Critical/Important/Suggestion] — <short description>
**File**: path/to/file.ts:42
**Issue**: what's wrong and why it matters
**Fix**: concrete change

### Summary
- Critical: N (must fix before merge)
- Important: N (should fix)
- Suggestions: N (nice to have)
- CI: PASS / FAIL / PENDING-resolved-to-PASS
- Verdict: APPROVE / NEEDS WORK / BLOCK
```

Rules for the verdict:
- **BLOCK** if any Critical finding exists, OR CI is not green, OR it's a draft.
- **NEEDS WORK** if Important findings exist but CI is green and nothing is Critical.
- **APPROVE** only when CI is green, no Critical/Important findings remain, and (for UI) `a11y-hawk` passed.

---

## Step 7 — Post the review (only if asked)

Posting to GitHub is outward-facing — **confirm before posting** unless the user already said "post it."

```bash
# Inline review with a decision:
gh pr review "$PR" $REPO --comment -b "<summary>"     # neutral comment
gh pr review "$PR" $REPO --request-changes -b "<...>" # blocking
gh pr review "$PR" $REPO --approve -b "<...>"         # only if Step 6 = APPROVE & CI green

# Per-line comments for individual findings (preferred for actionable items):
# use the code-review skill's --comment path, or `gh api` to add review comments.
```

- Never `--approve` while CI is red or pending — that defeats the skill.
- If the project's `code-review` skill supports `--comment`/`--fix`, route posting/fixes through it for consistency.

---

## Guardrails

- **Never declare a verdict while CI is pending or failing.** Wait, or report the failure — never approve around it.
- **Re-review after every code change.** A fix invalidates the prior review; re-run Step 2 on the new diff.
- **Wait cheaply.** Use `ScheduleWakeup` with a cadence matched to the run length (≤270s to stay in cache for short runs, 1200s+ for long ones). Don't tight-loop `gh pr checks`.
- **Distinguish flaky from real** before re-running CI; don't burn minutes re-running a genuine failure.
- **Outward-facing actions need confirmation** — posting reviews, pushing fixes, re-running CI all touch the PR; confirm unless told to proceed.
- **Respect scope** — fix only what the user asked; surface everything else as findings.
- **Honor `/loop`** — if invoked under loop/self-pacing, drive the wait with `ScheduleWakeup` and end the loop when CI resolves.

---

## Quick reference — gh commands

```bash
gh pr view <n> --json <fields>          # metadata
gh pr diff <n>                          # diff
gh pr checks <n> --json name,state,bucket,link   # CI status (the gate)
gh pr checkout <n>                      # local checkout (only if needed)
gh run list --commit <sha>              # find the run for the head SHA
gh run watch <id> --exit-status         # block on a run to completion
gh run view <id> --log-failed           # failing-step logs only
gh run rerun <id> --failed              # re-run only failed jobs (flaky CI)
gh pr review <n> --approve|--request-changes|--comment -b "..."   # post
```
