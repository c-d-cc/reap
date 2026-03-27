---
type: task
status: consumed
consumedBy: gen-046-cd3e60
consumedAt: 2026-03-27T14:25:58.815Z
priority: high
createdAt: 2026-03-27T14:15:38.823Z
---

# reap config CLI 구현 + status/run/config skill 정비

## Problem

3개 skill에 문제가 있음:
1. **reap.config** — `reap config` CLI 명령이 없고 skill 내용도 비어있음. config.yml 조회/수정 불가.
2. **reap.status** — CLI는 동작하지만 skill에 `disable-model-invocation`이 설정되어 AI가 결과를 해석하지 않음. `reap status` 호출 후 결과를 사용자에게 보여주도록 해야 함.
3. **reap.run** — skill 내용이 비어있음. 사용자가 직접 쓸 일은 적지만 `disable-model-invocation` 제거하고 안내 문구 필요.

## Solution

1. **reap config**: CLI 명령 `reap config` 추가 — config.yml 내용을 JSON 출력. v0.15 참조: `~/cdws/reap_v15/src/cli/commands/run/config.ts`. skill에서 `reap config` 호출 + AI가 결과 표시.
2. **reap.status**: `disable-model-invocation` 제거, `reap status` 호출 + AI가 결과 해석.
3. **reap.run**: `disable-model-invocation` 제거, 사용법 안내 추가.

## Files to Change

- `src/cli/index.ts` — config 명령 라우팅
- `src/cli/commands/config.ts` — 신규 (config.yml 읽기 + JSON 출력)
- `src/adapters/claude-code/skills/reap.config.md` — 업데이트
- `src/adapters/claude-code/skills/reap.status.md` — 업데이트
- `src/adapters/claude-code/skills/reap.run.md` — 업데이트
