#!/usr/bin/env bash
# REAP SessionStart 훅.
#
# **이 스크립트는 어떤 이유로도 세션 시작을 막지 않는다** (.reap/genome/invariants.md).
# 그러므로 set -e 를 켜지 않는다 — reap 호출이 실패하면 훅이 통째로 죽고,
# 사용자는 그 순간 REAP가 원인인 줄도 모른다.
#
# 아무것도 내지 않으면 아무것도 주입되지 않는다. 그것이 모든 실패의 처리다.
#
# 매달리는 경우는 여기서 막지 않는다 — 실행을 소유하는 것은 Claude Code이고,
# hooks.json 이 timeout 을 선언한다. 스크립트가 스스로 시간을 재려면 백그라운드
# 잡과 kill 이 필요하고, 그 복잡도가 이 스크립트의 유일한 미덕(아무것도 안 함)을 깬다.

command -v reap >/dev/null 2>&1 || exit 0

output=$(reap ctx --hook 2>/dev/null) || exit 0
[ -n "$output" ] || exit 0

printf '%s\n' "$output"
exit 0
