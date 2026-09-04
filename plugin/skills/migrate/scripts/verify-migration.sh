#!/usr/bin/env bash
# migrate 2차(작업 상태 복원) 검증 — SKILL.md 7/8이 부른다.
#
# Usage: verify-migration.sh <project-root>
# Each check prints "ok: <name>" or "FAIL: <name> — <reason>".
# Any FAIL makes the whole run exit 1; all-ok exits 0.
# REAP_BIN overrides the reap binary (default: reap). Reads project-root/.reap
# and project-root/.reap-v0_17 only — never writes.
set -u
root="${1:?usage: verify-migration.sh <project-root>}"
bin="${REAP_BIN:-reap}"
old="$root/.reap-v0_17"
new="$root/.reap"
fail=0

report() {
  local name="$1" status="$2" note="${3:-}"
  if [ "$status" = "ok" ]; then
    echo "ok: $name${note:+ — $note}"
  else
    echo "FAIL: $name — $note"
    fail=1
  fi
}

# 1) 원본에 진행 중 트랙이 있었으면 새 .reap에 focus milestone이 있다
had_track=0
if [ -f "$old/vision/memory/shortterm.md" ] && grep -qiE '^#+ *(다음|next)' "$old/vision/memory/shortterm.md"; then
  had_track=1
fi
if [ -f "$old/vision/goals.md" ] && grep -q '^- \[ \]' "$old/vision/goals.md"; then
  had_track=1
fi
if [ "$had_track" = "1" ]; then
  focus_count=$(grep -l '^focus: true' "$new"/vision/milestones/*/milestone.md 2>/dev/null | wc -l | tr -d ' ')
  if [ "${focus_count:-0}" -ge 1 ] 2>/dev/null; then
    report "진행 중 트랙 → focus milestone" ok
  else
    report "진행 중 트랙 → focus milestone" fail "원본 shortterm/goals에 다음 트랙이 있었지만 새 .reap에 focus milestone이 없다"
  fi
else
  report "진행 중 트랙 → focus milestone" ok "원본에 진행 중 트랙 없음"
fi

# 2) genome 3종에 v0.17 절차 어휘가 없다
v17_words='embryo|adapt phase|reflect phase|completion artifact|autoSubagent|cruise|lifecycle stage'
hits=0
for f in "$new"/genome/*.md; do
  [ -f "$f" ] || continue
  c=$(grep -ciE "$v17_words" "$f" 2>/dev/null)
  hits=$((hits + ${c:-0}))
done
if [ "$hits" = "0" ]; then
  report "genome에 v0.17 어휘 없음" ok
else
  report "genome에 v0.17 어휘 없음" fail "${hits}건 — grep -ciE '$v17_words' $new/genome/*.md"
fi

# 3) CLAUDE.md의 REAP 절이 v0.18 것이다 (파일 있으면)
claude_md="$root/CLAUDE.md"
if [ -f "$claude_md" ]; then
  c=$(grep -ciE 'reap-guide|reap-evolve|@\.reap/' "$claude_md" 2>/dev/null)
  if [ "${c:-0}" = "0" ]; then
    report "CLAUDE.md가 v0.18 어휘" ok
  else
    report "CLAUDE.md가 v0.18 어휘" fail "reap-guide/reap-evolve/@.reap import 잔존 ${c}건"
  fi
else
  report "CLAUDE.md가 v0.18 어휘" ok "CLAUDE.md 없음"
fi

# 4) 원본에 goals.md가 있었으면 plan source가 1개 이상 등록됐다
if [ -f "$old/vision/goals.md" ]; then
  sources_out=$(cd "$root" && "$bin" plan sources 2>&1)
  if printf '%s\n' "$sources_out" | grep -qE '^ps-'; then
    report "goals → plan source 등록" ok
  else
    report "goals → plan source 등록" fail "reap plan sources: $sources_out"
  fi
else
  report "goals → plan source 등록" ok "원본에 goals.md 없음"
fi

# 5) reap ctx 상태 줄에 milestone 줄이 있다
ctx_out=$(cd "$root" && "$bin" ctx 2>&1)
if printf '%s\n' "$ctx_out" | grep -qE '현재 milestone:|Milestone:'; then
  report "ctx 상태 줄에 milestone" ok
else
  report "ctx 상태 줄에 milestone" fail "reap ctx 출력에 '현재 milestone:'/'Milestone:' 줄이 없다"
fi

# 6) reap doctor 결함 0
doctor_out=$(cd "$root" && "$bin" doctor 2>&1)
if printf '%s\n' "$doctor_out" | grep -qE '결함 0|0 defects'; then
  report "doctor 결함 0" ok
else
  report "doctor 결함 0" fail "$doctor_out"
fi

exit $fail
