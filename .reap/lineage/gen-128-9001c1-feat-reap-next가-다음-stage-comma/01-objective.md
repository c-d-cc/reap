# Objective

## Goal
feat: `reap run next`가 stage 전환 후 다음 stage command를 자동 실행하여 output을 반환하도록 수정.

## Completion Criteria
1. `reap run next`가 stage 전환 완료 후, 다음 stage가 `completion`이 아니면 해당 stage의 execute 함수를 자동 호출한다.
2. 다음 stage가 `completion`인 경우 자동 실행하지 않고 기존 동작을 유지한다.
3. next의 기존 output(stage 전환 성공 메시지)은 그대로 출력되고, 이어서 다음 stage의 output이 추가 출력된다.
4. merge lifecycle의 stage 전환에서도 동일하게 동작한다 (merge-completion 제외).
5. 기존 테스트가 모두 통과한다.

## Requirements

### Functional Requirements
1. FR-01: `next.ts`에서 stage 전환 후, `nextStage`가 `completion`이 아닌 경우 해당 stage의 execute 함수를 dynamic import하여 호출한다.
2. FR-02: normal lifecycle에서 stage 이름(objective, planning, implementation, validation)은 동일 파일명으로 import한다.
3. FR-03: merge lifecycle에서 stage 이름(mate, merge, sync, validation)은 `merge-<stage>` 파일명으로 import한다 (validation → merge-validation).
4. FR-04: `completion` stage로 전환 시에는 자동 실행하지 않는다 (유저가 명시적으로 실행).
5. FR-05: next의 emitOutput 후에 다음 stage의 execute가 호출되어 그 stage의 output이 순차 출력된다.

### Non-Functional Requirements
1. NFR-01: JSON output 2개가 순차 출력되는 구조 (next output + stage output).
2. NFR-02: 기존 next.ts의 hook 실행, artifact 복사 등 기존 로직은 변경하지 않는다.

## Design

### Approaches Considered

| Aspect | Approach A: 직접 execute 호출 | Approach B: nextCommand 명시만 |
|--------|-----------|-----------|
| Summary | next.ts 내에서 다음 stage의 execute를 import하여 직접 호출 | next output의 prompt에 "Run `reap run <stage>` now" 메시지만 추가 |
| Pros | 하나의 호출로 stage 전환 + 다음 stage 실행 완료 | 단순, 기존 코드 최소 변경 |
| Cons | JSON 2개 순차 출력 구조 | 에이전트가 추가 명령 실행 필요 |
| Recommendation | **선택** — 자동화 목적에 부합 | 기각 |

### Selected Design
Approach A: `next.ts`의 `emitOutput` 호출 후, `nextStage`가 `completion`이 아닌 경우 해당 stage module을 dynamic import하여 `execute(paths)`를 호출한다.

- Normal lifecycle: `await import(./${nextStage})` → `execute(paths)`
- Merge lifecycle: stage에 따라 `merge-${stage}` 또는 `merge-validation` 파일 import

### Design Approval History
- 2026-03-22: 초기 설계 확정 (task instruction 기반)

## Scope
- **Related Genome Areas**: CLI commands (run/next.ts)
- **Expected Change Scope**: `src/cli/commands/run/next.ts` 1개 파일 수정
- **Exclusions**: evolve.ts 단순화는 이번 scope 밖. completion 자동 실행 없음.

## Genome Reference
- source-map.md: CLI Commands layer
- conventions.md: async/await 패턴, 단일 책임

## Backlog (Genome Modifications Discovered)
None

## Background
이전 세대(gen-127)에서 `lastNonce` 자동 읽기를 구현하여 next가 nonce를 자동으로 읽을 수 있게 되었다. 이번 세대에서는 한 단계 더 나아가, next가 stage 전환 후 다음 stage command까지 자동 실행하여 에이전트의 추가 명령 실행 부담을 줄인다.

