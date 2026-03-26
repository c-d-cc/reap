---
id: gen-008-e8af04
type: embryo
goal: "backlog frontmatter에 createdAt/consumedAt 타임스탬프 추가"
parents: ["gen-007-e29b32"]
---
# gen-008-e8af04
backlog frontmatter에 createdAt (생성 시점) / consumedAt (소비 시점) 타임스탬프 추가.

### Changes
- `src/core/backlog.ts` — BacklogItem, createBacklog, consumeBacklog, scanBacklog 수정

### Validation: PASS (e2e 62/62)