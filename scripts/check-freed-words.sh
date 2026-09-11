#!/usr/bin/env bash
# 비워둔 낱말이 되돌아오지 않았는지 본다.
#
# `loop`은 v0.18에서 plan 축 단위의 이름이었다가 `flux`에 자리를 내줬고, 그 낱말은
# 다른 개념(ralph)이 쓰도록 비워 뒀다. 되돌아오면 한 리포에서 두 뜻이 부딪힌다.
#
# 이 검사가 있는 이유는 실물이다 — 이름을 바꾼 커밋이 초록불을 냈는데 리포에는
# 79곳이 남아 있었고, 사람이 직접 grep해서 찾았다. 기존 검사 어느 것도 못 잡았다.
# check-docs-surface는 이름이 **언급되는지**만 보지, 낡은 낱말로 설명되는 것은 못 본다.
set -u
cd "$(dirname "$0")/.."
fail=0

# 남아 있어도 되는 곳. 각 줄에 왜 허용하는지 적는다 — 근거 없이 늘리지 않는다
allow_path() {
  case "$1" in
    .claude/skills/loop-to-flux/*) return 0 ;;   # 옛 이름을 부르는 것이 그 스킬의 일이다
    *loop-to-flux*)                return 0 ;;   # 개명 자체를 기록한 backlog·세대 기록
    *preflux-layout*)              return 0 ;;   # 내린 항목. 사람의 판정을 그대로 인용한다
    *ralph*)                       return 0 ;;   # 외부 기법 ralph loop과 harness의 /loop — 그 낱말의 임자는 저쪽이다
    scripts/check-freed-words.sh)  return 0 ;;   # 이 파일
    *) return 1 ;;
  esac
}

# 문장 단위 예외. 개명 이유를 설명하는 자리와 진짜 프로그래밍 루프
allow_line() {
  printf '%s' "$1" | grep -qiE \
    'loop-to-flux|개명|loop을 flux로|life/loops|archive/loops|sequence/loop\.md|옛 이름|이주 전|A loop means|named .flux., not .loop.|word .loop. is left|loop에서 flux로|loop.{0,4}이었다가|ralph loop|무한 루프|개발 루프|확인 루프|both loops are empty|this loop still examine|for \(|while \('
}

while IFS= read -r -d '' f; do
  allow_path "$f" && continue
  grep -Iq . "$f" 2>/dev/null || continue
  while IFS= read -r hit; do
    n="${hit%%:*}"; line="${hit#*:}"
    allow_line "$line" && continue
    printf '  FAIL %s:%s  %s\n' "$f" "$n" "$(printf '%s' "$line" | cut -c1-90)"
    fail=1
  done < <(grep -in "loop" "$f" 2>/dev/null)
done < <(git ls-files -z --cached --others --exclude-standard)

if [ $fail -eq 0 ]; then
  echo "ok: the freed word 'loop' appears only where it is allowed"
else
  echo "위는 전부 flux여야 하거나, 정말 예외라면 이 스크립트의 허용 목록에 근거와 함께 넣는다"
fi
exit $fail
