# Planning

> gen-092 — auto-update 가 어느 버전을 읽고 어디에 설치하는가

## Human Confirmation

HARD-GATE 는 **사전 승인으로 충족됐다.** team lead 가 이 세대를 지시하며 (a) 결함 둘을 한 세대에서
근거를 따로 적어 처리할 것, (b) 결함 2 의 결론이 **"로컬 설치는 auto-update 를 하지 않는다"가 아닌
경우에만** 구현 전에 가져올 것, (c) 그 외에는 completion 까지 진행할 것을 명시했다.

아래 D2 의 결론은 정확히 (b)의 사전 승인 범위 안이다 → 에스컬레이션 조건 미충족, 진행한다.
범위를 벗어나는 판단이 생기면 그 시점에 멈춘다.

## Goal + Spec

`check-version.ts` 의 자동 동작이 **자기 자신에 대해** 옳은 값을 읽고, **자기 자신에게만** 작용하게 한다.

### 결함 1 — 어느 버전을 읽는가

`getInstalledVersion()` 이 `execSync("reap --version")` 으로 **PATH 의 reap** 을 읽는다.
이 코드가 속한 패키지가 아니다. 지금 이 저장소에서 관측되는 값이 0.17.5 vs 0.17.6 이다.

**근거(D1)**: 자동 업데이트의 판단 대상은 "이 코드가 속한 설치"다. 다른 설치의 버전을 근거로
자기를 올릴지 결정하는 것은 어떤 조건에서도 옳지 않다 — 두 값이 우연히 같을 때만 맞는다.
`src/cli/index.ts:readVersion()` 이 이미 옳게 하고 있으므로 **새 방법을 발명하는 것이 아니라
이미 있는 방법으로 통일**하는 것이다.

### 결함 2 — 어디에 설치하는가

7단계가 무조건 `npm install -g @c-d-cc/reap@latest` 다.

**근거(D2 — D1 과 독립적으로 성립한다)**: `npm install -g` 는 **디렉토리가 아니라 머신에** 작용한다.
그 작용이 정당한 유일한 경우는 **작용 대상이 자기 자신일 때**, 즉 전역 설치일 때다.

- `local` — 사용자는 그 프로젝트의 `package.json` 에 버전을 **고정**했다. 전역을 올리는 것은
  사용자가 언급조차 하지 않은 설치를 바꾸는 것이고, 로컬을 대신 올리는 것은 npm 이 소유한
  lockfile/manifest 결정을 REAP 이 뒤에서 뒤집는 것이다. **둘 다 하지 않는다.**
- `npx` — 일회용 실행이다. 그것이 **전역 설치를 만들어내면** 사용자가 설치를 피하려고 npx 를 쓴
  의도를 정면으로 뒤집는다.
- `checkout` — npm 이 관리하지 않는 소스 트리다.
- `unknown` — 무엇인지 모르는 채 머신을 바꾸지 않는다. **fail-closed 가 무료다**: `npm root -g` 를
  물을 수 없는 환경이면 `npm install -g` 도 실패한다. 잃는 것이 없다.

이 판단은 D1 의 수정 여부와 무관하게 참이다. D1 이 이것을 **만든 것이 아니라 드러냈다**
(backlog 의 정정 절이 지적한 그대로).

### 결함 3 — D1 이 **만들어내는** 문구 불일치 (이 세대에서 함께 처리)

`checkAutoUpdateGuard()` / `performAutoUpdate` 의 blocked 경고는
`Run: npm install -g @c-d-cc/reap@latest` 를 권한다. **지금은** 전역 버전을 재고 전역 명령을
권하므로 일치한다. D1 이후에는 **로컬 버전을 재고 전역 명령을 권하게 된다** — 재는 것과 처방이
갈린다. 내 변경이 직접 만들어내는 불일치이므로 workaround 금지 원칙상 함께 고친다
(genome § 인과로 묶인 검증 동작 fix 는 본 generation 에서 처리).

