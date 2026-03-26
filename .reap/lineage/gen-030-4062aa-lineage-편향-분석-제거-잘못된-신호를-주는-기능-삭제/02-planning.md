# Planning — gen-030-4062aa

## Goal

lineage 편향 분석 기능 제거. "편향 경고"는 완성된 영역을 다시 건드리라는 잘못된 신호를 주므로 삭제한다.

## Completion Criteria

1. `analyzeLineageBias()` 함수가 vision.ts에서 완전히 삭제됨
2. `readAllLineageGoals()` 함수와 `LineageGoal` 타입이 lineage.ts에서 완전히 삭제됨
3. `buildVisionDevelopmentSuggestions()`에서 lineageGoals 파라미터와 stale goal 로직이 제거됨
4. completion.ts에서 관련 import와 호출이 모두 제거됨
5. 관련 테스트가 업데이트/제거됨
6. `npm run build` 성공
7. 기존 테스트가 모두 통과 (제거된 테스트 제외)

## Tasks

- [ ] T001 `src/core/vision.ts` — `analyzeLineageBias()` 함수 전체 삭제 (268행~365행), `LineageGoal` import 제거
- [ ] T002 `src/core/vision.ts` — `buildVisionDevelopmentSuggestions()`에서 lineageGoals 파라미터 제거, stale goal 감지 로직(#2) 제거
- [ ] T003 `src/core/lineage.ts` — `LineageGoal` 타입과 `readAllLineageGoals()` 함수 삭제
- [ ] T004 `src/cli/commands/run/completion.ts` — `analyzeLineageBias`, `readAllLineageGoals` import 제거, adapt phase에서 관련 호출 제거, `buildVisionDevelopmentSuggestions` 호출 수정
- [ ] T005 `tests/unit/vision.test.ts` — `analyzeLineageBias` 테스트 블록 삭제, `buildVisionDevelopmentSuggestions` 테스트에서 lineage 관련 수정
- [ ] T006 `tests/unit/lineage.test.ts` — `readAllLineageGoals` 테스트 블록 삭제
- [ ] T007 빌드 + 테스트 실행 검증

## Dependencies

T001~T003 (core) → T004 (CLI) → T005~T006 (tests) → T007 (검증)
