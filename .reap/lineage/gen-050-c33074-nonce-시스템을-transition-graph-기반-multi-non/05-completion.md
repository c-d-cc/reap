# Completion

## Summary

Nonce 시스템을 transition graph 기반 multi-nonce 발행으로 완전 리팩토링. 기존의 forward nonce 1개 + back nonce 1개 구조를 `pendingTransitions` map 기반으로 교체하여, 각 phase에서 허용된 모든 전이에 대해 nonce를 동시 발행하는 구조로 전환.

### 주요 변경:
- `lifecycle.ts`에 NORMAL_TRANSITIONS, MERGE_TRANSITIONS 선언적 graph 추가
- `GenerationState`에서 lastNonce/expectedHash/backNonce 등 6개 필드 제거, `pendingTransitions` map 1개로 통합
- `setNonce/verifyNonce/verifyBackNonce` 3개 함수를 `setTransitionNonces/verifyTransition/prepareStageEntry` 3개로 교체
- 13개 command 파일 + core 3개 모듈 수정
- completion:fitness self-loop이 graph에서 자연스럽게 표현 (기존 workaround 제거)
- back transition 2-step bug 자연 수정

### 테스트 결과: 491 pass, 8 fail (all pre-existing)

## Lessons Learned

### 잘된 점
- Transition graph를 선언적으로 정의하니 모든 전이 경로가 한 눈에 보이고, 새 전이 추가가 graph에 한 줄 추가로 끝남. 향후 evaluator agent가 새 전이를 필요로 할 때 확장이 쉬움.
- prepareStageEntry / setTransitionNonces 분리가 "enter" vs "continue" 시맨틱을 명확히 구분. 기존의 setNonce가 호출 시점에 따라 미묘하게 다른 동작을 하던 문제 해결.

### 개선할 점
- 초기 구현에서 setTransitionNonces의 "현재 지점에서 나갈 수 있는 전이" 시맨틱과 "진입 ticket" 시맨틱의 차이를 즉시 인식하지 못해 2번의 수정 사이클이 필요했음. 데이터 플로우를 먼저 명확히 다이어그램으로 그렸으면 시행착오를 줄일 수 있었을 것.

## Next Generation Hints

1. **Evaluator agent 템플릿 정의** -- 이번 generation에서 transition graph가 완성되었으므로, 다음 목표는 evaluator agent가 사용할 전이 경로(예: validation→implementation micro-loop)를 graph에 추가하고 evaluator agent 템플릿을 정의하는 것.
2. **Pre-existing test failures** -- integrity.test.ts의 cleanupLegacyProjectSkills 4개, migrate.test.ts 3개, update.test.ts 1개가 계속 실패 중. vision/docs→design 리네이밍 관련. 별도 generation에서 수정 권장.
3. **application.md의 Nonce System 섹션 업데이트** -- 현재 genome의 nonce 설명이 old API 기준. embryo이므로 이번 adapt에서 갱신 가능.

## Change Proposals

### Genome (application.md) -- Nonce System 섹션 갱신
현재:
```
- Forward nonce: 다음 phase 진입 게이트
- Back nonce: 이전 stage 회귀 허용
```
변경 제안:
```
- Transition graph: 각 stage:phase에서 허용된 전이를 선언적으로 정의
- pendingTransitions: 현재 허용된 모든 전이에 대한 nonce map
- verifyTransition: 통합 전이 검증 (forward + back 통합)
```
