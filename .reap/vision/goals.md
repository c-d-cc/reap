# Vision Goals

## Ultimate Goal

REAP가 스스로를 진화시키는 자기참조적(self-hosting) 파이프라인이 되는 것.
AI와 인간이 generation을 거치며 소프트웨어를 공동 진화시키되,
REAP 자신도 그 파이프라인 위에서 진화한다.

## Goal Items

### Core Stability
- [x] Core lifecycle 구현 (learning → completion)
- [x] Merge lifecycle 구현 (detect → reconcile → completion)
- [x] Nonce-based stage integrity
- [x] 2-level lineage compression
- [x] Generation commit 자동화
- [x] reap.push 구현
- [x] E2E 테스트 4 suites (init, lifecycle, merge, multi-gen)

### Clarity-driven Interaction (spec2 §0)
- [ ] Clarity level 자동 판단 로직 (vision/backlog/genome 상태 기반)
- [ ] 각 stage prompt에 clarity 가이드 주입
- [x] evolution.md에 clarity 원칙 내장 (gen-002: template으로 분리, 영어 작성)

### Maturity System (spec2 §2)
- [x] Embryo → Normal 전환 제안 (adapt phase)
- [x] 성숙도별 prompt 톤 차별화 (bootstrap/growth/cruise)
- [x] 소프트웨어 완성 기준 16항목 사전 정의

### Gap-driven Evolution (spec2 §3)
- [ ] adapt에서 vision gap 기반 다음 goal 제안
- [ ] Vision goals 자동 체크 마킹

### Self-Hosting (spec2 §5)
- [x] REAP 자신의 `.reap/` 구조 보유
- [ ] 외부 프로젝트에서 core lifecycle 검증
- [ ] Validation에서 자기 CLI 검증 가능
- [ ] Self-hosting invariants 정의
- [ ] 점진적 전환 (prompt → lifecycle → genome)

### Test Infrastructure
- [x] Phase 1: tests/ submodule 설정 (reap-test repo, self-evolve branch) (gen-012)
- [x] Phase 2: 테스트 구조 설계 (unit/e2e/scenario 디렉토리, 실행 스크립트) (gen-013)
- [ ] Phase 3: core 함수 unit tests (backlog.ts, archive.ts, generation.ts, nonce.ts 등)
- [ ] Phase 4: gen-002~011 신규 기능 e2e tests (CLAUDE.md, make backlog, --backlog consume, artifact path)
- [ ] Phase 5: init scenario tests (empty, existing no CLAUDE.md, existing with CLAUDE.md)
- [ ] Phase 6: 기존 scripts/e2e-*.sh를 tests/ 구조로 이전

### Distribution (spec2 §7)
- [ ] README 재작성 (영어 우선, self-evolving pipeline 강조)
- [ ] npm 배포 준비 (.npmignore, CI/CD)
- [ ] Update agent 구현 (version migration, idempotent)

### Agent Client 확장 (spec2 §6)
- [ ] OpenCode adapter
- [ ] Codex CLI adapter

### Backlog (현재 pending)
- [ ] reap init 자동 모드 감지 (이미 구현됨 — backlog 정리 필요)
- [ ] npx @c-d-cc/reap 지원
- [ ] Presets 기능 제거
- [ ] restart → abort 통합
- [x] tests 폴더 git submodule 분리 (gen-012)
