---
id: gen-005-944652
type: embryo
goal: "start에서 backlog consume 마킹 + learning artifact에 근거 참조"
parents: ["gen-004-d3397d"]
---
# gen-005-944652
start에서 backlog consume 마킹 + learning artifact에 근거 참조 구현.

### Changes
- `start.ts` — --backlog 옵션, consumeBacklog 호출, sourceBacklog 저장
- `index.ts` (run, cli) — --backlog 옵션 전달
- `learning.ts` — sourceBacklog content를 context에 포함, prompt에 Source Backlog 섹션 안내

### Validation: PASS (init 62, lifecycle 16)