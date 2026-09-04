#!/usr/bin/env bash
# reap store version verdict — run by migrate skill's 1/8. This script owns the verdict.
#
# Usage: detect-version.sh [<project-root>]   (default: .)
# The first stdout line is the verdict: v018 | v017 | none | mixed | unknown
# Lines after that are the grounds for which markers hit. Always exit 0 (an
# indeterminate verdict is still a verdict).
#
# Sharing a name doesn't make it a marker: sequence/ and vision/milestones/
# exist on both sides (v0.17 has sequence/goal.md·milestone.md, v0.18 has
# sequence/generation.md). config.yml's agentClient·language exist on both
# too. hooks/conditions/ exists on both too — v0.18 init also places
# hooks/conditions/always.sh (human, 2026-09-01). The only marker is an event
# hook file directly under hooks/ (excluding conditions/) whose filename
# starts with the v0.17 event convention (onXxx — onLifeStarted, onCompleted,
# onMerge*, etc.; all 14 events take this shape). A hook file starting with a
# v0.18 event (gen.*, milestone.*, orch.*) is not a marker.
# Only the list below is unambiguous.
set -u
root="${1:-.}"
r="$root/.reap"
if [ ! -d "$r" ]; then echo "none"; echo "evidence: $r missing"; exit 0; fi

v18=(); v17=()
# ── files new to 0.18 ──
[ -f "$r/map.md" ]                  && v18+=("map.md")
[ -f "$r/sequence/generation.md" ]  && v18+=("sequence/generation.md")
# ── files present only in 0.17 ──
[ -d "$r/lineage" ]                     && v17+=("lineage/")
[ -f "$r/vision/memory/shortterm.md" ]  && v17+=("vision/memory/shortterm.md")
[ -f "$r/life/current.yml" ]            && v17+=("life/current.yml")
# The hooks/ directory itself and conditions/ are not markers. Only an event hook
# file (*.sh·*.md) directly under hooks/ whose filename starts with the v0.17
# convention (onXxx) is a 0.17 marker.
v17_hooks=$(find "$r/hooks" -maxdepth 1 -type f \( -name '*.sh' -o -name '*.md' \) -print 2>/dev/null \
  | xargs -I{} basename {} 2>/dev/null | grep -E '^on[A-Z]')
[ -n "$v17_hooks" ] && v17+=("v0.17 hook files inside hooks/")
[ -f "$r/sequence/goal.md" ]            && v17+=("sequence/goal.md")

if [ ${#v18[@]} -gt 0 ] && [ ${#v17[@]} -gt 0 ]; then verdict="mixed"
elif [ ${#v18[@]} -gt 0 ]; then verdict="v018"
elif [ ${#v17[@]} -gt 0 ]; then verdict="v017"
else verdict="unknown"; fi

echo "$verdict"
[ ${#v18[@]} -gt 0 ] && echo "0.18 markers: ${v18[*]}"
[ ${#v17[@]} -gt 0 ] && echo "0.17 markers: ${v17[*]}"
[ "$verdict" = "unknown" ] && echo "evidence: .reap/ exists but neither side's markers are present — v0.15/0.16, or corrupted"
exit 0
