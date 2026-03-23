---
type: task
status: pending
priority: medium
source: github-issue-8
---

# reap status의 Completed Generations 카운트가 epoch 압축된 세대를 무시

`listCompleted()`가 `gen-*` prefix만 카운트하여 epoch.md로 압축된 세대가 누락됨.

## 위치
- `src/core/lineage.ts` — `listCompleted()`

## 해결 방향
- epoch.md 파일을 파싱하여 포함된 세대 수를 카운트에 합산
- 또는 epoch.md 메타데이터에 포함 세대 수 기록

## 참고
- GitHub Issue: #8
