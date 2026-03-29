---
id: gen-032-4baaef
type: embryo
goal: "reap destroy + reap clean CLI 명령 구현 (v0.15 패리티)"
parents: ["gen-031-a1fef3"]
---
# gen-032-4baaef
`reap destroy`와 `reap clean` CLI 명령을 구현하여 v0.15 패리티를 달성했다.

### Changes
- `src/cli/commands/destroy.ts` — destroy 명령 신규 구현 (destroyProject, cleanClaudeMd, cleanGitignore, execute)
- `src/cli/commands/clean.ts` — clean 명령 신규 구현 (cleanProject, cleanLineage, cleanLife, cleanDir, execute)
- `src/cli/index.ts` — destroy, clean 명령 등록
- `tests/e2e/destroy.test.ts` — 6개 e2e 테스트
- `tests/e2e/clean.test.ts` — 8개 e2e 테스트

### Test Results
- 319 tests 전체 통과 (unit 180 + e2e 98 + scenario 41)