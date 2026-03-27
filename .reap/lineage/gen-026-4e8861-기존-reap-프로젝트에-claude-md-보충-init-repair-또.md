---
id: gen-026-4e8861
type: embryo
goal: "기존 reap 프로젝트에 CLAUDE.md 보충 — init --repair 또는 install-skills 확장"
parents: ["gen-025-6513c5"]
---
# gen-026-4e8861
`reap init --repair` 옵션을 추가하여 기존 reap 프로젝트에 CLAUDE.md를 자동 보충하는 기능을 구현.

### Changes
- `src/cli/commands/init/common.ts` — CLAUDE.md 처리 로직을 `ensureClaudeMd()` 함수로 추출 (initCommon과 repair에서 공유)
- `src/cli/commands/init/repair.ts` — 신규. repair 로직 (config 읽기 → CLAUDE.md 보충 → JSON 결과)
- `src/cli/commands/init/index.ts` — `--repair` 분기 추가
- `src/cli/index.ts` — `--repair` 옵션 등록
- `tests/e2e/init-repair.test.ts` — 6개 e2e 테스트

### Test Results
- 245 tests 전체 통과 (unit 126 + e2e 78 + scenario 41)