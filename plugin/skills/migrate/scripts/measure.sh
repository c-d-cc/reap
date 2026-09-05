#!/usr/bin/env bash
# v0.17 store measurement — run by migrate skill's 3/8, before consent. This
# script owns the numbers the human is told; the skill doesn't count by eye.
#
# Usage: measure.sh [<project-root>]   (default: .)
# Reads <project-root>/.reap only (the store is still in place at 3/8 — before
# isolation). Never writes. Every line is "<key>: <value>". Always exit 0.
set -u
root="${1:-.}"
r="$root/.reap"
if [ ! -d "$r" ]; then echo "error: $r missing"; exit 0; fi

count_files() { # dir → number of regular files (recursive), 0 if absent
  [ -d "$1" ] && find "$1" -type f | wc -l | tr -d ' ' || echo 0
}
count_top() { # dir → number of entries directly under it, 0 if absent
  [ -d "$1" ] && find "$1" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ' || echo 0
}
size_of() { # file → bytes, 0 if absent
  [ -f "$1" ] && wc -c < "$1" | tr -d ' ' || echo 0
}

# memory — the three tiers, by size (bytes)
for t in longterm midterm shortterm; do
  echo "memory/$t.md: $(size_of "$r/vision/memory/$t.md") bytes"
done

# goals — live (unchecked) lines are what mapping #5 registers
if [ -f "$r/vision/goals.md" ]; then
  echo "goals.md live lines: $(grep -c '^- \[ \]' "$r/vision/goals.md" | tr -d ' ')"
else
  echo "goals.md live lines: 0 (absent)"
fi

# lineage — entries + last id (mapping #8 · #11)
lineage_entries=$(find "$r/lineage" -mindepth 1 -maxdepth 1 \( -type d -o -type f \) -name 'gen-[0-9][0-9][0-9]-*' 2>/dev/null | wc -l | tr -d ' ')
echo "lineage entries: ${lineage_entries:-0}"
last=$(find "$r/lineage" -mindepth 1 -maxdepth 1 \( -type d -o -type f \) -name 'gen-[0-9][0-9][0-9]-*' 2>/dev/null \
  | xargs -I{} basename {} 2>/dev/null | sed 's/\.md$//' | sort | tail -1)
echo "lineage last id: ${last:-none}"
[ -f "$r/lineage/pre-reap-history.md" ] && echo "lineage pre-reap-history.md: present" || echo "lineage pre-reap-history.md: absent"

# backlog — v0.17 keeps live items under life/backlog/ (not vision/)
echo "life/backlog items: $(count_top "$r/life/backlog")"

# milestones — only open ones are recreated (mapping #4)
open_ms=0
if [ -d "$r/vision/milestones" ]; then
  open_ms=$(grep -lE '^status: *(open|active|in[-_ ]progress)' "$r"/vision/milestones/*/milestone.md "$r"/vision/milestones/*.md 2>/dev/null | wc -l | tr -d ' ')
fi
echo "vision/milestones open: ${open_ms:-0}"

# design — files, not directories (mapping #6)
echo "vision/design files: $(count_files "$r/vision/design")"

# environment — files (mapping #10)
echo "environment files: $(count_files "$r/environment")"

# hooks — event hook files directly under hooks/ (mapping #9)
hook_files=$(find "$r/hooks" -maxdepth 1 -type f \( -name '*.sh' -o -name '*.md' \) 2>/dev/null | wc -l | tr -d ' ')
echo "hooks event files: ${hook_files:-0}"

# config — the two settings that carry over (5/8)
if [ -f "$r/config.yml" ]; then
  lang=$(grep -E '^language:' "$r/config.yml" | head -1 | sed 's/^language: *//')
  client=$(grep -E '^agentClient:' "$r/config.yml" | head -1 | sed 's/^agentClient: *//')
  echo "config language: ${lang:-unset}"
  echo "config agentClient: ${client:-unset}"
else
  echo "config language: unset (config.yml absent)"
  echo "config agentClient: unset (config.yml absent)"
fi

# open generation — 2/8 blocks on it
[ -f "$r/life/current.yml" ] && echo "life/current.yml: present" || echo "life/current.yml: absent"

# CLAUDE.md — mapping #12 acts only if the section exists
if [ -f "$root/CLAUDE.md" ] && grep -q '^## REAP' "$root/CLAUDE.md"; then
  echo "CLAUDE.md ## REAP section: present"
else
  echo "CLAUDE.md ## REAP section: absent"
fi
exit 0
