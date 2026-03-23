# Objective

## Goal
Nonce 토큰 구조 통일: stage/phase 동일 형태로 추상화

모든 nonce 토큰을 `hash(nonce + genId + stage:phase)` 형식으로 통일하고, generator-based에서 receiver-based로 전환한다.

## Completion Criteria

1. `verifyStageEntry`, `setPhaseNonce`, `verifyPhaseEntry` 3개 함수가 `verifyNonce`, `setNonce` 2개 함수로 대체됨
2. 모든 토큰이 `hash(nonce + genId + stage:phase)` 단일 형식 사용 (stage-only 형식 제거)
3. `verifyStageEntry`의 `prevStage` 역방향 조회 로직 제거됨
4. `verifyStageEntry`의 `state.phase` 분기 제거됨
5. 모든 기존 테스트 통과 (`bun test`, `bunx tsc --noEmit`, `npm run build`)
6. 14개 stage command 파일의 보일러플레이트가 통일된 패턴으로 변경됨

## Requirements

### Functional Requirements

1. **FR-01**: `generation.ts`의 `generateToken`은 항상 `stage:phase` 형식으로 해시 생성 (phase 필수)
2. **FR-02**: `generation.ts`의 `verifyToken`은 항상 `stage:phase` 형식으로 검증 (phase 필수)
3. **FR-03**: `stage-transition.ts`에 `verifyNonce(command, state, stage, phase)` 함수 추가 — 토큰 검증 + 소비 통합
4. **FR-04**: `stage-transition.ts`에 `setNonce(state, nextStage, nextPhase)` 함수 추가 — 토큰 생성 + 상태 설정 통합
5. **FR-05**: 첫 번째 stage:entry (objective, detect)는 `verifyNonce`에서 skip 처리
6. **FR-06**: 마지막 completion의 feedKnowledge phase는 `setNonce` 호출 불필요
7. **FR-07**: `verifyStageEntry`, `setPhaseNonce`, `verifyPhaseEntry` 제거
8. **FR-08**: 모든 stage command(normal 6 + merge 6)에서 통일된 `verifyNonce`/`setNonce` 패턴 적용
9. **FR-09**: `start.ts`의 stage chain token도 receiver-based 형식으로 변경 (`"objective:entry"`)
10. **FR-10**: `back.ts`, `next.ts` 등 토큰 관련 로직이 있는 파일도 일관성 있게 수정

### Non-Functional Requirements

1. **NFR-01**: 기존 E2E 테스트 및 단위 테스트 100% 통과
2. **NFR-02**: `current.yml` 스키마 변경 없음 (`lastNonce`, `expectedHash`, `phase` 필드 유지)

## Design

### Approaches Considered

| Aspect | A: receiver-based 통일 | B: phase 파라미터 optional 유지 |
|--------|----------------------|-------------------------------|
| Summary | 모든 토큰을 `stage:phase` 형식으로 통일, phase 필수 | 기존 구조 유지하되 함수만 통합 |
| Pros | 단일 형식, prevStage 역조회 불필요, 분기 제거 | 변경 최소화 |
| Cons | 모든 command 파일 수정 필요 | 근본 문제(두 형식 공존) 해결 안됨 |
| Recommendation | **채택** | 기각 |

### Selected Design

**Approach A: receiver-based 통일**

토큰을 "입장권" 개념으로 설계. 토큰은 "다음에 어디로 갈 것인지"를 명시한다.

#### Phase 타입 정의
- `entry` — stage 진입 토큰 (이전 stage의 complete에서 발급)
- `complete` — complete phase 진입 토큰 (work phase에서 발급)
- `work`, `review`, `verify`, `resolve`, `retrospective`, `feedKnowledge` — 각 stage의 작업 phase

#### 토큰 흐름 예시
```
start --phase create
  → setNonce(state, "objective", "entry")     // objective:entry 입장권

objective (work)
  → verifyNonce(cmd, state, "objective", "entry")  // 입장권 확인
  → setNonce(state, "objective", "complete")        // complete 입장권

objective --phase complete
  → verifyNonce(cmd, state, "objective", "complete") // complete 입장권 확인
  → setNonce(state, "planning", "entry")             // planning:entry 입장권

planning (work)
  → verifyNonce(cmd, state, "planning", "entry")  // 입장권 확인
  → setNonce(state, "planning", "complete")        // complete 입장권
  ...
```

#### 핵심 함수 시그니처
```typescript
// 토큰 검증 + 소비. 첫 stage:entry는 skip.
function verifyNonce(command: string, state: GenerationState, stage: string, phase: string): void

// 다음 진입 토큰 생성 + 상태 설정
function setNonce(state: GenerationState, stage: string, phase: string): void
```

#### `generateToken` / `verifyToken` 변경
- `phase` 파라미터를 필수로 변경 (optional → required)
- 해시 입력은 항상 `${nonce}${genId}${stage}:${phase}`

### Design Approval History
- 2026-03-23: receiver-based 통일 설계 확정

## Scope
- **Related Genome Areas**: `src/core/generation.ts`, `src/core/stage-transition.ts`, `src/cli/commands/run/` (14개 command 파일)
- **Expected Change Scope**: ~20개 파일 수정, 함수 시그니처 변경 + command 파일 패턴 통일
- **Exclusions**: `current.yml` 스키마 변경 없음, 새 기능 추가 없음 (순수 리팩토링)

## Genome Reference
- `conventions.md`: 함수 단일 책임, 50줄 이하 권장
- `constraints.md`: TypeScript strict mode, Node.js >=18 호환

## Backlog (Genome Modifications Discovered)
None

## Background
현재 nonce 토큰 시스템은 stage 토큰과 phase 토큰이 서로 다른 형식을 사용하고, generator-based(생성자가 자기 stage 이름으로 토큰 생성)라서 검증 시 prevStage 역조회가 필요하다. 이로 인해 `verifyStageEntry`에서 `state.phase` 존재 여부에 따른 불필요한 분기가 발생하고, 각 command 파일에서 4개 함수를 조합하는 보일러플레이트가 생긴다. receiver-based(수신자의 stage:phase로 토큰 생성)로 통일하면 이 모든 복잡성이 해소된다.
