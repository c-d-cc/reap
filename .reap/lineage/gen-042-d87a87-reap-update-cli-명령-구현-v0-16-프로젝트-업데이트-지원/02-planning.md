# Planning

## Goal

`reap update` CLI 명령 구현. v0.15 프로젝트는 migrate로 위임, v0.16 프로젝트는 구조 동기화(config backfill, 디렉토리 보충, CLAUDE.md 보수) 수행.

## Completion Criteria

1. `reap update` 명령이 v0.15 프로젝트에서 `reap init --migrate`와 동일하게 동작
2. `reap update` 명령이 v0.16 프로젝트에서 config 누락 필드 backfill 수행
3. `reap update` 명령이 v0.16 프로젝트에서 누락 디렉토리 생성 (있으면 skip)
4. `reap update` 명령이 v0.16 프로젝트에서 CLAUDE.md 보수
5. 이미 최신이면 "nothing to update" 메시지 출력
6. `/reap.update` skill이 `reap update` 호출로 변경됨
7. `npm run build && npm test` 통과 (기존 406 tests + 신규)

## Approach

### v0.15 감지 분기
`detectV15()` 호출 후 `reap init --migrate`로 delegate. 실제로는 migrate.ts의 execute를 직접 호출.

### v0.16 동기화 로직
1. **config backfill**: config.yml 읽기 -> ReapConfig 기본값과 비교 -> 누락 필드 추가 후 재작성
2. **디렉토리 보충**: initCommon의 ensureDir 목록과 동일한 디렉토리를 ensureDir (idempotent)
3. **CLAUDE.md**: ensureClaudeMd() 재사용
4. **결과 보고**: 변경된 항목 목록 + "nothing to update" 분기

### 패턴 준수
- `execute()` 함수 export (application.md convention)
- JSON stdout output (emitOutput/emitError)
- 기존 명령 구조와 일관성 유지

## Scope

### 변경 파일
- `src/cli/index.ts` -- `reap update` 명령 라우팅 추가
- `src/cli/commands/update.ts` -- 신규 파일, update 로직
- `src/adapters/claude-code/skills/reap.update.md` -- `reap update` 호출로 변경

### 테스트 파일
- `tests/e2e/update.test.ts` -- 신규, update 명령 e2e 테스트

### 범위 밖
- postinstall 변경 (이미 skills/reap-guide 처리)
- 기존 migrate 로직 수정

## Tasks

- [ ] T001 `src/cli/commands/update.ts` -- 신규 파일 생성. v0.15 분기 + v0.16 동기화 로직 구현
- [ ] T002 `src/cli/index.ts` -- `reap update` 명령 라우팅 추가
- [ ] T003 `src/adapters/claude-code/skills/reap.update.md` -- `reap update` 호출로 변경
- [ ] T004 `tests/e2e/update.test.ts` -- e2e 테스트 작성
- [ ] T005 빌드 + 전체 테스트 실행

## Dependencies

T001 -> T002 -> T003 -> T004 -> T005 (순차)
