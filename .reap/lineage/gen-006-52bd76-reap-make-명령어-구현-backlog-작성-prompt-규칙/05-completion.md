# Completion — gen-006-52bd76

## Summary

`reap make backlog` CLI 명령어를 추가하고, evolve.ts 및 stage prompt에 backlog 작성 규칙을 반영했다.

### Changes
- `src/cli/index.ts` — `reap make <resource>` command 추가 (현재 backlog만 지원)
- `src/cli/commands/run/evolve.ts` — Backlog Rules: `reap make backlog` 사용 의무, Write 금지, Edit 안내
- `src/cli/commands/run/implementation.ts` — Genome/Environment Changes 섹션에 동일 규칙
- `src/cli/commands/run/planning.ts` — Backlog Rules 블록 추가

### Validation: PASS (typecheck, build, e2e 모두 통과)

## Lessons Learned

- `reap make <resource>` 패턴은 확장 가능한 좋은 설계. 향후 template, goal 등 추가 시 동일 패턴 사용 가능.
- 기존 `reap backlog create`를 유지하면서 새 명령을 추가하는 것이 하위 호환 측면에서 안전.
- stage prompt 수정은 여러 파일에 분산되어 있어, 중앙 관리 방법이 있으면 유지보수가 편할 것.

## Next Generation Hints

- `reap make` 확장: template, goal 등 추가 resource 지원
- stage prompt의 공통 규칙을 중앙 관리하는 방법 검토 (현재는 evolve.ts + 개별 stage 파일에 분산)
- 기존 pending backlog 8개 중 우선순위 높은 항목 처리
