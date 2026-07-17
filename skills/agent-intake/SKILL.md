---
name: agent-intake
description: Run BEFORE doing any work on a request — classify the ask (question / task / plan-first), gate the effort (trivial vs full method), locate where the answer lives, and define a concrete done criterion. Wrong classification here produces the wrong deliverable no matter how good the execution is. Use at the start of every request, and re-run whenever a surprise changes what the user is actually asking. Triggers on "classify this ask", "intake", "is this a question or a task", "scope this request", "before I start".
allowed-tools: Read, Glob, Grep
user-invokable: true
---

# Agent intake — classify before you work

Run these gates IN ORDER before touching any file or running any search.

## Gate 1 — Triviality

A task is trivial ONLY if ALL four hold:

- one file
- ~10 changed lines or fewer
- no new behavior (rename, typo, constant tweak, comment)
- you already know exactly what to change without searching

Trivial → make the change, run the one obvious check (re-read the edited span; run the
affected build/lint/test), report in one or two sentences. STOP — skip the rest of the
method. Not trivial, or unsure → full method. **Unsure counts as not trivial.**

**The trivial path keeps one mandatory look: adjacent docs.** Before reporting, open
the README (or ops/CONTRIBUTING doc) in the directory of the file you touched and scan
it for one thing only: a prescribed follow-up or constraint tied to that file ("after
changing X, run Y", "X must stay in sync with Z"). If a prescribed follow-up exists and
it is outward-facing (deploy, push, send, restart), documentation is not authorization —
do NOT run it; name it in your report:

    PENDING: <prescribed action> — prescribed by <doc>, awaiting explicit authorization

A trivially-worded ask is exactly how prescribed follow-ups get silently dropped. The
glance costs one file read and closes that hole.

## Gate 2 — Fit: where does the answer live?

- **In sources you can open** (code, files, data, docs, runnable checks) → proceed
  normally. This is the default.
- **In an established technique you don't know yet** → research it first (docs, web),
  then proceed.
- **Only in your own inference** — nothing to open, nothing to look up → say so plainly.
  Never dress a guess in the costume of a rigorous process. If the user is present, ask;
  if running unattended, answer but label it low-confidence — never silently.

If you route anywhere other than "proceed normally", name that routing in your final
report. A silent detour is indistinguishable from a skipped step.

## Gate 3 — Classify the ask

Emit exactly one line before working:

    ASK: <question | task | plan-first> — done when <one concrete observation>

| Shape | Signals | Deliverable |
|---|---|---|
| **question** | "why is…", "what do you think…", user describes a problem or thinks out loud | Findings + one recommendation. **Change nothing.** |
| **task** | "fix", "build", "change", "make", "add", "remove" | The completed change, verified. |
| **plan-first** | ambiguous scope, irreversible or outward-facing actions involved, or the user asked for a plan | A plan + recommendation. Stop and WAIT for approval. |

Tie-breaks:

- Any plan-first signal beats task.
- A mixed ask ("why is this failing, and can you fix it?") is a **task** whose report
  must also answer the question.
- Genuinely unsure → plan-first.

The most expensive mistake this gate prevents: the user asked "why?" and you edited
files. If ASK is `question`, you are done after findings — no edits, no fixes, not even
obvious one-liners. Offer the fix as a proposed next step instead.

## Ambiguity test

Can you imagine two materially different deliverables the user might mean?

- Evidence gathering can settle which → proceed and let it.
- Only the user can settle it → ask exactly **one** pointed question that states your
  recommended interpretation ("I read this as X; I'd do Y — correct?"), then wait.
- Never ask the user something the code or data can answer.

## Define done

The done criterion in your ASK line must be observable, per shape:

- **task** → a concrete observation: "this test passes", "the build stays green",
  "this endpoint returns 200", "this number changes from X to Y". "The code looks
  right" is not a done criterion.
- **question** → every claim in the findings traces to a file:line actually read or a
  command actually run this session.
- **plan-first** → every planned step carries its own named verification.

State your load-bearing assumptions. If an assumption is checkable with a single tool
call, check it instead of assuming. If you cannot name any verification at all, that is
the one clarifying question worth asking.

## Extract what is already settled

List the constraints the user stated and the decisions they already made. These are
fixed inputs:

- never re-litigate a settled decision
- never re-derive an established fact
- never present options you will not pursue

## Self-check before proceeding

- [ ] ASK line emitted with shape and a concrete done criterion
- [ ] If question-shaped: I have committed to changing nothing
- [ ] I asked the user nothing that code or data could answer
- [ ] Settled decisions listed and treated as fixed
- [ ] Docs adjacent to any file I will touch were glanced; every prescribed follow-up is
      either authorized by the user's words or destined for a PENDING line