## Requirements

**FR1** `getInstalledVersion()` 은 이 코드가 속한 패키지의 `package.json` 버전을 돌려준다.
PATH 에 어떤 `reap` 이 있든 값이 달라지지 않는다.

**FR2** 로컬 빌드 판별(`dist/.dev-build` → `+dev.<hash>`)은 유지된다 — `performAutoUpdate` 2단계의
dev-build skip 이 이 접미사에 의존한다.

**FR3** "우리 버전"을 아는 곳은 **하나**다. 기존 사본 4곳(`cli/index.ts`, `update.ts`,
`load-context.ts`, `dump-state-sync.ts`)이 그 하나를 import 한다.

**FR4** `update.ts` / `load-context.ts` / `dump-state-sync.ts` 가 내놓는 버전 문자열은
**변경 전과 동일**하다 (`+dev` 없는 순수 버전). `lastMigratedVersion` 이 사용자 config 에 기록되므로
접미사가 새어들면 오염이다.

**FR5** `performAutoUpdate` 는 설치 종류가 `global` 일 때만 `npm install -g` 를 실행한다.
`local` / `npx` / `checkout` / `unknown` 은 실행하지 않고 이유를 담아 skip 한다.

**FR6** 버전 하한 경고 문구의 처방 명령은 설치 종류에 따라 달라진다.

**FR7** `performAutoUpdate` / `checkAutoUpdateGuard` 에 주입 seam 을 둬서 network·npm·설치 종류
없이 결정을 unit 으로 고정할 수 있다.

**FR8** 설치 종류 판정은 **업그레이드가 실제로 대기 중일 때만** 조회한다 — 매 SessionStart 에
`npm root -g` 를 추가로 spawn 하지 않는다.

## Completion Criteria

1. 가짜 `reap` shim 을 PATH 에 놓아도 `getInstalledVersion()` 이 자기 package.json 버전을 돌려준다
   — **수정 전 red 를 먼저 확인한 뒤** green.
2. `installKind` 가 `local`/`npx`/`checkout`/`unknown` 일 때 전역 설치 seam 이 **호출되지 않는다**
   — **seam 만 넣은 상태에서 red 를 먼저 확인한 뒤** guard 추가로 green.
3. `global` 일 때는 기존과 동일하게 전역 설치 + hand-off 가 일어난다.
4. `reap update` 의 `context.packageVersion` 과 `lastMigratedVersion` 이 baseline 과 동일
   (e2e `update-migration.test.ts` 무수정 통과).
5. unit / e2e / scenario 세 스위트 0 fail, unit 은 585 + 신규분.
6. `scripts/check-self-diagnosis.sh` 전 절 통과, `scripts/check-docs-version.sh` 통과.
7. `reap fix --check` 0 error / 2 warning (상속분) 유지.

## Approach — 왜 새 모듈 하나인가

같은 사실을 아는 곳이 다섯이고, genome 은 **"공유 가능하면 표식보다 공유"** 를 처방한다
(application.md). 표식을 다섯 개 심는 것은 사람이 매번 기억해야 하는 방식이고, 그 방식이
issue #22 에서 실패한 방식이다.

`src/core/package-info.ts` — **"이 코드가 속한 패키지에 관한 사실"의 단일 소유자**:

| export | 값 | 소비자 |
|---|---|---|
| `REAP_PACKAGE` | `"@c-d-cc/reap"` | 아래 전부 |
| `findPackageRoot(dir, name, readName)` | 위로 걸어 올라가 패키지 루트 | 아래 전부 |
| `packageVersion()` | `"0.17.6"` — 순수 버전 | update / load-context / dump-state-sync |
| `runningVersion()` | `packageVersion()` + `+dev.<hash>` | `cli/index.ts --version`, `check-version` |
| `InstallKind` / `detectInstallKind(deps)` | 설치 종류 | check-version, uninstall |

