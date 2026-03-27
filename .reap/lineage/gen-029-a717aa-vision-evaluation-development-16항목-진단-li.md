---
id: gen-029-a717aa
type: embryo
goal: "Vision evaluation & development — 16항목 진단 + lineage 편향 분석 + vision 자동 제안"
parents: ["gen-028-872529"]
---
# gen-029-a717aa
REAP의 self-evolving 능력을 강화하는 3가지 기능을 구현했다:

### Changes
- `src/core/lineage.ts` — `readAllLineageGoals()` 추가: meta.yml + L1 compressed md frontmatter에서 전체 lineage goal 추출
- `src/core/vision.ts` — 3개 함수 추가:
  - `buildDiagnosisPrompt()`: 16항목 완성 기준별 정성적 진단 prompt
  - `analyzeLineageBias()`: 최근 N gen의 vision section별 편향 분석
  - `buildVisionDevelopmentSuggestions()`: 누락/미착수/과대 scope 감지 → 제안
- `src/cli/commands/run/completion.ts` — adapt phase에서 위 3개 분석을 prompt에 주입. bootstrap-only 16항목 텍스트 → 모든 maturity level 진단 프레임워크로 대체
- `tests/unit/lineage.test.ts` — 신규 9 tests
- `tests/unit/vision.test.ts` — 14 tests 추가

### Test Results
- 320 tests 전체 통과 (unit 195 + e2e 84 + scenario 41)