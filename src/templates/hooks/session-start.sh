#!/usr/bin/env bash
# REAP SessionStart hook — injects REAP guide + current generation context into every Claude session
# This script runs from the package directory but uses cwd to find the project's .reap/
set -euo pipefail

# Script directory (package-internal) for guide file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

# Project directory is cwd (where Claude Code session started)
PROJECT_ROOT="$(pwd)"
REAP_DIR="${PROJECT_ROOT}/.reap"
CURRENT_YML="${REAP_DIR}/life/current.yml"
GUIDE_FILE="${SCRIPT_DIR}/reap-guide.md"

# Check if this is a REAP project
if [ ! -d "$REAP_DIR" ]; then
  exit 0
fi

# Read REAP guide
reap_guide=""
if [ -f "$GUIDE_FILE" ]; then
  reap_guide=$(cat "$GUIDE_FILE")
fi

# Read current.yml
gen_stage="none"
if [ ! -f "$CURRENT_YML" ]; then
  generation_context="No active Generation. Run \`/reap.evolve\` to start one."
else
  content=$(cat "$CURRENT_YML")
  if [ -z "$content" ]; then
    generation_context="No active Generation. Run \`/reap.evolve\` to start one."
  else
    # Parse YAML fields (simple grep-based, no external deps)
    gen_id=$(echo "$content" | grep "^id:" | sed 's/^id: *//')
    gen_goal=$(echo "$content" | grep "^goal:" | sed 's/^goal: *//')
    gen_stage=$(echo "$content" | grep "^stage:" | sed 's/^stage: *//')
    generation_context="Active Generation: ${gen_id} | Goal: ${gen_goal} | Stage: ${gen_stage}"
  fi
fi

# Map stage to command
case "${gen_stage}" in
  objective)      next_cmd="/reap.objective" ;;
  planning)       next_cmd="/reap.planning" ;;
  implementation) next_cmd="/reap.implementation" ;;
  validation)     next_cmd="/reap.validation" ;;
  completion)     next_cmd="/reap.completion" ;;
  *)              next_cmd="/reap.evolve" ;;
esac

# Escape for JSON
escape_for_json() {
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\"/\\\"}"
  s="${s//$'\n'/\\n}"
  s="${s//$'\r'/\\r}"
  s="${s//$'\t'/\\t}"
  printf '%s' "$s"
}

reap_context="<REAP_WORKFLOW>\n${reap_guide}\n\n---\n\n## Current State\n${generation_context}\n\n## Rules\n1. ALL development work MUST follow the REAP lifecycle. Do NOT bypass it.\n2. Before writing any code, check if a Generation is active and what stage it is in.\n3. If a Generation is active, use \`${next_cmd}\` to proceed with the current stage.\n4. If no Generation is active, use \`/reap.evolve\` to start a new one.\n5. Do NOT implement features, fix bugs, or make changes outside of the REAP lifecycle unless the user explicitly asks to bypass it.\n6. When the user says \"reap evolve\", \"다음 단계\", \"proceed\", or similar — invoke the appropriate REAP skill.\n</REAP_WORKFLOW>"

escaped_context=$(escape_for_json "$reap_context")

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "${escaped_context}"
  }
}
EOF

exit 0
