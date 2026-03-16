#!/usr/bin/env node

/**
 * claude-rules CLI
 *
 * Usage (bunx | npx | pnpm dlx | yarn dlx):
 *   bunx @nickbevers/claude-rules init [agents...]
 *   claude-rules init                  # Claude only (default)
 *   claude-rules init claude windsurf  # Multiple agents
 *   claude-rules init all              # All agents
 *   claude-rules setup                 # Symlink into ~/.claude/ (global)
 *   claude-rules convert <agent>       # Generate config for another agent
 *   claude-rules --help
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, symlinkSync, unlinkSync, renameSync, statSync, lstatSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { homedir } from "node:os";

const PKG_ROOT = resolve(dirname(import.meta.url.replace("file://", "")), "..");
const VERSION = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")).version;

/** Resolve a path locally first, fall back to package */
function resolveSource(name) {
  const local = resolve(name);
  return existsSync(local) ? local : join(PKG_ROOT, name);
}

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const log = (msg) => console.log(`${GREEN}[claude-rules]${RESET} ${msg}`);
const warn = (msg) => console.log(`${YELLOW}[claude-rules]${RESET} ${msg}`);
const err = (msg) => console.error(`${RED}[claude-rules]${RESET} ${msg}`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function copyDirRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/** Strip YAML frontmatter (--- ... ---) from markdown content */
function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n+/);
  return match ? content.slice(match[0].length) : content;
}

/** Read all rule files, strip frontmatter, return concatenated content */
function collectRules() {
  const rulesDir = resolveSource("rules");
  const parts = [];
  for (const file of readdirSync(rulesDir).filter(f => f.endsWith(".md")).sort()) {
    const content = readFileSync(join(rulesDir, file), "utf8");
    parts.push(stripFrontmatter(content));
  }
  return parts.join("\n---\n\n");
}

/** Read all skill files, strip frontmatter, return concatenated content */
function collectSkills() {
  const skillsDir = resolveSource("skills");
  const parts = [];
  for (const dir of readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory())) {
    const skillFile = join(skillsDir, dir.name, "SKILL.md");
    if (existsSync(skillFile)) {
      const content = readFileSync(skillFile, "utf8");
      parts.push(stripFrontmatter(content));
    }
  }
  return parts.join("\n---\n\n");
}

/** Read CLAUDE.md content (already has no frontmatter) */
function collectPrinciples() {
  return readFileSync(resolveSource("CLAUDE.md"), "utf8");
}

// ---------------------------------------------------------------------------
// Adapter extras — embedded to avoid shipping extra directories
// ---------------------------------------------------------------------------

const ADAPTER_EXTRAS = {
  cursor: `## Cursor Specific

### Composer Mode

When working in Composer mode (multi-file edits), follow the same "read before write" principle. Always check existing code before modifying.

### Inline Edits

For inline edit suggestions (Cmd+K), keep changes minimal and focused. Don't expand scope beyond what was selected.

### Skills/Workflows

Cursor cannot spawn subagents. When a skill document describes a "sparring" workflow, perform it sequentially:
1. Generate Option A (bold/expressive direction)
2. Generate Option B (refined/subtle direction)
3. Self-critique both options
4. Present 2-3 merged options to the user

### Context Window

Cursor has a limited context window. If rules are too long, prioritize: principles > domain rules for the current task > skills.`,

  windsurf: `## Windsurf Specific

### Cascade Mode

Windsurf's Cascade can handle multi-step workflows. When a skill describes a sparring workflow, follow the sequential approach:
1. Generate both directions independently
2. Cross-critique
3. Merge into final options

### File Operations

Always use Windsurf's built-in file operations rather than terminal commands for reading and editing files.`,

  copilot: `## GitHub Copilot Specific

### Scope

Copilot primarily assists with inline completions and chat. For multi-step workflows described in Skills, use Copilot Chat and follow the steps manually.

### Agent Mode

When using Copilot's agent mode (@workspace), it can follow the full workflow instructions. For sparring workflows, perform them sequentially (generate both directions, cross-critique, merge).`,

  aider: `## Aider Specific

### File Context

Aider works best when you explicitly add files to the chat with \`/add\`. Follow the "read before write" principle by reviewing added files before making changes.

### Workflows

Aider does not support subagent spawning. For sparring workflows, the user should run the workflow steps as separate Aider prompts, or use Aider's \`/run\` command to execute scripts that generate options.`,
};

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdInit(targetDir, agents, { force = false } = {}) {
  const projectDir = resolve(targetDir);
  log(`Initializing in ${BOLD}${projectDir}${RESET}${force ? ` ${YELLOW}(force)${RESET}` : ""}`);

  // Always generate Claude Code config (source format)
  syncClaude(projectDir, { force });

  // Generate other agent configs if requested
  for (const agent of agents) {
    if (agent === "all") {
      convertAgent(projectDir, "cursor");
      convertAgent(projectDir, "windsurf");
      convertAgent(projectDir, "copilot");
      convertAgent(projectDir, "aider");
    } else if (agent !== "claude") {
      convertAgent(projectDir, agent);
    }
  }

  console.log("");
  log("Done! Your project now has Claude Code rules.");
  if (agents.some(a => a !== "claude")) {
    console.log(`${DIM}  Generated agent configs are derived from rules/ — regenerate with: claude-rules convert <agent>${RESET}`);
  }
}

