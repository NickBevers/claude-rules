## Claude Code Specific

### Subagent Spawning

When a skill calls for "paired subagents," use the Agent tool to spawn parallel workers. Each agent gets the same brief but a different creative lens (described in the skill file).

### Tools Usage

- `Read` before any `Edit` — understand context first
- `Glob` and `Grep` for search — never shell `find` or `grep`
- `Write` for new files only — prefer `Edit` for modifications
- `Bash` for git, package management, build commands
- `Agent` with `subagent_type=Explore` for broad codebase research

### Context Efficiency

- Minimize tool calls: batch parallel reads when possible
- Use `Glob` before `Read` — find then read, don't guess paths
- Prefer `Grep` with `output_mode: "files_with_matches"` to narrow scope before reading
- For large reviews, delegate to subagents to protect main context window

### Hooks

Claude Code hooks (pre-commit, post-save) configured in `.claude/hooks/`.

### MCP Integration

If the project has an MCP server, Claude Code connects natively.
