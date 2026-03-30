# Planning

## Goal

migrate/update 관련 실패 테스트 8건을 수정하여 전체 테스트 스위트가 통과하도록 한다.

## Completion Criteria

1. `bun test tests/unit/integrity.test.ts` — 전체 pass (cleanupLegacyProjectSkills 4건 포함)
2. `bun test tests/e2e/migrate.test.ts` — 전체 pass (3건 포함)
3. `bun test tests/e2e/update.test.ts` — 전체 pass (1건 포함)
4. 기존 통과 테스트에 regression 없음

## Tasks

- [ ] T001 `src/core/integrity.ts` — LEGACY_PREFIX_PATTERN을 commands용/skills용 2개로 분리. reapdev.* 포함.
- [ ] T002 `src/core/integrity.ts` — cleanupLegacyProjectSkills 함수에서 commands는 LEGACY_COMMAND_PATTERN, skills는 LEGACY_SKILL_PATTERN 사용.
- [ ] T003 `src/cli/commands/migrate.ts` — line 401 `vision/docs` -> `paths.visionDesign` 수정
- [ ] T004 `tests/e2e/update.test.ts` — line 65,73 `vision/docs` -> `vision/design` 수정
- [ ] T005 빌드 후 전체 테스트 실행 확인

## Scope

변경 파일:
- `src/core/integrity.ts` (소스 수정)
- `src/cli/commands/migrate.ts` (소스 수정)
- `tests/e2e/update.test.ts` (테스트 수정)

범위 밖: daemon 테스트, 다른 backlog 항목.
