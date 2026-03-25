# Learning — gen-008-e8af04

## Source Backlog
`backlog-timestamp-fields.md` — backlog frontmatter에 createdAt/consumedAt 추가

## Key Findings
- `createBacklog()`: frontmatter에 type, status, priority만 있음. createdAt 없음.
- `consumeBacklog()`: status를 consumed로 바꾸고 consumedBy 추가. consumedAt 없음.
- `BacklogItem` 인터페이스: createdAt, consumedAt 필드 없음.
- `scanBacklog()`: frontmatter 파싱에서 해당 필드 미처리.

변경 대상: `src/core/backlog.ts` 1개 파일.

## Clarity Level: High
