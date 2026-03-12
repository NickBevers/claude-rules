#!/usr/bin/env bash
set -euo pipefail

# sync-agents.sh
#
# Generates agent-specific configuration files from the universal .ai/ source.
# Run this after editing any file in .ai/rules/ or .ai/skills/.
#
# Usage:
#   ./scripts/sync-agents.sh              # Sync all enabled agents
#   ./scripts/sync-agents.sh claude       # Sync only Claude Code
#   ./scripts/sync-agents.sh cursor       # Sync only Cursor
#   ./scripts/sync-agents.sh --project /path/to/project  # Sync into a project dir
#
# The script reads .ai/manifest.yaml to determine which agents are enabled
# and what files to generate. It concatenates the universal rules into the
# format each agent expects.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
AI_DIR="$ROOT_DIR/.ai"
ADAPTERS_DIR="$ROOT_DIR/adapters"

# Target can be the global config dir or a specific project
TARGET_DIR="$ROOT_DIR"
AGENT_FILTER=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --project)
      TARGET_DIR="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [agent] [--project /path/to/project]"
      echo ""
      echo "Agents: claude, cursor, windsurf, copilot, aider, all (default)"
      echo ""
      echo "Examples:"
      echo "  $0                              # Sync all enabled agents to global config"
      echo "  $0 claude                       # Sync only Claude Code"
      echo "  $0 claude --project ~/my-app    # Generate CLAUDE.md in ~/my-app"
      echo "  $0 all --project ~/my-app       # Generate all agent configs in ~/my-app"
      exit 0
      ;;
    *)
      AGENT_FILTER="$1"
      shift
      ;;
  esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[sync]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[sync]${NC} $1"; }
log_error() { echo -e "${RED}[sync]${NC} $1"; }

