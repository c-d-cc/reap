# Learning

## Project Overview

REAP v0.17.2 (미릴리즈), embryo generation 74. 유저 지시로 0.17.2 에 본 세대 + 다음 세대(genome threshold)를 포함한 뒤 함께 릴리즈한다.

작은 범위의 테스트 인프라 복구 세대다.

## Source Backlog

`scenario-multi-generation-5건-실패-gen-065-backlog-gate-도입-후-테스트-미갱신.md` (consumed by gen-074-72bf54)

gen-072 validation 중 발견, gen-073 에서도 동일 상태 확인.

## Key Findings

### 1. 루트 코즈 확정 — gen1 이 만든 backlog 가 gen2 start 를 막는다

`tests/scenario/multi-generation.test.ts` 흐름:

```
L54-57  gen1: create carry-over backlog
        → .reap/life/backlog/carry-over-test.md (status: pending) 직접 생성
L60-73  gen1: commit + verify archive
L77-80  gen2: start
        → cli(dir, "run", "start", "--goal", ..., "--type", "embryo")
        → expect(result.status).toBe("ok")   ← 실제로는 "prompt"
```

gen-065 가 도입한 backlog gate: `--backlog` / `--no-backlog` 없이 pending 이 존재하면 `run start` 가 `status: "prompt"` + `phase: "select-backlog"` 를 emit 하고 generation 을 만들지 않는다. **설계된 동작이며 실사용 경로다.**

나머지 4건(`gen2: learning → validation`, `gen2: completion`, `lineage has >= 2 entries`, `git log has feat(gen-*) commits`)은 gen2 가 생성되지 않은 결과의 **연쇄 실패**다. 독립 결함이 아니다.

### 2. 다른 scenario 파일은 안전 (S3 점검 완료)

| 파일 | `run start` 호출 | backlog 파일 생성 | 판정 |
|---|---|---|---|
| `multi-generation.test.ts` | O | **O (L54-57)** | **취약 — 수정 대상** |
| `merge.test.ts` | O | 디렉토리만(L23), 파일 없음 | 안전 |
| `lifecycle.test.ts` | O | X | 안전 |
| `init-start-status.test.ts` | O | X | 안전 |

`merge.test.ts` 는 `mkdir` 로 backlog 디렉토리만 만들고 파일을 넣지 않아 pending 0 → gate 통과.

### 3. 수정 방향 — backlog 의 A/B 중 B (+ A 도 별도 case)

backlog S1 이 제시한 두 안:
- **A**: `--no-backlog` 명시 — 최소 변경이나 gate 자체를 검증하지 않음
- **B**: gate 를 시나리오에 편입 — prompt 수신 → `--backlog` 재호출 → 소비 확인

**B 채택.** scenario test 의 목적은 "실제 사용 흐름 재현"이고, gen-065 gate 는 실사용 경로다. 이걸 우회하면 테스트가 실제와 달라진다.

추가로 **A 경로도 별도 case 로 검증**한다 — backlog Verification 3("pending backlog 가 없는 상태에서도 통과하는지, 양쪽 경로 모두 안정")을 충족하려면 `--no-backlog` 분기도 커버해야 한다. gate 는 두 출구를 가지므로 둘 다 확인하는 것이 맞다.

### 4. `carry-over-test.md` 는 Write 로 직접 생성됨

`reap make backlog` 가 아닌 직접 파일 생성이지만 `status: pending` frontmatter 가 있어 gen-065 의 `consumeBacklog` 4-케이스 graceful 처리 범위에 든다. 소비 시 `status: consumed` + `consumedBy` 가 붙는지 검증 가치가 있다.

### 5. scenario baseline 은 gen-072 에서 이미 기록됨 (S2 부분 완료)

`.reap/environment/summary.md` § Tests 에 세 스위트의 baseline 표가 있고 scenario 도 `35 pass / 5 fail (pre-existing, backlog 등록됨)` 로 명시돼 있다. 본 세대가 green 으로 만들면 **수치와 설명을 함께 갱신**해야 한다.

## Previous Generation Reference

gen-072 가 이 문제를 발견하고 `git stash` 로 pre-existing 확증 후 backlog 등록. gen-073 은 baseline 기록 덕분에 즉시 판단할 수 있었다 — 그 조치의 효과가 확인된 상태에서, 이제 근본 수정을 한다.

## Backlog Review

pending 4건. 유저 지시 순서: 본 세대(scenario) → genome threshold → 0.17.2 릴리즈 → interview(0.18.0). daemon 2건 보류.

## Context for This Generation

### Clarity Level: **High**

루트 코즈가 라인 단위로 특정됐고, 수정 방향도 backlog 에 A/B 로 제시돼 있으며 판단 근거가 명확하다.

### 특수 제약

- **소스 코드를 바꾸지 않는다.** gen-065 gate 는 올바른 동작이므로 테스트를 현재 동작에 맞춘다. CLI 를 고치는 것이 아니다
- **0.17.2 에 포함된다** — 릴리즈 노트에 본 세대 내용을 추가해야 하나, 마지막 세대(genome threshold) completion 에서 일괄 처리한다. 여기서 노트를 건드리면 다음 세대와 충돌
