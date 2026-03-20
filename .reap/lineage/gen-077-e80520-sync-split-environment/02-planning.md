# Planning

## Tasks

### Phase 1: 커맨드 템플릿
- [ ] T001 `src/templates/commands/reap.sync.genome.md` — 기존 reap.sync.md 내용 이동
- [ ] T002 `src/templates/commands/reap.sync.environment.md` — 신규 작성 (소스 스캔 + 유저 인터뷰 + 3-layer 생성)
- [ ] T003 `src/templates/commands/reap.sync.md` — orchestrator로 재작성 (sync.genome + sync.environment 순차 호출)

### Phase 2: init/update 연동
- [ ] T004 `src/cli/commands/init.ts` — COMMAND_NAMES에 sync.genome, sync.environment 추가 + environment/docs/, environment/resources/ 디렉토리 생성
- [ ] T005 `src/core/paths.ts` — environmentDocs, environmentResources, environmentSummary getter 추가

### Phase 3: session-start context 로딩
- [ ] T006 `src/templates/hooks/genome-loader.cjs` — environment/summary.md 로딩하여 context에 포함

### Phase 4: objective 간소화
- [ ] T007 `src/templates/commands/reap.objective.md` Step 1 — interactive environment setup 제거, "environment가 비어있으면 /reap.sync.environment 안내"로 변경

### Phase 5: 빌드/검증
- [ ] T008 빌드 + 테스트
