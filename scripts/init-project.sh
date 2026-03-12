#!/usr/bin/env bash
set -euo pipefail

# init-project.sh
#
# Initializes a project directory with AI agent configurations pulled from
# the global ~/.config/claude-rules/ source of truth.
#
# Usage:
#   ~/.config/claude-rules/scripts/init-project.sh /path/to/project [agents...]
#
# Examples:
#   init-project.sh .                    # Current dir, Claude only (default)
#   init-project.sh . claude cursor      # Current dir, Claude + Cursor
#   init-project.sh ~/my-app all         # All agents
#
# What it does:
# 1. Copies .ai/ directory into the project (universal rules)
# 2. Runs sync-agents.sh to generate agent-specific configs
# 3. Adds generated files to .gitignore (optional)
#
# Projects can then override rules by:
# - Adding a project-level CLAUDE.md that imports from .ai/ and adds specifics
# - Adding project-specific rules in .ai/rules/project-*.md

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GLOBAL_DIR="$(dirname "$SCRIPT_DIR")"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 /path/to/project [agents...]"
  echo "Agents: claude (default), cursor, windsurf, copilot, aider, all"
  exit 1
fi

PROJECT_DIR="$(cd "$1" && pwd)"
shift

AGENTS=("${@:-claude}")
if [[ ${#AGENTS[@]} -eq 0 ]]; then
  AGENTS=("claude")
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[init]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[init]${NC} $1"; }

log_info "Initializing AI agent config in: $PROJECT_DIR"

# Copy .ai/ universal rules
if [[ -d "$PROJECT_DIR/.ai" ]]; then
  log_warn ".ai/ already exists — merging (existing files preserved)"
fi

mkdir -p "$PROJECT_DIR/.ai/rules" "$PROJECT_DIR/.ai/skills"

# Copy rules (don't overwrite project-specific overrides)
for f in "$GLOBAL_DIR/.ai/rules/"*.md; do
  local_file="$PROJECT_DIR/.ai/rules/$(basename "$f")"
  if [[ ! -f "$local_file" ]]; then
    cp "$f" "$local_file"
    log_info "  Copied $(basename "$f")"
  else
    log_warn "  Skipped $(basename "$f") (already exists)"
  fi
done

for f in "$GLOBAL_DIR/.ai/skills/"*.md; do
  local_file="$PROJECT_DIR/.ai/skills/$(basename "$f")"
  if [[ ! -f "$local_file" ]]; then
    cp "$f" "$local_file"
    log_info "  Copied $(basename "$f")"
  else
    log_warn "  Skipped $(basename "$f") (already exists)"
  fi
done

# Copy manifest
if [[ ! -f "$PROJECT_DIR/.ai/manifest.yaml" ]]; then
  cp "$GLOBAL_DIR/.ai/manifest.yaml" "$PROJECT_DIR/.ai/manifest.yaml"
  log_info "  Copied manifest.yaml"
fi

# Copy sync script
mkdir -p "$PROJECT_DIR/scripts"
cp "$GLOBAL_DIR/scripts/sync-agents.sh" "$PROJECT_DIR/scripts/sync-agents.sh"
chmod +x "$PROJECT_DIR/scripts/sync-agents.sh"
log_info "  Copied sync-agents.sh"

# Copy adapter templates
if [[ -d "$GLOBAL_DIR/adapters" ]]; then
  cp -r "$GLOBAL_DIR/adapters" "$PROJECT_DIR/adapters" 2>/dev/null || true
fi

# Run sync for requested agents
for agent in "${AGENTS[@]}"; do
  "$PROJECT_DIR/scripts/sync-agents.sh" "$agent" --project "$PROJECT_DIR"
done

echo ""
log_info "Project initialized. Structure:"
echo ""
echo "  $PROJECT_DIR/"
echo "  ├── .ai/                    # Universal rules (edit these)"
echo "  │   ├── manifest.yaml       # Configuration manifest"
echo "  │   ├── rules/              # Domain rules (agent-agnostic)"
echo "  │   └── skills/             # Workflow definitions"
echo "  ├── scripts/"
echo "  │   └── sync-agents.sh      # Regenerate agent configs"

for agent in "${AGENTS[@]}"; do
  case "$agent" in
    claude|all)
      echo "  ├── CLAUDE.md               # Global rules (edit manually)"
      echo "  ├── rules/                  # Path-scoped rules (generated)"
      echo "  ├── skills/                 # On-demand skills (generated)"
      ;;
  esac
  case "$agent" in
    cursor|all) echo "  ├── .cursorrules            # Generated — Cursor" ;;
  esac
  case "$agent" in
    windsurf|all) echo "  ├── .windsurfrules          # Generated — Windsurf" ;;
  esac
  case "$agent" in
    copilot|all) echo "  ├── .github/copilot-instructions.md  # Generated — Copilot" ;;
  esac
  case "$agent" in
    aider|all)
      echo "  ├── .aider.conf.yml         # Generated — Aider config"
      echo "  ├── CONVENTIONS.md          # Generated — Aider conventions"
      ;;
  esac
done

echo ""
log_info "To add project-specific rules, create .ai/rules/project-*.md files"
log_info "Then re-run: ./scripts/sync-agents.sh"
