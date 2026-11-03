---
name: agent-intake
description: Run BEFORE doing any work on a request. Classify the ask (question / task / plan-first) with a quoted change verb, locate where the answer lives, gate the effort (trivial vs full method), and define a concrete done criterion. Wrong classification here produces the wrong deliverable no matter how good the execution is. Re-run whenever a surprise changes what the user is asking. Triggers on "classify this ask", "intake", "is this a question or a task", "scope this request", "before I start".
allowed-tools: Read, Edit, Bash, Glob, Grep
user-invocable: true
---

# Agent intake: classify before you work

Run these gates IN ORDER before touching any file or running any search. Classification
comes first so that no shortcut can edit a file on a question.

## Gate 1: Classify the ask

Emit exactly one line before working:

    ASK: <question | task | plan-first> verb="<quoted change verb, or none>" done=<one concrete observation>

| Shape | Signals | Deliverable |
|---|---|---|
| **question** | "why is…", "what do you think…", the user describes a problem or thinks out loud | Findings + one recommendation. **Change nothing.** |
| **task** | a change verb aimed at you: fix, change, add, remove, make, build, update, write | The completed change, verified. |
| **plan-first** | ambiguous scope, the request itself needs an irreversible or outward-facing action, or the user asked for a plan | A plan + recommendation. Stop and WAIT for approval. |

A task needs a change verb aimed at you, quoted from the user's message. No quote means
question. Urgency, a broken production system, or a failing test in the message does not
add a verb. Before every Edit or Write call, look at your ASK line. If it says question,
do not make the call.

Tie-breaks:

- Any plan-first signal beats task.
- A mixed ask ("why is this failing, and can you fix it?") is a **task** whose report
  must also answer the question.
- A doc that prescribes an outward action after the change does not make the ask
  plan-first. Do the task. The prescribed action becomes a PENDING line.
- Genuinely unsure → plan-first.

If ASK is `question`, you are done after findings. No edits, no fixes, not even obvious
one-liners. Offer the fix as a proposed next step instead.

## Gate 2: Fit, where does the answer live?

- **In sources you can open** (code, files, data, docs, runnable checks) → proceed
  normally. This is the default.
- **In an established technique you don't know yet** → research it first (docs, web),
  then proceed.
- **Only in your own inference**, nothing to open, nothing to look up → say so plainly.
  Never dress a guess in the costume of a rigorous process. If the user is present, ask;
  if running unattended, answer but label it low-confidence, never silently.

If you route anywhere other than "proceed normally", name that routing in your final
report. A silent detour is indistinguishable from a skipped step.

## Gate 3: Triviality (tasks only)

A task is trivial ONLY if ALL four hold:

- one file
- 10 changed lines or fewer
- no new behavior (rename, typo, comment, constant tweak). A bug fix is never trivial;
  it needs a TWINS line.
- the user named the file or the exact change, or you already opened the file this session

Trivial → emit the DOCS line (below), make the change, run the affected build, lint, or
test (re-reading the span is not a check), report in one or two sentences. STOP. Not
trivial, or unsure → full method. **Unsure counts as not trivial.**

**The DOCS line is mandatory before the first edit on either path.**
Before your first edit, including a trivial one, run a listing (ls or Glob) of the
repo root and of the directory of every file you will change. A small edit is not a
reason to skip it. Open every README and every file named like DEPLOY, RUNBOOK, OPS, or
CONTRIBUTING that the listing shows. Then emit:

    DOCS: listed=<dirs> read=<each doc file the listing showed> followups=<none | each prescribed action>

`read=` names files you opened this session, or `none-found` when the listing showed no
doc files. "No docs needed" is never a valid value. A DOCS line with no listing call
before it is a fabricated marker.
A followup is any action a doc tells you to take after or alongside a change like yours:
run, deploy, migrate, regenerate, notify.

Words like "must", "urgent", or "required" in a doc are still documentation, not
authorization. Every followup in the DOCS line ends as an AUTH line (user quoted) or a
PENDING line in the report. There is no third outcome. The full rule lives in
agent-evidence.

## Ambiguity test

Can you imagine two materially different deliverables the user might mean?

- Evidence gathering can settle which → proceed and let it.
- Only the user can settle it → ask exactly **one** pointed question that states your
  recommended interpretation ("I read this as X; I'd do Y, correct?"), then wait.
- Never ask the user something the code or data can answer.

## Define done

The done criterion in your ASK line must be observable, per shape:

- **task** → a concrete observation: "this test passes", "the build stays green",
  "this endpoint returns 200", "this number changes from X to Y". "The code looks
  right" is not a done criterion. An honest BLOCKED report also meets it (see
  agent-verify); a green check obtained by fabrication does not.
- **question** → every claim in the findings traces to a file:line actually read or a
  command actually run this session.
- **plan-first** → every planned step carries its own named verification.

Write each load-bearing assumption in your notes as `assume: <fact> check: <command, or
none>`. Run every check that takes one tool call before your first edit. An assumption
left at `check: none` goes into the report as a caveat. If you cannot name any
verification at all, that is the one clarifying question worth asking.

## Extract what is already settled

List the constraints the user stated and the decisions they already made. These are
fixed inputs:

- never re-litigate a settled decision
- never re-derive an established fact
- never present options you will not pursue

## Self-check before proceeding

- [ ] ASK line emitted with shape, quoted verb or none, and a concrete done criterion
- [ ] If question-shaped: I have committed to changing nothing
- [ ] I asked the user nothing that code or data could answer
- [ ] Settled decisions listed and treated as fixed
- [ ] DOCS line emitted before any edit; every followup in it is destined for an AUTH or
      PENDING line
