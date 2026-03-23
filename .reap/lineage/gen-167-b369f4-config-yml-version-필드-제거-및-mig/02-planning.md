# Planning

## Summary
version 비교 기반 migration 필터링을 제거하고, 모든 migration을 매번 `check()`하여 필요한 것만 실행하는 방식으로 변경.
config.yml에서 version 필드를 완전히 제거하고, 관련 코드를 모두 정리.

## Technical Context
- **Tech Stack**: TypeScript, YAML config, Commander.js CLI
- **Constraints**: Node.js fs/promises, `src/core/fs.ts` 유틸 경유

## Tasks

### Phase 1: 타입 및 인터페이스 정리
- [ ] T001 `src/types/index.ts` -- ReapConfig에서 `version: string` 필드 제거
- [ ] T002 `src/core/migrations/types.ts` -- Migration에서 fromVersion/toVersion 제거, MigrationRunResult에서 fromVersion/toVersion 제거

### Phase 2: Migration 코어 로직 변경
- [ ] T003 `src/core/migrations/index.ts` -- MigrationRunner.run() 리팩터링: version 비교 제거, 모든 migration을 check() 후 실행. compareSemver/normalizeVersion 제거. currentPackageVersion 파라미터 제거. config.version 갱신 제거.
- [ ] T004 `src/core/migrations/0.0.0-to-0.10.0.ts` -- fromVersion/toVersion 필드 제거

### Phase 3: 참조 코드 정리
- [ ] T005 `src/cli/commands/init.ts` -- config 생성 시 version 필드 제거
- [ ] T006 `src/cli/commands/update.ts` -- MigrationRunner.run() 호출에서 currentVersion 인자 제거
- [ ] T007 `src/core/integrity.ts` -- checkConfig()에서 version 검증 제거
- [ ] T008 `src/cli/commands/run/config.ts` -- version 표시를 패키지 버전으로 대체
- [ ] T009 `src/cli/commands/status.ts` -- ProjectStatus.version을 패키지 버전으로 대체

### Phase 4: 데이터 정리
- [ ] T010 `.reap/config.yml` -- version 행 제거

### Phase 5: 검증
- [ ] T011 타입체크 (bunx tsc --noEmit)
- [ ] T012 테스트 (bun test)

## Dependencies
- T003, T004 → T002 (타입 변경 후)
- T005~T009 → T001 (ReapConfig 타입 변경 후)
- T006 → T003 (MigrationRunner 시그니처 변경 후)
- T011, T012 → 모든 코드 변경 완료 후
