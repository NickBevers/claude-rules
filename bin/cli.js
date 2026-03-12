#!/usr/bin/env node

/**
 * claude-rules CLI
 *
 * Usage:
 *   bunx github:NickBevers/claude-rules init [agents...]
 *   npx github:NickBevers/claude-rules init [agents...]
 *   claude-rules init                  # Claude only (default)
 *   claude-rules init claude cursor    # Multiple agents
 *   claude-rules init all              # All agents
 *   claude-rules setup                 # Symlink into ~/.claude/ (global)
 *   claude-rules sync [agent]          # Re-sync agent configs
 *   claude-rules --help
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, statSync, symlinkSync, unlinkSync, renameSync } from "node:fs";
import { join, dirname, basename, resolve } from "node:path";
import { execSync } from "node:child_process";
import { homedir } from "node:os";

const PKG_ROOT = resolve(dirname(import.meta.url.replace("file://", "")), "..");
const AI_DIR = join(PKG_ROOT, ".ai");
const ADAPTERS_DIR = join(PKG_ROOT, "adapters");
const VERSION = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")).version;

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

function backupIfExists(target) {
  try {
    const stat = statSync(target);
    const isLink = false; // lstatSync needed for symlinks
    try {
      const lstat = statSync(target);
      // If it's a real file/dir, back it up
      const backup = `${target}.backup.${Date.now()}`;
      renameSync(target, backup);
      warn(`Backed up ${target} -> ${backup}`);
    } catch {
      // ignore
    }
  } catch {
    // doesn't exist, nothing to back up
  }
}

// ---------------------------------------------------------------------------
// Path scope mappings for Claude Code rules
// ---------------------------------------------------------------------------
const PATH_SCOPES = {
  "frontend-development": [
    '"**/*.tsx"', '"**/*.jsx"', '"**/*.astro"', '"**/*.module.css"',
    '"**/*.css"', '"**/components/**"', '"**/islands/**"',
    '"**/pages/**"', '"**/layouts/**"'
  ],
  "backend-development": [
    '"**/server/**"', '"**/api/**"', '"**/*.server.ts"',
    '"**/routes/**"', '"**/services/**"', '"**/middleware/**"'
  ],
  security: [
    '"**/auth/**"', '"**/session*"', '"**/middleware*"',
    '"**/*guard*"', '"**/*crypt*"', '"**/*password*"',
    '"**/*permission*"', '"**/*role*"'
  ],
  testing: [
    '"**/*.test.*"', '"**/*.spec.*"', '"**/e2e/**"',
    '"**/tests/**"', '"**/test/**"', '"**/vitest*"', '"**/playwright*"'
  ],
  devops: [
    '"**/Dockerfile*"', '"**/docker-compose*"', '"**/.github/**"',
    '"**/*.yml"', '"**/*.yaml"', '"**/deploy*"', '"**/coolify*"'
  ],
  design: [
    '"**/*.module.css"', '"**/*.css"', '"**/tokens*"',
    '"**/theme*"', '"**/design*"'
  ],
  ticketing: ['"**/.claude/tickets/**"', '"**/tickets/**"'],
  planning: ['"**/.claude/research/**"', '"**/decisions*"', '"**/architecture*"'],
  git: ['"**/.gitignore"', '"**/.gitattributes"', '"**/.github/**"'],
  research: ['"**/.claude/research/**"', '"**/research/**"', '"**/spike*"'],
  laravel: [
    '"**/*.php"', '"**/livewire/**"', '"**/resources/views/**"',
    '"**/app/**"', '"**/routes/**"', '"**/database/migrations/**"',
    '"**/composer.json"', '"**/*.blade.php"'
  ],
  compliance: [
    '"**/privacy*"', '"**/cookie*"', '"**/consent*"',
    '"**/gdpr*"', '"**/legal*"', '"**/terms*"', '"**/policy*"'
  ],
  incident: [
    '"**/incident*"', '"**/postmortem*"', '"**/runbook*"',
    '"**/status*"', '"**/ops/**"', '"**/monitoring*"'
  ],
  copywriting: [
    '"**/components/**"', '"**/pages/**"', '"**/layouts/**"',
    '"**/content/**"', '"**/copy*"', '"**/text*"', '"**/*.astro"'
  ],
  database: [
    '"**/schema*"', '"**/migrations/**"', '"**/drizzle*"',
    '"**/prisma/**"', '"**/seeds/**"', '"**/db/**"'
  ],
};