`findPackageRoot` / `detectInstallKind` / `REAP_PACKAGE` 는 **gen-090 이 `uninstall.ts` 에 이미
만든 것을 옮기는 것**이다 (새로 쓰지 않는다). 그것들은 이미 주입 seam 과 unit test 6종을 갖고 있다.

**왜 core 인가**: 두 command 가 쓰는 사실이고, genome 의 계층 규칙상 `core` 는 `cli` 를 import 하지
않는다. `cli/commands/uninstall.ts` 에 두고 `check-version.ts` 가 그것을 import 하는 것은
command 끼리의 우연한 결합이다.

**왜 `findPackageRoot` 가 고정 깊이보다 나은가**: 12단계까지 이름으로 찾으므로 **모듈 위치가
바뀌어도 값이 바뀌지 않는다**. 현재 4개 사본은 각자 다른 깊이 목록(2단계 / 3단계 / …)을 갖고 있고
그 차이는 자기 파일 위치에서 나온 것이다 — longterm 이 경고하는 번들 깊이 함정이 그것이다.
다만 안전을 위해 **찾기 실패 시 기존 고정 깊이 목록으로 폴백**한다 → 최악의 경우도 현행과 동일.

### 부수 효과 하나를 미리 적는다

`runningVersion()` 이 마커를 `<packageRoot>/dist/.dev-build` 에서 찾으므로, `bun src/cli/index.ts`
(= `npm run dev`) 로 실행할 때도 로컬 `dist/` 빌드가 있으면 `+dev.<hash>` 가 붙는다. 지금은
`src/.dev-build` 를 보므로 붙지 않는다. **번들 실행 경로는 완전히 동일하다**
(`dist/cli/index.js` 기준 `../.dev-build` == `<root>/dist/.dev-build`). 테스트·게이트·CI 는 전부
번들을 돌리므로 영향 0 이며, 값이 더 정직해지는 방향이다.

## Implementation Plan

### Phase A — 결함 1 (red 먼저)

- [ ] T001 `tests/unit/check-version.test.ts` 에 PATH shim 테스트 추가:
      임시 디렉토리에 `9.9.9` 를 출력하는 실행가능 `reap` 를 만들고 `PATH` 앞에 붙인 뒤
      `getInstalledVersion()` 이 **`package.json` 의 버전으로 시작**하는지 단언.
      **분리 단언**: 판정은 `startsWith(declared)` — 가짜 값 `9.9.9` 는 이것을 만족할 수 없다
      (`not.toBe("9.9.9")` 는 크래시·null 도 통과시키므로 그것만으로는 부족).
      **현 구현으로 실행해 red 를 기록한다.** (unit)
- [ ] T002 `src/core/package-info.ts` 신설 — `REAP_PACKAGE`, `findPackageRoot`, `readPackageName`,
      `packageVersion()`, `runningVersion()`. (unit: T003)
- [ ] T003 `tests/unit/package-info.test.ts` 신설 — `packageVersion()` 이 `package.json` 과 일치,
      `runningVersion()` 이 그것으로 시작, `REAP_PACKAGE` 가 선언과 일치(기존 uninstall 테스트의
      패턴 유지), `findPackageRoot` 폴백. (unit)
- [ ] T004 `src/cli/commands/check-version.ts` — `getInstalledVersion()` 을 `runningVersion()`
      위임으로 교체. **이름은 유지**한다(T001 의 red→green 이 같은 대상에 대해 성립해야 하고,
      호출부 2곳의 의미도 바뀌지 않는다). doc comment 에 *"installed = 이 코드가 속한 설치"* 를
      못박는다. → T001 green. (unit)
