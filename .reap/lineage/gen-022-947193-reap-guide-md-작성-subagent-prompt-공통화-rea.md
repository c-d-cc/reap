---
id: gen-022-947193
type: embryo
goal: "reap-guide.md 작성 + subagent prompt 공통화 (reap 지식 주입 체계 구축)"
parents: ["gen-021-82a4a0"]
---
# gen-022-947193
reap-guide.md 작성 + subagent prompt 공통화 완료. REAP 도구 사용법을 담은 가이드 문서를 만들고, evolve.ts의 프롬프트 빌드 로직을 `src/core/prompt.ts`로 추출.

### Changes
- `src/templates/reap-guide.md` (신규, 220줄): v16 구조에 맞는 REAP 가이드. 3-Layer Model, Genome Structure, Life Cycle, Key Concepts, Hook System, CLI Commands, Maturity System, Critical Rules 등 포함.
- `src/core/prompt.ts` (신규): `loadReapKnowledge(paths)` — guide + genome + environment + vision 병렬 로딩. `buildBasePrompt(knowledge, paths, state, cruiseCount?)` — subagent prompt 조립. `ReapKnowledge` 타입 정의.
- `src/cli/commands/run/evolve.ts` (리팩토링, 212줄 → 54줄): `buildSubagentPrompt()` 인라인 함수 제거, `prompt.ts` 함수로 교체.

### Test Results
- 195 tests 전체 통과 (unit 82 + e2e 72 + scenario 41)