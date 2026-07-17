---
name: agent-report
description: Outcome-first reporting — first sentence answers "what happened", plain prose for a teammate who stepped away, honest caveats, failures reported as failures with their output, prescribed-but-unauthorized follow-ups named, scratch files cleaned up. Use when composing the final message of any task, and when summarizing findings for a question-shaped ask. Triggers on "write the report", "summarize what happened", "outcome first", "final message", "wrap this up honestly".
allowed-tools: Read, Bash, Glob, Grep
user-invokable: true
---

# Agent report — outcome first, honest throughout

## The first sentence

It answers "what happened" or "what did you find" — the thing the user would ask for
with "just give me the TLDR". Detail and reasoning come after, for readers who want them.
Never open with process ("I started by reading…") or suspense.

## Write for a teammate who stepped away

They didn't watch your process and don't know the shorthand you invented along the way.

- Complete sentences, readable by someone who never saw the code.
- Define jargon at first use; translate numbers into meaning ("about twice as fast",
  not only "420ms → 210ms").
- No codenames or labels invented mid-work, no arrow chains (`A → B → fails`), no method
  scaffolding or step numbers. The ALL-CAPS audit lines from the working phases stay in
  the working output — the report itself is clean prose (PENDING lines are the one
  exception, see below).
- Quote only load-bearing lines. Never dump full files or logs.

## Include the caveats

- What was skipped, what's still weak, what couldn't be verified (carry over every
  `UNVERIFIED:` item as an explicit caveat).
- Failed things are reported as failed, **with their actual output** — plainly, without
  hedging and without success language. "Should work now" is banned vocabulary.
- If the project's docs prescribe a follow-up you deliberately did not take (deploy,
  push, restart, send), name it:

      PENDING: <prescribed action> — awaiting explicit authorization

  A silently dropped prescribed follow-up is a fraud, not a simplification.

## Leave behind only intended changes

Delete scratch files, debug prints, and temporary artifacts created during the work.
Note the cleanup in the report. Debris left behind contradicts the declared scope.

## Follow-ups

Offer only follow-ups that emerged from this task — a caveat listed, a surprise logged,
scope deliberately cut. If none emerged, end without follow-ups. Never pad the ending
with generic offers.

## Hostile-reviewer reread (last step before sending)

Reread your draft as a reviewer looking for fraud:

- [ ] Any claim not actually verified, or dressed in success language?
- [ ] Is the deliverable the right shape for the ASK (findings for a question, change
      for a task, plan for plan-first)?
- [ ] Anything touched outside the declared SCOPE?
- [ ] Every prescribed-but-skipped follow-up carries a PENDING line?
- [ ] Would a teammate who stepped away understand every sentence on first read?

Fix what fails, then send.
