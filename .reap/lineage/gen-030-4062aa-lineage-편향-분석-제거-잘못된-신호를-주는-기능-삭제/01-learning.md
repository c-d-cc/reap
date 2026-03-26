# Learning — gen-030-4062aa

## Goal
lineage 편향 분석 제거 — 잘못된 신호를 주는 기능 삭제

## Key Findings

### 제거 대상 분석 결과

1. **`analyzeLineageBias()` (vision.ts:275-365)**: 최근 N gen의 vision section별 분포를 분석하여 "편향 경고"와 "방치된 영역" 경고를 생성. 한 영역에 집중하는 것이 문제가 아닌데 경고를 주어 완성된 영역을 다시 건드리게 유도하는 잘못된 신호.

2. **`buildVisionDevelopmentSuggestions()` (vision.ts:374-454)**: 3가지 제안 생성:
   - (1) criteria 미커버 감지 — lineageGoals 무관
   - (2) stale goal 감지 — "최근 작업이 없는 unchecked goal" 경고. 같은 문제: 최근 작업이 없다는 것이 문제가 아님 → 제거
   - (3) large scope 감지 — lineageGoals 무관, 순수 visionGoals 기반
   - **결론**: stale goal 감지(#2) 제거. lineageGoals 파라미터 제거.

3. **`readAllLineageGoals()` (lineage.ts:138-182)**: completion.ts에서만 사용. analyzeLineageBias와 buildVisionDevelopmentSuggestions 호출 시에만 필요 → 제거 가능.

4. **`LineageGoal` 타입 (lineage.ts:129-132)**: readAllLineageGoals의 반환 타입. vision.ts에서 import → 함께 제거.

### 영향 범위

| 파일 | 변경 |
|------|------|
| `src/core/vision.ts` | `analyzeLineageBias()` 삭제, `buildVisionDevelopmentSuggestions()`에서 lineageGoals 파라미터 + stale goal 로직 제거, `LineageGoal` import 제거 |
| `src/core/lineage.ts` | `readAllLineageGoals()` 삭제, `LineageGoal` 타입 삭제 |
| `src/cli/commands/run/completion.ts` | `analyzeLineageBias` import + 호출 제거, `readAllLineageGoals` import + 호출 제거, `buildVisionDevelopmentSuggestions` 호출에서 lineageGoals 인자 제거 |
| `tests/unit/vision.test.ts` | `analyzeLineageBias` 테스트 전체 삭제, `buildVisionDevelopmentSuggestions` 테스트 수정 |
| `tests/unit/lineage.test.ts` | `readAllLineageGoals` 테스트 전체 삭제 |

### 유지 대상

- `buildVisionGapAnalysis()` — vision gap 분석 (gen-028). 미완료 goal 파악은 유효
- `buildDiagnosisPrompt()` — 16항목 진단 프레임워크. lineage 무관
- `buildVisionDevelopmentSuggestions()` — criteria 미커버 + large scope 감지는 유지 (lineageGoals 파라미터만 제거)

## Previous Generation Reference

gen-029에서 이 3개 함수(`analyzeLineageBias`, `readAllLineageGoals`, `buildVisionDevelopmentSuggestions`)를 추가. 이번 gen에서 편향 관련 로직을 정리.

## Backlog Review

- `reap clean` / `reap destroy` — 현재 goal과 무관. 유지.

## Context for This Generation

- Clarity: **High** — 제거 대상과 범위가 명확
- Embryo type이지만 코드 삭제 작업이므로 genome 수정 불필요
