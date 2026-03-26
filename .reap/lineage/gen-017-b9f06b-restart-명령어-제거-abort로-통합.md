---
id: gen-017-b9f06b
type: embryo
goal: "restart 명령어 제거, abort로 통합"
parents: ["gen-016-3f239d"]
---
# gen-017-b9f06b
restart 명령어를 완전히 제거하고 abort로 통합 완료. 삭제 2파일(restart.ts, reap.restart.md), 수정 2파일(run/index.ts, maturity.ts), environment 업데이트(summary.md에서 restart.ts 제거, handler 수 19→18).

### Changes
- `src/cli/commands/run/restart.ts` — 삭제
- `src/adapters/claude-code/skills/reap.restart.md` — 삭제
- `src/cli/commands/run/index.ts` — restart import/handler/주석 제거
- `src/core/maturity.ts` — "Restart frequency" → "Abort frequency"
- `.reap/environment/summary.md` — restart.ts 제거, handler 수 수정, 테스트 설명 업데이트

### Validation: PASS (typecheck, build, unit 55/55, e2e 63/63 = 118 tests)