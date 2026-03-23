---
type: task
priority: high
status: consumed
consumedBy: gen-156-b0102e
---

# Lineage archiving 시 전체 backlog 복사 버그

## 문제
`src/core/generation.ts:238`에서 status에 관계없이 모든 backlog를 lineage에 복사함.
해당 generation에서 consumed한 backlog만 lineage에 들어가야 함.

## 현재 코드
```typescript
// Always copy to lineage  ← 문제
await writeTextFile(join(backlogDir, entry), content);
```

## 수정 방향
- `if (isConsumed)` 조건으로 consumed된 항목만 lineage에 복사
- pending/deferred 항목은 life/backlog에만 유지
