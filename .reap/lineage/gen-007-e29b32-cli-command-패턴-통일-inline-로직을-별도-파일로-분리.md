---
id: gen-007-e29b32
type: embryo
goal: "CLI command 패턴 통일 — inline 로직을 별도 파일로 분리"
parents: ["gen-006-52bd76"]
---
# gen-007-e29b32
CLI index.ts의 inline 로직을 별도 commands/ 파일로 분리하여 패턴 통일. backlog, make, cruise, install-skills 4개 command를 별도 파일로 추출.

### Changes
- `src/cli/commands/backlog.ts` — 신규
- `src/cli/commands/make.ts` — 신규
- `src/cli/commands/cruise.ts` — 신규
- `src/cli/commands/install-skills.ts` — 신규
- `src/cli/index.ts` — 7개 command 모두 top-level import + execute 패턴 통일

### Validation: PASS (e2e 62/62)