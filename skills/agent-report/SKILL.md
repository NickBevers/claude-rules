---
name: agent-report
description: Outcome-first reporting. Re-read the original ask, open with "what happened" (or with the BLOCKED line when the work was blocked), write plain prose for a teammate who stepped away, carry every caveat, report failures as failures with their output, name prescribed-but-unauthorized follow-ups as PENDING, and clean up scratch files. Use when composing the final message of any task, and when summarizing findings for a question-shaped ask. Triggers on "write the report", "summarize what happened", "outcome first", "final message", "wrap this up honestly".
allowed-tools: Read, Edit, Bash, Glob, Grep
user-invocable: true
---

# Agent report: outcome first, honest throughout

## Re-read the ask first

Before drafting, re-read the user's original message word for word. Every request in
it must end up done, answered, or named as not done. A passing subset is never reported
as whole-task success.

## The first sentence

It answers "what happened" or "what did you find", the thing the user would ask for
with "just give me the TLDR". Detail and reasoning come after, for readers who want them.
Never open with process ("I started by reading…") or suspense. If the work was blocked,
the first sentence says so and quotes the BLOCKED evidence.

## Write for a teammate who stepped away

They didn't watch your process and don't know the shorthand you invented along the way.

- Complete sentences, readable by someone who never saw the code.
- Define jargon at first use; translate numbers into meaning ("about twice as fast",
  not only "420ms → 210ms").
- No codenames or labels invented mid-work, no arrow chains (`A → B → fails`), no method
  scaffolding or step numbers. The ALL-CAPS audit lines from the working phases stay in
  the working output. The final message is clean prose; PENDING and BLOCKED lines are
  the only exceptions.
- Quote only load-bearing lines. Never dump full files or logs.

## Include the caveats

- What was skipped, what's still weak, what couldn't be verified (carry over every
  `UNVERIFIED:` item as an explicit caveat, and every assumption left at `check: none`).
- Failed things are reported as failed, **with their actual output**, plainly, without
  hedging and without success language. "Should work now" is banned vocabulary.
- If the project's docs prescribe a follow-up you deliberately did not take (deploy,
  push, restart, send), name it:

      PENDING: <prescribed action> source=<doc path> reason=<awaiting explicit authorization | blocker>

  Every followup in your DOCS line ends here or in an AUTH line. There is no third
  outcome.

## Leave behind only intended changes

Delete scratch files, debug prints, and temporary artifacts you created during the work.
Keep requested deliverables and pre-existing files. Note the cleanup in the report.

## Follow-ups

Offer only follow-ups that emerged from this task: a caveat listed, a surprise logged,
scope deliberately cut. If none emerged, end without follow-ups. Never pad the ending
with generic offers.

## Hostile-reviewer reread (last step before sending)

Reread your draft as a reviewer looking for fraud:

- [ ] Any claim not actually verified, or dressed in success language?
- [ ] Is the deliverable the right shape for the ASK (findings for a question, change
      for a task, plan for plan-first)?
- [ ] Anything touched outside the declared SCOPE?
- [ ] I re-read the user's original message. Every request in it is done, answered, or
      named as not done
- [ ] Every followup in my DOCS line appears as an AUTH line or a PENDING line
- [ ] If the work was blocked, the first sentence says so and the BLOCKED evidence is quoted
- [ ] Would a teammate who stepped away understand every sentence on first read?

Fix what fails, then send.
