# Implementation Log

## Completed Tasks

### T001-T002: integrity.ts regex 수정
- `LEGACY_PREFIX_PATTERN` 단일 패턴을 `LEGACY_COMMAND_PATTERN`과 `LEGACY_SKILL_PATTERN` 2개로 분리
- commands: `/^(reap|reapdev)\.[^.]+\.md$/` — .md 파일 매칭
- skills: `/^(reap|reapdev)\./` — 디렉토리 매칭 (suffix 불필요)
- `cleanupLegacyProjectSkills()` 내부에서 commands는 COMMAND 패턴, skills는 SKILL 패턴 사용

### T003: migrate.ts vision 경로 수정
- `ensureDir(join(paths.vision, "docs"))` -> `ensureDir(paths.visionDesign)` 변경
- vision/docs는 더 이상 존재하지 않는 경로. paths.visionDesign이 vision/design을 가리킴

### T004: update.test.ts 경로 수정
- `vision/docs` 참조를 `vision/design`으로 변경 (rm, dirExists 양쪽)

### T005: 빌드 + 테스트
- 전체 빌드 성공
- integrity unit: 31 pass, 0 fail
- migrate e2e: 29 pass, 0 fail
- update e2e: 5 pass, 0 fail
