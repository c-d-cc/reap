---
type: task
status: consumed
consumedBy: gen-025-6513c5
consumedAt: 2026-03-26T07:49:38.512Z
priority: medium
createdAt: 2026-03-26T07:31:54.657Z
---

# adapt phase에서 subagent의 자율 backlog 생성 방지 — Echo Chamber 원칙 위반

## Problem

gen-023의 adapt phase에서 subagent가 `나머지-스킬-prompt-cli-이전.md` backlog를 자율 생성.
실제로 해당 스킬들은 이미 1줄 패턴으로 되어있어 불필요한 backlog였음.

evolution.md의 Echo Chamber 방지 원칙: "있으면 좋겠다 수준은 backlog에 등록 후 인간 검토" + "[autonomous] 태그 부착"
— subagent가 검증 없이 backlog를 생성하고 autonomous 태그도 없었음.

## Solution

adapt phase의 prompt에서 backlog 생성 규칙을 강화:
1. subagent가 adapt에서 backlog를 생성할 때 반드시 `[autonomous]` 태그 부착 명시
2. backlog 생성 전 기존 코드/스킬 상태를 확인하도록 지시 추가
3. 또는: adapt에서 backlog 생성 자체를 금지하고 "제안"만 prompt에 포함 → 유저가 직접 생성

## Files to Change

- `src/cli/commands/run/completion.ts` — adapt phase prompt에 자율 backlog 생성 제한 규칙 추가
- `src/core/prompt.ts` — subagent prompt에 Echo Chamber 방지 규칙 강화
