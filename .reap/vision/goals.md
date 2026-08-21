# Vision Goals

## Ultimate Goal

REAP가 스스로를 진화시키는 자기참조적(self-hosting) 파이프라인이 되는 것.
AI와 인간이 generation을 거치며 소프트웨어를 공동 진화시키되,
REAP 자신도 그 파이프라인 위에서 진화한다.

## Goal Items

### Self-Hosting
- [ ] `goal-001` 외부 프로젝트에서 core lifecycle 검증 (npm 배포 후)
- [ ] `goal-002` Validation에서 자기 CLI 검증 가능
- [ ] `goal-003` Self-hosting invariants 정의

### Distribution
- [ ] `goal-004` 배포 형태를 사용자 도구로 인식되게 한다
      <!-- 지금 REAP 은 클라이언트의 skill 목록에 19줄로 흩어져 있다. 켜고 끄기·버전·출처가
           항목별로 나뉘어 하나의 도구로 보이지 않는다 -->
- [ ] `goal-005` Update agent Phase 2: 프로젝트 동기화 (유저 지시 후 진행)
- [ ] `goal-006` Update agent Phase 3: 배포 연동 (유저 지시 후 진행)

### Evaluator Agent
- [x] `goal-007` Nonce 시스템 리팩토링: transition graph 기반 multi-nonce 발행
- [x] `goal-008` Evaluator agent 템플릿 정의 (long-running, cross-generation)
- [x] `goal-009` Fitness 위임: evaluator 1차 평가 → 인간 에스컬레이션 (gen-066 validation + gen-067 fitness/cruise. opt-in `evaluator: true`, advisor 모델, `EvaluatorConcern` state 채널, cruise high-severity 자동 중단)
- [ ] `goal-010` Vision/Goal/Memory 관리 위임
- [ ] `goal-011` 세대별 작업 기록 및 다음 작업 할당

### Cell — 다중 pipeline 상호작용
> 설계 문서: `vision/design/reap-cell.md` (구 `reap-tree.md` — 개명 근거는 그 문서 §2.1)

- [ ] `goal-012` P0 설계 확정 — 인터페이스 표현 형식 / 다중 agent 동시성 제어 (전제는 단일 머신·단일 조직으로 확정)
- [ ] `goal-013` P1 카탈로그 — 인터페이스 선언 + provides/consumes. 전파 없음
- [ ] `goal-014` P2 파급 — depends-on 파생 + impact + 알림 채널 & 커서 게이트
- [ ] `goal-015` P3 지식 전파 — governs 상속 + 상향 요약 + 충돌 감지
- [ ] `goal-016` P4 orchestration — goal 배정 + 수확 대조
- [ ] `goal-017` Fitness 모델 확정 — cell 단위 인간 판단. self-fitness 금지 원칙과의 정합성

### 지식 축 — 계획과 맥락을 어디에 두는가
- [x] `goal-018` Milestone 도입 (gen-097 — `vision/milestones/`, main 1개 + 나머지 소비 가능, 경계 3요소 강제. 다음 세대 제안이 토큰 겹침 휴리스틱에서 계획으로 바뀌었다)
- [ ] `goal-019` 지식 축을 정리한다 — 참조 체계 · idea 자리 · memory 재설계 · 대화 절차
      <!-- 어떤 generation 으로 나뉘는지는 `vision/milestones/v018-지식-축-정리.md` 가 갖는다.
           계획을 goals.md 에 복사하지 않는다 (gen-097 의 경계).
           `.reap/plan/` 과 `/reap.plan` 은 v0.18 에서 제외됐다 (사용자, 2026-08-21) —
           backlog 는 vision/design/backlogs_plan-track/ 이 갖는다 -->

### Agent Client 확장
- [x] `goal-020` OpenCode adapter (gen-063~064 완료 — opencode.json + plugin + AGENTS.md + dump-state + slash commands `/reap.*`. 4-항목 verification: static load / dynamic refresh / entry-point / slash trigger 모두 충족)
- [ ] `goal-021` Codex CLI adapter
