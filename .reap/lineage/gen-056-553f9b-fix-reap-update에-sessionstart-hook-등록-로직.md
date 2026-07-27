---
id: gen-056-553f9b
type: embryo
goal: "fix: reap update에 SessionStart hook 등록 로직 추가"
parents: ["gen-055-1e33bd"]
---
# gen-056-553f9b
`reap update` 실행 시 SessionStart hook이 등록되지 않던 문제를 수정. `registerSessionHooks()`를 export하고 `update.ts`의 v0.16 sync 단계에서 호출하도록 추가. idempotent 함수이므로 이미 등록된 경우 skip.

변경 파일: `src/adapters/claude-code/install.ts`, `src/cli/commands/update.ts` (총 3줄 변경)