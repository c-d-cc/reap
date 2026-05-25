---
id: gen-043-5e6dca
type: embryo
goal: "autoUpdate 자동 업데이트 구현 — SessionStart에서 최신 버전 확인 및 설치"
parents: ["gen-042-d87a87"]
---
# gen-043-5e6dca
check-version.ts에 자동 업데이트 로직을 구현했다. SessionStart/postinstall에서 npm registry의 latest 버전을 조회하고, config.yml의 autoUpdate가 true이면 자동으로 `npm install -g @c-d-cc/reap@latest` + `reap update`를 실행한다.

### 주요 변경
- `src/cli/commands/check-version.ts`: queryLatestVersion, readAutoUpdateConfig, performAutoUpdate 함수 추가. execute()에서 performAutoUpdate 호출.
- `tests/unit/check-version.test.ts`: readAutoUpdateConfig 5개 + queryLatestVersion 1개 테스트 추가

테스트: 417 pass (기존 411 + 신규 6)