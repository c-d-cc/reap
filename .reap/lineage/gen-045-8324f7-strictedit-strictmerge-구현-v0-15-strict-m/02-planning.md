# Planning

## Goal

`config.yml`의 `strict: boolean`을 `strictEdit: boolean`, `strictMerge: boolean`으로 분리하고, evolve prompt에 HARD-GATE로 주입하여 실제 enforce 로직을 구현한다.

## Completion Criteria

1. `ReapConfig` 타입에서 `strict` 필드가 `strictEdit`, `strictMerge`로 분리
2. `buildBasePrompt()`가 strictEdit/strictMerge 상태에 따라 HARD-GATE 섹션 주입
3. `reap init`이 `strictEdit: false, strictMerge: false`를 기본값으로 설정
4. `reap update`가 기존 `strict: boolean`을 `strictEdit/strictMerge`로 자동 변환
5. `reap init --migrate`가 v0.15 strict 값을 올바르게 변환
6. `integrity.ts`가 새 필드를 검증
7. 기존 테스트 수정 완료, 신규 테스트 추가
8. `npm run build && npm test` 통과

## Approach

v0.15의 `buildStrictSection()` 로직을 `src/core/prompt.ts`로 이식. config 변환은 `resolveStrict()` 패턴 적용 — 기존 `strict: true`는 `strictEdit: true, strictMerge: true`로 자동 변환.

## Scope

### In Scope
- `src/types/index.ts`
- `src/core/prompt.ts`
- `src/cli/commands/init/common.ts`
- `src/cli/commands/update.ts`
- `src/cli/commands/migrate.ts`
- `src/core/integrity.ts`
- `src/cli/commands/run/evolve.ts`
- 관련 테스트 파일

### Out of Scope
- docs/README 업데이트
- skill 파일(.md) 변경

## Tasks

- [ ] T001 `src/types/index.ts` — `strict: boolean` 제거, `strictEdit: boolean` + `strictMerge: boolean` 추가
- [ ] T002 `src/core/prompt.ts` — `buildStrictSection()` 함수 추가 + `buildBasePrompt()` signature에 config 파라미터 추가
- [ ] T003 `src/cli/commands/run/evolve.ts` — config를 `buildBasePrompt()`에 전달
- [ ] T004 `src/cli/commands/init/common.ts` — 기본값 `strict: false` → `strictEdit: false, strictMerge: false`
- [ ] T005 `src/cli/commands/update.ts` — CONFIG_DEFAULTS 변경 + `strict` → `strictEdit/strictMerge` 변환 로직
- [ ] T006 `src/cli/commands/migrate.ts` — v0.15 strict 값 변환 (`strict: true` → `strictEdit: true, strictMerge: true`)
- [ ] T007 `src/core/integrity.ts` — strict 검증을 strictEdit/strictMerge 검증으로 변경
- [ ] T008 `tests/unit/prompt.test.ts` — buildStrictSection() + buildBasePrompt() strict 주입 테스트 (신규)
- [ ] T009 기존 테스트 수정 — integrity, migrate, init-repair, merge scenario의 strict 필드 업데이트
- [ ] T010 `npm run build && npm test` — 빌드 및 전체 테스트 통과 확인

## Dependencies

T001 → T002 → T003 (타입 먼저, prompt 로직, evolve 연결 순서)
T001 → T004, T005, T006, T007 (타입 변경이 선행)
T008, T009는 구현 완료 후 작성
