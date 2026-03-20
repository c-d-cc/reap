---
type: task
status: consumed
consumedBy: gen-080-96807d
priority: medium
---

# Hook 이벤트 이름 수정

## 변경
- `onGenomeResolved` → `onGenomeMated` (이름 변경)
- `onSourceMerged` 추가 (신규 이벤트)

## 수정 대상
- docs 번역 (en.ts, ko.ts, ja.ts, zh-CN.ts) — hook event 테이블
- README 4개 — hook event 테이블
- src/templates/hooks/reap-guide.md — hook event 목록
- .reap/genome/constraints.md — hook event 목록
- .reap/genome/domain/hook-system.md — hook event 정의
- src/templates/commands/reap.completion.md — hook 실행 참조
- src/templates/commands/reap.next.md — hook 실행 참조
