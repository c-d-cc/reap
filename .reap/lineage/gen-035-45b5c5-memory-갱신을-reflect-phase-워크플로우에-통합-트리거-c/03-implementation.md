# Implementation Log — gen-035-45b5c5

## Completed Tasks

### T001 `src/cli/commands/run/completion.ts`
reflect phase prompt의 memory 지시를 1줄 → 14줄로 확장. tier별 구체적 criteria 포함. "if applicable" 제거.

### T002 `.reap/genome/evolution.md`
Memory 활용 규칙 아래에 "Memory 갱신 Criteria" 서브섹션 추가. Shortterm(필수)/Midterm/Longterm/갱신 안 할 것 4개 블록.

### T003 `src/templates/evolution.md`
T002와 동일한 내용을 영문으로 "Memory Update Criteria" 서브섹션으로 추가.

### T004 `src/templates/reap-guide.md`
"When to Update" 섹션 아래에 "Update Criteria" 서브섹션 추가. T003과 동일한 영문 criteria.

### T005 `src/core/prompt.ts`
buildBasePrompt의 Memory 섹션 끝에 "Memory Update Criteria" 4줄 요약 추가. memory가 로딩된 경우에만 출력.

### T006 `tests/e2e/completion-reflect.test.ts`
신규 e2e 테스트. completion reflect prompt에 memory criteria(Shortterm/Midterm/Longterm/mandatory/Do NOT write) 포함 여부 검증.

### T007 빌드 + 전체 테스트
351 tests 전체 통과 (unit 206 + e2e 104 + scenario 41).
