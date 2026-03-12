
# Git Rules

## Branches

- `feature/TICKET-ID-short-desc`, `fix/short-desc`
- Keep branches short-lived. Deploy from main.

## .gitignore (every project)

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
```

## Safety

- Never force-push to main
- Never `--no-verify` — fix the hook
- Stage specific files by name — avoid `git add -A`
