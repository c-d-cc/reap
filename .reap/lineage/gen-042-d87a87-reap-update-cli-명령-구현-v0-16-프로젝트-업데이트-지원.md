---
id: gen-042-d87a87
type: embryo
goal: "reap update CLI 명령 구현 — v0.16 프로젝트 업데이트 지원"
parents: ["gen-041-243ec9"]
---
# gen-042-d87a87
`reap update` CLI 명령을 구현했다. v0.15 프로젝트는 기존 migrate로 위임하고, v0.16 프로젝트는 config 누락 필드 backfill, 디렉토리 보충, CLAUDE.md 보수를 수행한다.

### 주요 변경
- `src/cli/commands/update.ts`: 신규. v0.15/v0.16 분기 + 동기화 로직
- `src/cli/index.ts`: `reap update` 명령 라우팅 추가
- `src/adapters/claude-code/skills/reap.update.md`: `reap update` 호출로 변경
- `tests/e2e/update.test.ts`: 5개 e2e 테스트

테스트: 411 pass (기존 406 + 신규 5)