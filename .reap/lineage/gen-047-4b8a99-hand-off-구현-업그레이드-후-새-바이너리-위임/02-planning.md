# Planning

## Goal

autoUpdate에서 npm install 성공 후, 새 바이너리에 프로젝트 동기화를 위임(hand-off)한다. 구 바이너리가 동기화를 수행하는 현재 문제를 해결.

## Completion Criteria

1. `performAutoUpdate()`가 npm install 성공 후 `reap update --post-upgrade`로 새 바이너리에 위임
2. hand-off 성공 시 구 바이너리의 `reap update` 실행 skip
3. hand-off 실패 시 기존 fallback (`reap update`) 유지
4. `reap update --post-upgrade` 실행 시 v0.16 프로젝트 동기화만 수행 (v0.15 migration skip)
5. 기존 454 tests 전부 pass
6. `--post-upgrade` 관련 e2e 테스트 추가

## Approach

v0.15 패턴을 v0.16에 이식. 핵심 차이:
- v0.15는 console.log 출력, v0.16은 JSON stdout (`emitOutput`) — `--post-upgrade`도 JSON 출력 유지
- v0.16의 `update.ts execute()`는 `phase?: string` 파라미터 하나만 받음 — `postUpgrade?: boolean` 추가

## Scope

변경 파일:
- `src/cli/commands/check-version.ts` — handOffToNewBinary() 추가, performAutoUpdate() 수정
- `src/cli/commands/update.ts` — execute() 시그니처 변경, --post-upgrade 분기
- `src/cli/index.ts` — update 명령에 --post-upgrade 옵션 등록
- `tests/e2e/cli-commands.test.ts` — --post-upgrade e2e 테스트 추가

## Tasks

- [ ] T001 `src/cli/commands/check-version.ts` — `handOffToNewBinary()` 함수 추가 (execSync "reap update --post-upgrade", stdio: inherit, timeout: 120s, 성공 true/실패 false)
- [ ] T002 `src/cli/commands/check-version.ts` — `performAutoUpdate()`에서 npm install 성공 후 handOffToNewBinary() 호출. 성공 시 기존 `reap update` skip, 실패 시 fallback 유지
- [ ] T003 `src/cli/commands/update.ts` — `execute(phase?, postUpgrade?)` 시그니처 변경. postUpgrade=true이면 v0.15 detect skip, 바로 v0.16 sync 수행
- [ ] T004 `src/cli/index.ts` — update 명령에 `--post-upgrade` 옵션 추가, execute 호출 시 전달
- [ ] T005 `npm run build` — 빌드 확인
- [ ] T006 `npm test` — 기존 454 tests pass 확인
- [ ] T007 `tests/e2e/cli-commands.test.ts` — `reap update --post-upgrade` e2e 테스트 추가

## Dependencies

T001 → T002 (handOff 함수가 있어야 performAutoUpdate에서 사용)
T003, T004는 독립적으로 작업 가능
T005 → T006 → T007 (빌드 후 테스트, 테스트 후 신규 테스트 추가)
