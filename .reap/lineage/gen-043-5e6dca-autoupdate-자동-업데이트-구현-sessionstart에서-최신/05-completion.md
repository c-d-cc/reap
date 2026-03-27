# Completion — gen-043-5e6dca

## Summary

check-version.ts에 자동 업데이트 로직을 구현했다. SessionStart/postinstall에서 npm registry의 latest 버전을 조회하고, config.yml의 autoUpdate가 true이면 자동으로 `npm install -g @c-d-cc/reap@latest` + `reap update`를 실행한다.

### 주요 변경
- `src/cli/commands/check-version.ts`: queryLatestVersion, readAutoUpdateConfig, performAutoUpdate 함수 추가. execute()에서 performAutoUpdate 호출.
- `tests/unit/check-version.test.ts`: readAutoUpdateConfig 5개 + queryLatestVersion 1개 테스트 추가

테스트: 417 pass (기존 411 + 신규 6)

## Lessons Learned

- v0.15의 selfUpgrade()와 session-start.cjs auto-update flow가 명확한 참조점을 제공하여 빠르게 이식할 수 있었다. 이전 버전의 코드를 참조 가능하게 보관하는 것의 가치.
- performAutoUpdate는 외부 프로세스(npm, reap) 호출이라 mock 없이는 실제 테스트가 어렵다. readAutoUpdateConfig처럼 pure logic을 분리하면 테스트 가능한 영역이 넓어진다.

## Next Generation Hints

- v0.15의 session-start.cjs에는 auto-update 결과를 SessionStart 출력에 반영하는 로직이 있었다 (autoUpdateMessage, updateSection). v0.16에서는 check-version이 SessionStart hook과 분리되어 있어 이 연동이 없다. 필요하다면 check-version의 결과를 stdout/stderr로 전달하는 방법을 고려.
- performAutoUpdate의 e2e 테스트를 추가하려면 mock npm registry나 dry-run 모드가 필요할 수 있다.
