#!/usr/bin/env bash
set -euo pipefail

# setup.sh — Link claude-rules into ~/.claude/ so Claude Code loads them
#
# This creates symlinks from this repo into ~/.claude/:
#   CLAUDE.md  → ~/.claude/CLAUDE.md         (global always-on rules)
#   rules/     → ~/.claude/rules/            (path-scoped, load conditionally)
#   skills/    → ~/.claude/skills/           (on-demand, zero cost until triggered)
#
# Safe: backs up existing files, won't overwrite without confirmation.
#
# Usage:
#   ./setup.sh              # Install (symlink into ~/.claude/)
#   ./setup.sh --uninstall  # Remove symlinks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[setup]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[setup]${NC} $1"; }
log_error() { echo -e "${RED}[setup]${NC} $1"; }

backup_if_exists() {
  local target="$1"
  if [[ -e "$target" && ! -L "$target" ]]; then
    local backup="${target}.backup.$(date +%Y%m%d%H%M%S)"
    mv "$target" "$backup"
    log_warn "Backed up existing $target -> $backup"
  elif [[ -L "$target" ]]; then
    rm "$target"
    log_info "Removed existing symlink: $target"
  fi
}

install() {
  mkdir -p "$CLAUDE_DIR"

  # Symlink CLAUDE.md
  backup_if_exists "$CLAUDE_DIR/CLAUDE.md"
  ln -s "$SCRIPT_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
  log_info "Linked CLAUDE.md -> $CLAUDE_DIR/CLAUDE.md"

  # Symlink rules/
  backup_if_exists "$CLAUDE_DIR/rules"
  ln -s "$SCRIPT_DIR/rules" "$CLAUDE_DIR/rules"
  log_info "Linked rules/ -> $CLAUDE_DIR/rules/"

  # Symlink skills/
  backup_if_exists "$CLAUDE_DIR/skills"
  ln -s "$SCRIPT_DIR/skills" "$CLAUDE_DIR/skills"
  log_info "Linked skills/ -> $CLAUDE_DIR/skills/"

  echo ""
  log_info "Done! Claude Code will now load:"
  echo "  - CLAUDE.md on every interaction (~40 lines, always-on)"
  echo "  - rules/*.md when touching matching file types (conditional)"
  echo "  - skills/*/SKILL.md on demand (zero cost until triggered)"
  echo ""
  log_info "To verify: start a new Claude Code session and check if stack defaults appear."
}

uninstall() {
  for item in "$CLAUDE_DIR/CLAUDE.md" "$CLAUDE_DIR/rules" "$CLAUDE_DIR/skills"; do
    if [[ -L "$item" ]]; then
      rm "$item"
      log_info "Removed symlink: $item"
    elif [[ -e "$item" ]]; then
      log_warn "Skipped $item (not a symlink — won't delete)"
    fi
  done
  log_info "Uninstalled. Claude Code will use its defaults."
}

case "${1:-}" in
  --uninstall|-u)
    uninstall
    ;;
  --help|-h)
    echo "Usage: $0 [--uninstall]"
    echo ""
    echo "Install:   $0           (symlinks into ~/.claude/)"
    echo "Uninstall: $0 --uninstall (removes symlinks)"
    ;;
  *)
    install
    ;;
esac
