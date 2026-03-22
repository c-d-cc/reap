---
type: task
status: pending
priority: medium
---

# docs-update를 reapdev 스킬로 분리

## 문제

현재 docs 업데이트 로직이 `onLifeCompleted.docs-update.md` hook에만 있음.
hook 외에도 docs update가 필요한 타이밍이 있음 (예: 수동 실행, release 전 점검, 여러 generation 후 일괄 업데이트 등).

## 개선 방향

1. `reapdev.docsUpdate` 스킬 생성 — docs-update.md의 전체 로직을 스킬로 이동
2. `onLifeCompleted.docs-update.md` hook은 해당 스킬을 호출하는 1줄 wrapper로 변경
3. 사용자가 `/reapdev.docsUpdate`로 언제든 수동 실행 가능
