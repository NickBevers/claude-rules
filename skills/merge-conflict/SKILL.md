---
name: merge-conflict
description: Detect and resolve git merge conflicts. Triggers on "merge conflict", "resolve conflict", "conflict markers", "fix conflicts", "merge failed".
allowed-tools: Read, Edit, Glob, Grep, Bash
---

# Merge Conflict Resolution

Help the user understand and resolve git merge conflicts safely.

## Step 1: Find All Conflicts

```bash
grep -rn '<<<<<<<' --include='*' . | grep -v node_modules | grep -v .git
```

List every file with conflicts. Show the count.

## Step 2: For Each Conflicted File

Read the file and present each conflict block clearly:

```
File: src/components/Header.tsx (2 conflicts)

--- Conflict 1 (lines 15-25) ---
CURRENT branch (HEAD):
  <the current version>

INCOMING branch (feature/xyz):
  <the incoming version>
```

For each conflict, explain:
- What changed on each side
- Whether the changes overlap (true conflict) or are independent (easy merge)

## Step 3: Ask the User

For each conflict, present options:
1. **Keep current** (HEAD)
2. **Keep incoming**
3. **Keep both** (concatenate)
4. **Manual merge** — suggest a merged version and let the user confirm

Do NOT auto-resolve. Wait for the user's choice on each conflict unless they say "resolve all" with a clear strategy (e.g., "keep all incoming", "keep ours for styling, theirs for logic").

## Step 4: Apply and Verify

After resolving all conflicts in a file:
1. Remove all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
2. Read the file back to verify no markers remain
3. Run a syntax check if applicable (e.g., `node --check` for JS/TS)

## Step 5: Stage and Report

After all files are resolved:

```bash
# Show what was resolved
git diff --name-only

# Stage resolved files
git add <resolved-files>
```

Do NOT commit automatically. Tell the user the files are staged and ready.

## Rules

- Never resolve conflicts silently — always show both sides first
- Never commit after resolving — only stage
- If a conflict is in a lockfile (`package-lock.json`, `bun.lockb`, `yarn.lock`), suggest regenerating it instead of manual resolution
- If a conflict is in a generated file (build output, compiled CSS), suggest regenerating from source
- For `.md` files, prefer keeping both sections unless they're clearly redundant
- Preserve formatting and indentation from whichever side the user picks
