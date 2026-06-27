---
id: gen-050-c33074
type: embryo
goal: "Nonce 시스템을 transition graph 기반 multi-nonce로 리팩토링하여 evaluator agent 도입을 위한 기반 마련"
parents: ["gen-049-3d1b71"]
---
# gen-050-c33074
Nonce 시스템을 transition graph 기반 multi-nonce 발행으로 완전 리팩토링. 기존의 forward nonce 1개 + back nonce 1개 구조를 `pendingTransitions` map 기반으로 교체하여, 각 phase에서 허용된 모든 전이에 대해 nonce를 동시 발행하는 구조로 전환.

### 주요 변경:
- `lifecycle.ts`에 NORMAL_TRANSITIONS, MERGE_TRANSITIONS 선언적 graph 추가
- `GenerationState`에서 lastNonce/expectedHash/backNonce 등 6개 필드 제거, `pendingTransitions` map 1개로 통합
- `setNonce/verifyNonce/verifyBackNonce` 3개 함수를 `setTransitionNonces/verifyTransition/prepareStageEntry` 3개로 교체
- 13개 command 파일 + core 3개 모듈 수정
- completion:fitness self-loop이 graph에서 자연스럽게 표현 (기존 workaround 제거)
- back transition 2-step bug 자연 수정

### 테스트 결과: 491 pass, 8 fail (all pre-existing)