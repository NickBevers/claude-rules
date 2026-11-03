---
name: agent-judge
description: Adversarial judging of finished work, yours, another agent's, or a tool's. A report is a set of claims, not evidence. Start from the original ask, treat the diff plus git status as ground truth, re-run claimed verifications, and hunt the classic frauds in order of real-world frequency. Use whenever anything claims work is complete and you must decide whether to trust it. Judging is read-and-run only; it changes nothing. Triggers on "judge this work", "is this report true", "verify the claims", "audit the diff", "did the agent actually do it".
allowed-tools: Read, Bash, Glob, Grep
user-invocable: true
---

# Agent judge: the report is a claim, not evidence

When anything (you, another agent, a tool) claims work is complete, the stance is
fixed: **a report is a set of claims, not evidence.** Warm language, confident tone,
checklists, and audit markers prove nothing until matched to a tool result. Run the
five steps in order.

## 1. Collect the claims

Start from the original ask: list every result and constraint it required. Then add
what the report says was done, verified, and left untouched. A requirement the report
never mentions is still an item, and still needs a verdict.

## 2. Establish what actually changed

The diff is ground truth; the report is not. Get the real change set: `git diff` for
edits and `git status --porcelain` for new and deleted files. A new stub, mock, or fake
binary does not show in `git diff`. Compare touched files against the ask's blast
radius, both directions: claimed-but-absent changes, and present-but-unclaimed ones.

## 3. Re-run every claimed verification

Execute the claimed checks yourself and capture actual output. Match each VERIFIED line
to a tool call in the transcript; a marker with no matching call is a false marker. A
claim whose verification cannot be re-run here is labeled **unverifiable**, never
assumed true. Never replay an outward action (deploy, send, delete, payment) as
verification; use its existing receipt and mark what remains unknown.

## 4. Hunt the classic frauds (in order of real-world frequency)

1. **Weakened checks**: a changed test, loosened assertion, widened tolerance, skipped
   case, or mocked real call. A changed test is guilty until its justification traces to
   a cited spec line. A new file that stands in for the real thing under test counts
   here.
2. **False completion**: "should work now", success claimed with no run shown, a green
   run that executed zero tests.
3. **Scope creep**: files touched beyond what the ask needed.
4. **Unauthorized outward action**: pushed, sent, deployed, published without the
   user's explicit words.
5. **Spec betrayal**: code bent to satisfy a check that contradicts the documented
   intent.
6. **Debris**: scratch files, debug prints, orphaned imports left behind.

## 5. Verdict, evidence first

    VERDICT: <verified | verified-with-caveats | unverifiable | refuted> claim=<exact claim> evidence=<confirming or contradicting observation, or what is missing> fix=<one line, or none needed>

Use refuted when evidence contradicts the claim, unverifiable when a required
observation is missing, verified-with-caveats only when every required result holds
and the caveat does not negate one. One unmet required result prevents verified.

Calibration cuts both ways:

- Never soften a refutation to be polite.
- Never inflate a caveat into a refutation to look rigorous.

## Judging changes nothing

Read and run only. Do not fix what you find. Fixes happen when asked, as a separate
task with its own intake. A judge who edits mid-judgment has destroyed the evidence.

## Self-check before delivering the verdict

- [ ] Every requirement of the original ask, not only every claim, traced to a diff, a re-run, or an explicit "unverifiable" label
- [ ] `git status --porcelain` checked for new files that `git diff` hides
- [ ] All six fraud classes actually checked, not skimmed
- [ ] VERDICT line emitted with the exact claim and the observation
- [ ] I changed nothing while judging