function syncClaude(projectDir, { force = false } = {}) {
  log("Copying Claude Code config...");

  const pkgRules = join(PKG_ROOT, "rules");
  const pkgSkills = join(PKG_ROOT, "skills");
  const pkgClaude = join(PKG_ROOT, "CLAUDE.md");

  // Copy or merge CLAUDE.md
  const claudeDest = join(projectDir, "CLAUDE.md");
  if (!existsSync(claudeDest)) {
    copyFileSync(pkgClaude, claudeDest);
    log("  -> CLAUDE.md");
  } else {
    const pkgContent = readFileSync(pkgClaude, "utf8").trim();
    const existingContent = readFileSync(claudeDest, "utf8").trim();

    // Skip if project already contains the package content (already merged)
    if (!force && existingContent.includes(pkgContent)) {
      log("  -> CLAUDE.md (already includes global rules, skipped)");
    } else {
      const MERGE_MARKER = "# --- Project Rules ---";
      // If previously merged, replace the package section above the marker
      if (existingContent.includes(MERGE_MARKER)) {
        const projectSection = existingContent.split(MERGE_MARKER).slice(1).join(MERGE_MARKER);
        writeFileSync(claudeDest, pkgContent + "\n\n" + MERGE_MARKER + projectSection);
        log("  -> CLAUDE.md (updated global rules, preserved project rules)");
      } else {
        // First merge: package content on top, existing project content below marker
        writeFileSync(claudeDest, pkgContent + "\n\n" + MERGE_MARKER + "\n\n" + existingContent + "\n");
        log("  -> CLAUDE.md (merged: global rules + existing project rules)");
      }
    }
  }

  // Add rules/ and skills/ to .gitignore if neither directory exists yet
  const rulesDest = join(projectDir, "rules");
  const skillsDest = join(projectDir, "skills");
  if (!existsSync(rulesDest) && !existsSync(skillsDest)) {
    const gitignorePath = join(projectDir, ".gitignore");
    const entries = ["rules/", "skills/"];
    if (existsSync(gitignorePath)) {
      const content = readFileSync(gitignorePath, "utf8");
      const toAdd = entries.filter(e => !content.split("\n").some(line => line.trim() === e));
      if (toAdd.length > 0) {
        writeFileSync(gitignorePath, content.trimEnd() + "\n" + toAdd.join("\n") + "\n");
        log(`  -> .gitignore (added ${toAdd.join(", ")})`);
      }
    } else {
      writeFileSync(gitignorePath, entries.join("\n") + "\n");
      log("  -> .gitignore (created with rules/, skills/)");
    }
  }

  // Copy rules/ (add new rules by name, never overwrite existing)
  mkdirSync(rulesDest, { recursive: true });
  let ruleAdded = 0;
  let ruleSkipped = 0;
  for (const file of readdirSync(pkgRules).filter(f => f.endsWith(".md"))) {
    const dest = join(rulesDest, file);
    if (force || !existsSync(dest)) {
      copyFileSync(join(pkgRules, file), dest);
      ruleAdded++;
    } else {
      ruleSkipped++;
    }
  }
  if (ruleAdded > 0 || ruleSkipped > 0) {
    log(`  -> rules/ (${ruleAdded} ${force ? "overwritten" : "added"}, ${ruleSkipped} existing kept)`);
  } else {
    log("  -> rules/ (up to date)");
  }

  // Copy skills/ (add new skills by name, never overwrite existing)
  let skillAdded = 0;
  let skillSkipped = 0;
  for (const dir of readdirSync(pkgSkills, { withFileTypes: true }).filter(d => d.isDirectory())) {
    const destDir = join(skillsDest, dir.name);
    const skillFile = join(pkgSkills, dir.name, "SKILL.md");
    if (existsSync(skillFile)) {
      if (force || !existsSync(join(destDir, "SKILL.md"))) {
        mkdirSync(destDir, { recursive: true });
        copyFileSync(skillFile, join(destDir, "SKILL.md"));
        skillAdded++;
      } else {
        skillSkipped++;
      }
    }
  }
  if (skillAdded > 0 || skillSkipped > 0) {
    log(`  -> skills/ (${skillAdded} ${force ? "overwritten" : "added"}, ${skillSkipped} existing kept)`);
  } else {
    log("  -> skills/ (up to date)");
  }
}

