#!/usr/bin/env bash
# REAP SessionStart hook — injects REAP guide + Genome + current generation context into every Claude session
# This script runs from the package directory but uses cwd to find the project's .reap/
set -euo pipefail

# Timing (node is guaranteed since REAP is an npm package)
_reap_ms() { node -e 'process.stdout.write(String(Date.now()))'; }
_reap_start_time=$(_reap_ms)
_reap_step=0
_reap_total=6
_reap_log() {
  local now=$(_reap_ms)
  local elapsed=$(( now - _reap_start_time ))
  _reap_step=$(( _reap_step + 1 ))
  echo "[REAP ${_reap_step}/${_reap_total} +${elapsed}ms] $1" >&2
}

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
  echo "[REAP] Not a REAP project, skipping" >&2
  exit 0
fi

# Step 1: Auto-update check
_reap_log "Checking for updates..."
CONFIG_FILE="${REAP_DIR}/config.yml"
auto_update_message=""
if [ -f "$CONFIG_FILE" ]; then
  auto_update=$(grep "^autoUpdate:" "$CONFIG_FILE" 2>/dev/null | sed 's/^autoUpdate: *//' | tr -d ' ' || true)
  if [ "$auto_update" = "true" ]; then
    installed=$(reap --version 2>/dev/null || echo "")
    latest=$(npm view @c-d-cc/reap version 2>/dev/null || echo "")
    if [ -n "$installed" ] && [ -n "$latest" ] && [ "$installed" != "$latest" ]; then
      if npm update -g @c-d-cc/reap >/dev/null 2>&1; then
        reap update >/dev/null 2>&1 || true
        auto_update_message="REAP auto-updated: v${installed} → v${latest}"
      fi
    fi
  fi
fi

# Step 2: Loading REAP guide
_reap_log "Loading REAP guide..."
reap_guide=""
if [ -f "$GUIDE_FILE" ]; then
  reap_guide=$(cat "$GUIDE_FILE")
fi

# Step 3: Loading Genome
_reap_log "Loading Genome (principles, conventions, constraints, source-map, domain)..."
# Read Genome files with tiered loading
# L1 (~500 lines max): principles.md, conventions.md, constraints.md, source-map.md — always full load
# L2 (~200 lines max): domain/*.md — full load if within budget, otherwise title+summary only
L1_LIMIT=500
L2_LIMIT=200

genome_content=""
l1_lines=0
if [ -d "$GENOME_DIR" ]; then
  for f in "$GENOME_DIR"/principles.md "$GENOME_DIR"/conventions.md "$GENOME_DIR"/constraints.md "$GENOME_DIR"/source-map.md; do
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

# Step 4: Checking Genome & source-map sync
_reap_log "Checking Genome & source-map sync..."
genome_stale_warning=""
if command -v git &>/dev/null && [ -d "$PROJECT_ROOT/.git" ]; then
  last_genome_commit=$(git -C "$PROJECT_ROOT" log -1 --format="%H" -- ".reap/genome/" 2>/dev/null || echo "")
  if [ -n "$last_genome_commit" ]; then
    commits_since=$(git -C "$PROJECT_ROOT" rev-list --count "${last_genome_commit}..HEAD" -- src/ tests/ package.json tsconfig.json scripts/ 2>/dev/null || echo "0")
    if [ "$commits_since" -gt 10 ]; then
      genome_stale_warning="WARNING: Genome may be stale — ${commits_since} commits since last Genome update. Consider running /reap.sync to synchronize."
      echo "[REAP]   ⚠ Genome stale: ${commits_since} code commits since last update" >&2
    fi
  fi
fi

sourcemap_drift_warning=""
SOURCEMAP_FILE="${GENOME_DIR}/source-map.md"
if [ -f "$SOURCEMAP_FILE" ] && [ -d "${PROJECT_ROOT}/src/core" ]; then
  documented=$(grep -c 'Component(' "$SOURCEMAP_FILE" 2>/dev/null || echo "0")
  actual=$(ls "${PROJECT_ROOT}"/src/core/*.ts 2>/dev/null | wc -l | tr -d ' ')
  if [ "$documented" != "0" ] && [ "$actual" != "0" ] && [ "$documented" != "$actual" ]; then
    sourcemap_drift_warning="WARNING: source-map.md drift — ${documented} components documented, ${actual} core files found. Consider running /reap.sync."
    echo "[REAP]   ⚠ Source-map drift: ${documented} documented vs ${actual} actual" >&2
  else
    echo "[REAP]   ✓ Source-map in sync (${actual} components)" >&2
  fi
else
  echo "[REAP]   - Source-map check skipped (no source-map.md or src/core/)" >&2
fi

# Step 5: Reading generation state
_reap_log "Reading generation state..."
# Read strict mode from config.yml
strict_mode=false
CONFIG_FILE="${REAP_DIR}/config.yml"
if [ -f "$CONFIG_FILE" ]; then
  strict_val=$(grep "^strict:" "$CONFIG_FILE" 2>/dev/null | sed 's/^strict: *//' | tr -d ' ' || true)
  if [ "$strict_val" = "true" ]; then
    strict_mode=true
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
  printf '%s' "$1" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>process.stdout.write(JSON.stringify(d).slice(1,-1)))'
}

