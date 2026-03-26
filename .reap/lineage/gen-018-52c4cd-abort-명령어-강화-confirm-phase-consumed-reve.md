---
id: gen-018-52c4cd
type: embryo
goal: "abort 명령어 강화 — confirm phase + consumed revert + 소스 처리"
parents: ["gen-017-b9f06b"]
---
# gen-018-52c4cd
abort 명령어를 2-phase(confirm → execute)로 강화하여 v0.15의 핵심 기능을 복원했다.

### Changes
- `src/core/backlog.ts` — `revertBacklogConsumed` 함수 추가 (consumed → pending revert)
- `src/cli/index.ts` — `--source-action`, `--save-backlog` CLI 옵션 추가
- `src/cli/commands/run/index.ts` — abort일 때 options를 JSON으로 extra에 전달
- `src/cli/commands/run/abort.ts` — 2-phase 구현 (confirm prompt + execute 동작)
- `src/adapters/claude-code/skills/reap.abort.md` — 스킬 파일 업데이트
- `tests/e2e/abort.test.ts` — 신규 9개 e2e 테스트

### Validation: PASS (typecheck, build, 168/168 tests)