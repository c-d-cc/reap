---
type: task
status: pending
---

# archiving 시 artifact의 REAP MANAGED 헤더 제거

## 현상
- artifact 파일에 `# REAP MANAGED — Do not modify directly.` 주석이 있음
- lineage로 아카이브 시 그대로 복사되어 혼란 유발
- lineage는 완료된 기록이므로 수정 금지 지시가 무의미

## 기대 동작
- `gm.complete()` 또는 completion archive에서 artifact를 lineage로 복사할 때
- 첫 줄이 `# REAP MANAGED`로 시작하면 해당 줄 strip 후 복사

## 관련 코드
- `src/core/generation.ts` — complete() 메서드의 artifact 복사 로직
