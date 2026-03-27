# Completion -- gen-040-773bb9

## Summary

v0.15에 있던 autoUpdateMinVersion guard를 v0.16에 이식했다. `check-version` 명령에 npm registry의 `reap.autoUpdateMinVersion` 필드를 조회하여, 설치된 버전이 minimum보다 낮으면 stderr로 경고하는 로직을 추가했다. 이미 SessionStart hook과 postinstall에서 `check-version`이 호출되고 있으므로, 추가 인프라 변경 없이 두 경로 모두에서 guard가 동작한다.

### 주요 변경
- `package.json`에 `reap.autoUpdateMinVersion: "0.16.0"` 필드 추가
- `check-version.ts`에 `queryAutoUpdateMinVersion()`, `semverGte()`, `checkAutoUpdateGuard()` 구현
- unit test 8개, e2e test 1개 추가 (406 total)

## Lessons Learned

- v0.16의 `check-version`은 이미 SessionStart hook + postinstall 양쪽에서 호출되는 구조라, 여기에 로직을 넣으면 자연스럽게 두 경로 모두 커버됨. 기존 인프라를 잘 활용한 사례.
- `emitOutput`은 `process.exit(0)`을 호출하므로, 여러 side-effect를 순차 실행하는 함수에서는 사용 불가. `console.error`가 적절한 대안.

## Next Generation Hints

- npm publish 후 실제 registry에서 `reap.autoUpdateMinVersion` 필드가 조회되는지 확인 필요
- v0.16.1 등 다음 버전 릴리즈 시 autoUpdateMinVersion 값을 적절히 올려야 함
