---
type: task
status: pending
priority: high
createdAt: 2026-03-26T06:56:50.943Z
---

# prompt 기반 flow를 CLI script로 이전 (merge, pull, knowledge, abort)

## Problem

4개 스킬에서 flow 제어 로직이 prompt(.md)에 정의되어 있음.
REAP의 원칙: slash command 수 최소화 + flow 제어는 CLI script가 담당 + prompt와 script 핑퐁 구조.

문제 스킬:
- **reap.merge** — 6단계 lifecycle 전체가 prompt에 나열
- **reap.pull** — 4가지 조건 분기가 prompt에 있음
- **reap.knowledge** — 인자별 4가지 절차가 prompt에 정의 (no argument일 때만 유저에게 선택지)
- **reap.abort** — 2-phase 분기가 prompt에 있음

## Solution

v15의 패턴을 따라 CLI script와 prompt를 핑퐁하는 구조로 전환:
1. 각 스킬 .md를 1줄 CLI 호출 + "stdout 지시를 따르라"로 축소
2. CLI가 현재 상태를 보고 다음 할 일을 JSON stdout으로 안내 (prompt 포함 가능)
3. AI가 stdout의 prompt를 실행 → 결과를 다시 CLI에 전달 (핑퐁)

### 각 스킬별 방향
- **merge**: `reap run merge` 오케스트레이터 명령 추가 → 현재 stage 확인 → 다음 stage 안내
- **pull**: `reap run pull` 명령 추가 → git fetch + 분석 → 결과에 따라 다음 action 안내
- **knowledge**: `reap run knowledge [reload|genome|environment]` 명령 추가 → 인자별 처리 → no argument시 선택지 prompt 반환
- **abort**: 이미 2-phase 구조가 CLI에 있으나 스킬이 상세 설명을 갖고 있음 → 스킬을 1줄로 축소

## Reference
- v15 패턴: `~/cdws/reap_v15/src/templates/commands/reap.merge.md` (1줄: `reap run merge $ARGUMENTS`)
- v15 CLI 핑퐁: stdout JSON의 `prompt` 필드로 AI에게 지시 반환

## Files to Change
- `src/adapters/claude-code/skills/reap.merge.md` — 1줄로 축소
- `src/adapters/claude-code/skills/reap.pull.md` — 1줄로 축소
- `src/adapters/claude-code/skills/reap.knowledge.md` — 1줄로 축소
- `src/adapters/claude-code/skills/reap.abort.md` — 1줄로 축소
- `src/cli/commands/run/` — merge, pull, knowledge 핸들러 추가 또는 확장
- `src/cli/index.ts` — 새 명령 등록
