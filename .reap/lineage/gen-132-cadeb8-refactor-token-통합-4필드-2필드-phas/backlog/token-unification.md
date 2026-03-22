---
type: task
status: consumed
priority: high
consumedBy: gen-132-cadeb8
---

# Token 통합 + phase 필드 추가

## 변경 사항

### 1. current.yml 필드 정리

기존 4개 필드:
- `expectedTokenHash`, `lastNonce` (stage 전환용)
- `expectedPhaseTokenHash`, `lastPhaseNonce` (phase 전환용)

통합 2개 필드:
- `lastNonce` — stage/phase 전환 모두 사용, 마지막 생성된 nonce
- `expectedHash` — `expectedTokenHash`에서 리네이밍

### 2. phase 필드 추가

`current.yml`에 `phase` 필드 추가. 현재 stage 내 어디인지 추적.
예: `phase: work`, `phase: complete`, `phase: retrospective`, `phase: feedKnowledge`

### 3. token 생성 함수 통합

`generateStageToken` + `generatePhaseToken` → 하나의 함수로 통합.
stage/phase 전환 모두 동일한 `lastNonce` + `expectedHash`에 저장.

### 4. GenerationState 타입 업데이트

- `expectedTokenHash` → `expectedHash`
- `lastPhaseNonce`, `expectedPhaseTokenHash` 제거
- `phase?: string` 추가

### 5. 모든 참조 업데이트

- stage command들 (objective, planning, implementation, validation, completion)
- merge stage commands
- stage-transition.ts
- next.ts
- generation.ts
- 테스트 파일들
