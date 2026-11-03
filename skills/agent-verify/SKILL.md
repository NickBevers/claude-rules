---
name: agent-verify
description: Verification by observation. Prove the done criterion by running it (never by re-reading the code) and copy the result from the tool output, confirm the surrounding system still works, sweep the project for twin defects with two patterns after any bug fix, stop after exactly 3 failed fix cycles, and report an impossible task as BLOCKED instead of faking a green check. Use after every change, before writing the report. Triggers on "verify this", "did it actually work", "run it don't read it", "check the fix", "twin sweep".
allowed-tools: Read, Bash, Glob, Grep
user-invocable: true
---

# Agent verify: observed, not inferred

Verification has two mandatory halves, plus a third whenever a defect was fixed.

## (a) The done criterion, observed

It ran, it rendered, it counted, **not** inferred from reading the code. Where a runtime
exists, exercise the affected flow end-to-end, not just typecheck. For each claim, emit:

    VERIFIED: <criterion> ran=<command or action> saw=<result copied from the output>

The right side must be an observation ("pytest tests/api -q → 42 passed"), never a
belief ("should pass now"). Write the line only after the tool call has returned. The
command must be one you ran in this session, and the result must be copied from its
output, not paraphrased. A VERIFIED line with no matching tool call above it is a false
marker. A false marker is worse than a missing one. A green run that executed zero tests
or skipped the failing case is not a pass.

## (b) The surrounding system still works

Run the tests, build, or lint covering the touched area. A green targeted check with a
broken build is a **failed** verification, not a partial success.

## (c) Twin sweep, mandatory after fixing any defect

A bug found in one place is presumed to recur elsewhere until searched. Search the whole
project with at least two patterns. Pattern 1 is the identifier: the function, variable,
or key name. Pattern 2 is the wrong expression itself with names stripped, for example
`- 1)` or `/ len(`. A twin can be inlined under another name, and pattern 1 cannot find
it. Open every hit and judge it. Fixing a twin is in scope; add its file to SCOPE first.

    TWINS: patterns=<p1>; <p2> hits=<n> result=<all fixed | listed in report>

A completeness claim with no search behind it is verification theater. Zero hits is a
fine result; the line proves you looked.

## When verification fails, route the failure

- A **mechanical mistake** (typo, wrong span, missed import) → go back to the edit.
- A failure that **surprises** you → go back to evidence gathering; your model of the
  system is wrong somewhere, and patching blind makes it worse.

**Hard bound:** after 3 failed fix-verify cycles on the same issue (number them in your
notes: `cycle 2/3`; changing tactics does not reset the count), stop. Report what was
tried, the actual output, and your current hypothesis, and hand back to the user.

## The no-third-option rule

If something cannot be verified (no runtime, needs credentials, needs human eyes), say
exactly that:

    UNVERIFIED: <claim> why=<reason it could not be verified here>

Every claim in your report is either VERIFIED with an observation or UNVERIFIED with a
reason. There is no third option, and no success language on UNVERIFIED items.

## Blocked is a valid result. A faked green is the worst one.

These moves make a check pass without making the claim true. Each one is fabrication:

- adding a mock, stub, fake server, or fake binary for the thing under test
- hardcoding the value the check looks for
- editing the check, its fixtures, or its config, unless an INTENT line cites the spec
  line that makes the check wrong
- wrapping the failing part in skip, xfail, try/except, or `|| true`
- changing env vars, PATH, or flags so the real call never runs

If the done criterion can only be met by one of these moves, the task is blocked. Stop
now. Do not use up the 3 cycles first. The same applies to a missing credential,
network, service, or binary: stop on the first error that shows it. Emit:

    BLOCKED: criterion=<done criterion> needs=<missing thing> evidence="<error line copied from output>"

Lead the report with it. An honest BLOCKED report meets the done criterion. A green
check from a move on this list fails it.

## Self-check before reporting

- [ ] Every done-criterion claim has a VERIFIED line that copies output from a tool call above it
- [ ] Surrounding tests/build/lint for the touched area were run, results captured
- [ ] If a defect was fixed: TWINS line with two patterns and a real hit count
- [ ] Failures routed (edit vs evidence), and I stopped at cycle 3
- [ ] Everything unverifiable carries an UNVERIFIED line, not a hedge
- [ ] I listed changed and new files (`git status --porcelain`). None is a test, fixture,
      mock, or stub unless an INTENT line cites the spec line that makes it necessary
- [ ] If the criterion could only be met by fabrication or a missing prerequisite: BLOCKED
      line emitted, nothing faked
