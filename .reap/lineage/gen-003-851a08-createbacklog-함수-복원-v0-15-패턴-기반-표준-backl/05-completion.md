# Completion — gen-003-851a08

## Summary
v0.15의 createBacklog 패턴을 v0.16에 복원. 표준 템플릿으로 backlog를 생성하는 함수와 CLI command 추가.

### Changes
- `src/core/backlog.ts` — `createBacklog()`, `toKebabCase()`, `CreateBacklogOptions` 추가
- `src/cli/index.ts` — `reap backlog create/list` command 추가

### Validation: PASS (e2e 62/62)

## Lessons Learned
1. v0.15에서 잘 동작하던 기능이 v0.16 rewrite에서 누락된 경우가 많음. v0.15 소스를 체계적으로 비교하는 것이 중요.
2. CLI command로 backlog 생성을 제공하면, AI가 직접 파일을 작성하는 것보다 형식 일관성이 보장됨.

## Next Generation Hints
- artifact-path-in-prompt (high) — subagent가 artifact를 올바른 경로에 생성하도록
- lineage-backlog-consumed-only (high) — lineage에 consumed만 아카이빙
