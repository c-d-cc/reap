# Planning

## Summary
`createBacklog()` 함수를 `src/core/backlog.ts`에 추가하고, `reap run make backlog` CLI 커맨드를 구현한다.
잘못된 형식의 backlog 파일 `source-map-compression-constants.md`를 삭제한다.

## Technical Context
- **Tech Stack**: TypeScript, Node.js, Commander.js CLI
- **Constraints**: 파일 I/O는 `src/core/fs.ts` 유틸 사용 (writeTextFile), YAML frontmatter 형식

## Tasks

### Phase 1: Core 함수

- [ ] T001 `src/core/backlog.ts` -- `toKebabCase()` 헬퍼 함수 추가 (title을 kebab-case 파일명으로 변환)
- [ ] T002 `src/core/backlog.ts` -- `createBacklog()` 함수 추가: type 검증, YAML frontmatter 생성, 파일 저장
- [ ] T003 `src/core/backlog.ts` -- `VALID_BACKLOG_TYPES` 상수 export

### Phase 2: CLI 커맨드

- [ ] T004 `src/cli/commands/run/make.ts` -- `make` 커맨드 생성: argv 파싱, backlog 하위 커맨드 dispatch
- [ ] T005 `src/cli/commands/run/index.ts` -- COMMANDS에 `make` 등록

### Phase 3: 정리

- [ ] T006 `.reap/life/backlog/source-map-compression-constants.md` -- 잘못된 형식의 파일 삭제

### Phase 4: 빌드 검증

- [ ] T007 빌드 + 기존 테스트 통과 확인

## Dependencies
- T002는 T001에 의존 (kebab-case 함수 사용)
- T004는 T002에 의존 (createBacklog 호출)
- T005는 T004에 의존 (make 모듈 import)
- T006은 독립적
- T007은 T001~T006 완료 후 실행

## FR-Task Mapping
| FR | Task |
|----|------|
| FR1 createBacklog 함수 | T002 |
| FR2 type 검증 | T002 |
| FR3 priority 기본값 | T002 |
| FR4 kebab-case 파일명 | T001 |
| FR5 YAML frontmatter 형식 | T002 |
| FR6 make.ts 커맨드 | T004 |
| FR7 플래그 지원 | T004 |
| FR8 COMMANDS 등록 | T005 |
| FR9 잘못된 파일 삭제 | T006 |
