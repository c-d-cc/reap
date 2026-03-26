---
id: gen-004-d3397d
type: embryo
goal: "lineage에 consumed backlog만 아카이빙 — archive.ts 수정"
parents: ["gen-003-851a08"]
---
# gen-004-d3397d
archive.ts를 v0.15 패턴으로 수정하여, lineage에 consumed backlog만 아카이빙하고 pending은 life/에 유지.

### Changes
- `src/core/archive.ts` — backlog/ 제외 복사, consumed만 별도 lineage 아카이빙, consumed는 life에서 삭제

### Validation: PASS (init 62, lifecycle 16, multi-gen 34)