function convertAgent(projectDir, agent) {
  switch (agent) {
    case "cursor":
      convertFlat(projectDir, agent, ".cursorrules");
      break;
    case "windsurf":
      convertFlat(projectDir, agent, ".windsurfrules");
      break;
    case "copilot":
      convertCopilot(projectDir);
      break;
    case "aider":
      convertAider(projectDir);
      break;
    default:
      err(`Unknown agent: ${agent}. Supported: cursor, windsurf, copilot, aider`);
  }
}

function convertFlat(projectDir, agent, outputFile) {
  log(`Converting for ${agent}...`);

  const parts = [
    `# ${agent.charAt(0).toUpperCase() + agent.slice(1)} Rules\n`,
    `# Auto-generated from rules/ and skills/ — do not edit directly.`,
    `# Regenerate: claude-rules convert ${agent}\n`,
    collectPrinciples(),
    "\n---\n",
    collectRules(),
    "\n---\n",
    collectSkills(),
  ];

  if (ADAPTER_EXTRAS[agent]) {
    parts.push("\n---\n\n", ADAPTER_EXTRAS[agent]);
  }

  writeFileSync(join(projectDir, outputFile), parts.join("\n"));
  log(`  -> ${outputFile}`);
}

function convertCopilot(projectDir) {
  log("Converting for Copilot...");

  const githubDir = join(projectDir, ".github");
  mkdirSync(githubDir, { recursive: true });

  const parts = [
    "# Copilot Instructions\n",
    "<!-- Auto-generated from rules/ and skills/ — do not edit directly. -->\n",
    collectPrinciples(),
    "\n",
    collectRules(),
    "\n## Workflows (Reference)\n",
    collectSkills(),
  ];

  if (ADAPTER_EXTRAS.copilot) {
    parts.push("\n\n", ADAPTER_EXTRAS.copilot);
  }

  writeFileSync(join(githubDir, "copilot-instructions.md"), parts.join("\n"));
  log("  -> .github/copilot-instructions.md");
}

function convertAider(projectDir) {
  log("Converting for Aider...");

  writeFileSync(join(projectDir, ".aider.conf.yml"),
    "# Auto-generated — regenerate: claude-rules convert aider\nread: CONVENTIONS.md\nauto-commits: false\nno-auto-lint: false\n"
  );

  const parts = [
    "# Project Conventions\n",
    "<!-- Auto-generated from rules/ and skills/ — do not edit directly. -->\n",
    collectPrinciples(),
    "\n",
    collectRules(),
  ];

  if (ADAPTER_EXTRAS.aider) {
    parts.push("\n\n", ADAPTER_EXTRAS.aider);
  }

  writeFileSync(join(projectDir, "CONVENTIONS.md"), parts.join("\n"));
  log("  -> .aider.conf.yml + CONVENTIONS.md");
}

