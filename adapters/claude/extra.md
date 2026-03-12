## Claude Code Specific

### Subagent Spawning

When a skill calls for "paired subagents," use Claude Code's Agent tool to spawn parallel workers. Each agent gets the same brief but a different creative lens (described in the skill file). Use TaskCreate/TaskUpdate to track sparring rounds.

### Tools Usage

- Use `Read` before any `Edit` — always understand context first
- Use `Glob` and `Grep` for search — never shell `find` or `grep`
- Use `Write` only for new files — prefer `Edit` for modifications
- Use `Bash` for git operations, package management, and build commands

### Hooks

Claude Code hooks (pre-commit, post-save) can be configured in `.claude/hooks/`. These are Claude-specific and not portable.

### MCP Integration

If the project has an MCP server, Claude Code can connect to it natively. Other agents cannot (yet).
