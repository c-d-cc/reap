#!/usr/bin/env bash
# REAP SessionStart hook — injects REAP guide + Genome + current generation context into every Claude session
# This script runs from the package directory but uses cwd to find the project's .reap/
set -euo pipefail

# Script directory (package-internal) for guide file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

# Project directory is cwd (where Claude Code session started)
PROJECT_ROOT="$(pwd)"
REAP_DIR="${PROJECT_ROOT}/.reap"
CURRENT_YML="${REAP_DIR}/life/current.yml"
GUIDE_FILE="${SCRIPT_DIR}/reap-guide.md"
GENOME_DIR="${REAP_DIR}/genome"

# Check if this is a REAP project
if [ ! -d "$REAP_DIR" ]; then
  exit 0
fi

# Read REAP guide
reap_guide=""
if [ -f "$GUIDE_FILE" ]; then
  reap_guide=$(cat "$GUIDE_FILE")
fi

# Read Genome files with tiered loading
# L1 (~500 lines max): principles.md, conventions.md, constraints.md — always full load
# L2 (~200 lines max): domain/*.md — full load if within budget, otherwise title+summary only
L1_LIMIT=500
L2_LIMIT=200

genome_content=""
l1_lines=0
if [ -d "$GENOME_DIR" ]; then
  for f in "$GENOME_DIR"/principles.md "$GENOME_DIR"/conventions.md "$GENOME_DIR"/constraints.md; do
    if [ -f "$f" ]; then
      file_content=$(cat "$f")
      file_lines=$(echo "$file_content" | wc -l | tr -d ' ')
      l1_lines=$((l1_lines + file_lines))
      if [ "$l1_lines" -le "$L1_LIMIT" ]; then
        genome_content="${genome_content}\n### $(basename "$f")\n${file_content}\n"
      else
        # L1 budget exceeded — include truncated with warning
        genome_content="${genome_content}\n### $(basename "$f") [TRUNCATED — L1 budget exceeded, read full file directly]\n$(echo "$file_content" | head -20)\n...\n"
      fi
    fi
  done

  # L2: domain/ files
  if [ -d "$GENOME_DIR/domain" ]; then
    l2_lines=0
    l2_overflow=false
    for f in "$GENOME_DIR"/domain/*.md; do
      if [ -f "$f" ]; then
        file_content=$(cat "$f")
        file_lines=$(echo "$file_content" | wc -l | tr -d ' ')
        l2_lines=$((l2_lines + file_lines))
        if [ "$l2_overflow" = false ] && [ "$l2_lines" -le "$L2_LIMIT" ]; then
          genome_content="${genome_content}\n### domain/$(basename "$f")\n${file_content}\n"
        else
          # L2 budget exceeded — title + first line only
          l2_overflow=true
          first_line=$(echo "$file_content" | grep -m1 "^>" || echo "$file_content" | head -1)
          genome_content="${genome_content}\n### domain/$(basename "$f") [summary — read full file for details]\n${first_line}\n"
        fi
      fi
    done
  fi
fi

# Detect Genome staleness — count commits since last Genome modification
genome_stale_warning=""
if command -v git &>/dev/null && [ -d "$PROJECT_ROOT/.git" ]; then
  last_genome_commit=$(git -C "$PROJECT_ROOT" log -1 --format="%H" -- ".reap/genome/" 2>/dev/null || echo "")
  if [ -n "$last_genome_commit" ]; then
    commits_since=$(git -C "$PROJECT_ROOT" rev-list --count "${last_genome_commit}..HEAD" 2>/dev/null || echo "0")
    if [ "$commits_since" -gt 10 ]; then
      genome_stale_warning="WARNING: Genome may be stale — ${commits_since} commits since last Genome update. Consider running /reap.sync to synchronize."
    fi
  fi
fi

# Read current.yml
gen_stage="none"
if [ ! -f "$CURRENT_YML" ]; then
  generation_context="No active Generation. Run \`/reap.start\` to start one."
else
  content=$(cat "$CURRENT_YML")
  if [ -z "$content" ]; then
    generation_context="No active Generation. Run \`/reap.start\` to start one."
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
  *)              next_cmd="/reap.start" ;;
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

# Build staleness section
stale_section=""
if [ -n "$genome_stale_warning" ]; then
  stale_section="\n\n## Genome Staleness\n${genome_stale_warning}\nIf the user wants to proceed without syncing, ask: \"Genome이 오래되었을 수 있습니다. 지금 /reap.sync를 실행할까요, 아니면 나중에 할까요?\" and respect their choice."
fi

reap_context="<REAP_WORKFLOW>\n${reap_guide}\n\n---\n\n## Genome (Project Knowledge — treat as authoritative source of truth)\n${genome_content}\n\n---\n\n## Current State\n${generation_context}${stale_section}\n\n## Rules\n1. ALL development work MUST follow the REAP lifecycle. Do NOT bypass it.\n2. Before writing any code, check if a Generation is active and what stage it is in.\n3. If a Generation is active, use \`${next_cmd}\` to proceed with the current stage.\n4. If no Generation is active, use \`/reap.start\` to start a new one.\n5. Do NOT implement features, fix bugs, or make changes outside of the REAP lifecycle unless the user explicitly asks to bypass it.\n6. When the user says \"reap evolve\", \"다음 단계\", \"proceed\", or similar — invoke the appropriate REAP skill.\n7. **Genome is the authoritative knowledge source.** When making decisions about architecture, conventions, or constraints, ALWAYS reference the Genome first. If code contradicts Genome, flag it as a potential genome-change backlog item.\n8. If you notice the Genome is outdated or missing information relevant to your current task, inform the user and suggest running \`/reap.sync\`.\n</REAP_WORKFLOW>"

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
