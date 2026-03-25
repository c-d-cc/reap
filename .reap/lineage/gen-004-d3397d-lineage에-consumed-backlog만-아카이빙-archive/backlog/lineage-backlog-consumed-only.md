---
type: task
status: consumed
consumedBy: gen-004-d3397d
priority: high
---

# Lineage에 consumed backlog만 아카이빙

## Problem
v0.16의 archive.ts가 `life/` 전체를 `cp(recursive: true)`로 lineage에 복사하므로, pending backlog까지 모두 lineage에 포함됨.
lineage는 해당 generation에서 실제로 소비(consumed)한 backlog만 보관해야 함.

## v0.15 Reference
v0.15 generation.ts (line 228-243):
- lineage의 backlog/에는 **consumed된 항목만** 복사
- consumed된 항목은 life/backlog/에서 삭제
- pending 항목은 life/backlog/에 유지 (다음 세대로 carry-over)

```typescript
const isConsumed = /status:\s*consumed/i.test(content);
if (isConsumed) {
  await writeTextFile(join(backlogDir, entry), content);  // lineage에 복사
  await unlink(join(this.paths.backlog, entry));           // life에서 삭제
}
```

## Solution
archive.ts 수정:
1. `life/` 복사 시 `backlog/` 디렉토리를 제외
2. consumed backlog만 별도로 lineage의 backlog/에 복사
3. consumed 항목은 life/backlog/에서 삭제
4. pending 항목은 life/backlog/에 유지

## Files to Change
- src/core/archive.ts
