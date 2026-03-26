# Implementation Log

## Completed Tasks

### T001 `src/core/integrity.ts` — `cleanupLegacyProjectSkills` 함수 추가
- `LEGACY_PREFIX_PATTERN = /^(?:reap|reapdev)\./` 패턴으로 `reap.`/`reapdev.` 접두사 매칭
- `.claude/commands/` 내 파일 삭제 + `.claude/skills/` 내 디렉토리 삭제 (recursive)
- 삭제된 파일 경로 목록을 상대 경로로 반환
- 디렉토리 없으면 graceful skip (try-catch)

### T002 `src/cli/commands/migrate.ts` — executeMain에서 cleanup 호출
- step 3.9에 `cleanupLegacyProjectSkills(paths.root)` 호출 추가
- `legacyCleaned` 결과를 context에 포함
- completed 배열에 `"legacy-cleanup"` 추가

### T003 `src/cli/commands/init/common.ts` — initCommon에서 cleanup 호출
- `initCommon()` 함수 시작부에 `cleanupLegacyProjectSkills(paths.root)` 호출
- 디렉토리 생성 이전에 실행하여 깨끗한 상태에서 init 진행

### T004 `tests/unit/integrity.test.ts` — unit test 7개 추가
- reap.*.md 파일 삭제, reapdev.*.md 파일 삭제
- reap.*/ 디렉토리 삭제, reapdev.*/ 디렉토리 삭제
- .claude/ 없을 때 빈 배열 반환
- 디렉토리 자체 보존 확인
- commands + skills 동시 처리 확인

### T005 `tests/e2e/migrate.test.ts` — e2e test 2개 추가
- legacy 파일이 있는 상태에서 migrate → 정리 확인 + context에 결과 포함
- 다른 프로젝트 파일은 보존되는지 확인

### T006 빌드 + 전체 테스트
- 빌드 성공 (0.47MB)
- unit 223 tests 통과
- e2e migrate 22 tests 통과

## Changes Summary

| 파일 | 변경 |
|------|------|
| `src/core/integrity.ts` | `cleanupLegacyProjectSkills()` 함수 추가, `rm` import 추가 |
| `src/cli/commands/migrate.ts` | `executeMain()`에서 cleanup 호출, context에 결과 포함 |
| `src/cli/commands/init/common.ts` | `initCommon()`에서 cleanup 호출 |
| `tests/unit/integrity.test.ts` | unit test 7개 추가 |
| `tests/e2e/migrate.test.ts` | e2e test 2개 추가 |
