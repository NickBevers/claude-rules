---
name: mcp-builder
description: Build Model Context Protocol servers and tools for AI agent integration. Triggers on "build MCP", "MCP server", "MCP tool", "model context protocol", "agent tool", "build tool for Claude".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# MCP Builder — Model Context Protocol Servers

Build MCP servers that expose tools, resources, and prompts to AI agents (Claude Code, Cursor, etc.).

## Step 1: Define Purpose

- What capability does the MCP server provide? (database access, API integration, file processing, custom tool)
- Who uses it? (Claude Code, Cursor, other MCP-compatible agents)
- What tools should it expose? (list operations the agent should be able to perform)
- What resources should it expose? (data the agent should be able to read)

## Step 2: Architecture

### MCP Server Structure (TypeScript)
```
mcp-server-{name}/
├── src/
│   ├── index.ts          # Server entry point
│   ├── tools/            # Tool implementations
│   │   └── {tool-name}.ts
│   ├── resources/        # Resource providers
│   │   └── {resource}.ts
│   └── prompts/          # Prompt templates (optional)
│       └── {prompt}.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Server Entry Point
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: 'mcp-server-{name}',
  version: '1.0.0',
});

// Register tools
server.tool('tool-name', 'Description of what this tool does', {
  // Zod schema for parameters
  param1: z.string().describe('What this parameter is'),
}, async ({ param1 }) => {
  // Implementation
  return { content: [{ type: 'text', text: result }] };
});

// Register resources
server.resource('resource://path', 'Description', async () => {
  return { contents: [{ uri: 'resource://path', text: data }] };
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Step 3: Tool Design Principles

- **Single responsibility**: One tool = one operation. Don't combine search + modify.
- **Clear descriptions**: The AI reads the description to decide when to use the tool. Be specific.
- **Typed parameters**: Use Zod schemas with `.describe()` on every field.
- **Idempotent when possible**: Same input = same output. Safe to retry.
- **Error handling**: Return structured errors with actionable messages.
- **Rate limiting**: If wrapping an external API, respect rate limits internally.

### Tool Categories
- **Read tools**: List, search, get — safe, no side effects
- **Write tools**: Create, update, delete — require confirmation context
- **Action tools**: Trigger workflows, send notifications — irreversible, document clearly

## Step 4: Testing

```typescript
// Test each tool in isolation
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
await server.connect(serverTransport);

const client = new McpClient({ name: 'test', version: '1.0.0' });
await client.connect(clientTransport);

// Call tools and assert results
const result = await client.callTool('tool-name', { param1: 'value' });
```

## Step 5: Claude Code Integration

Add to `.claude/settings.json`:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "bun",
      "args": ["run", "/path/to/mcp-server/src/index.ts"]
    }
  }
}
```

## Step 6: Documentation

Every MCP server needs:
- README with purpose, setup, and tool descriptions
- Example usage for each tool
- Configuration options (env vars, API keys)
- Error codes and troubleshooting

## Rules

- Use `@modelcontextprotocol/sdk` (official SDK)
- Bun runtime (not Node.js) for new servers
- Zod for all parameter validation
- Never expose secrets through tool responses
- Never allow file system access outside designated directories
- Rate limit external API calls within the server
- Log tool invocations for debugging (not in production)
- No icons or decorative elements in output
