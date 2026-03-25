# Learning — gen-007-e29b32

## Goal
CLI command 패턴 통일 — inline 로직을 별도 파일로 분리

## Source Backlog
`cli-command-pattern-refactor.md` — index.ts에 3가지 패턴 혼재. 별도 파일 패턴으로 통일.

## Key Findings

### 현재 위반 (index.ts)
- **backlog** (line 52-93): action 안에 create/list 로직 inline + dynamic import
- **make** (line 95-127): action 안에 backlog 생성 로직 inline — backlog create와 거의 동일 코드
- **cruise** (line 129-149): action 안에 cruise 로직 inline + dynamic import
- **install-skills** (line 44-50): action 안에 1줄이지만 dynamic import

### 올바른 패턴 (참조)
- init: `import { execute as initExecute } from "./commands/init/index.js"` → `await initExecute(...)`
- status: `import { execute as statusExecute } from "./commands/status.js"` → `await statusExecute()`
- run: `import { execute as runExecute } from "./commands/run/index.js"` → `await runExecute(...)`

### 중복
- `backlog create`와 `make backlog`가 동일한 `createBacklog()` 호출. make.ts에서 backlog create를 재사용하면 됨.

## Clarity Level: High
