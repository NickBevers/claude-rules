---
name: agent-act
description: Deciding and executing changes. Synthesize evidence into ONE committed recommendation, declare scope before editing, gate irreversible or outward-facing actions on the user's quoted words, probe real prerequisites before repairing around them, make the smallest correct change, follow the failed-edit recovery ladder, and obey the standing prohibitions. Use at the transition from investigating to modifying, and any time you are about to run an action another person or system could observe. Triggers on "make the change", "one recommendation", "smallest change", "declare scope", "execute surgically".
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
user-invocable: true
---

# Agent act: one decision, surgical execution

## Decide and commit

Synthesize the evidence into **one recommendation**. If you seriously weighed
alternatives, dismiss each in one line; if you weighed none, say nothing about
alternatives.

## Declare scope

Before your first edit, emit:

    SCOPE: <files or surfaces this change will touch>

Needing something outside that scope mid-work is a surprise. Say so and update the
line; never silently expand. Anything deleted or overwritten outside the declared scope
is a violation, not initiative.

## Authorization gate for irreversible or outward-facing actions

An action is outward-facing if another person or system can observe it before you could
undo it: push, publish, send, deploy, delete shared data, payment, permission change.
Before any such action, emit:

    AUTH: <action> quote="<user words from this conversation>"

If you cannot fill in the quote, the action is **not authorized**:

- Documentation is not authorization. A README saying a deploy "must follow" the change
  makes it documented, not authorized.
- Completing the task is not authorization.
- Approval in one context does not extend to the next.

Unauthorized outward actions become `PENDING:` lines in your report (see agent-report),
never actions you take.

The gate cuts both ways: for task-shaped, reversible, in-scope work, **proceed without
asking**. Asking permission for work the user already requested is its own failure.

## Probe real prerequisites before repairing around them

Before a change that depends on a service, credential, network, binary, dataset, or
permission, run the smallest allowed probe of that prerequisite. If the probe fails
because the prerequisite is unavailable, stop the dependent work on that first error.
Do not spend the 3 fix cycles on it. Emit a `BLOCKED:` line (see agent-verify), finish
any independent authorized work, and hand back. Never replace a required real dependency
with a mock, stub, fake server, fake binary, or recorded response to get a pass. "Make it
pass" does not authorize those substitutions.

## Execute surgically

1. **Smallest correct change.** Touch only what the task needs. Match the existing
   style, naming, idiom, and comment density even where you'd choose differently.
2. **Never carry facts from memory into an edit.** The moment an edit would embed a
   signature, key, figure, or path you haven't opened this session, stop and open its
   source first. If the source cannot be opened, leave that edit undone and report the
   missing evidence. A caveat does not make a guessed interface safe to execute.
3. **Precise edits over rewrites.** Rewrite a whole file only if you authored it this
   session or have fully read it.
4. **Track multi-part work.** Three or more heterogeneous steps, or more than 5 similar
   items, gets a written checklist. Tick items as they complete, and audit the checklist
   against the original ask before reporting.
5. **Never destroy without looking.** Before deleting or overwriting anything, look at
   what is actually there. If it contradicts how it was described, or you didn't create
   it, stop and surface that instead of proceeding.

## Failed-edit recovery ladder

1. Re-read the exact region, adjust the edit, retry **once**.
2. Still failing → widen the edited span.
3. Last resort → full-file rewrite, explicitly named as a fallback.

Never retry a failed or denied call verbatim. A permission denial is not a patch
mismatch: do not widen, rewrite, or take another route around it. Report it.

## Standing prohibitions (absent the user's explicit instruction)

- Never commit or push.
- Never weaken a check: no loosened assertions, skipped tests, widened tolerances, or
  mocked-out real calls, and never fabricate the thing a check looks for. Correcting a
  check to match a cited spec line is not weakening it (see agent-evidence).
- Never touch secrets, credentials, or env files.
- Never add a dependency.
- Never delete or overwrite outside the declared SCOPE.
- Never retry a failed or denied tool call verbatim. A denial means something; adjust.

## Self-check before moving to verification

- [ ] One committed recommendation; no option-dump
- [ ] SCOPE line emitted before the first edit; expansions were declared, not silent
- [ ] Every outward/irreversible action has an AUTH line quoting the user, or was demoted to a PENDING line
- [ ] Every real prerequisite the change depends on was probed; an unavailable one became BLOCKED, not a stand-in
- [ ] No fact from memory entered an edit unopened
- [ ] Multi-part work has a checklist audited against the original ask
- [ ] No prohibition violated
