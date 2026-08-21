---
type: task
status: pending
priority: low
createdAt: 2026-08-20T00:20:32.063Z
---

# process tracing 재설계 — 진입점 휴리스틱이 call resolution 품질에 종속

> gen-089 이 daemon 을 폐기하고 indexer 를 내장하면서 **의도적으로 이식하지 않은** 분석 둘 중 하나.
> 나머지 하나는 `community-detection-재설계-...`.

## Problem

`daemon/src/indexer/process-tracer.ts` (46줄, gen-089 에서 삭제됨. 복원은 git history 에서)는
"진입점 = 아무도 호출하지 않는 함수" 라는 휴리스틱으로 실행 흐름을 추적했다. 실측 결과:

```
MAX_PROCESSES=75 상한에 도달
라벨 예: "gitCommit → gitInit → IndexManager"
```

두 가지가 어긋나 있다:

**1. 진입점 판정이 call resolution 품질에 종속된다.** call resolver 가 **이름 기반**이라
해석에 실패한 함수는 caller 가 0개로 보이고, 따라서 **전부 진입점이 된다**. 상한 75 에 도달한 것이
그 증거다. gen-089 가 import 해석률을 100% 로 올렸지만 **call resolution 은 여전히 이름 기반**이다 —
같은 이름의 심볼이 여러 파일에 있으면 `pickBestTarget` 이 추측한다.

**2. 라벨이 흐름을 오독하게 만든다.** `gitCommit → gitInit → IndexManager` 는 실행 순서가 아니라
**DFS 방문 순서의 앞 3개 이름**이다. 화살표로 이어 놓으면 사람은 그것을 실행 흐름으로 읽는다.
**틀린 것보다 나쁘다 — 맞는 것처럼 보이는 틀린 것이다.**

## Solution

**선결 조건: call resolution 을 이름 기반에서 벗어나게 하는 것.**
그것 없이 진입점 휴리스틱만 손보면 같은 결함이 다른 형태로 남는다.
관련 조사는 SCIP 채택 검토다 — SCIP 은 이 문제(4가지 한계 중 1번)를 풀지만 사용자 저장소에
빌드 가능한 툴체인을 요구하고, 보류 결정이 유지되고 있다.

> **조사 문서 위치 (gen-095 에 이동).** `.reap/vision/design/code-index-scip.md`.
> 이 backlog 를 소비하는 세대는 **먼저 그것을 읽을 것.**
>
> 그 문서가 지목한 4가지 한계 중 **1번(이름 기반 call resolution)이 이 backlog 의 선결 조건이며,
> 지금 배포되는 `src/indexer/call-resolver.ts` 를 그대로 서술한다** (`nameIndex` 기반 매칭).
> **4번은 gen-089 가 해소했다** — 문서에 취소선과 근거를 함께 달아 두었다.

값싼 중간 단계 후보:

| 안 | 내용 |
|---|---|
| **import 로 call 을 제한** | `a.ts::f → b.ts::g` edge 를 `a.ts` 가 `b.ts` 를 import 할 때만 인정. gen-089 가 IMPORTS 를 실제로 동작하게 만들었으므로 **지금은 가능하다** |
| **미해석을 미해석으로 표시** | 해석 실패를 "caller 없음"과 구분해 기록. 진입점 판정에서 제외 |
| **라벨을 흐름처럼 쓰지 않기** | 화살표 대신 "진입점 X 에서 도달 가능한 N개 심볼" 처럼 실제로 계산한 것만 말한다 |

두 번째와 세 번째는 **알고리즘 교체 없이** 지금 할 수 있고, 오독을 없애는 효과가 가장 크다.

## Files to Change

- `src/indexer/call-resolver.ts` — import 제약 + 미해석 표시
- `src/indexer/process-tracer.ts` — 신설
- `src/cli/commands/index-cmd.ts` — `reap index processes` verb
- `tests/unit/indexer-call-resolver.test.ts` — 신설
- 문서 일습 (guide ×2, README ×5, docs 5 로케일)

## Verification

- [ ] 알려진 fixture 에서 **진입점이 실제 진입점만** — 해석 실패 함수가 섞이지 않는다
- [ ] 이 저장소에서 진입점 수가 상한에 도달하지 않는다
- [ ] 라벨이 실행 흐름으로 오독될 수 없는 형태다 — 근거를 artifact 에 적을 것
- [ ] call resolution 정확도를 **수치로** 측정했다 (해석률처럼 화면에 보이는 지표가 있는가)
