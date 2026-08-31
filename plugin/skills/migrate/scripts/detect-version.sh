#!/usr/bin/env bash
# reap 저장소 버전 판정 — migrate skill 1/8이 실행한다. 판정은 이 스크립트가 소유한다.
#
# 사용법: detect-version.sh [<project-root>]   (기본: .)
# stdout 첫 줄이 판정이다: v018 | v017 | none | mixed | unknown
# 둘째 줄부터는 어떤 표지가 걸렸는지의 근거. 항상 exit 0 (판정 불능도 판정이다).
#
# 이름이 같아도 표지가 못 되는 것들: sequence/ 와 vision/milestones/ 는 양쪽에 다 있다
# (v0.17은 sequence/goal.md·milestone.md, v0.18은 sequence/generation.md).
# config.yml 의 agentClient·language 도 양쪽에 있다. 아래 목록만이 명백하다.
set -u
root="${1:-.}"
r="$root/.reap"
if [ ! -d "$r" ]; then echo "none"; echo "근거: $r 없음"; exit 0; fi

v18=(); v17=()
# ── 0.18에서 새로 생긴 파일 ──
[ -f "$r/map.md" ]                  && v18+=("map.md")
[ -f "$r/sequence/generation.md" ]  && v18+=("sequence/generation.md")
# ── 0.17에만 있는 파일 ──
[ -d "$r/lineage" ]                     && v17+=("lineage/")
[ -f "$r/vision/memory/shortterm.md" ]  && v17+=("vision/memory/shortterm.md")
[ -f "$r/life/current.yml" ]            && v17+=("life/current.yml")
[ -d "$r/hooks" ]                       && v17+=("hooks/")
[ -f "$r/sequence/goal.md" ]            && v17+=("sequence/goal.md")

if [ ${#v18[@]} -gt 0 ] && [ ${#v17[@]} -gt 0 ]; then verdict="mixed"
elif [ ${#v18[@]} -gt 0 ]; then verdict="v018"
elif [ ${#v17[@]} -gt 0 ]; then verdict="v017"
else verdict="unknown"; fi

echo "$verdict"
[ ${#v18[@]} -gt 0 ] && echo "0.18 표지: ${v18[*]}"
[ ${#v17[@]} -gt 0 ] && echo "0.17 표지: ${v17[*]}"
[ "$verdict" = "unknown" ] && echo "근거: .reap/ 은 있으나 양쪽 표지가 전부 없음 — v0.15/0.16이거나 손상"
exit 0
