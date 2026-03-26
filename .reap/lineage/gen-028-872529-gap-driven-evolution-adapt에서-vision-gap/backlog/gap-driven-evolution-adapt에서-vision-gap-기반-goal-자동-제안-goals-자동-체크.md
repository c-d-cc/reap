---
type: task
status: consumed
consumedBy: gen-028-872529
consumedAt: 2026-03-26T08:48:02.220Z
priority: high
createdAt: 2026-03-26T08:25:58.129Z
---

# Gap-driven Evolution — adapt에서 vision gap 기반 goal 자동 제안 + goals 자동 체크

## Problem

현재 adapt phase에서 AI가 다음 goal을 제안하지만, vision/goals.md를 체계적으로 분석하지 않음.
이번 세션에서 직접 vision을 보며 작업을 orchestrate한 경험:
- AI가 vision을 읽고 우선순위를 판단했지만, 이 과정이 수동이었음
- backlog와 vision의 갭을 비교하는 로직이 코드에 없어서 매번 prompt 기반으로 수행
- 완료된 항목의 `[x]` 마킹도 수동 — generation이 어떤 vision goal을 달성했는지 자동 감지 불가

REAP의 근본 방향(self-evolving)을 실현하려면 이 gap 분석이 코드 수준에서 자동화되어야 함.

## Solution

### 1. Vision goals 자동 체크 마킹
- completion adapt에서 현재 generation의 goal/결과를 vision/goals.md의 미완료 항목(`[ ]`)과 대조
- 매칭되면 `[x]`로 마킹 제안 (자동 수정은 인간 확인 후)

### 2. Vision gap 기반 다음 goal 자동 제안
- adapt에서 vision/goals.md의 미완료 `[ ]` 항목 목록 추출
- backlog pending 항목과 cross-reference
- 우선순위 판단: v0.15 대비 갭, 의존성, backlog priority 종합
- "다음 generation 후보" 3개를 구조화된 형태로 제안

### 메타 분석 (이번 세션 회고)
이번 세션에서 AI가 자동화할 수 있었던 부분:
- vision goals를 읽고 "v0.15 대비 누락 기능" 목록 생성 → 이건 코드로 자동화 가능 (lineage 분석 + vision diff)
- backlog 우선순위 정렬 → high > medium, 버그 > 기능 규칙으로 자동화 가능
- "다음에 뭘 할까?" 판단 → vision gap + backlog + maturity 수준 종합 알고리즘

## Files to Change

- `src/cli/commands/run/completion.ts` — adapt phase에서 vision gap 분석 로직 호출
- `src/core/vision.ts` (신규) — goals.md 파싱, gap 추출, 자동 체크 제안
- 테스트 추가
