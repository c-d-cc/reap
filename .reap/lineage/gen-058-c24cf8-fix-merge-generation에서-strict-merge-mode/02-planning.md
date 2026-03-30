# Planning

## Goal

Merge generation의 merge stage에서 strict merge mode가 자동 bypass되도록 `buildStrictSection()` 수정.

## Completion Criteria

- [ ] merge generation일 때 strict merge HARD-GATE가 출력되지 않거나 허용 안내로 대체됨
- [ ] `buildBasePrompt()`와 `load-context.ts` 양쪽 모두 동일하게 동작
- [ ] 기존 테스트 유지 + merge bypass 테스트 추가
- [ ] `npm run build` 성공, 기존 테스트 pass

## Tasks

- [ ] T001 `src/core/prompt.ts` — `buildStrictSection()`에 `generationType?` 파라미터 추가, merge type이면 strict merge bypass
- [ ] T002 `src/core/prompt.ts` — `buildBasePrompt()`에서 `buildStrictSection()` 호출 시 `state.type` 전달
- [ ] T003 `src/cli/commands/load-context.ts` — `buildStrictSection()` 호출 시 `state?.type` 전달
- [ ] T004 `tests/unit/prompt-strict.test.ts` — merge generation bypass 테스트 추가
- [ ] T005 빌드 + 전체 테스트 실행
