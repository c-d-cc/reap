#!/usr/bin/env bash
# reap 저장소 버전 판정 — migrate skill 1/8이 실행한다. 판정은 이 스크립트가 소유한다.
#
# 사용법: detect-version.sh [<project-root>]   (기본: .)
# stdout 첫 줄이 판정이다: v018 | v017 | none | mixed | unknown
# 둘째 줄부터는 어떤 표지가 걸렸는지의 근거. 항상 exit 0 (판정 불능도 판정이다).
#
# 이름이 같아도 표지가 못 되는 것들: sequence/ 와 vision/milestones/ 는 양쪽에 다 있다
# (v0.17은 sequence/goal.md·milestone.md, v0.18은 sequence/generation.md).
# config.yml 의 agentClient·language 도 양쪽에 있다. hooks/conditions/ 도 양쪽에 있다 —
# v0.18 init도 hooks/conditions/always.sh를 놓는다(사람, 2026-09-01). 표지는 hooks/
# 바로 아래(conditions/ 제외)의 이벤트 훅 파일 중, 파일명이 v0.17 이벤트 관례(onXxx —
# onLifeStarted·onCompleted·onMerge* 등 14종 전부 이 꼴이다)로 시작하는 것뿐이다.
# v0.18 이벤트(gen.*·milestone.*·orch.*)로 시작하는 훅 파일은 표지가 아니다.
# 아래 목록만이 명백하다.
set -u
root="${1:-.}"
r="$root/.reap"
if [ ! -d "$r" ]; then echo "none"; echo "evidence: $r missing"; exit 0; fi

v18=(); v17=()
# ── 0.18에서 새로 생긴 파일 ──
[ -f "$r/map.md" ]                  && v18+=("map.md")
[ -f "$r/sequence/generation.md" ]  && v18+=("sequence/generation.md")
# ── 0.17에만 있는 파일 ──
[ -d "$r/lineage" ]                     && v17+=("lineage/")
[ -f "$r/vision/memory/shortterm.md" ]  && v17+=("vision/memory/shortterm.md")
[ -f "$r/life/current.yml" ]            && v17+=("life/current.yml")
# hooks/ 디렉토리 자체와 conditions/ 는 표지가 아니다. hooks/ 바로 아래의 이벤트 훅
# 파일(*.sh·*.md) 중 v0.17 관례(onXxx)로 시작하는 파일명만 0.17 표지다.
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
