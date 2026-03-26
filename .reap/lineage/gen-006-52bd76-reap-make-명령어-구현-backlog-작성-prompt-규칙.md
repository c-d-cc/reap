---
id: gen-006-52bd76
type: embryo
goal: "reap make 명령어 구현 + backlog 작성 prompt 규칙"
parents: ["gen-005-944652"]
---
# gen-006-52bd76
`reap make backlog` CLI 명령어를 추가하고, evolve.ts 및 stage prompt에 backlog 작성 규칙을 반영했다.

### Changes
- `src/cli/index.ts` — `reap make <resource>` command 추가 (현재 backlog만 지원)
- `src/cli/commands/run/evolve.ts` — Backlog Rules: `reap make backlog` 사용 의무, Write 금지, Edit 안내
- `src/cli/commands/run/implementation.ts` — Genome/Environment Changes 섹션에 동일 규칙
- `src/cli/commands/run/planning.ts` — Backlog Rules 블록 추가

### Validation: PASS (typecheck, build, e2e 모두 통과)