# ============================================================================
# CLAUDE CODE — CLAUDE.md + .claude/rules/
# ============================================================================
sync_claude() {
  log_info "Syncing Claude Code configuration..."

  local rules_out_dir="$TARGET_DIR/rules"
  local skills_out_dir="$TARGET_DIR/skills"

  # CLAUDE.md is maintained manually (not generated) because it contains
  # carefully curated hard constraints and stack defaults. The sync script
  # only generates path-scoped rules/ and skills/ files.
  #
  # If CLAUDE.md does not exist, create a minimal one.
  if [[ ! -f "$TARGET_DIR/CLAUDE.md" ]]; then
    log_warn "No CLAUDE.md found — creating minimal version from principles"
    {
      echo "# Global Rules"
      echo ""
      echo "These rules load on EVERY interaction. Domain rules are in rules/ (path-scoped) and skills/ (on-demand)."
      echo ""
      cat "$AI_DIR/rules/principles.md"
    } > "$TARGET_DIR/CLAUDE.md"
    log_info "  -> CLAUDE.md (created)"
  else
    log_info "  -> CLAUDE.md (exists, not overwritten — edit manually)"
  fi

  # Generate path-scoped rules from .ai/rules/
  # Each rule file gets a paths: frontmatter so it only loads when
  # Claude accesses matching file types. This is the key optimization.
  mkdir -p "$rules_out_dir"

  # Path scope mappings: .ai/rules/ filename -> paths globs
  # Rules without a mapping are skipped (principles are in CLAUDE.md,
  # generic rules like project-management are token waste)
  generate_scoped_rule() {
    local src="$1"
    local dest="$2"
    local paths_yaml="$3"

    {
      echo "---"
      echo "paths:"
      echo "$paths_yaml"
      echo "---"
      echo ""
      cat "$src"
    } > "$dest"
  }

  # Frontend
  if [[ -f "$AI_DIR/rules/frontend-development.md" ]]; then
    generate_scoped_rule "$AI_DIR/rules/frontend-development.md" "$rules_out_dir/frontend.md" \
      '  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.astro"
  - "**/*.module.css"
  - "**/*.css"
  - "**/components/**"
  - "**/islands/**"
  - "**/pages/**"
  - "**/layouts/**"'
    log_info "  -> rules/frontend.md (path-scoped)"
  fi

  # Backend
  if [[ -f "$AI_DIR/rules/backend-development.md" ]]; then
    generate_scoped_rule "$AI_DIR/rules/backend-development.md" "$rules_out_dir/backend.md" \
      '  - "**/server/**"
  - "**/api/**"
  - "**/*.server.ts"
  - "**/routes/**"
  - "**/services/**"
  - "**/middleware/**"'
    log_info "  -> rules/backend.md (path-scoped)"
  fi

  # Security
  if [[ -f "$AI_DIR/rules/security.md" ]]; then
    generate_scoped_rule "$AI_DIR/rules/security.md" "$rules_out_dir/security.md" \
      '  - "**/auth/**"
  - "**/session*"
  - "**/middleware*"
  - "**/*guard*"
  - "**/*crypt*"
  - "**/*password*"
  - "**/*permission*"
  - "**/*role*"'
    log_info "  -> rules/security.md (path-scoped)"
  fi

  # Testing
  if [[ -f "$AI_DIR/rules/testing.md" ]]; then
    generate_scoped_rule "$AI_DIR/rules/testing.md" "$rules_out_dir/testing.md" \
      '  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/e2e/**"
  - "**/tests/**"
  - "**/test/**"
  - "**/vitest*"
  - "**/playwright*"'
    log_info "  -> rules/testing.md (path-scoped)"
  fi

  # DevOps
  if [[ -f "$AI_DIR/rules/devops.md" ]]; then
    generate_scoped_rule "$AI_DIR/rules/devops.md" "$rules_out_dir/devops.md" \
      '  - "**/Dockerfile*"
  - "**/docker-compose*"
  - "**/.github/**"
  - "**/*.yml"
  - "**/*.yaml"
  - "**/deploy*"'
    log_info "  -> rules/devops.md (path-scoped)"
  fi

  # Design
  if [[ -f "$AI_DIR/rules/design.md" ]]; then
    generate_scoped_rule "$AI_DIR/rules/design.md" "$rules_out_dir/design.md" \
      '  - "**/*.module.css"
  - "**/*.css"
  - "**/tokens*"
  - "**/theme*"
  - "**/design*"'
    log_info "  -> rules/design.md (path-scoped)"
  fi

  # Ticketing
  if [[ -f "$AI_DIR/rules/ticketing.md" ]]; then
    generate_scoped_rule "$AI_DIR/rules/ticketing.md" "$rules_out_dir/ticketing.md" \
      '  - "**/.claude/tickets/**"
  - "**/tickets/**"'
    log_info "  -> rules/ticketing.md (path-scoped)"
  fi

  # Planning
  if [[ -f "$AI_DIR/rules/planning.md" ]]; then
    generate_scoped_rule "$AI_DIR/rules/planning.md" "$rules_out_dir/planning.md" \
      '  - "**/.claude/research/**"
  - "**/decisions*"
  - "**/architecture*"'
    log_info "  -> rules/planning.md (path-scoped)"
  fi

  # Git
  if [[ -f "$AI_DIR/rules/git.md" ]]; then
    generate_scoped_rule "$AI_DIR/rules/git.md" "$rules_out_dir/git.md" \
      '  - "**/.gitignore"
  - "**/.gitattributes"
  - "**/.github/**"'
    log_info "  -> rules/git.md (path-scoped)"
  fi

  # Research
  if [[ -f "$AI_DIR/rules/research.md" ]]; then
    generate_scoped_rule "$AI_DIR/rules/research.md" "$rules_out_dir/research.md" \
      '  - "**/.claude/research/**"
  - "**/research/**"
  - "**/spike*"'
    log_info "  -> rules/research.md (path-scoped)"
  fi

  # Skills go in skills/ directory (on-demand, zero cost until triggered)
  mkdir -p "$skills_out_dir"
  for skill_file in "$AI_DIR"/skills/*.md; do
    local basename=$(basename "$skill_file")
    [[ "$basename" == "SKILL-FORMAT.md" ]] && continue
    cp "$skill_file" "$skills_out_dir/$basename"
    log_info "  -> skills/$basename (on-demand)"
  done

  # Clean up old non-scoped rule files that the sync script used to generate
  # These are the flat copies without paths: frontmatter
  local old_files=(
    "$rules_out_dir/backend-development.md"
    "$rules_out_dir/frontend-development.md"
    "$rules_out_dir/project-management.md"
    "$rules_out_dir/skill-design-discovery.md"
    "$rules_out_dir/skill-micro-animations.md"
    "$rules_out_dir/skill-SKILL-FORMAT.md"
  )
  for old_file in "${old_files[@]}"; do
    if [[ -f "$old_file" ]]; then
      rm "$old_file"
      log_warn "  Removed old file: $(basename "$old_file")"
    fi
  done

  log_info "  -> rules/ ($(ls "$rules_out_dir"/*.md 2>/dev/null | wc -l) path-scoped files)"
  log_info "  -> skills/ ($(ls "$skills_out_dir"/*.md 2>/dev/null | wc -l) on-demand files)"
}

# ============================================================================
# CURSOR — .cursorrules (single flat file)
# ============================================================================
sync_cursor() {
  log_info "Syncing Cursor configuration..."

  local output="$TARGET_DIR/.cursorrules"

  {
    echo "# Cursor Rules"
    echo ""
    echo "# These rules are auto-generated from .ai/ — do not edit directly."
    echo "# Source: https://github.com/quiknick09/claude-rules"
    echo "# Regenerate: ./scripts/sync-agents.sh cursor"
    echo ""

    # Cursor uses a single flat file, so concatenate everything
    cat "$AI_DIR/rules/principles.md"
    echo ""
    echo "---"
    echo ""

    for rule_file in "$AI_DIR"/rules/*.md; do
      if [[ "$(basename "$rule_file")" == "principles.md" ]]; then
        continue
      fi
      cat "$rule_file"
      echo ""
      echo "---"
      echo ""
    done

    # Include skills as reference (Cursor can follow them as instructions)
    for skill_file in "$AI_DIR"/skills/*.md; do
      [[ "$(basename "$skill_file" .md)" == "SKILL-FORMAT" ]] && continue
      cat "$skill_file"
      echo ""
      echo "---"
      echo ""
    done

    # Apply Cursor-specific adapter
    local adapter="$ADAPTERS_DIR/cursor/extra.md"
    if [[ -f "$adapter" ]]; then
      cat "$adapter"
    fi
  } > "$output"

  log_info "  -> $output"
}

# ============================================================================
# WINDSURF — .windsurfrules (single flat file, similar to Cursor)
# ============================================================================
sync_windsurf() {
  log_info "Syncing Windsurf configuration..."

  local output="$TARGET_DIR/.windsurfrules"

  {
    echo "# Windsurf Rules"
    echo ""
    echo "# Auto-generated from .ai/ — do not edit directly."
    echo "# Regenerate: ./scripts/sync-agents.sh windsurf"
    echo ""

    cat "$AI_DIR/rules/principles.md"
    echo ""

    for rule_file in "$AI_DIR"/rules/*.md; do
      if [[ "$(basename "$rule_file")" == "principles.md" ]]; then
        continue
      fi
      cat "$rule_file"
      echo ""
    done

    for skill_file in "$AI_DIR"/skills/*.md; do
      [[ "$(basename "$skill_file" .md)" == "SKILL-FORMAT" ]] && continue
      cat "$skill_file"
      echo ""
    done

    local adapter="$ADAPTERS_DIR/windsurf/extra.md"
    if [[ -f "$adapter" ]]; then
      cat "$adapter"
    fi
  } > "$output"

  log_info "  -> $output"
}

# ============================================================================
# COPILOT — .github/copilot-instructions.md
# ============================================================================
sync_copilot() {
  log_info "Syncing GitHub Copilot configuration..."

  mkdir -p "$TARGET_DIR/.github"
  local output="$TARGET_DIR/.github/copilot-instructions.md"

  {
    echo "# Copilot Instructions"
    echo ""
    echo "<!-- Auto-generated from .ai/ — do not edit directly. -->"
    echo "<!-- Regenerate: ./scripts/sync-agents.sh copilot -->"
    echo ""

    cat "$AI_DIR/rules/principles.md"
    echo ""

    for rule_file in "$AI_DIR"/rules/*.md; do
      if [[ "$(basename "$rule_file")" == "principles.md" ]]; then
        continue
      fi
      cat "$rule_file"
      echo ""
    done

    # Skills are less useful for Copilot (no subagent spawning),
    # but include them as reference for the instruction-following model
    echo "## Workflows (Reference)"
    echo ""
    echo "The following workflows describe multi-step processes. Follow the steps when the user requests these tasks."
    echo ""

    for skill_file in "$AI_DIR"/skills/*.md; do
      [[ "$(basename "$skill_file" .md)" == "SKILL-FORMAT" ]] && continue
      cat "$skill_file"
      echo ""
    done

    local adapter="$ADAPTERS_DIR/copilot/extra.md"
    if [[ -f "$adapter" ]]; then
      cat "$adapter"
    fi
  } > "$output"

  log_info "  -> $output"
}

# ============================================================================
# AIDER — .aider.conf.yml + CONVENTIONS.md
# ============================================================================
sync_aider() {
  log_info "Syncing Aider configuration..."

  local config_output="$TARGET_DIR/.aider.conf.yml"
  local conventions_output="$TARGET_DIR/CONVENTIONS.md"

  # Aider config points to the conventions file
  {
    echo "# Auto-generated from .ai/ — do not edit directly."
    echo "# Regenerate: ./scripts/sync-agents.sh aider"
    echo ""
    echo "# Read conventions file for coding standards"
    echo "read: CONVENTIONS.md"
    echo ""
    echo "# Aider settings"
    echo "auto-commits: false"
    echo "no-auto-lint: false"
  } > "$config_output"

  # CONVENTIONS.md is the Aider equivalent of CLAUDE.md
  {
    echo "# Project Conventions"
    echo ""
    echo "<!-- Auto-generated from .ai/ — do not edit directly. -->"
    echo ""

    cat "$AI_DIR/rules/principles.md"
    echo ""

    for rule_file in "$AI_DIR"/rules/*.md; do
      if [[ "$(basename "$rule_file")" == "principles.md" ]]; then
        continue
      fi
      cat "$rule_file"
      echo ""
    done

    local adapter="$ADAPTERS_DIR/aider/extra.md"
    if [[ -f "$adapter" ]]; then
      cat "$adapter"
    fi
  } > "$conventions_output"

  log_info "  -> $config_output"
  log_info "  -> $conventions_output"
}

# ============================================================================
# Main dispatch
# ============================================================================

if [[ -z "$AGENT_FILTER" || "$AGENT_FILTER" == "all" ]]; then
  sync_claude
  # Only sync enabled agents (check manifest or just always try)
  # For now, only sync agents the user has enabled
  log_info "Done. Claude synced. Other agents disabled in manifest."
  log_info "Enable agents in .ai/manifest.yaml and re-run to generate their configs."
else
  case "$AGENT_FILTER" in
    claude)   sync_claude ;;
    cursor)   sync_cursor ;;
    windsurf) sync_windsurf ;;
    copilot)  sync_copilot ;;
    aider)    sync_aider ;;
    *)
      log_error "Unknown agent: $AGENT_FILTER"
      log_error "Supported: claude, cursor, windsurf, copilot, aider, all"
      exit 1
      ;;
  esac
fi

echo ""
log_info "Sync complete."
