# Planning

## Goal

migrate/init에서 프로젝트 레벨 legacy commands/skills 파일(`reap.*`, `reapdev.*`)을 자동 정리하여 v0.15 잔존 파일로 인한 AI 혼란을 방지한다.

## Completion Criteria

1. `cleanupLegacyProjectSkills(projectRoot)` 공통 함수가 `src/core/integrity.ts`에 존재
2. `.claude/commands/reap.*.md`, `.claude/commands/reapdev.*.md` 파일 삭제
3. `.claude/skills/reap.*/`, `.claude/skills/reapdev.*/` 디렉토리 삭제
4. `.claude/commands/`, `.claude/skills/` 디렉토리 자체는 보존
5. `reap.`/`reapdev.`가 아닌 파일은 보존
6. migrate execute phase에서 cleanup 호출
7. init에서 cleanup 호출
8. 삭제된 파일 목록이 반환값으로 제공
9. unit test 통과
10. e2e test 통과

## Approach

- `cleanupLegacyProjectSkills()` 함수를 `src/core/integrity.ts`에 추가 — 이미 legacy 탐지 로직(`checkUserLevelArtifacts`)이 있는 모듈
- `readdir` + 패턴 매칭 + `rm`으로 삭제, 삭제된 파일 목록 반환
- migrate.ts `executeMain()`에서 호출 (backup 이후, 구조 변환 이전)
- init/common.ts `initCommon()`에서 호출 (디렉토리 생성 이전)

## Tasks

- [ ] T001 `src/core/integrity.ts` — `cleanupLegacyProjectSkills(projectRoot: string): Promise<string[]>` 함수 추가
- [ ] T002 `src/cli/commands/migrate.ts` — `executeMain()`에서 cleanup 호출 + completed/context에 결과 포함
- [ ] T003 `src/cli/commands/init/common.ts` — `initCommon()`에서 cleanup 호출
- [ ] T004 `tests/unit/integrity.test.ts` — `cleanupLegacyProjectSkills` unit test 추가
- [ ] T005 `tests/e2e/migrate.test.ts` — legacy cleanup e2e test 추가
- [ ] T006 빌드 + 전체 테스트 실행

## Dependencies

- T001 → T002, T003 (공통 함수 먼저)
- T001 → T004 (함수 구현 → unit test)
- T002, T003 → T005 (호출 추가 → e2e test)
- T004, T005 → T006 (테스트 작성 → 빌드 + 전체 실행)
