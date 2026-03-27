# Implementation Log

## Completed Tasks

### T001 `src/cli/commands/update.ts` -- 신규 파일 생성
v0.15/v0.16 분기 로직 구현:
- `detectV15()` -> migrate로 위임 (phase 파라미터 전달)
- v0.16: `backfillConfig()` (누락 필드 기본값 추가), `ensureDirectories()` (누락 디렉토리 생성), `ensureClaudeMd()` (CLAUDE.md 보수)
- 변경 없으면 "Nothing to update" 메시지

### T002 `src/cli/index.ts` -- 라우팅 추가
`reap update` 명령 + `--phase` 옵션 (v0.15 migration phase 지원).

### T003 `reap.update.md` -- skill 파일 변경
`reap init --migrate` -> `reap update` 호출로 변경. v0.15/v0.16 분기 설명 추가.

### T004 `tests/e2e/update.test.ts` -- e2e 테스트 5개
- up-to-date project -> "Nothing to update"
- config backfill -> 누락 필드 추가 확인
- missing directories -> 디렉토리 생성 확인
- CLAUDE.md repair -> 파일 복원 확인
- no project -> 에러 메시지 확인

### T005 빌드 + 테스트
- `npm run build` 성공
- `npm test` 411 pass (231 unit + 139 e2e + 41 scenario)
- 기존 406 + 신규 5 = 411
