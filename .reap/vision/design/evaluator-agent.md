# Evaluator Agent 설계

> 2026-03-28 합의. 상태: 설계 확정, 구현 전.

## 동기

현재 reap-evolve agent가 코드 작성과 검증을 모두 수행한다.
Self-review bias가 존재하며, fitness 평가는 전적으로 인간에 의존한다.
독립된 evaluator agent를 도입하여 검증 품질을 높이고 인간 부담을 줄인다.

## Evaluator Agent 역할

### 1. Long-running Orchestrator
- 1회성이 아닌 generation을 넘어서는 장기 실행 agent
- Cross-generation 맥락을 유지하며 프로젝트 전체 흐름을 파악

### 2. Vision/Goals/Memory 관리
- Goal 달성 현황 추적
- Goal 기반으로 다음 작업 추천 (인간이 최종 선택)
- Memory tier 간 정보 승격/정리

### 3. Fitness 1차 평가
- 코드 품질, goal 달성 여부, artifact 완성도 평가
- 판단 기준:
  - **명확한 사안** → evaluator가 직접 판단
  - **중요/애매한 사안** → 인간에게 에스컬레이션
- 현재 validation stage와의 관계: validation은 기능적 검증(테스트 통과 등), evaluator는 goal 적합성 + 품질 평가

### 4. 세대별 작업 기록
- 각 generation의 성과를 기록하고 추적
- 세대 간 진행 상황의 연속성 유지

## 선행 작업: Nonce 시스템 리팩토링

### 현재 문제
- forward nonce 1개 + back nonce 1개만 발행 (linear 전이만 가능)
- Validation 실패 시 수정 후 재진입(self nonce) 불가능
- 각 phase의 허용 전이가 코드에 하드코딩

### 목표: Transition Graph 기반 Multi-nonce

각 phase에서 허용된 전이를 사전 정의하고, 모든 전이에 대해 nonce를 발행한다.

```typescript
// 개념적 transition graph
const TRANSITION_GRAPH: Record<string, string[]> = {
  "learning:complete":        ["planning:entry"],
  "planning:complete":        ["implementation:entry"],
  "implementation:complete":  ["validation:entry"],
  "validation:complete":      ["completion:entry", "implementation:entry", "validation:entry"],
  "completion:reflect":       ["completion:fitness"],
  "completion:fitness":       ["completion:adapt", "validation:entry"],
  "completion:adapt":         ["completion:commit"],
  "completion:commit":        [],  // terminal
};
```

### State 변경

```typescript
// 현재: 개별 필드
interface GenerationState {
  lastNonce?: string;
  expectedHash?: string;
  phase?: string;
  backNonce?: string;
  backExpectedHash?: string;
  backTarget?: string;
  backTargetPhase?: string;
}

// 변경 후: transitions map
interface GenerationState {
  pendingTransitions?: Record<string, { nonce: string; hash: string }>;
  // key 예: "planning:entry", "validation:entry" 등
}
```

### 영향 범위
- `src/core/nonce.ts` — setNonce()가 graph 기반 다중 nonce 발행
- `src/core/stage-transition.ts` — verifyNonce()가 pendingTransitions에서 검증
- `src/core/lifecycle.ts` — transition graph 정의 추가
- `src/types/index.ts` — GenerationState 타입 변경
- `src/cli/commands/run/` — 모든 stage command의 verify/set 호출부
- `src/cli/commands/run/back.ts` — 별도 verifyBackNonce 대신 통합 verify
- `.reap/life/current.yml` — 스키마 변경 + 기존 세대 호환성
- `tests/` — nonce 관련 테스트 전면 재작성

## 진행 순서

1. **Nonce transition graph 리팩토링** — 선행 필수, 가장 큰 작업
2. **Evaluator agent 템플릿 정의** — role, tools, behavior rules
3. **Fitness 위임 로직** — evaluator 1차 평가 + 인간 에스컬레이션
4. **Vision/Goal 관리 위임** — cross-generation orchestration 확장

## 설계 원칙

- 정량적 fitness 메트릭 금지 (Goodhart's Law) — evaluator도 정성적 판단만
- 인간의 최종 결정권 보장 — evaluator는 제안/판단, 인간이 override 가능
- 생물학적 메타포 유지 — fitness evaluation은 환경(외부)이 수행
