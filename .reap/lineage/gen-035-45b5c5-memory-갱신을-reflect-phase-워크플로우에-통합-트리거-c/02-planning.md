# Planning — gen-035-45b5c5

## Goal
Memory 갱신을 reflect phase 워크플로우에 통합. 각 tier별 구체적 트리거와 criteria를 명시하여, AI가 "언제, 무엇을" 써야 하는지 명확히 한다.

## Completion Criteria
1. completion.ts reflect phase prompt에 memory 갱신 criteria가 포함된다
2. 프로젝트 genome evolution.md에 Memory criteria가 명시된다
3. 템플릿 evolution.md에도 동일 criteria가 반영된다
4. reap-guide.md Memory 섹션에 criteria가 추가된다
5. prompt.ts subagent prompt에 memory criteria가 포함된다
6. e2e 테스트로 reflect prompt에 memory criteria 포함 여부를 검증한다
7. 빌드 성공, 기존 테스트 통과

## Approach
모든 변경은 텍스트/prompt 수준. 코드 로직 변경 없음. 동일한 criteria 텍스트를 5곳에 일관되게 반영.

## Tasks
- [ ] T001 `src/cli/commands/run/completion.ts` — reflect phase prompt의 memory 지시를 criteria 기반으로 강화
- [ ] T002 `.reap/genome/evolution.md` — Memory 섹션에 tier별 갱신 criteria 추가
- [ ] T003 `src/templates/evolution.md` — Memory 섹션에 tier별 갱신 criteria 추가 (T002와 동일 내용)
- [ ] T004 `src/templates/reap-guide.md` — Memory 섹션 When to Update에 criteria 추가
- [ ] T005 `src/core/prompt.ts` — buildBasePrompt Memory 섹션에 criteria 포함
- [ ] T006 `tests/e2e/` — reflect prompt memory criteria 포함 여부 e2e 테스트 작성
- [ ] T007 빌드 + 전체 테스트 실행

## Dependencies
T001~T005 병렬 가능. T006은 T001 이후. T007은 전체 완료 후.
