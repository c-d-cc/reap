---
type: task
status: pending
priority: low
createdAt: 2026-08-20T05:07:27.064Z
---

# `list-carriers.sh` 가 산문 속 `reap:carrier(id)` 언급을 orphan 으로 보고한다

## Problem

`bash scripts/list-carriers.sh --orphans` 가 항상 다음을 출력한다:

```
id  (1 file — orphan)
    RELEASE_NOTES.md
```

실제 carrier 가 아니다. `RELEASE_NOTES.md:47` 의 v0.17.3 항목이 carrier 제도를 **설명하면서**
`` `reap:carrier(id)` `` 라고 쓴 것이다 — `id` 는 자리표시자이지 ID 가 아니다.

gen-090 에서 확인 (`git diff` 로 본 세대가 만든 것이 아님을 검증). 언제부터 있었는지는 v0.17.3
릴리즈 노트 작성 시점부터다.

**왜 사소하지 않은가**: `--orphans` 의 출력은 "표식이 불필요하거나, 다른 carrier 를 빠뜨렸거나"
둘 중 하나라는 신호로 읽으라고 genome 이 지시한다. 항상 뜨는 가짜 항목이 하나 있으면 그 출력
전체가 "훑고 넘기는 것"이 된다 — #22 가 19개 경고 속에서 6세대를 살아남은 것과 같은 기전이다.

## Solution

셋 중 하나. 판단 필요.

**A. 자리표시자 ID 를 무시 목록에 넣는다** — `id`, `<id>`, `사실-id` 같은 것. 목록이 자란다.

**B. 문서 파일에서는 인라인 코드(`` ` `` 로 감싼 것) 안의 표식을 세지 않는다.**
실제 표식은 `<!-- -->` 주석이나 코드 주석 안에 있으므로 구분 가능하다. 가장 정확하지만
grep 한 줄이 아니게 된다.

**C. `RELEASE_NOTES.md:47` 의 문장을 고친다** — 예: `reap:carrier(<사실-id>)` 로.
**하지만 그것도 `<사실-id>` 라는 ID 로 잡힌다.** 백틱을 떼고 "carrier 표식"으로만 서술하면 해결된다.
비용 0 이지만 **발행된 릴리즈 노트의 과거 항목을 수정하는 것**이라 별도 판단이 필요하다.

먼저 확인할 것: 같은 오탐이 `docs/` 5개 로케일이나 `reap-guide.md` 에도 있는가.
있다면 C 는 확장되지 않으므로 B 가 답이다.

## Files to Change

- `scripts/list-carriers.sh` — A 또는 B
- `RELEASE_NOTES.md` — C
- (조사) `grep -rn "reap:carrier" docs/ src/templates/reap-guide.md` 로 오탐 범위 확인
