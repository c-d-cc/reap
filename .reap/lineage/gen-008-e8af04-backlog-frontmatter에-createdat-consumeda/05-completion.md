# Completion — gen-008-e8af04

## Summary
backlog frontmatter에 createdAt (생성 시점) / consumedAt (소비 시점) 타임스탬프 추가.

### Changes
- `src/core/backlog.ts` — BacklogItem, createBacklog, consumeBacklog, scanBacklog 수정

### Validation: PASS (e2e 62/62)

## Lessons Learned
- 작은 scope의 변경도 lifecycle을 거치면 추적 가능. 1개 파일 수정이지만 backlog consume → archive 흐름에서 시간 정보가 필요한 이유가 명확.
