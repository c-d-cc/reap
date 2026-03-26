---
type: task
status: consumed
consumedBy: gen-022-947193
consumedAt: 2026-03-26T05:41:56.744Z
priority: high
createdAt: 2026-03-26T05:41:17.820Z
---

# subagent prompt 공통화 — reap 지식 주입 함수 분리 및 전역 적용

## Problem

현재 REAP 지식 주입(genome, environment, vision, reap-guide)이 `evolve.ts`의 `buildSubagentPrompt()`에만 하드코딩.
evolve 외에 다른 곳에서 subagent를 생성할 때 (예: 향후 update agent, fix agent 등) 동일한 지식 주입이 필요하지만 재사용 불가.

## Solution

1. `src/core/` 에 공통 함수 분리 (예: `prompt.ts` 또는 `knowledge.ts`):
   - `loadReapKnowledge(paths)` → reap-guide + genome + environment + vision 로딩
   - `buildBasePrompt(knowledge, context)` → 공통 subagent prompt 기반 생성
2. `evolve.ts`의 `buildSubagentPrompt()`를 이 공통 함수 위에 구축
3. 향후 다른 subagent도 같은 함수로 지식 주입

## Files to Change

- `src/core/prompt.ts` (또는 knowledge.ts) — 신규: 공통 지식 로딩 + prompt 빌더
- `src/cli/commands/run/evolve.ts` — buildSubagentPrompt()를 공통 함수 기반으로 리팩토링
- `src/templates/reap-guide.md` — reap-guide backlog과 연동

## Dependencies

- reap-guide.md 작성 backlog과 함께 진행해야 함
