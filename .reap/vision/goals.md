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
- [x] Evaluator agent 템플릿 정의 (long-running, cross-generation)
- [x] Fitness 위임: evaluator 1차 평가 → 인간 에스컬레이션 (gen-066 validation + gen-067 fitness/cruise. opt-in `evaluator: true`, advisor 모델, `EvaluatorConcern` state 채널, cruise high-severity 자동 중단)
- [ ] Vision/Goal/Memory 관리 위임
- [ ] 세대별 작업 기록 및 다음 작업 할당

### Tree — 계층형 pipeline
> 설계 문서: `vision/design/reap-tree.md`

- [ ] Tree 개념 정의 확정 — 노드 경계, merge 와의 구분, 지식 전파 방향 (설계 문서 완성)
- [ ] Phase 1 관측 — parent 가 child 를 알고 child lineage 요약을 받는다 (실행 제어 없음)
- [ ] Phase 2 지식 전파 — parent genome/vision 하향 상속 + child 교훈 상향 요약
- [ ] Phase 3 orchestration — parent 가 child pipeline 을 트리거·대기하는 engine
- [ ] Fitness 모델 확정 — child 단위 인간 판단 vs parent 통합. self-fitness 금지 원칙과의 정합성

### Agent Client 확장
- [x] OpenCode adapter (gen-063~064 완료 — opencode.json + plugin + AGENTS.md + dump-state + slash commands `/reap.*`. 4-항목 verification: static load / dynamic refresh / entry-point / slash trigger 모두 충족)
- [ ] Codex CLI adapter
