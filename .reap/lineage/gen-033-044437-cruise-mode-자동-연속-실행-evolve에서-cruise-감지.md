---
id: gen-033-044437
type: embryo
goal: "Cruise mode 자동 연속 실행 — evolve에서 cruise 감지 시 N generation 자동 순회"
parents: ["gen-032-4baaef"]
---
# gen-033-044437
Cruise mode 자동 연속 실행 기능을 구현했다. `reap run evolve`에서 cruise mode가 활성화되어 있을 때, subagent prompt에 cruise loop 실행 지시를 포함시켜 자동으로 N generation을 연속 실행할 수 있게 했다.

### Changes
- `src/core/prompt.ts` — buildBasePrompt에 "Cruise Loop — Auto-Continuation" 섹션 추가 (cruiseCount 존재 시)
- `src/cli/commands/run/evolve.ts` — cruise 상태 파싱 + context 추가 (cruiseMode, cruiseCurrent, cruiseTotal) + prompt에 cruise mode 안내 추가
- `tests/unit/cruise-prompt.test.ts` — 6개 unit test 신규
- `tests/e2e/cruise-evolve.test.ts` — 5개 e2e test 신규

### Test Results
- 330 tests 전체 통과 (unit 186 + e2e 103 + scenario 41)