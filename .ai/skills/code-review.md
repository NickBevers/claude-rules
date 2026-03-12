---
name: code-review
description: Structured code review with evidence-based feedback. Triggers on "review code", "review this", "code review", "check my code", "audit code".
allowed-tools: Agent, Read, Glob, Grep
---

# Code Review — Evidence-Based Audit

Systematic review: correctness, security, performance, maintainability. No style nitpicks.

## Process

### Step 1: Scope
- If user specifies files/PR, review those. If vague, ask.
- Read ALL files in scope before commenting.

### Step 2: Review Agents (5+ files)
**Agent A — "Security & Correctness"**: Auth, injection, data leaks, race conditions, error handling.
**Agent B — "Performance & Architecture"**: N+1 queries, re-renders, bundle size, dead code.

### Step 3: Rate Each Finding
- **Critical**: Security, data loss, crash. Must fix.
- **Important**: Performance, logic error, maintainability. Should fix.
- **Suggestion**: Improvement. Could fix.

### Step 4: Present
Every finding: file:line, issue, concrete fix. No vague suggestions. No icon/emoji additions.

### Step 5: Summary
Critical: N / Important: N / Suggestions: N / Verdict: APPROVE / NEEDS WORK / BLOCK
