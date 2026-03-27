---
id: gen-025-6513c5
type: embryo
goal: "adapt phase에서 subagent 자율 backlog 생성 방지 — prompt 규칙 강화"
parents: ["gen-024-1415bf"]
---
# gen-025-6513c5
adapt phase에서 subagent의 자율 backlog 생성을 방지하기 위해 prompt 규칙을 3곳에서 강화.

### Changes
- `src/cli/commands/run/completion.ts` — adapt phase prompt: step 3 "Record as type: task in backlog" → "artifact 텍스트에 제안으로만 기록", step 4 제거, "CRITICAL — Backlog Creation Prohibited in Adapt Phase" 섹션 추가
- `src/core/prompt.ts` — Echo Chamber Prevention에 adapt phase 전용 규칙 2줄 추가
- `src/templates/reap-guide.md` — Critical Rules에 규칙 6번 추가

### Test Results
- 239 tests 전체 통과 (unit 126 + e2e 72 + scenario 41)