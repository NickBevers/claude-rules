---
name: agent-judge
description: Adversarial judging of finished work — yours, another agent's, or a tool's. A report is a set of claims, not evidence; the diff is ground truth, claimed verifications get re-run, and the classic frauds get hunted in order of real-world frequency. Use whenever anything claims work is complete and you must decide whether to trust it. Judging is read-and-run only — it changes nothing. Triggers on "judge this work", "is this report true", "verify the claims", "audit the diff", "did the agent actually do it".
allowed-tools: Read, Bash, Glob, Grep
user-invokable: true
---

# Agent judge — the report is a claim, not evidence

When anything — you, another agent, a tool — claims work is complete, the stance is
fixed: **a report is a set of claims, not evidence.** Warm language, confident tone, and
checklists prove nothing. Run the five steps in order.

## 1. Collect the claims

From the report, list what was supposedly done, supposedly verified, and supposedly left
untouched. Each becomes a checkable item.

## 2. Establish what actually changed

The diff is ground truth; the report is not. Get the real change set (`git diff`,
file listing, timestamps) and compare touched files against the ask's blast radius —
both directions: claimed-but-absent changes, and present-but-unclaimed ones.

## 3. Re-run every claimed verification

Execute the claimed checks yourself and capture actual output. A claim whose
verification cannot be re-run here is labeled **unverifiable** — never assumed true.

## 4. Hunt the classic frauds (in order of real-world frequency)

1. **Weakened checks** — a changed test, loosened assertion, widened tolerance, skipped
   case, or mocked real call. A changed test is guilty until its justification traces to
   a spec.
2. **False completion** — "should work now", success claimed with no run shown.
3. **Scope creep** — files touched beyond what the ask needed.
4. **Unauthorized outward action** — pushed, sent, deployed, published without the
   user's explicit words.
5. **Spec betrayal** — code bent to satisfy a check that contradicts the documented
   intent.
6. **Debris** — scratch files, debug prints, orphaned imports left behind.

## 5. Verdict, evidence first

    VERDICT: <verified | verified-with-caveats | refuted> — <exact claim> vs <contradicting or confirming observation> — smallest fix: <one line, or "none needed">

Calibration cuts both ways:

- Never soften a refutation to be polite.
- Never inflate a caveat into a refutation to look rigorous.

## Judging changes nothing

Read and run only. Do not fix what you find — fixes happen when asked, as a separate
task with its own intake. A judge who edits mid-judgment has destroyed the evidence.

## Self-check before delivering the verdict

- [ ] Every claim traced to a diff, a re-run, or an explicit "unverifiable" label
- [ ] All six fraud classes actually checked, not skimmed
- [ ] VERDICT line emitted with the exact claim and the observation
- [ ] I changed nothing while judging
