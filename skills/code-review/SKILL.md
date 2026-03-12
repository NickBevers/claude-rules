---
name: code-review
description: Structured code review with evidence-based feedback. Triggers on "review code", "review this", "code review", "check my code", "audit code".
allowed-tools: Agent, Read, Glob, Grep
---

# Code Review — Evidence-Based Audit

Systematic review that catches real issues, not style nitpicks. Focus on correctness, security, performance, and maintainability.

## Process

### Step 1: Scope

Identify what to review:
- If user specifies files/PR, review those
- If vague, ask: "Which files or changes should I review?"
- Read ALL files in scope before commenting

### Step 2: Spawn Review Agents (for large reviews)

For reviews spanning 5+ files, spawn parallel agents:

**Agent A — "Security & Correctness"**: Auth flaws, injection risks, data leaks, race conditions, error handling gaps, input validation.

**Agent B — "Performance & Architecture"**: N+1 queries, unnecessary re-renders, bundle size impact, missing indexes, abstraction quality, dead code.

For smaller reviews, do both passes yourself sequentially.

### Step 3: Evaluate Each Finding

Rate each issue:
- **Critical**: Security vulnerability, data loss risk, or crash. Must fix.
- **Important**: Performance issue, logic error, or maintainability problem. Should fix.
- **Suggestion**: Improvement that isn't blocking. Could fix.

### Step 4: Present Findings

Format:
```
## [Critical/Important/Suggestion] — Short description
**File**: path/to/file.ts:42
**Issue**: What's wrong and why it matters
**Fix**: Specific code or approach to resolve
```

Rules:
- Lead with critical issues. Skip praise.
- Every finding must reference a specific file and line.
- Every finding must include a concrete fix, not just "consider improving."
- Do NOT flag: style preferences already handled by linter, obvious patterns, things the user didn't change.
- Do NOT suggest adding icons, emojis, or decorative elements.

### Step 5: Summary

```
## Summary
- Critical: N issues (must fix before merge)
- Important: N issues (should fix)
- Suggestions: N issues (nice to have)
- Overall: [APPROVE / NEEDS WORK / BLOCK]
```

## Stack-Specific Checks

**Frontend (Astro/Preact)**:
- Islands hydrated only when needed?
- CSS Modules used (no inline styles)?
- Nanostores for cross-island state (no prop drilling)?
- Images have explicit dimensions?
- No barrel file imports?

**Backend (Hono)**:
- `env(c)` used (not Bun.env/process.env)?
- Zod validation on all inputs?
- Error responses use `{ error, message }` shape?
- No stack traces/internal IDs exposed?

**Database (Drizzle)**:
- TEXT not VARCHAR for unbounded data?
- Soft delete filter (`is_active = true`) present?
- Migrations reviewed (no destructive changes without backup plan)?

**Security**:
- Argon2id for passwords (not bcrypt)?
- Session cookies HTTP-only/Secure/SameSite=Strict?
- Rate limiting on auth endpoints?
- No secrets in code?
