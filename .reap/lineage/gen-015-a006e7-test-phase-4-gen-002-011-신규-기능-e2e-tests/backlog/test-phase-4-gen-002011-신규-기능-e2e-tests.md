---
type: task
status: consumed
consumedBy: gen-015-a006e7
consumedAt: 2026-03-25T16:14:07.423Z
priority: high
createdAt: 2026-03-25T15:41:37.121Z
---

# Test Phase 4: gen-002~011 신규 기능 e2e tests

## Problem
gen-002~011에서 추가된 기능에 대한 e2e 테스트가 없음.

## Solution
테스트 대상:
- CLAUDE.md 생성/append (gen-002) — init 후 CLAUDE.md 존재 + REAP section 포함
- evolution.md template 로딩 (gen-002) — init 후 evolution.md에 Clarity-driven 포함
- reap make backlog (gen-006) — CLI로 backlog 생성 + frontmatter 검증
- --backlog consume (gen-005) — start --backlog 후 consumed 마킹 + sourceBacklog 설정
- createdAt/consumedAt (gen-008) — timestamp 포함 검증
- archive consumed-only (gen-004) — lineage에 consumed만 남는지 검증
- CLI command 패턴 (gen-007) — 모든 command 동작 확인

## Files to Change
- tests/e2e/init-claude-md.test.sh (또는 .ts)
- tests/e2e/make-backlog.test.sh
- tests/e2e/backlog-consume.test.sh
- tests/e2e/archive-backlog.test.sh
