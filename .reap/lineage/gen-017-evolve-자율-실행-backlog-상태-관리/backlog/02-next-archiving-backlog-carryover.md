---
type: task
status: consumed
consumedBy: gen-017
priority: high
title: "backlog 상태 관리 체계 도입 + 아카이빙 시 이월 로직"
---

## 근본 원인
- backlog 항목에 상태(status) 필드가 없음
- "시작 전에 있던 항목(consumed)" vs "gen 중 새로 추가된 항목(pending)" 구분 불가
- Completion에서 consumed 항목 삭제, 아카이빙에서 나머지 전체 이동 → 임의 판단에 의존
- gen-016에서 실제로 미완료 이월 항목(03-evolve-autonomous-mode.md)이 소실됨

## 개선 방향

### 1. backlog frontmatter에 status 필드 추가
```yaml
---
type: task
status: pending | consumed
consumedBy: gen-XXX  # consumed일 때만
---
```

### 2. lifecycle 각 단계에서의 처리
- `/reap.start`: goal로 선택된 backlog 항목 → `status: consumed`, `consumedBy: gen-XXX`
- `/reap.objective`: 추가 backlog 발견 시 → `status: pending`
- `/reap.completion`: genome-change/environment-change 적용된 것 → `status: consumed`
- `/reap.next` (아카이빙):
  - `status: consumed` → lineage로 이동 (이력 보존)
  - `status: pending` → 새 backlog로 이월 (자동)

### 3. 이점
- AI 임의 판단 제거 — 상태 필드 기반으로 기계적 처리
- consumed 추적으로 어떤 gen에서 어떤 backlog가 해결됐는지 이력 추적 가능

## 변경 파일
- `src/templates/commands/reap.start.md` — consumed 마킹 단계 추가
- `src/templates/commands/reap.completion.md` — genome-change consumed 마킹
- `src/templates/commands/reap.next.md` — status 기반 아카이빙/이월 분기
- backlog frontmatter 스키마 문서화 (genome 또는 conventions)