// Map .ai/rules/ filenames to output filenames
const RULE_NAME_MAP = {
  "frontend-development": "frontend",
  "backend-development": "backend",
};

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdInit(targetDir, agents) {
  const projectDir = resolve(targetDir);
  log(`Initializing in ${BOLD}${projectDir}${RESET}`);

  // 1. Copy .ai/ source directory
  const aiDest = join(projectDir, ".ai");
  if (existsSync(aiDest)) {
    warn(".ai/ already exists — merging (existing files preserved)");
  }
  mkdirSync(join(aiDest, "rules"), { recursive: true });
  mkdirSync(join(aiDest, "skills"), { recursive: true });

  // Copy rules (skip existing)
  for (const f of readdirSync(join(AI_DIR, "rules"))) {
    const dest = join(aiDest, "rules", f);
    if (!existsSync(dest)) {
      copyFileSync(join(AI_DIR, "rules", f), dest);
      log(`  Copied rules/${f}`);
    } else {
      warn(`  Skipped rules/${f} (exists)`);
    }
  }

  // Copy skills (skip existing)
  for (const f of readdirSync(join(AI_DIR, "skills"))) {
    const dest = join(aiDest, "skills", f);
    if (!existsSync(dest)) {
      copyFileSync(join(AI_DIR, "skills", f), dest);
      log(`  Copied skills/${f}`);
    } else {
      warn(`  Skipped skills/${f} (exists)`);
    }
  }

  // Copy manifest
  const manifestDest = join(aiDest, "manifest.yaml");
  if (!existsSync(manifestDest)) {
    copyFileSync(join(AI_DIR, "manifest.yaml"), manifestDest);
    log("  Copied manifest.yaml");
  }

  // 2. Generate agent configs
  for (const agent of agents) {
    if (agent === "claude" || agent === "all") syncClaude(projectDir);
    if (agent === "cursor" || agent === "all") syncFlat(projectDir, "cursor", ".cursorrules");
    if (agent === "windsurf" || agent === "all") syncFlat(projectDir, "windsurf", ".windsurfrules");
    if (agent === "copilot" || agent === "all") syncCopilot(projectDir);
    if (agent === "aider" || agent === "all") syncAider(projectDir);
  }

  // 3. Create .gitignore entries suggestion
  console.log("");
  log("Done! Add to .gitignore if you don't want to commit generated files:");
  console.log(`${DIM}  # AI agent configs (generated from .ai/)${RESET}`);
  console.log(`${DIM}  rules/${RESET}`);
  console.log(`${DIM}  skills/${RESET}`);
  console.log(`${DIM}  .cursorrules${RESET}`);
  console.log(`${DIM}  .windsurfrules${RESET}`);
  console.log("");
  log(`To regenerate: ${BOLD}claude-rules sync${RESET}`);
}

function syncClaude(projectDir) {
  log("Syncing Claude Code...");

  const rulesDir = join(projectDir, "rules");
  const skillsDir = join(projectDir, "skills");
  mkdirSync(rulesDir, { recursive: true });
  mkdirSync(skillsDir, { recursive: true });

  // CLAUDE.md — create if missing
  const claudeMd = join(projectDir, "CLAUDE.md");
  if (!existsSync(claudeMd)) {
    const principles = readFileSync(join(AI_DIR, "rules", "principles.md"), "utf8");
    writeFileSync(claudeMd, `# Global Rules\n\nDomain rules in \`rules/\` load by file path. Skills in \`skills/\` load by keyword.\n\n${principles}`);
    log("  -> CLAUDE.md (created)");
  } else {
    log("  -> CLAUDE.md (exists, not overwritten)");
  }

  // Generate path-scoped rules
  const ruleFiles = readdirSync(join(AI_DIR, "rules")).filter(f => f.endsWith(".md") && f !== "principles.md");
  let ruleCount = 0;

  for (const file of ruleFiles) {
    const key = file.replace(".md", "");
    const scope = PATH_SCOPES[key];
    if (!scope) continue; // skip rules without path scoping

    const outputName = (RULE_NAME_MAP[key] || key) + ".md";
    const content = readFileSync(join(AI_DIR, "rules", file), "utf8");
    const pathsYaml = scope.map(p => `  - ${p}`).join("\n");
    const scoped = `---\npaths:\n${pathsYaml}\n---\n\n${content}`;
    writeFileSync(join(rulesDir, outputName), scoped);
    ruleCount++;
  }
  log(`  -> rules/ (${ruleCount} path-scoped files)`);

  // Generate skills in skills/{name}/SKILL.md format
  const skillFiles = readdirSync(join(AI_DIR, "skills")).filter(f => f.endsWith(".md") && f !== "SKILL-FORMAT.md");
  let skillCount = 0;

  for (const file of skillFiles) {
    const name = file.replace(".md", "");
    const skillDir = join(skillsDir, name);
    mkdirSync(skillDir, { recursive: true });
    copyFileSync(join(AI_DIR, "skills", file), join(skillDir, "SKILL.md"));
    skillCount++;
  }
  log(`  -> skills/ (${skillCount} on-demand)`);
}

