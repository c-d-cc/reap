# Objective

## Goal
feat: phase 전환 시에도 nonce 검증 추가

## Completion Criteria
1. 모든 normal lifecycle stage command(objective, planning, implementation, validation)에서 work phase 끝에 phase nonce가 생성되어 `current.yml`에 저장된다.
2. `--phase complete` 호출 시 phase nonce가 검증되고, 검증 실패 시 에러가 발생한다.
3. completion stage의 multi-phase 전환(retrospective → feedKnowledge → commit)에서 각 phase 끝에 다음 phase용 nonce가 생성되고, 다음 phase 시작 시 검증된다.
4. merge lifecycle stage command(merge-detect, merge-mate, merge-merge, merge-sync, merge-validation, merge-completion)에도 동일한 phase nonce가 적용된다.
5. 기존 stage 전환 nonce(`lastNonce`, `expectedTokenHash`)는 변경 없이 유지된다.
6. `GenerationState` 타입에 `lastPhaseNonce`와 `expectedPhaseTokenHash` 필드가 추가된다.
7. 모든 테스트가 통과한다 (`bun test`).

## Requirements

### Functional Requirements
1. **FR-01**: `GenerationState`에 `lastPhaseNonce?: string`와 `expectedPhaseTokenHash?: string` 필드를 추가한다.
2. **FR-02**: phase nonce 생성/검증 함수를 구현한다 — 기존 `generateStageToken`을 재사용하되, phase 구분을 위해 `genId + stage + phase` 조합으로 해시를 생성한다.
3. **FR-03**: normal lifecycle의 work phase 끝(emitOutput 직전)에서 phase nonce를 생성하여 `current.yml`에 저장한다.
4. **FR-04**: normal lifecycle의 `--phase complete` 시작 시 phase nonce를 검증하고, 통과 시 삭제 후 진행, 실패 시 에러를 발생시킨다.
5. **FR-05**: completion stage에서 retrospective phase 끝에 feedKnowledge용 nonce를, feedKnowledge phase 끝에 commit용 nonce를 생성한다.
6. **FR-06**: completion stage에서 feedKnowledge phase 시작 시, commit phase(archive) 시작 시 각각 nonce를 검증한다.
7. **FR-07**: merge lifecycle의 모든 stage command에도 동일한 phase nonce 패턴을 적용한다 (work/review/resolve/verify → complete, retrospective → archive).
8. **FR-08**: phase nonce 시스템은 기존 stage nonce 시스템과 독립적으로 동작한다.

### Non-Functional Requirements
1. **NFR-01**: 기존 `generateStageToken`/`verifyStageToken` 함수를 최대한 재사용하여 코드 중복을 최소화한다.
2. **NFR-02**: phase nonce 관련 로직을 공통 함수로 추출하여 각 stage command에서 일관되게 사용한다.

## Design

### Approaches Considered

| Aspect | Approach A: 별도 함수 | Approach B: 기존 함수 재사용 |
|--------|----------------------|---------------------------|
| Summary | `generatePhaseToken`/`verifyPhaseToken` 별도 생성 | 기존 `generateStageToken`에 phase 파라미터 추가 |
| Pros | 명확한 관심사 분리, stage/phase 혼동 방지 | 코드 중복 최소, 일관된 해시 메커니즘 |
| Cons | 유사한 로직 중복 | 기존 함수 시그니처 변경 필요 |
| Recommendation | **선택** | - |

### Selected Design

**Approach A: 별도 함수** 선택.

1. **`generatePhaseToken(genId, stage, phase)`** — `nonce + genId + stage + ":" + phase` 해시 생성
2. **`verifyPhaseToken(token, genId, stage, phase, expectedHash)`** — 검증
3. **`generatePhaseNonce(state, stage, phase, saveFn)`** — 공통 헬퍼: nonce 생성 → state에 저장
4. **`verifyPhaseNonce(command, state, stage, phase)`** — 공통 헬퍼: 검증 → 삭제

이 함수들을 `src/core/generation.ts`에 추가하고, 공통 헬퍼는 `src/core/stage-transition.ts`에 추가한다.

### Design Approval History
- 2026-03-22: 초기 설계 확정

## Scope
- **Related Genome Areas**: `src/core/generation.ts`, `src/core/stage-transition.ts`, `src/types/index.ts`, 모든 stage command 파일 (14개)
- **Expected Change Scope**: ~14개 파일 수정, 신규 파일 없음
- **Exclusions**: stage 전환 nonce 로직 변경 없음, `next.ts`/`start.ts` 변경 없음

## Genome Reference
- conventions.md: 함수 단일 책임, 50줄 이하 권장
- constraints.md: TypeScript strict mode, Node.js fs/promises 사용

## Backlog (Genome Modifications Discovered)
None

## Background
현재 nonce는 stage 전환(`--phase complete`에서 생성 → 다음 stage command 진입 시 검증)에만 사용된다. stage 내 phase 전환(work → complete)에는 검증이 없어, AI가 work phase를 수행하지 않고 바로 `--phase complete`를 호출할 수 있는 취약점이 있다. 특히 completion stage는 phase가 여러 개(retrospective → feedKnowledge → commit)이므로 순서 강제가 중요하다.
