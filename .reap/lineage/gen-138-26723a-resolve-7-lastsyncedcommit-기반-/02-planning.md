# Planning

## Summary
`lastSyncedCommit` 필드를 config.yml에 추가하여 genome sync 상태를 정확히 추적한다. 5개 파일 수정.

## Technical Context
- **Tech Stack**: TypeScript 5.x, Node.js >=18, Commander.js, YAML
- **Constraints**: 파일 I/O는 `src/core/fs.ts` 유틸 경유, config는 YAML 포맷

## Tasks

### Phase 1: 타입 & 설정 인프라
- [ ] T001 `src/types/index.ts` -- `ReapConfig`에 `lastSyncedCommit?: string` 필드 추가
- [ ] T002 `src/core/config.ts` -- `ConfigManager.backfill()`에 `lastSyncedCommit: ""` 기본값 추가

### Phase 2: sync-genome 완료 시 커밋 해시 저장
- [ ] T003 `src/cli/commands/run/sync-genome.ts` -- `--phase complete` 시 `git rev-parse HEAD` 실행 후 config에 `lastSyncedCommit` 업데이트

### Phase 3: session-start hook의 staleness 감지 개선
- [ ] T004 `src/templates/hooks/genome-loader.cjs` -- `parseConfig()`에서 `lastSyncedCommit` 파싱
- [ ] T005 `src/templates/hooks/genome-loader.cjs` -- `detectStaleness()`에서 `lastSyncedCommit` 기반 로직으로 변경
- [ ] T006 `src/templates/hooks/genome-loader.cjs` -- `buildGenomeHealth()`에서 unsynced 상태 경고 표시

### Phase 4: status 출력 보강
- [ ] T007 `src/cli/commands/status.ts` -- `ProjectStatus`와 `getStatus()`에 `lastSyncedCommit` 정보 추가

## Dependencies
- T002 → T001 (타입 먼저)
- T003 → T001, T002 (인프라 먼저)
- T004, T005, T006 순차 (같은 파일 내 함수들, 서로 참조)
- T007 → T001 (타입 필요)

## E2E Test Scenarios

### Scenario 1: init 후 unsynced 표시
- Setup: `reap init`으로 새 프로젝트 생성
- Action: session-start hook 실행 (genome-loader)
- Assertion: genome health에 "unsynced" 또는 "never synced" 표시

### Scenario 2: sync 후 synced 표시
- Setup: `reap init` → `reap run sync-genome --phase complete`
- Action: config.yml 확인
- Assertion: `lastSyncedCommit`에 유효한 git commit hash 존재

### Scenario 3: sync 후 코드 변경 시 stale 표시
- Setup: sync 완료 → 다수 커밋 추가
- Action: session-start hook 실행
- Assertion: `lastSyncedCommit` 기준으로 staleness 감지
