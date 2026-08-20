---
type: task
status: pending
priority: low
createdAt: 2026-08-20T05:07:27.016Z
---

# source-map 부재를 `fix --check` 가 보고할 것인가 — 규칙을 무조건형으로 굳힐 때 함께 판단

## Problem

gen-090 이 배포 genome 에 넣은 규칙은 **조건부**다: source-map 을 읽되, 없으면 `summary.md` 가
구조를 갖고 있고 그것이 커지면 그때 만들라고 말한다.

그래서 `reap fix --check` 에 "source-map.md 없음" 경고를 **넣지 않았다**. 넣으면 REAP 이 두 가지를
동시에 말하게 된다 — genome 은 "없어도 진행할 수 있다", checker 는 "없으면 문제다". issue #22 가
정확히 그 형태였다(installer 와 checker 가 서로를 부정).

부수 이유: 0.17.6 이전에 greenfield 로 init 한 **모든** 프로젝트가 즉시 경고를 받는다.
genome 의 "항상 무언가를 보고하는 검사는 필터링된다" 판단에 걸린다.

## Solution

**지금 하지 말 것.** 다음 두 조건 중 하나가 성립할 때 다시 꺼낸다:

1. 규칙을 **무조건형**으로 바꾸기로 결정할 때 (즉 "source-map 은 항상 존재한다"를 REAP 이 보장하기로
   할 때). 그러면 checker 경고는 모순이 아니라 그 보장의 집행 수단이 된다.
2. 실사용자가 "source-map 이 없는데 agent 가 계속 찾는다"를 보고할 때 — 조건부 문구가 실제로는
   작동하지 않는다는 증거다.

둘 중 하나가 성립하면 함께 결정할 것:
- 경고인가 에러인가 (환경 파일이므로 경고가 맞을 가능성이 높다)
- `fixProject` 에 대응 생성 코드를 둘 것인가 — **기존 프로젝트에는 코드가 있으므로 빈 스텁은 틀린
  내용을 쓰는 것**이다. greenfield 스텁과 같은 판단을 적용할 수 없다
- `reap init --repair` / `reap update` 가 보충할 것인가 (gen-090 은 셋 다 제외했다. 근거는
  lineage 의 gen-090 02-planning.md § 의도적 제외)

**추측으로 재개하지 말 것.** 위 두 조건 없이 넣으면 gen-090 이 피한 모순을 그대로 만든다.

## Files to Change

- `src/core/integrity.ts` — `checkMemorySize` 인근에 검사 추가 (경고 전용)
- `src/templates/evolution.md` — 규칙 문구를 무조건형으로 (조건 1을 택한 경우)
- `src/templates/migration/vX.Y.Z.md` — 문구 변경을 기존 프로젝트에 전달
- `tests/unit/integrity-*.test.ts` — 신규 경고의 positive/negative
- `scripts/check-self-diagnosis.sh` — §4 의 findings 0 요구와 충돌하지 않는지 확인
