---
type: task
status: pending
priority: medium
---

# e2e 테스트 — init CLAUDE.md 3가지 시나리오

## Problem
init에서 CLAUDE.md 생성/append 로직이 추가되었으나, e2e 테스트에서 검증하지 않음.

## Scenarios
1. **Empty directory** — `reap init` 후 CLAUDE.md 생성, REAP section + `.reap/genome/` 참조 확인
2. **Existing project, no CLAUDE.md** — 기존 코드가 있는 디렉토리에서 init 후 CLAUDE.md 생성 확인
3. **Existing project, with CLAUDE.md** — 이미 CLAUDE.md가 있는 프로젝트에서 init 후 기존 내용 보존 + REAP section append + 중복 방지 확인

## Files to Change
- scripts/e2e-init.sh — Test 7 추가
