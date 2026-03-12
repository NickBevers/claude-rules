---
name: mcp-builder
description: Build Model Context Protocol servers and tools for AI agent integration. Triggers on "build MCP", "MCP server", "MCP tool", "model context protocol", "agent tool", "build tool for Claude".
allowed-tools: Agent, Read, Glob, Grep, Write, Edit, WebSearch, WebFetch
---

# MCP Builder — Model Context Protocol Servers

Build MCP servers that expose tools, resources, and prompts to AI agents (Claude Code, Cursor, etc.).

## Step 1: Define Purpose

What capability does the server provide? Who uses it? What tools to expose (operations)? What resources to expose (readable data)?

## Step 2: Architecture

Standard structure: `mcp-server-{name}/src/` with `index.ts` (entry point), `tools/` (implementations), `resources/` (providers), optional `prompts/`. Uses `@modelcontextprotocol/sdk` with `McpServer` and `StdioServerTransport`.

## Step 3: Tool Design Principles

- **Single responsibility**: One tool = one operation
- **Clear descriptions**: AI reads these to decide when to use the tool
- **Typed parameters**: Zod schemas with `.describe()` on every field
- **Idempotent when possible**: Same input = same output, safe to retry
- **Error handling**: Structured errors with actionable messages
- **Rate limiting**: Respect external API limits internally

Tool categories: Read (list/search/get, no side effects), Write (create/update/delete, confirmation context), Action (trigger workflows, irreversible, document clearly).

## Step 4: Testing

Use `InMemoryTransport.createLinkedPair()` from the SDK to test tools in isolation. Connect server and client in-memory, call tools, assert results.

## Step 5: Integration

Add to `.claude/settings.json` under `mcpServers` with `command: "bun"` and args pointing to `src/index.ts`.

## Step 6: Documentation

Every server needs: README with purpose/setup/tool descriptions, example usage per tool, config options (env vars, API keys), error codes and troubleshooting.

## Rules

- Use `@modelcontextprotocol/sdk` (official SDK)
- Bun runtime (not Node.js) for new servers
- Zod for all parameter validation
- Never expose secrets through tool responses
- Never allow file system access outside designated directories
- Rate limit external API calls within the server
- Log tool invocations for debugging (not in production)