- [ ] T005 `src/cli/index.ts` `readVersion()` 삭제 → `runningVersion()` import. (e2e: `--version`)
- [ ] T006 `src/cli/commands/update.ts` / `src/cli/commands/load-context.ts` /
      `src/core/dump-state-sync.ts` 의 지역 `getPackageVersion()` 3개 삭제 → `packageVersion()`
      import. (e2e: `update-migration.test.ts` 가 값 동일성을 이미 단언한다 — FR4 의 검사다)

### Phase B — 결함 2 (seam → red → guard)

- [ ] T007 `detectInstallKind` / `InstallKind` / `sameDirectory` / `npmGlobalRoot` 를
      `uninstall.ts` → `package-info.ts` 로 **이동**. `UninstallDeps` 는
      `InstallKindDeps`(moduleDir/npmGlobalRoot/realpath/readPackageName)를 확장하는 형태로 분리.
      `uninstall.ts` 는 import 로 전환. (unit: T008)
- [ ] T008 `tests/unit/uninstall.test.ts` 의 import 경로를 새 모듈로 갱신. 테스트 본문 무변경 —
      **이동이 동작을 바꾸지 않았다는 것이 이 테스트의 통과로 증명된다**. (unit)
- [ ] T009 `check-version.ts` 에 `AutoUpdateDeps` seam 추가 (`installedVersion` / `latestVersion` /
      `minVersion` / `installKind` / `installLatestGlobally` / `handOff` / `syncWithCurrentBinary` /
      `log`). **이 시점에는 guard 를 넣지 않는다.**
- [ ] T010 `tests/unit/check-version.test.ts` 에 kind 별 테이블 테스트 추가 —
      `local`/`npx`/`checkout`/`unknown` 에서 `installLatestGlobally` 가 호출되지 않을 것,
      `global` 에서는 호출될 것. **T009 상태로 실행해 4건 red 를 기록한다.** (unit)
- [ ] T011 `performAutoUpdate` 에 install-kind guard 추가 (4단계 통과 후 kind 조회 → 5단계 하한
      guard → 6단계 kind guard → 7단계 설치). → T010 green. (unit)
- [ ] T012 `upgradeCommandFor(kind)` 추가 + 하한 경고 2곳(`performAutoUpdate` blocked /
      `checkAutoUpdateGuard`)에 적용. `checkAutoUpdateGuard` 에도 seam 추가.
      kind 조회는 **경고를 실제로 내보내는 분기 안에서만** 수행. (unit: T013)
- [ ] T013 `tests/unit/check-version.test.ts` 에 문구 테스트 — `local` 처방은
      `npm install @c-d-cc/reap@latest` 를 포함하고 **` -g ` 를 포함하지 않을 것**,
      `global` 처방은 `-g` 를 포함할 것. (두 상태를 분리하는 단언) (unit)

### Phase C — 검증·문서

- [ ] T014 `npm run typecheck` + `npm run build` + 세 스위트 전체. baseline 대비 신규분만 증가.
- [ ] T015 `bash scripts/check-self-diagnosis.sh` 전 절. (§ 2 의 번들 sha 단언이 이 수정의
      회귀 검사를 겸한다 — gen-088 이 남겨둔 그대로 사용하고 건드리지 않는다)
- [ ] T016 릴리즈 문서 보강 — `RELEASE_NOTES.md` / `RELEASE_NOTICE.md`(en·ko) /
      5개 로케일 changelog 의 **기존 0.17.6 항목에 한 줄 추가**. 버전 추가·수정 없음.
      `bash scripts/check-docs-version.sh` 통과 확인.
- [ ] T017 `bash scripts/list-carriers.sh --orphans` 로 새로 만든 사실이 고아 표식을 남기지
      않는지 확인 (이번 변경은 **공유**로 처리하므로 새 표식을 심지 않는 것이 정답이다 — 확인만).

## Test Strategy