function cmdSetup() {
  const claudeDir = join(homedir(), ".claude");
  mkdirSync(claudeDir, { recursive: true });

  log("Setting up global symlinks...");

  const links = [
    [join(PKG_ROOT, "CLAUDE.md"), join(claudeDir, "CLAUDE.md")],
    [join(PKG_ROOT, "rules"), join(claudeDir, "rules")],
    [join(PKG_ROOT, "skills"), join(claudeDir, "skills")],
  ];

  for (const [src, dest] of links) {
    // Remove existing symlink
    try {
      if (lstatSync(dest).isSymbolicLink()) {
        unlinkSync(dest);
      } else {
        // Real file/dir — back it up
        const backup = `${dest}.backup.${Date.now()}`;
        renameSync(dest, backup);
        warn(`Backed up ${dest} -> ${backup}`);
      }
    } catch {
      // Doesn't exist, fine
    }

    symlinkSync(src, dest);
    log(`  ${basename(dest)} -> ${src}`);
  }

  console.log("");
  log("Done! Claude Code will now load your global rules.");
}

function cmdConvert(targetDir, agents) {
  const projectDir = resolve(targetDir);

  if (agents.length === 0) {
    err("Specify an agent: claude-rules convert <cursor|windsurf|copilot|aider|all>");
    process.exit(1);
  }

  for (const agent of agents) {
    if (agent === "all") {
      convertAgent(projectDir, "cursor");
      convertAgent(projectDir, "windsurf");
      convertAgent(projectDir, "copilot");
      convertAgent(projectDir, "aider");
    } else {
      convertAgent(projectDir, agent);
    }
  }

  log("Conversion complete.");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  console.log(`
${BOLD}claude-rules${RESET} v${VERSION} — AI agent configuration

${BOLD}Usage:${RESET}
  claude-rules init [agents...] [-f]  Initialize a project (default: claude)
  claude-rules setup                  Symlink into ~/.claude/ (global install)
  claude-rules convert <agent|all>    Generate config for another agent
  claude-rules --help                 Show this help

${BOLD}Flags:${RESET}
  --force, -f    Overwrite existing files (re-merge CLAUDE.md, replace rules/skills)

${BOLD}Agents:${RESET} claude, cursor, windsurf, copilot, aider, all

${BOLD}Run with any package manager:${RESET}
  bunx @nickbevers/claude-rules ${DIM}<command>${RESET}
  npx @nickbevers/claude-rules ${DIM}<command>${RESET}
  pnpm dlx @nickbevers/claude-rules ${DIM}<command>${RESET}
  yarn dlx @nickbevers/claude-rules ${DIM}<command>${RESET}

${BOLD}Examples:${RESET}
  ${DIM}# Initialize current project with Claude Code config${RESET}
  bunx @nickbevers/claude-rules init

  ${DIM}# Initialize with Claude + Windsurf${RESET}
  bunx @nickbevers/claude-rules init claude windsurf

  ${DIM}# Install globally into ~/.claude/${RESET}
  bunx @nickbevers/claude-rules setup

  ${DIM}# Generate Windsurf rules from existing Claude rules${RESET}
  bunx @nickbevers/claude-rules convert windsurf

  ${DIM}# Generate all agent configs${RESET}
  bunx @nickbevers/claude-rules convert all
`);
  process.exit(0);
}

switch (command) {
  case "init": {
    const agents = args.slice(1).filter(a => !a.startsWith("-"));
    const force = args.includes("--force") || args.includes("-f");
    cmdInit(".", agents.length ? agents : ["claude"], { force });
    break;
  }
  case "setup":
    cmdSetup();
    break;
  case "convert": {
    const agents = args.slice(1).filter(a => !a.startsWith("-"));
    cmdConvert(".", agents);
    break;
  }
  default:
    err(`Unknown command: ${command}`);
    console.log("Run 'claude-rules --help' for usage.");
    process.exit(1);
}
