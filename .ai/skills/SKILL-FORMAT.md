# Skill File Format (Portable)

This describes the format used for skill files in `.ai/skills/`. The format is designed to be readable by any AI coding agent while being enhanced by agents that support subagent spawning (Claude Code).

## Structure

Every skill file follows this structure:

```markdown
# Skill: [Name]

## When to Trigger
[Natural-language description of when to invoke this workflow]

## Process: [Method Name]

### Step 1: Gather Context
[What information to collect before starting]

### Step 2: Generate Options
[How to create initial options — on agents with subagent support, this runs in parallel]

### Step 3: Cross-Critique
[How to evaluate and refine options]

### Step 4: Present to User
[Output format template]

### Step 5: User Feedback Loop
[How to iterate]

### Step 6: Generate Final Output
[Production-ready output format — code, config, etc.]

## Quality Checklist
[Verification steps before presenting results]
```

## Portability Notes

- **Claude Code**: Steps 2-3 run as parallel subagents via the Agent tool
- **Cursor/Windsurf/Copilot**: Steps 2-3 run sequentially in a single conversation
- **Aider**: Steps 2-3 are separate prompts the user triggers manually
- **AgentSkills.io**: When the standard stabilizes, these files can be wrapped in the standard's metadata envelope while keeping the same markdown body

## AgentSkills.io Compatibility

The emerging AgentSkills.io standard proposes a YAML frontmatter + markdown body format:

```yaml
---
name: design-discovery
version: 1.0.0
triggers:
  - "pick fonts"
  - "choose colors"
  - "design direction"
requires:
  - web_search
  - file_write
---
```

When the standard is finalized, add this frontmatter to existing skill files. The markdown body remains unchanged — it is already in the correct format.
