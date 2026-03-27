# Planning

## Goal

`check-version` 명령에 autoUpdateMinVersion guard를 구현하여, breaking change가 포함된 버전으로의 자동 업데이트를 차단하고 사용자에게 경고한다.

## Completion Criteria

1. `package.json`에 `reap.autoUpdateMinVersion` 필드가 존재한다
2. `reap check-version` 실행 시 npm registry에서 `reap.autoUpdateMinVersion`을 조회한다
3. 설치된 버전 < minVersion이면 stderr로 경고 메시지를 출력한다
4. 네트워크 실패, 타임아웃 등 에러 시 silent skip한다 (postinstall/hook 안정성)
5. unit test로 semver 비교 로직을 검증한다
6. e2e test로 check-version 명령의 guard 동작을 검증한다

## Approach

v0.15의 검증된 패턴을 v0.16 아키텍처에 맞게 이식:

- `check-version.ts`에 guard 로직 추가 (이미 SessionStart hook + postinstall에서 호출됨)
- `queryAutoUpdateMinVersion()` -- npm view로 registry 조회
- `semverGte()` -- inline semver 비교 (외부 의존성 없음)
- 경고 출력은 `console.error` (stderr) -- npm postinstall에서 stdout은 억제되지만 stderr는 경우에 따라 표시됨
- `process.exit(0)` 유지 -- guard는 정보성 경고일 뿐, install을 막지 않음

## Scope

**변경 파일:**
- `package.json` -- `reap.autoUpdateMinVersion` 필드 추가
- `src/cli/commands/check-version.ts` -- guard 로직 구현

**테스트 파일:**
- `tests/unit/check-version.test.ts` -- semver 비교 + guard 로직 unit test
- `tests/e2e/check-version.test.ts` -- CLI 실행 e2e test

**변경 없음:**
- `src/adapters/claude-code/install.ts` -- 이미 hook 등록 인프라 완비
- `scripts/postinstall.sh` -- 이미 `reap check-version` 호출 중

## Tasks

- [ ] T001 `package.json` -- `reap.autoUpdateMinVersion` 필드 추가 (`"0.16.0"`)
- [ ] T002 `src/cli/commands/check-version.ts` -- `queryAutoUpdateMinVersion()` 함수 구현
- [ ] T003 `src/cli/commands/check-version.ts` -- `semverGte()` 함수 구현
- [ ] T004 `src/cli/commands/check-version.ts` -- `checkAutoUpdateGuard()` 함수 구현 (설치 버전 조회 + 비교 + 경고)
- [ ] T005 `src/cli/commands/check-version.ts` -- `execute()`에서 `checkAutoUpdateGuard()` 호출 추가
- [ ] T006 `tests/unit/check-version.test.ts` -- semverGte unit test (같음, 크다, 작다, 패치만 다름 등)
- [ ] T007 `tests/e2e/check-version.test.ts` -- CLI 실행 시 정상 종료 확인

## Dependencies

T001 → T002~T005 (package.json 필드가 먼저 존재해야 의미 있음)
T002, T003 → T004 (guard 함수가 두 유틸을 사용)
T004 → T005
T002~T005 → T006, T007
