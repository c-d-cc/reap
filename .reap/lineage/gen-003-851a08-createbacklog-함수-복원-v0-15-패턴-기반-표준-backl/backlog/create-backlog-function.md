---
type: task
status: consumed
consumedBy: gen-003-851a08
priority: high
---

# createBacklog 함수 복원 (v0.15 패턴)

## Problem
v0.16에 backlog 생성 함수가 없음. AI가 임의 형식으로 backlog를 작성하여 frontmatter 누락, 섹션 불일치 등 발생 가능.
v0.15에는 `createBacklog()` 함수가 표준 템플릿으로 backlog를 생성했음.

## v0.15 Reference
v0.15 backlog.ts (line 121-164):
- `createBacklog(backlogDir, { type, title, body?, priority? })` → filename 반환
- 표준 템플릿: frontmatter (type, status, priority) + # Title + ## Problem + ## Solution + ## Files to Change + ## Context
- type 검증: genome-change | environment-change | task
- filename: toKebabCase(title) + .md

## Solution
1. v0.16 backlog.ts에 `createBacklog()` 함수 추가 (v0.15 패턴 복원)
2. CLI command `reap backlog create` 추가 (optional)
3. evolve.ts subagent prompt에서 backlog 생성 시 `reap backlog create` 사용하도록 안내, 또는 최소한 표준 템플릿을 명시

## Files to Change
- src/core/backlog.ts — createBacklog 함수 추가
- src/cli/index.ts — backlog create command 추가 (optional)
