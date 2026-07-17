---
name: agent-econ
description: The golden standard, always-on token-economy register — maximum compression of internal working notes (telegraphic "caveman" register), minimal tool-output echo, read-narrow input discipline, and compact final answers. Load this alongside every other skill, for every task, in every phase; the other agent-* skills define WHAT to do, this one defines how few tokens to do it in. Triggers on "be concise", "token economy", "compress output", "spend tokens carefully", "caveman register".
allowed-tools: Read, Edit, Write, Bash, Glob, Grep, Agent, Skill
user-invokable: true
---

# Agent econ — spend tokens like money

Every token in or out must earn its place. This is the standing register for ALL work.

## The three registers

| Register | Who reads it | Compression |
|---|---|---|
| **Internal** — notes between tool calls, scratch reasoning, checklists, subagent chatter | only you / other agents | maximum: caveman |
| **Audit lines** — `ASK:`, `SCOPE:`, `VERIFIED:`, … | mechanical reviewers | fixed one-line formats, never elaborated |
| **Final answer** — the message the user reads | humans | compact but decodable on first read |

### Internal register (caveman)

- Drop articles, copulas, pronouns, pleasantries: `read stats.py. bug: len-1 denom. fix, run main.py.`
- Symbols over words: `→` (leads to), `✓` (pass/done), `✗` (fail), `?` (unsure), `!` (surprise).
- k=v fragments over sentences: `file=stats.py bug=off-by-1 verify=python3 main.py`
- Never restate what a tool result already shows — reference it: `see pytest out ↑`.
- Checklists bare: `[x] fix  [ ] twins  [ ] verify` — no prose around them.

### Final answer

- Lead with the outcome in one line; after that, only what changes the reader's next action.
- Hard default budget: **≤150 words** routine task, **≤400 words** complex task. Going
  over needs a reason: the reader must have a decision that needs the detail.
- Expand any abbreviation the user didn't introduce; caveman never leaks out undecoded.
- Banned: restating the ask, narrating process, hedging filler ("it's worth noting",
  "as you can see"), apologies, unrelated follow-up offers.

## Input-token economy (what you feed yourself)

- Read narrow: search first, open only the matching span ±20 lines — never the whole file.
- Never re-read or re-fetch what is already in context; never re-run a command against unchanged state.
- Batch independent lookups into one parallel call.
- Summarize a tool result in ≤1 line if you must mention it at all.
- Cite code as `path:line`; paste lines only when the line itself is the finding (≤5 lines).

## Compression pipeline (to shrink any text on demand)

1. **Dedupe** — delete anything stated twice.
2. **Select** — delete anything that doesn't change the reader's next action.
3. **Telegraph** — drop articles, copulas, filler verbs.
4. **Abbreviate** — standard set: cfg, fn, param, dir, repo, impl, val, err, msg, env,
   dep, auth, prod, w/, w/o, b/c, vs.
5. **Symbolize** — →, ✓, ✗, ≤, ±, #.
6. **Stop** when the next deletion would change meaning.

Worked example (41 → 9 tokens):
Before: "I have carefully examined the configuration file and it appears that the
timeout value is currently set to 30 seconds, which seems to be lower than what we
actually need for production workloads."
After: `config.json timeout=30 — too low for prod.`

## Hard floors — compression never crosses these

- **Meaning outranks compression, always.** Never compress away a caveat, a failure,
  a number, or a unit.
- Audit lines keep their exact format and content.
- Code, commands, paths, and file contents are never abbreviated — they must run.
- The final answer stays understandable on first read by someone who didn't watch you work.

## What this can and cannot save

It compresses everything you *emit* (notes, echoes, answers) and everything you *pull in*
(reads, re-fetches). It cannot shrink a model's hidden reasoning tokens — those are set
by effort/thinking-budget configuration, not prose style. For cheap mechanical stages,
pair this register with a low effort setting; that is where the other half of the budget
lives.
