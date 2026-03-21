---
type: task
status: consumed
consumedBy: gen-096-57c421
---

# backlog title이 frontmatter title 대신 filename에서 추출됨

## 현상
`reap run start` scan 시 backlog item의 title이 frontmatter의 heading(`# 제목`)에서 추출되는데,
heading이 없으면 filename 기반으로 fallback됨. frontmatter에 `title` 필드가 있어도 무시됨.

## 기대 동작
1순위: `# heading` → 2순위: frontmatter `title` 필드 → 3순위: filename

## 관련 코드
- `src/core/backlog.ts:31` — `body.match(/^#\s+(.+)/m)?.[1] ?? filename.replace(...)`
