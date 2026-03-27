# Implementation Log

## Completed Tasks

### T001 -- package.json에 reap.autoUpdateMinVersion 필드 추가
`reap.autoUpdateMinVersion: "0.16.0"` 필드를 package.json에 추가. npm publish 시 registry 메타데이터로 배포됨.

### T002 -- queryAutoUpdateMinVersion() 구현
`npm view @c-d-cc/reap reap.autoUpdateMinVersion`으로 npm registry에서 최신 패키지의 autoUpdateMinVersion을 조회. 타임아웃 10초, 실패 시 null 반환.

### T003 -- semverGte() 구현
v0.15의 검증된 패턴을 그대로 이식. major.minor.patch 3자리 비교, 외부 의존성 없음. `export`로 노출하여 unit test 가능하게 함.

### T004 -- checkAutoUpdateGuard() 구현
설치된 버전 조회 → +dev 빌드 skip → minVersion 조회 → 비교 → stderr 경고. 모든 에러는 silent catch.

### T005 -- execute()에서 checkAutoUpdateGuard() 호출
기존 legacy cleanup 후에 guard 체크 추가.

### T006 -- semverGte unit test 작성
`tests/unit/check-version.test.ts` -- 8개 테스트 케이스 (equal, greater/lesser major/minor/patch, mixed).

### T007 -- check-version e2e test 작성
`tests/e2e/check-version.test.ts` -- exit code 0 확인 (postinstall 안정성 보장).

## Architecture Decisions

- **export semverGte** -- v0.15에서는 module-private였지만, v0.16에서는 unit test를 위해 export. 함수 자체가 side-effect 없는 pure function이라 노출해도 문제 없음.
- **console.error for warning** -- `emitOutput`은 `process.exit(0)`을 호출하므로 사용 불가 (이후 legacy cleanup이 실행되지 않음). `console.error` (stderr)로 경고 메시지만 출력.
- **getInstalledVersion을 별도 함수로 분리** -- queryAutoUpdateMinVersion과 대칭 구조. 추후 mock 가능.
