# Planning — gen-043-5e6dca

## Goal
check-version.ts에 자동 업데이트 로직 추가. SessionStart/postinstall에서 npm registry의 latest 버전을 조회하고, config.yml의 autoUpdate가 true이면 자동 설치 + 프로젝트 동기화 수행.

## Completion Criteria
1. autoUpdate: true인 프로젝트에서 check-version 실행 시 latest 버전과 비교하여 업데이트 시도
2. autoUpdate: false이면 업데이트 skip
3. +dev 빌드에서는 업데이트 skip
4. autoUpdateMinVersion guard 통과 실패 시 업데이트 block (stderr 경고)
5. 네트워크 실패/타임아웃 시 silent skip (exit 0)
6. 업데이트 성공 시 `reap update` 실행하여 프로젝트 동기화
7. 기존 테스트 전체 pass (411개)
8. 새 함수에 대한 unit test 추가

## Approach
v0.15의 selfUpgrade() + session-start.cjs auto-update flow를 v0.16의 check-version.ts에 이식. 기존 helper 함수(semverGte, queryAutoUpdateMinVersion, getInstalledVersion)를 재사용하고, 새로 queryLatestVersion + performAutoUpdate 함수를 추가.

### 핵심 흐름
```
execute()
  → cleanupLegacyHooks() (기존)
  → cleanupLegacyProjectSkills() (기존)
  → performAutoUpdate()
      → getInstalledVersion()
      → skip if +dev or null
      → readAutoUpdateConfig() — .reap/config.yml에서 autoUpdate 읽기
      → skip if autoUpdate !== true
      → queryLatestVersion() — npm view @c-d-cc/reap version
      → skip if installed === latest
      → checkAutoUpdateGuard() 대신 inline guard (queryAutoUpdateMinVersion + semverGte)
      → execSync("npm install -g @c-d-cc/reap@latest")
      → execSync("reap update") — 프로젝트 동기화
      → stderr 로그 출력
```

### 설계 결정
- `checkAutoUpdateGuard()`는 기존 함수 유지 (별도 역할: guard 경고만). performAutoUpdate에서는 동일 로직을 inline으로 사용하여 불필요한 중복 호출 방지.
- config.yml 파싱에 YAML 라이브러리 사용 (이미 production dependency).
- `npm install -g` 사용 (v0.15의 `npm update -g`보다 명시적).

## Scope
- `src/cli/commands/check-version.ts` — 주요 변경
- `tests/unit/check-version.test.ts` — unit test 추가
- `tests/e2e/check-version.test.ts` — 기존 테스트는 변경 불필요 (exit 0 유지)

## Tasks
- [ ] T001 `src/cli/commands/check-version.ts` — queryLatestVersion() 함수 추가: npm view로 latest 조회
- [ ] T002 `src/cli/commands/check-version.ts` — readAutoUpdateConfig() 함수 추가: cwd의 .reap/config.yml에서 autoUpdate 필드 읽기
- [ ] T003 `src/cli/commands/check-version.ts` — performAutoUpdate() 함수 추가: 전체 auto-update flow 구현
- [ ] T004 `src/cli/commands/check-version.ts` — execute()에서 performAutoUpdate() 호출
- [ ] T005 `tests/unit/check-version.test.ts` — queryLatestVersion, readAutoUpdateConfig, performAutoUpdate unit test 추가
- [ ] T006 빌드 + 전체 테스트 실행 (npm run build && npm test)

## Dependencies
T001, T002 → T003 → T004 → T005 → T006
