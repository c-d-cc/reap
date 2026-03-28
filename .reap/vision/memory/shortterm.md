# Shortterm Memory

## 세션 요약 (2026-03-28)

### gen-050: Nonce 시스템 transition graph 리팩토링
- forward nonce 1개 + back nonce 1개 구조를 pendingTransitions map 기반으로 교체
- lifecycle.ts에 NORMAL_TRANSITIONS, MERGE_TRANSITIONS 선언적 graph 추가
- GenerationState에서 6개 nonce 필드 제거, pendingTransitions 1개로 통합
- setNonce/verifyNonce/verifyBackNonce를 setTransitionNonces/verifyTransition/prepareStageEntry로 교체
- 13개 command + core 3개 모듈 수정
- completion:fitness self-loop이 graph에서 자연스럽게 표현
- back transition 2-step bug 수정 (기존: complete 후 back이 2단계 건너뜀)
- 491 pass, 8 fail (all pre-existing)

### 다음 세션
- Evaluator agent 템플릿 정의 (vision/design/evaluator-agent.md 참조)
- Pre-existing test failures 수정 (integrity, migrate, update 관련 8개)
- Genome application.md의 Nonce System 섹션을 transition graph 기반으로 갱신
- Embryo → Normal 전환 검토

### Backlog 상태
- 없음 (empty)
