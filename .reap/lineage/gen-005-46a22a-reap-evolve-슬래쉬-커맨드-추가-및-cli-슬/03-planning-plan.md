# Implementation Plan

## Summary
4개 backlog를 3개 Phase로 나누어 구현. Phase 1은 독립적인 슬래쉬 커맨드/템플릿 작업, Phase 2는 CLI 명령어(update, preset), Phase 3은 테스트와 동기화. 기존 cli/ → core/ → types/ 단방향 의존 유지. 새 파일은 최소화하고 기존 패턴을 따른다.

## Technical Context
- **Tech Stack**: Bun + TypeScript, Commander.js, YAML
- **Constraints**: 로컬 파일시스템만 사용, 외부 서비스 의존 없음, 기존 테스트 깨지지 않아야 함
- **Conventions**: 새 템플릿 추가 시 init.ts 복사 로직 동기화 필수

## Tasks

### Phase 1: 슬래쉬 커맨드 & 템플릿 (FR-001, FR-003)
- [x] T001 `src/templates/commands/reap.evolve.md` 생성 — current.yml 직접 읽기/쓰기로 새 Generation 시작, advance, back 수행하는 에이전트 지시문
- [x] T002 기존 7개 커맨드 템플릿(`src/templates/commands/reap.*.md`)의 "완료" 섹션에서 `reap evolve --advance` → `/reap.evolve` 안내로 변경
- [x] T003 `src/templates/commands/reap.growth.md` Gate에 git working tree clean 확인 추가
- [x] T004 `init.ts`의 `COMMAND_NAMES`에 `"reap.evolve"` 추가
- [x] T005 `.claude/commands/reap.evolve.md`, `.reap/commands/reap.evolve.md` 에 현재 프로젝트용 복사

### Phase 2: CLI 명령어 (FR-002, FR-004)
- [x] T006 `src/cli/commands/update.ts` 구현 — commands, templates, domain/README.md 동기화 + `--dry-run`
- [x] T007 `src/cli/index.ts`에 `update` 서브커맨드 등록
- [x] T008 `src/templates/presets/bun-hono-react/` 프리셋 생성 (principles.md, conventions.md, constraints.md)
- [x] T009 `init.ts`에 `--preset` 옵션 추가 — 프리셋 존재 시 해당 genome 복사, 없으면 기존 placeholder
- [x] T010 `ReapConfig` 타입에 `preset?: string` 필드 추가

### Phase 3: 테스트 & 검증
- [x] T011 `tests/commands/init.test.ts` — preset 옵션 테스트, reap.evolve 커맨드 복사 테스트 추가
- [x] T012 `tests/commands/update.test.ts` 신규 — update 명령 기본 동작, dry-run, 동기화 검증
- [x] T013 기존 테스트 전체 통과 확인 (`bun test`)
- [x] T014 TypeScript 컴파일 확인 (`bunx tsc --noEmit`)

## Dependencies
- T001 → T002 (evolve 커맨드 내용 확정 후 기존 커맨드 업데이트)
- T001 → T004, T005 (evolve 템플릿 생성 후 init/복사)
- T006 → T007 (update 로직 구현 후 CLI 등록)
- T008 → T009 (프리셋 파일 생성 후 init 로직)
- T010은 독립적 (types만 수정)
- Phase 1, Phase 2는 독립적으로 병렬 가능
- Phase 3은 Phase 1, 2 완료 후
