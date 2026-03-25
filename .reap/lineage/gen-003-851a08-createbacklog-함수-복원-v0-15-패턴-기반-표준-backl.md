---
id: gen-003-851a08
type: embryo
goal: "createBacklog 함수 복원 — v0.15 패턴 기반 표준 backlog 생성"
parents: ["gen-002-a64ab4"]
---
# gen-003-851a08
v0.15의 createBacklog 패턴을 v0.16에 복원. 표준 템플릿으로 backlog를 생성하는 함수와 CLI command 추가.

### Changes
- `src/core/backlog.ts` — `createBacklog()`, `toKebabCase()`, `CreateBacklogOptions` 추가
- `src/cli/index.ts` — `reap backlog create/list` command 추가

### Validation: PASS (e2e 62/62)