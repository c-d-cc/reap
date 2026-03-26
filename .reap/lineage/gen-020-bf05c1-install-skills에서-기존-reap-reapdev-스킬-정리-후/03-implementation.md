# Implementation Log — gen-020-bf05c1

## Completed Tasks

### T001-T003: `src/adapters/claude-code/install.ts` — cleanup 로직 추가

- `unlink` import 추가
- `SKILL_PATTERN` 정규식 (`/^(reap|reapdev)\..+\.md$/`) 상수 추가
- `cleanupStaleSkills(targetDir)` 함수 신규 작성: `readdir` → 정규식 필터 → `unlink`로 삭제, 삭제된 파일 목록 반환
- `installSkills()`에서 `ensureDir` 이후, 복사 이전에 `cleanupStaleSkills()` 호출
- `emitOutput`에 `cleaned` 필드 추가, `completed` 배열에 `"cleanup-stale-skills"` 단계 추가
- message에 삭제된 stale 파일 수 포함

### T004: `tests/unit/install-skills.test.ts` — unit test 작성

- `SKILL_PATTERN` 정규식 검증 (9 tests):
  - reap.*.md, reapdev.*.md 매칭 확인
  - 비관련 파일 (.md가 아닌 파일, 다른 접두사, 확장자 없는 파일) 비매칭 확인
  - bare prefix (reap.md, reapdev.md) 비매칭 확인
- cleanup 동작 검증: stale 파일 식별, 빈 디렉토리, reap 파일 없는 디렉토리

### T005: 빌드 및 전체 테스트 실행

- `npm run build` 성공 (0.38MB bundle)
- `bun test tests/unit/` — 69 tests pass (8 files), 171 expect() calls

### 추가 수정: `package.json` 빌드 스크립트 dist 정리

- 수동 통합 테스트 중 발견: `cp -r`은 기존 dist의 삭제된 스킬 파일을 제거하지 않음
- `package.json`의 `build` 스크립트에 `rm -rf dist/adapters/claude-code/skills` 추가 (skills 복사 직전)
- 이로써 소스에서 삭제된 스킬 파일이 dist에 잔존하는 stale artifact 문제 해결