| 대상 | 레벨 | 근거 |
|---|---|---|
| `packageVersion` / `runningVersion` | unit | 순수 파일 읽기, network 불필요 |
| "PATH 가 아니라 자기 것" | unit (PATH shim) | **red 먼저** 가능한 유일한 형태 |
| kind 별 설치 여부 | unit (주입 seam) | 실제 `npm install -g` 를 돌릴 수 없다 |
| 처방 문구 | unit (순수 함수) | 두 상태를 분리하는 단언 필요 |
| 버전 문자열 불변(FR4) | e2e (기존 `update-migration.test.ts`) | **무수정 통과가 곧 검사** |
| 번들 무결성 | 자기진단 게이트 § 2 sha 단언 | gen-088 자산 재사용 |

### 이 세대의 테스트가 **닿지 않는 경로** (미리 명시)

- 실제 `npm install -g` 실행 및 그 결과
- 실제 network `npm view` 응답
- 실제 npm postinstall 환경(`npm_config_*` 가 주입된 상태)에서의 `npm root -g` 응답
- 실제 SessionStart hook 발화
- Windows 경로/심볼릭 링크 실환경

앞의 셋은 **자기진단 게이트가 부분적으로 덮는다** — 게이트는 실제 tarball 을 격리 prefix 에
`npm i -g` 하므로 postinstall 이 실제로 돈다. 다만 게이트가 확인하는 것은 *"번들이 바뀌지
않았다"* 이지 *"어떤 분기를 탔다"* 가 아니다.

## Files to Change (strictEdit 범위)

**소스**
- `src/core/package-info.ts` *(신규)*
- `src/cli/commands/check-version.ts`
- `src/cli/commands/uninstall.ts`
- `src/cli/index.ts`
- `src/cli/commands/update.ts`
- `src/cli/commands/load-context.ts`
- `src/core/dump-state-sync.ts`

**테스트 (submodule `tests/`)**
- `tests/unit/package-info.test.ts` *(신규)*
- `tests/unit/check-version.test.ts`
- `tests/unit/uninstall.test.ts`

**문서**
- `RELEASE_NOTES.md`
- `RELEASE_NOTICE.md`
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts`

**REAP artifacts (reflect 단계)**
- `.reap/life/0{1..5}-*.md`
- `.reap/environment/summary.md`, `.reap/environment/source-map.md`
- `.reap/vision/memory/{shortterm,midterm,longterm}.md`

**건드리지 않는다**: `scripts/check-self-diagnosis.sh` (gen-088 자산), `package.json`(버전 유지),
`scripts/build.sh`, `scripts/postinstall.sh`.

## Additional Findings

- `npm pack --dry-run --json` → `dist/.dev-build` 가 tarball 에 **포함된다**(86개 중 1). 로컬 pack
  → 격리 설치본은 자기 버전을 `+dev` 로 읽어 auto-update 를 2단계에서 skip 한다. 발행본은
  `scripts/build.sh:61` 의 `CI` 가드로 마커가 없다.
- `src/core/notice.ts` 도 패키지 루트를 찾지만 `require.resolve` 기반이고 대상이 버전이 아니라
  `RELEASE_NOTICE.md` 경로다. **이번 통합 대상에 넣지 않는다** — 같은 사실이 아니고, 건드리면
  릴리즈 노티스 표시 경로에 불필요한 위험이 생긴다. [판단 기록]
- `handOffToNewBinary()` 와 fallback 의 `execSync("reap update")` 는 여전히 PATH 를 쓴다. 이것은
  **의도된 것**이다 — 전역 업그레이드 직후 PATH 의 reap 이 곧 새 바이너리이며, 그 분기는 이제
  `kind === "global"` 에서만 도달한다. 주석으로 못박는다.
- `--isolate` 없이 unit 을 돌리면 `mock.module` 보호가 사라진다(environment 기록). 이번 신규
  테스트는 `mock.module` 을 쓰지 않는다 — PATH 환경변수 조작과 주입 seam 만 쓰며, PATH 는
  `afterEach` 에서 복원한다.
