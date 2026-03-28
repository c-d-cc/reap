---
id: gen-030-4062aa
type: embryo
goal: "lineage 편향 분석 제거 — 잘못된 신호를 주는 기능 삭제"
parents: ["gen-029-a717aa"]
---
# gen-030-4062aa
lineage 편향 분석 기능을 제거했다. "편향 경고"는 작업이 한 영역에 집중되는 것을 문제로 취급하여 완성된 영역을 다시 건드리라는 잘못된 신호를 주고 있었다.

### Changes
- `src/core/vision.ts` — `analyzeLineageBias()` 함수 삭제, `buildVisionDevelopmentSuggestions()`에서 lineageGoals 파라미터와 stale goal 감지 로직 제거
- `src/core/lineage.ts` — `LineageGoal` 타입과 `readAllLineageGoals()` 함수 삭제
- `src/cli/commands/run/completion.ts` — 관련 import/호출 제거, `buildVisionDevelopmentSuggestions` 호출 수정
- `tests/unit/vision.test.ts` — analyzeLineageBias 6 tests, stale goal 1 test 삭제, 나머지 lineage 파라미터 제거
- `tests/unit/lineage.test.ts` — readAllLineageGoals 9 tests 삭제

### 유지된 기능
- `buildVisionDevelopmentSuggestions()` — criteria 미커버 감지 + large scope 감지는 유지 (lineage 의존 없이)
- `buildVisionGapAnalysis()` — vision gap 분석 유지
- `buildDiagnosisPrompt()` — 16항목 진단 프레임워크 유지

### Test Results
- 304 tests 전체 통과 (unit 179 + e2e 84 + scenario 41)