function syncFlat(projectDir, agent, outputFile) {
  log(`Syncing ${agent}...`);

  const parts = [`# ${agent.charAt(0).toUpperCase() + agent.slice(1)} Rules\n`];
  parts.push(`# Auto-generated from .ai/ — do not edit directly.`);
  parts.push(`# Regenerate: claude-rules sync ${agent}\n`);

  // Principles first
  parts.push(readFileSync(join(AI_DIR, "rules", "principles.md"), "utf8"));
  parts.push("\n---\n");

  // All other rules
  for (const f of readdirSync(join(AI_DIR, "rules")).filter(f => f.endsWith(".md") && f !== "principles.md")) {
    parts.push(readFileSync(join(AI_DIR, "rules", f), "utf8"));
    parts.push("\n---\n");
  }

  // Skills
  for (const f of readdirSync(join(AI_DIR, "skills")).filter(f => f.endsWith(".md") && f !== "SKILL-FORMAT.md")) {
    parts.push(readFileSync(join(AI_DIR, "skills", f), "utf8"));
    parts.push("\n---\n");
  }

  // Adapter extras
  const adapterFile = join(ADAPTERS_DIR, agent, "extra.md");
  if (existsSync(adapterFile)) {
    parts.push(readFileSync(adapterFile, "utf8"));
  }

  writeFileSync(join(projectDir, outputFile), parts.join("\n"));
  log(`  -> ${outputFile}`);
}

function syncCopilot(projectDir) {
  log("Syncing Copilot...");

  const githubDir = join(projectDir, ".github");
  mkdirSync(githubDir, { recursive: true });

  const parts = ["# Copilot Instructions\n"];
  parts.push("<!-- Auto-generated from .ai/ — do not edit directly. -->\n");

  parts.push(readFileSync(join(AI_DIR, "rules", "principles.md"), "utf8"));

  for (const f of readdirSync(join(AI_DIR, "rules")).filter(f => f.endsWith(".md") && f !== "principles.md")) {
    parts.push(readFileSync(join(AI_DIR, "rules", f), "utf8"));
  }

  parts.push("\n## Workflows (Reference)\n");
  for (const f of readdirSync(join(AI_DIR, "skills")).filter(f => f.endsWith(".md") && f !== "SKILL-FORMAT.md")) {
    parts.push(readFileSync(join(AI_DIR, "skills", f), "utf8"));
  }

  const adapterFile = join(ADAPTERS_DIR, "copilot", "extra.md");
  if (existsSync(adapterFile)) parts.push(readFileSync(adapterFile, "utf8"));

  writeFileSync(join(githubDir, "copilot-instructions.md"), parts.join("\n"));
  log("  -> .github/copilot-instructions.md");
}

