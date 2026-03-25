---
type: task
status: consumed
consumedBy: gen-007-e29b32
priority: high
---

# CLI command 패턴 통일 — inline 로직을 별도 파일로 분리

## Problem
src/cli/index.ts에 3가지 패턴이 혼재:
1. 별도 파일 + top-level import (init, status, run) — **올바른 패턴**
2. inline 로직 + dynamic import (backlog, make, cruise) — **convention 위반**
3. backlog create와 make backlog가 거의 동일한 코드 중복

genome/application.md의 "CLI Command Structure" convention에 따르면:
- index.ts는 라우팅만
- 모든 command 로직은 commands/ 아래 별도 파일의 execute()

## Solution
1. `src/cli/commands/backlog.ts` — backlog create/list 로직 분리
2. `src/cli/commands/make.ts` — make backlog 로직 분리 (backlog.ts의 createBacklog 재사용)
3. `src/cli/commands/cruise.ts` 생성 또는 기존 core/cruise.ts에 execute 추가
4. index.ts에서 inline 로직 제거, import + execute 호출로 통일
5. backlog create와 make backlog의 코드 중복 제거

## Files to Change
- src/cli/index.ts — inline 로직 제거
- src/cli/commands/backlog.ts — 신규
- src/cli/commands/make.ts — 신규
- src/cli/commands/cruise.ts — 신규 또는 기존 파일 활용
