# Planning — gen-026-4e8861

## Goal

기존 reap 프로젝트(`.reap/` 이미 존재)에 CLAUDE.md를 자동으로 보충하는 `reap init --repair` 옵션 추가.

## Completion Criteria

1. `reap init --repair` 실행 시, `.reap/`이 있는 프로젝트에서 CLAUDE.md를 보충한다
2. CLAUDE.md가 없으면 새로 생성한다 (프로젝트명 + reap section)
3. CLAUDE.md가 있지만 reap 섹션이 없으면 append한다
4. CLAUDE.md가 있고 reap 섹션도 있으면 skip하고 알려준다
5. `.reap/`이 없는 프로젝트에서 `--repair` 실행 시 에러를 반환한다
6. `--repair` 없이 기존 `reap init` 동작은 변경되지 않는다
7. unit test 또는 e2e test로 repair 로직을 검증한다

## Approach

- `src/cli/commands/init/index.ts`에 `--repair` 옵션 분기 추가
- `src/cli/commands/init/repair.ts` 신규 파일 — repair 로직
- `initCommon.ts`의 기존 CLAUDE.md 로직(`getClaudeMdSection()`)을 재사용
- 프로젝트명은 `config.yml`에서 읽어옴
- JSON output으로 결과 반환 (repaired 항목, skipped 항목)

## Scope

### 변경 파일
- `src/cli/commands/init/index.ts` — `--repair` 옵션 추가, repair 분기
- `src/cli/commands/init/repair.ts` — 신규 (repair 로직)
- `src/cli/index.ts` — `--repair` 옵션 등록

### Out of scope
- CLAUDE.md 외 다른 파일 repair (향후 확장 가능하나 이번에는 CLAUDE.md만)
- install-skills 수정
- postinstall 자동 실행

## Tasks

- [ ] T001 `src/cli/index.ts` — init 커맨드에 `--repair` 옵션 추가
- [ ] T002 `src/cli/commands/init/index.ts` — `--repair` 옵션 분기: repair 모드이면 `.reap/` 존재 필수, repair 함수 호출
- [ ] T003 `src/cli/commands/init/repair.ts` — 신규 파일. repairInit() 구현: config 읽기 → CLAUDE.md 보충 → JSON 결과 출력
- [ ] T004 `src/cli/commands/init/common.ts` — CLAUDE.md 보충 로직을 별도 함수로 추출 (initCommon과 repair에서 공유)
- [ ] T005 빌드 + 수동 검증 (각 케이스)
- [ ] T006 테스트 작성 (e2e test — `reap init --repair` CLI 전체 흐름)

## Dependencies

- T004 → T003 (공통 함수 추출 후 repair에서 사용)
- T001, T002 → T003 (CLI 등록 후 repair 로직 연결)
- T005, T006 → T001~T004 완료 후