function syncAider(projectDir) {
  log("Syncing Aider...");

  writeFileSync(join(projectDir, ".aider.conf.yml"),
    "# Auto-generated from .ai/\nread: CONVENTIONS.md\nauto-commits: false\nno-auto-lint: false\n"
  );

  const parts = ["# Project Conventions\n"];
  parts.push("<!-- Auto-generated from .ai/ — do not edit directly. -->\n");
  parts.push(readFileSync(join(AI_DIR, "rules", "principles.md"), "utf8"));

  for (const f of readdirSync(join(AI_DIR, "rules")).filter(f => f.endsWith(".md") && f !== "principles.md")) {
    parts.push(readFileSync(join(AI_DIR, "rules", f), "utf8"));
  }

  const adapterFile = join(ADAPTERS_DIR, "aider", "extra.md");
  if (existsSync(adapterFile)) parts.push(readFileSync(adapterFile, "utf8"));

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
    try { unlinkSync(dest); } catch {}
    try {
      const stat = statSync(dest);
      const backup = `${dest}.backup.${Date.now()}`;
      renameSync(dest, backup);
      warn(`Backed up ${dest}`);
    } catch {}

    symlinkSync(src, dest);
    log(`  ${basename(dest)} -> ${dest}`);
  }

  console.log("");
  log("Done! Claude Code will now load your global rules.");
}

function cmdSync(targetDir, agents) {
  const projectDir = resolve(targetDir);
  log(`Re-syncing in ${projectDir}`);

  // Check if .ai/ exists
  if (!existsSync(join(projectDir, ".ai"))) {
    err("No .ai/ directory found. Run 'claude-rules init' first.");
    process.exit(1);
  }

  for (const agent of agents) {
    if (agent === "claude" || agent === "all") syncClaude(projectDir);
    if (agent === "cursor" || agent === "all") syncFlat(projectDir, "cursor", ".cursorrules");
    if (agent === "windsurf" || agent === "all") syncFlat(projectDir, "windsurf", ".windsurfrules");
    if (agent === "copilot" || agent === "all") syncCopilot(projectDir);
    if (agent === "aider" || agent === "all") syncAider(projectDir);
  }

  log("Sync complete.");
}

function cmdUpdate(targetDir) {
  const projectDir = resolve(targetDir);
  log("Updating .ai/ from latest source...");

  // Update rules (overwrite all)
  const aiDest = join(projectDir, ".ai");
  if (!existsSync(aiDest)) {
    err("No .ai/ directory found. Run 'claude-rules init' first.");
    process.exit(1);
  }

  for (const f of readdirSync(join(AI_DIR, "rules"))) {
    copyFileSync(join(AI_DIR, "rules", f), join(aiDest, "rules", f));
  }
  log("  Updated .ai/rules/");

  for (const f of readdirSync(join(AI_DIR, "skills"))) {
    copyFileSync(join(AI_DIR, "skills", f), join(aiDest, "skills", f));
  }
  log("  Updated .ai/skills/");

  copyFileSync(join(AI_DIR, "manifest.yaml"), join(aiDest, "manifest.yaml"));
  log("  Updated manifest.yaml");

  log("Done. Run 'claude-rules sync' to regenerate agent configs.");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  console.log(`
${BOLD}claude-rules${RESET} v${VERSION} — AI agent configuration manager

${BOLD}Usage:${RESET}
  claude-rules init [agents...]    Initialize a project (default: claude)
  claude-rules setup               Symlink into ~/.claude/ (global install)
  claude-rules sync [agents...]    Re-generate agent configs from .ai/
  claude-rules update              Update .ai/ rules/skills to latest
  claude-rules --help              Show this help

${BOLD}Agents:${RESET} claude, cursor, windsurf, copilot, aider, all

${BOLD}Examples:${RESET}
  ${DIM}# Initialize current project with Claude Code config${RESET}
  claude-rules init

  ${DIM}# Initialize with Claude + Cursor${RESET}
  claude-rules init claude cursor

  ${DIM}# Quick setup via bunx (no install)${RESET}
  bunx github:NickBevers/claude-rules init

  ${DIM}# Install globally into ~/.claude/${RESET}
  claude-rules setup

  ${DIM}# Update rules and re-sync${RESET}
  claude-rules update && claude-rules sync
`);
  process.exit(0);
}

switch (command) {
  case "init": {
    const agents = args.slice(1).filter(a => !a.startsWith("-"));
    cmdInit(".", agents.length ? agents : ["claude"]);
    break;
  }
  case "setup":
    cmdSetup();
    break;
  case "sync": {
    const agents = args.slice(1).filter(a => !a.startsWith("-"));
    cmdSync(".", agents.length ? agents : ["claude"]);
    break;
  }
  case "update":
    cmdUpdate(".");
    break;
  default:
    err(`Unknown command: ${command}`);
    console.log("Run 'claude-rules --help' for usage.");
    process.exit(1);
}
