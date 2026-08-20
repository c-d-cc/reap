---
type: task
status: consumed
priority: low
createdAt: 2026-08-20T15:51:44.743Z
consumedBy: gen-094-61a545
consumedAt: 2026-08-20T16:26:16.992Z
---

# vision/design/reap-tree.md 가 daemon 을 현존 컴포넌트로 서술한다

## Problem

`.reap/vision/design/reap-tree.md` 4곳이 daemon 을 **지금 존재하는 것으로** 서술한다. 회고가 아니라 **틀린 현재 서술**이라 성격이 다르다 — gen-094 가 지운 "있다가 지웠음" 문장들과 달리, 이것들은 읽는 사람에게 daemon 이 살아 있다고 알린다.

| 줄 | 내용 |
|---|---|
| `:17` | `daemon/ 은 별도 앱이고` — 그 디렉토리는 존재하지 않는다 |
| `:185` | `daemon/evaluator 와 같은 패턴: config flag → caller 게이트 → 내부 silent-fail` |
| `:253` | `현재 daemon 은 project 별 등록이므로 노드 내부만 본다` — Open Decision 항목 하나가 통째로 daemon 전제 위에 서 있다 |
| `:274` | `daemon opt-in 검증 패턴 재사용` |

gen-094 의 goal 은 **사용자 대면** 문서였고 이것은 내부 설계 문서다. 다만 방치할 수 없는 이유가 있다: `:253` 은 tree 설계의 **미결 결정 5번**이며, 그 결정을 내리려는 다음 세대가 존재하지 않는 컴포넌트를 놓고 판단하게 된다.

## Solution

**tree 트랙을 착수할 때 함께 처리한다.** 지금 단독으로 고치지 않는 이유는 `:253` 이 단순 치환이 아니기 때문이다 — "daemon 이 project 별 등록이라 노드 내부만 본다"는 미결 결정을 `reap index` 기준으로 다시 물어야 하고("내장 인덱스가 tree 축을 인지해야 하는가"), 그것은 문구 교체가 아니라 설계 판단이다.

건별 처리 방향:

- `:17` — daemon 자리에 현재 성립하는 예를 넣거나 그 예 자체를 뺀다 (`tests/` submodule 과 `docs/` 자체 빌드만으로도 논지가 선다)
- `:185`, `:274` — opt-in 패턴의 예시. `evaluator` 하나로 충분하므로 daemon 언급만 제거
- `:253` — **다시 물어야 하는 결정.** `reap index` 는 프로젝트별 `.reap/.index/` 를 쓰므로 전제가 바뀌었다. 문장 교체가 아니라 미결 항목 재작성

## Files to Change

- `.reap/vision/design/reap-tree.md` — 4곳 (`:17`, `:185`, `:253`, `:274`)
