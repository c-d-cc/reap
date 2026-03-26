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
- [x] 2-level lineage compression (threshold 20)
- [x] Generation commit 자동화
- [x] reap.push 구현
- [x] abort 2-phase (confirm → execute) + consumed revert
- [x] submodule dirty check (completion commit + push에서 자동 차단)
- [x] backlog CRUD (make backlog, consume, revert, createdAt/consumedAt)
- [x] restart 제거 → abort로 통합 (gen-017)

### Clarity-driven Interaction (spec2 §0)
- [x] evolution.md에 clarity 원칙 내장 (template 포함)
- [x] evolve/stage prompt에 clarity 가이드 주입
- [ ] Clarity level 자동 판단 로직 (코드 기반 — vision/backlog/genome 상태에서 계산)

### Maturity System (spec2 §2)
- [x] Embryo → Normal 전환 제안 (adapt phase, soft/hard check)
- [x] 성숙도별 prompt 톤 차별화 (bootstrap/growth/cruise)
- [x] 소프트웨어 완성 기준 16항목 사전 정의

### Gap-driven Evolution (spec2 §3)
- [x] adapt에서 vision gap 기반 다음 goal 자동 제안 (코드 레벨) (gen-028)
- [x] Vision goals 자동 체크 마킹 (adapt에서 완료 항목 자동 [x]) (gen-028)

### Test Infrastructure
- [x] tests/ submodule 설정 (reap-test, self-evolve branch) (gen-012)
- [x] 테스트 구조 설계 (unit/e2e/scenario, bun:test) (gen-013)
- [x] core unit tests 60개 (gen-014, gen-019)
- [x] e2e tests 63개 (gen-015, gen-018)
- [x] scenario tests 41개 (gen-015, gen-016)
- [x] TypeScript 전환 + setup helper + 병렬 실행 (gen-016)

### Self-Hosting (spec2 §5)
- [x] REAP 자신의 `.reap/` 구조 보유
- [ ] 외부 프로젝트에서 core lifecycle 검증
- [ ] Validation에서 자기 CLI 검증 가능
- [ ] Self-hosting invariants 정의
- [ ] 점진적 전환 (prompt → lifecycle → genome)

### Distribution (spec2 §7)
- [ ] README 재작성 (v0.16 기준, self-evolving pipeline 강조)
- [ ] npm 배포 준비 (.npmignore 최종 정리, CI/CD)
- [ ] Update agent Phase 1: `reap update` CLI (selfUpgrade, hand-off, lastCliVersion, --dry-run)
- [ ] Update agent Phase 2: 프로젝트 동기화 (MigrationRunner, template sync, integrity check, legacy cleanup)
- [ ] Update agent Phase 3: 배포 연동 (release notice, auto issue report, session init 자동 감지)

### Agent Client 확장 (spec2 §6)
- [ ] OpenCode adapter
- [ ] Codex CLI adapter

### Genome/Environment
- [x] genome/environment prescriptive/descriptive 분리 (gen-011)
- [x] evolution.md Code Quality Principles (gen-007)
- [x] evolution.md Testing Principles (gen-012 이후)
- [x] CLAUDE.md 자동 생성/append (gen-002)
- [x] templates SSOT (evolution.md, claude-md-section.md) (gen-002)
- [x] CLI Command Structure enforced convention (gen-007)
