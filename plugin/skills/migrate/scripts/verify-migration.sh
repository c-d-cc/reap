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

# 2) genome에 v0.17 절차 어휘가 없다 — invariants.md는 사람만 고치므로 FAIL이 아니라 참고로 센다
v17_words='embryo|adapt phase|reflect phase|completion artifact|autoSubagent|cruise|lifecycle stage|shortterm|midterm|longterm'
hits=0; inv_hits=0
for f in "$new"/genome/*.md; do
  [ -f "$f" ] || continue
  c=$(grep -ciE "$v17_words" "$f" 2>/dev/null)
  if [ "$(basename "$f")" = "invariants.md" ]; then
    inv_hits=$((inv_hits + ${c:-0}))
  else
    hits=$((hits + ${c:-0}))
  fi
done
inv_note=""
[ "$inv_hits" != "0" ] && inv_note="invariants.md에 ${inv_hits}건 — 사람이 지울 것(기록 파일 Needs updating)"
if [ "$hits" = "0" ]; then
  report "genome에 v0.17 어휘 없음" ok "$inv_note"
else
  report "genome에 v0.17 어휘 없음" fail "${hits}건 — grep -ciE '$v17_words' $new/genome/*.md${inv_note:+; $inv_note}"
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

# 6) 옮긴 문서를 가리키는 옛 경로가 새 .reap·CLAUDE.md에 없다
stale=$(cd "$root" && grep -rnE '\.reap/vision/(design|goals\.md)|vision/memory/(longterm|midterm|shortterm)|\.reap/lineage/' .reap CLAUDE.md --include='*.md' --include='CLAUDE.md' 2>/dev/null | grep -v '^\.reap/archive/migration-v0_17\.md' | grep -v '^\.reap/archive/generations/' || true)
if [ -z "$stale" ]; then
  report "옛 경로 참조 없음" ok
else
  report "옛 경로 참조 없음" fail "$(printf '%s\n' "$stale" | grep -c '')건: $(printf '%s' "$stale" | head -3 | tr '\n' ' ')"
fi

# 7) reap doctor 결함 0
doctor_out=$(cd "$root" && "$bin" doctor 2>&1)
if printf '%s\n' "$doctor_out" | grep -qE '결함 0|0 defects'; then
  report "doctor 결함 0" ok
else
  report "doctor 결함 0" fail "$doctor_out"
fi

# 8) 원본 lineage 세대 수 = archive/generations의 migratedFrom 파일 수 (gen-0101, mapping #8)
if [ -d "$old/lineage" ]; then
  orig_count=$(find "$old/lineage" -mindepth 1 -maxdepth 1 \( -type d -o -type f \) -name 'gen-[0-9][0-9][0-9]-*' 2>/dev/null | wc -l | tr -d ' ')
  [ -f "$old/lineage/pre-reap-history.md" ] && orig_count=$((orig_count + 1))
  migrated_count=$(grep -l '^migratedFrom: \.reap-v0_17/lineage/' "$new"/archive/generations/*.md 2>/dev/null | wc -l | tr -d ' ')
  if [ "${migrated_count:-0}" = "$orig_count" ]; then
    report "lineage 세대 수 = archive/generations migratedFrom 수" ok "${orig_count}건"
  else
    report "lineage 세대 수 = archive/generations migratedFrom 수" fail "원본 ${orig_count}건, archive에서 migratedFrom 있는 파일 ${migrated_count:-0}건"
  fi
else
  report "lineage 세대 수 = archive/generations migratedFrom 수" ok "원본에 lineage 없음"
fi

# 9) sequence/generation.md의 마지막 번호가 원본 lineage 마지막 번호 이상이다 (gen-0101, mapping #8)
if [ -d "$old/lineage" ]; then
  orig_last_raw=$(find "$old/lineage" -mindepth 1 -maxdepth 1 \( -type d -o -type f \) -name 'gen-[0-9][0-9][0-9]-*' 2>/dev/null \
    | sed -E 's#.*/gen-([0-9]{3})-.*#\1#' | sort -n | tail -1)
  orig_last=$((10#${orig_last_raw:-0}))
  new_last_raw=$(grep -oE '^\| gen-[0-9]{4}-(plan|exec|fix) ' "$new/sequence/generation.md" 2>/dev/null | grep -oE '[0-9]{4}' | sort -n | tail -1)
  new_last=$((10#${new_last_raw:-0}))
  if [ "$new_last" -ge "$orig_last" ]; then
    report "sequence/generation.md 마지막 번호 ≥ 원본" ok "원본 ${orig_last} ≤ 새 ${new_last}"
  else
    report "sequence/generation.md 마지막 번호 ≥ 원본" fail "원본 lineage 마지막 gen-${orig_last}, 새 레지스트리 마지막 ${new_last}"
  fi
else
  report "sequence/generation.md 마지막 번호 ≥ 원본" ok "원본에 lineage 없음"
fi

exit $fail
