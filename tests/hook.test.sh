#!/usr/bin/env bash
# 훅 스크립트는 단위 테스트가 아니라 셸에서 직접 돌려 검사한다.
# 검사하는 것은 하나다: **어떤 경우에도 종료 코드 0.**

HOOK="$(cd "$(dirname "$0")/.." && pwd)/plugin/hooks/session-start.sh"
BIN="$(cd "$(dirname "$0")/.." && pwd)/dist/reap"
fail=0

check() { # 이름 기대코드 기대출력(빈문자열이면 없어야 함) 실제코드 실제출력
  local name=$1 want=$2 want_out=$3 got=$4 got_out=$5
  if [ "$got" != "$want" ]; then
    printf '  실패 %s — 종료 코드 %s (기대 %s)\n' "$name" "$got" "$want"; fail=1; return
  fi
  if [ "$want_out" = "none" ] && [ -n "$got_out" ]; then
    printf '  실패 %s — 출력이 있으면 안 된다: %s\n' "$name" "$got_out"; fail=1; return
  fi
  if [ "$want_out" = "json" ] && ! printf '%s' "$got_out" | python3 -c 'import json,sys; json.load(sys.stdin)' 2>/dev/null; then
    printf '  실패 %s — 유효한 JSON이 아니다\n' "$name"; fail=1; return
  fi
  printf '  통과 %s\n' "$name"
}

work=$(mktemp -d); trap 'rm -rf "$work"' EXIT
mkdir -p "$work/bin" "$work/plain" "$work/proj" "$work/broken"
cp "$BIN" "$work/bin/reap"
(cd "$work/proj" && git init -q -b main && "$work/bin/reap" init >/dev/null)
printf '#!/bin/sh\nexit 3\n' > "$work/broken/reap"; chmod +x "$work/broken/reap"

echo "훅 스크립트 검사"

out=$(cd "$work/proj" && PATH=/usr/bin:/bin "$HOOK" 2>&1); code=$?
check "reap가 PATH에 없다" 0 none "$code" "$out"

out=$(cd "$work/plain" && PATH="$work/bin:$PATH" "$HOOK" 2>&1); code=$?
check "REAP 프로젝트가 아니다" 0 none "$code" "$out"

out=$(cd "$work/proj" && PATH="$work/broken:$PATH" "$HOOK" 2>&1); code=$?
check "reap가 실패한다" 0 none "$code" "$out"

out=$(cd "$work/proj" && PATH="$work/bin:$PATH" "$HOOK" 2>/dev/null); code=$?
check "정상 프로젝트" 0 json "$code" "$out"

# 훅이 매달리는 경우는 스크립트가 막을 수 없다 — 실행을 소유하는 것은 Claude Code다.
# 그래서 검사하는 것은 **선언**이다: hooks.json이 타임아웃을 명시하는가.
# 명시하지 않으면 기본 60초까지 세션 시작이 지연된다.
HOOKS_JSON="$(cd "$(dirname "$0")/.." && pwd)/plugin/hooks/hooks.json"
t=$(python3 -c 'import json,sys; h=json.load(open(sys.argv[1]))["hooks"]["SessionStart"][0]["hooks"][0]; print(h.get("timeout","none"))' "$HOOKS_JSON" 2>/dev/null)
if [ "$t" = "none" ] || [ -z "$t" ]; then
  printf '  실패 %s — hooks.json에 timeout이 없다 (기본 60초까지 세션이 지연된다)\n' "훅 타임아웃 선언"; fail=1
elif [ "$t" -gt 10 ] 2>/dev/null; then
  printf '  실패 %s — timeout %ss 는 너무 길다\n' "훅 타임아웃 선언" "$t"; fail=1
else
  printf '  통과 %s (%ss)\n' "훅 타임아웃 선언" "$t"
fi

[ $fail -eq 0 ] && echo "전부 통과" || echo "실패 있음"
exit $fail
