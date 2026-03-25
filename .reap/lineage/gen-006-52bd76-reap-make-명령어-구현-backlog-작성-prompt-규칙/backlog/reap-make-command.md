---
type: task
status: consumed
consumedBy: gen-006-52bd76
priority: high
---

# reap make 명령어 구현 + backlog 작성 prompt 규칙

## Problem
1. 현재 `reap backlog create`로 backlog 생성은 가능하나, `reap make` 패턴으로 통합 필요 (v0.15: `reap make backlog`)
2. evolve/stage prompt에 backlog 작성 규칙이 없음 — AI가 Write로 직접 생성하여 형식 불일치 발생 가능
3. make 명령은 backlog 외에도 template 기반 파일 생성이 필요한 경우 확장 가능

## v0.15 Reference
evolve.ts line 123-125:
- backlog 생성 시 반드시 `reap make backlog` 사용
- Write 도구로 직접 생성 금지
- 생성 후 해당 파일을 편집하여 내용 채움

## Solution
1. `reap make backlog --type --title --body --priority` CLI command 추가
2. 기존 `reap backlog create`를 `reap make backlog`으로 이전 (또는 alias)
3. evolve.ts subagent prompt에 규칙 추가: "reap make backlog 사용, Write 직접 생성 금지, 생성 후 Edit으로 내용 채움"
4. 각 stage prompt (implementation, planning 등)에도 동일 규칙 명시

## Files to Change
- src/cli/index.ts — `reap make backlog` command
- src/cli/commands/run/evolve.ts — subagent prompt에 backlog 규칙
- src/cli/commands/run/implementation.ts — backlog 작성 규칙
- src/cli/commands/run/planning.ts — backlog 작성 규칙
