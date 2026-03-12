# Git Rules

## Commit Conventions

- Commit messages are concise (1-2 sentences) and focus on the "why" not the "what"
- Use imperative mood: "Add authentication middleware" not "Added authentication middleware"
- Categorize changes: add (new feature), update (enhance existing), fix (bug fix), refactor, test, docs, chore
- One logical change per commit — don't bundle unrelated changes

## Branching

- `main` — production-ready code, always deployable
- `develop` — integration branch for features (if used)
- Feature branches: `feature/BE-003-session-auth` (prefix + ticket ID + short description)
- Bug fix branches: `fix/login-redirect-loop`
- Keep branches short-lived — merge frequently

## Pull Requests

- PR title: short (under 70 characters), descriptive
- PR body: summary bullets + test plan
- One concern per PR — don't combine features with refactors
- Self-review before requesting review
- All CI checks must pass before merge

## What NOT to Commit

- `.env` files (use `.env.example` instead)
- `node_modules/` or `bun.lockb` changes (unless dependency update is the point)
- Credentials, API keys, secrets of any kind
- Large binary files
- IDE-specific config (`.vscode/`, `.idea/`) unless team-shared settings
- OS files (`.DS_Store`, `Thumbs.db`)

## .gitignore

Every project must have a `.gitignore` that excludes:
```
node_modules/
dist/
.env
.env.local
.env.*.local
*.log
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp
*.swo
```

## Safety

- Never force-push to main/production branches
- Never use `--no-verify` to skip hooks — fix the underlying issue
- Never amend published commits (commits already pushed)
- Prefer new commits over amending — especially after hook failures
- When staging files, add specific files by name — avoid `git add -A` (can catch secrets)

## Tags & Releases

- Semantic versioning: `v1.2.3` (major.minor.patch)
- Tag releases on main branch
- Changelog updated with each release