# Build strict mode section
strict_section=""
if [ "$strict_mode" = true ]; then
  if [ "$gen_stage" = "implementation" ]; then
    strict_section="\n\n## Strict Mode (ACTIVE — SCOPED MODIFICATION ALLOWED)\n<HARD-GATE>\nStrict mode is enabled. Code modification is ALLOWED only within the scope of the current Generation's plan.\n- You MUST read \`.reap/life/02-planning.md\` before writing any code.\n- You may ONLY modify files and modules listed in the plan's task list.\n- Changes outside the plan's scope are BLOCKED. If you discover out-of-scope work is needed, add it to the backlog instead of implementing it.\n- If the user explicitly requests to bypass strict mode (e.g., \"override\", \"bypass strict\"), you may proceed — but inform them that strict mode is being bypassed.\n</HARD-GATE>"
  elif [ "$gen_stage" = "none" ]; then
    strict_section="\n\n## Strict Mode (ACTIVE — CODE MODIFICATION BLOCKED)\n<HARD-GATE>\nStrict mode is enabled and there is NO active Generation.\nYou MUST NOT write, edit, or create any source code files.\nAllowed actions: reading files, analyzing code, answering questions, running commands.\nTo start coding, the user must first run \`/reap.start\` and advance to the implementation stage.\nIf the user explicitly requests to bypass strict mode (e.g., \"override\", \"bypass strict\", \"just do it\"), you may proceed — but inform them that strict mode is being bypassed.\n</HARD-GATE>"
  else
    strict_section="\n\n## Strict Mode (ACTIVE — CODE MODIFICATION BLOCKED)\n<HARD-GATE>\nStrict mode is enabled. Current stage is '${gen_stage}', which is NOT the implementation stage.\nYou MUST NOT write, edit, or create any source code files.\nAllowed actions: reading files, analyzing code, answering questions, running commands, writing REAP artifacts.\nAdvance to the implementation stage via the REAP lifecycle to unlock code modification.\nIf the user explicitly requests to bypass strict mode (e.g., \"override\", \"bypass strict\", \"just do it\"), you may proceed — but inform them that strict mode is being bypassed.\n</HARD-GATE>"
  fi
fi

# Build staleness section
stale_section=""
if [ -n "$genome_stale_warning" ]; then
  stale_section="\n\n## Genome Staleness\n${genome_stale_warning}\nIf the user wants to proceed without syncing, ask: \"The Genome may be stale. Would you like to run /reap.sync now, or do it later?\" and respect their choice."
fi
if [ -n "$sourcemap_drift_warning" ]; then
  stale_section="${stale_section}\n${sourcemap_drift_warning}"
fi

# Build auto-update section
update_section=""
if [ -n "$auto_update_message" ]; then
  update_section="\n\n## Auto-Update\n${auto_update_message}. Tell the user: \"${auto_update_message}\""
fi

# Step 6: Building context
_reap_log "Done. Injecting context."

reap_context="<REAP_WORKFLOW>\n${reap_guide}\n\n---\n\n## Genome (Project Knowledge — treat as authoritative source of truth)\n${genome_content}\n\n---\n\n## Current State\n${generation_context}${stale_section}${strict_section}${update_section}\n\n## Rules\n1. ALL development work MUST follow the REAP lifecycle. Do NOT bypass it.\n2. Before writing any code, check if a Generation is active and what stage it is in.\n3. If a Generation is active, use \`${next_cmd}\` to proceed with the current stage.\n4. If no Generation is active, use \`/reap.start\` to start a new one.\n5. Do NOT implement features, fix bugs, or make changes outside of the REAP lifecycle unless the user explicitly asks to bypass it.\n6. When the user says \"reap evolve\", \"next stage\", \"proceed\", or similar — invoke the appropriate REAP skill.\n7. **Genome is the authoritative knowledge source.** When making decisions about architecture, conventions, or constraints, ALWAYS reference the Genome first. If code contradicts Genome, flag it as a potential genome-change backlog item.\n8. If you notice the Genome is outdated or missing information relevant to your current task, inform the user and suggest running \`/reap.sync\`.\n</REAP_WORKFLOW>"

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
