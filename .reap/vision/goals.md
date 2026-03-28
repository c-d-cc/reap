# Vision Goals

## Ultimate Goal

REAP가 스스로를 진화시키는 자기참조적(self-hosting) 파이프라인이 되는 것.
AI와 인간이 generation을 거치며 소프트웨어를 공동 진화시키되,
REAP 자신도 그 파이프라인 위에서 진화한다.

## Goal Items

### Self-Hosting
- [ ] 외부 프로젝트에서 core lifecycle 검증 (npm 배포 후)
- [ ] Validation에서 자기 CLI 검증 가능
- [ ] Self-hosting invariants 정의

### Distribution
- [ ] Update agent Phase 2: 프로젝트 동기화 (유저 지시 후 진행)
- [ ] Update agent Phase 3: 배포 연동 (유저 지시 후 진행)

### Evaluator Agent
- [x] Nonce 시스템 리팩토링: transition graph 기반 multi-nonce 발행
- [ ] Evaluator agent 템플릿 정의 (long-running, cross-generation)
- [ ] Fitness 위임: evaluator 1차 평가 → 인간 에스컬레이션
- [ ] Vision/Goal/Memory 관리 위임
- [ ] 세대별 작업 기록 및 다음 작업 할당

### Agent Client 확장
- [ ] OpenCode adapter (당장 불필요)
- [ ] Codex CLI adapter (당장 불필요)
