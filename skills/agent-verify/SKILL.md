---
name: agent-verify
description: Verification by observation — prove the done criterion by running/rendering/counting it (never by re-reading the code), confirm the surrounding system still works, sweep the project for twin defects after any bug fix, and stop honestly after 3 failed fix cycles. Use after every change, before writing the report. An unverified claim never passes as a verified one. Triggers on "verify this", "did it actually work", "run it don't read it", "check the fix", "twin sweep".
allowed-tools: Read, Bash, Glob, Grep
user-invokable: true
---

# Agent verify — observed, not inferred

Verification has two mandatory halves, plus a third whenever a defect was fixed.

## (a) The done criterion, observed

It ran, it rendered, it counted — **not** inferred from reading the code. Where a runtime
exists, exercise the affected flow end-to-end, not just typecheck. For each claim, emit:

    VERIFIED: <criterion> — <command or action run> → <actual observed result>

The right side must be an observation ("pytest tests/api -q → 42 passed"), never a
belief ("should pass now"). If you did not run it, you did not verify it.

## (b) The surrounding system still works

Run the tests, build, or lint covering the touched area. A green targeted check with a
broken build is a **failed** verification, not a partial success.

## (c) Twin sweep — mandatory after fixing any defect

A bug found in one place is presumed to recur elsewhere until searched. Name the exact
wrong construct, search the whole project for it, and report the count:

    TWINS: pattern=<exact construct searched> hits=<n> → <all fixed | listed in report>

A completeness claim with no search behind it is verification theater. Zero hits is a
fine result — the line proves you looked.

## When verification fails, route the failure

- A **mechanical mistake** (typo, wrong span, missed import) → go back to the edit.
- A failure that **surprises** you → go back to evidence gathering; your model of the
  system is wrong somewhere, and patching blind makes it worse.

**Hard bound:** after ~3 failed fix-verify cycles on the same issue, or when blocked by
anything outside your control (credentials, environment, permissions) — stop. Report
what was tried, the actual output, and your current hypothesis, and hand back to the
user. Retry thrash burns everything and exits nowhere.

## The no-third-option rule

If something cannot be verified (no runtime, needs credentials, needs human eyes), say
exactly that:

    UNVERIFIED: <claim> — <why it could not be verified here>

Every claim in your report is either VERIFIED with an observation or UNVERIFIED with a
reason. There is no third option, and no success language on UNVERIFIED items.

## Self-check before reporting

- [ ] Every done-criterion claim has a VERIFIED line with an actual observation
- [ ] Surrounding tests/build/lint for the touched area were run, results captured
- [ ] If a defect was fixed: TWINS line with a real search count
- [ ] Failures routed (edit vs evidence), and I stopped at the 3-cycle bound
- [ ] Everything unverifiable carries an UNVERIFIED line, not a hedge
