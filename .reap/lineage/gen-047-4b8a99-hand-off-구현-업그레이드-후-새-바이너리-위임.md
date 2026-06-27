---
id: gen-047-4b8a99
type: embryo
goal: "hand-off 구현 — 업그레이드 후 새 바이너리 위임"
parents: ["gen-046-cd3e60"]
---
# gen-047-4b8a99
autoUpdate에서 npm install 성공 후, 새 바이너리에 프로젝트 동기화를 위임하는 hand-off 메커니즘을 구현했다.

### 주요 변경
- `src/cli/commands/check-version.ts` — `handOffToNewBinary()` 추가, `performAutoUpdate()`에서 hand-off 시도 + fallback 유지
- `src/cli/commands/update.ts` — `--post-upgrade` 플래그 지원 (v0.15 migration skip, v0.16 sync만 수행)
- `src/cli/index.ts` — update 명령에 `--post-upgrade` 옵션 등록
- `tests/e2e/cli-commands.test.ts` — e2e 테스트 2개 추가

테스트: 456 pass (기존 454 + 2 신규)