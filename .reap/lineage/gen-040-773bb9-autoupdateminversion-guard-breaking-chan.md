---
id: gen-040-773bb9
type: embryo
goal: "autoUpdateMinVersion guard — breaking change 자동 업데이트 차단"
parents: ["gen-039-a7a1ea"]
---
# gen-040-773bb9
v0.15에 있던 autoUpdateMinVersion guard를 v0.16에 이식했다. `check-version` 명령에 npm registry의 `reap.autoUpdateMinVersion` 필드를 조회하여, 설치된 버전이 minimum보다 낮으면 stderr로 경고하는 로직을 추가했다. 이미 SessionStart hook과 postinstall에서 `check-version`이 호출되고 있으므로, 추가 인프라 변경 없이 두 경로 모두에서 guard가 동작한다.

### 주요 변경
- `package.json`에 `reap.autoUpdateMinVersion: "0.16.0"` 필드 추가
- `check-version.ts`에 `queryAutoUpdateMinVersion()`, `semverGte()`, `checkAutoUpdateGuard()` 구현
- unit test 8개, e2e test 1개 추가 (406 total)