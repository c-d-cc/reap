---
id: gen-046-cd3e60
type: embryo
goal: "reap config CLI 구현 + status/run/config skill 정비"
parents: ["gen-045-8324f7"]
---
# gen-046-cd3e60
`reap config` CLI 명령을 구현하고, 3개 skill 파일(reap.config, reap.status, reap.run)을 정비했다.

### 주요 변경
- `src/cli/commands/config.ts` — 신규: config.yml 읽기 + JSON 출력
- `src/cli/index.ts` — config 명령 라우팅 추가
- `src/adapters/claude-code/skills/reap.config.md` — disable-model-invocation 제거, AI 안내 추가
- `src/adapters/claude-code/skills/reap.status.md` — disable-model-invocation 제거, 결과 해석 안내
- `src/adapters/claude-code/skills/reap.run.md` — disable-model-invocation 제거, 사용법 안내
- `tests/e2e/cli-commands.test.ts` — config 테스트 2개 추가

테스트: 454 pass (기존 452 + 2 신규)