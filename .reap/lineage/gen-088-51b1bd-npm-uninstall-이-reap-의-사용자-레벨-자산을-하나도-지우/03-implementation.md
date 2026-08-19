# Implementation

## Completed Tasks

| Task | 내용 | 파일 | 상태 |
|---|---|---|---|
| T001 | adapter 계약에 `removeUserLevelAssets` + `UserLevelRemovalResult` | `src/adapters/types.ts` | done |
| T002 | claude-code 제거 구현 (slash / agents / settings.json) | `src/adapters/claude-code/install.ts` | done |
| T003 | opencode 제거 구현 (XDG 경유) | `src/adapters/opencode/install.ts` | done |
| T004 | adapter 배선 + `~/.reap/` allowlist 제거 | `src/adapters/{claude-code,opencode}/index.ts`, `src/adapters/index.ts` | done |
| T005 | 비기동 `stopDaemonIfRunning` + `stopCmd` 경유 | `src/cli/commands/daemon/{client,index}.ts` | done |
| T016a | 자기진단 게이트 § 8 작성 + **red 확인** | `scripts/check-self-diagnosis.sh` | done (red) |
| T006 | `reap uninstall` 명령 | `src/cli/commands/uninstall.ts` | done |
| T007 | 명령 등록 + 진입 훅 우회 | `src/cli/index.ts` | done |
| T008 | `destroy` 출력이 `reap uninstall` 을 가리킨다 | `src/cli/commands/destroy.ts` | done |
| T009 | README 5개 언어에 제거 절 | `README*.md` | done |
| T010 | reap.cc 5 로케일 + CLI 페이지 | `docs/src/i18n/translations/*.ts`, `docs/src/pages/CLIPage.tsx` | done |
| T011 | 번들 reap-guide 에 명령 문서화 (dog-fooding) | `src/templates/reap-guide.md` | done |
| T012 | unit 29건 | `tests/unit/uninstall.test.ts` | done |
| T013~T015 | e2e 8건 (제거·생존·prompt·양 client·2회 실행·npx 형태·negative·checkout npm·daemon 미기동) | `tests/e2e/uninstall.test.ts` | done |
| T016b | 게이트 § 8 green | — | done |
| D3a | 게이트가 pack 한 산출물을 설치·검증하게 함 | `scripts/check-self-diagnosis.sh` | done |
| D3b | 사용자 대면 잔여 경로를 backlog 로 | `.reap/life/backlog/auto-update-…md` | done |

## 게이트 § 8 — 먼저 실패시켰다 (조건 1)

구현 배선 **전에** § 8 을 쓰고 돌린 출력:

```
Checking uninstall...
  ok    installed state to remove (19 commands, 2 agents)
  FAIL  reap uninstall --confirm exited 1
        error: unknown option '--confirm'
```

앞의 `ok` 가 조건 재현을 증명하고(지울 것이 실제로 19+2 개 있었다), 뒤의 `FAIL` 이 검사가 명령을 실제로
부른다는 것을 증명한다.

## Discovered Tasks

### D2 — `daemon stop` 이 꺼진 daemon 을 띄운 뒤 죽인다 (계획 승인됨, 동작 변경 있음)

`stopCmd` 이 `daemonRequest("GET","/health")` 를 쓰는데 그 함수의 첫 줄이 `ensureDaemon()` 이다.

- **사용자 대면 동작이 바뀐다**: 이전에는 꺼져 있어도 띄웠다 죽이고 `"Daemon stopped (pid: N)"` 를 보고했다.
  이제는 `"Daemon is not running"` 이다.
- **기존 테스트 확인 결과**: `grep -rn "not running|Daemon stopped" tests/` → **0건**.
  `e2e/daemon-lifecycle.test.ts` case 2 는 daemon 을 먼저 띄운 뒤 stop 하므로 새 동작에서도 그대로 통과한다.
  즉 **이 동작을 단언하던 테스트는 존재하지 않았다** — 고칠 기존 테스트가 없다는 뜻이며, 동시에
  아무도 이 경로를 검증하고 있지 않았다는 뜻이다.

### D3 — **자기진단 게이트가 배포된 패키지를 진단하고 있었다** (범위 밖, 인과로 묶임 — 유저 판단 필요)

§ 8 을 배선 후 돌렸는데도 `unknown option '--confirm'` 이 그대로 나왔다. 추적 결과:

**게이트가 설치하는 것은 방금 pack 한 tarball 이 아니라 npm 에 배포된 0.17.5 다.**

측정 (전부 이 세대에서 실행):

| 확인 | 결과 |
|---|---|
| `tar -xzOf <tarball> package/dist/cli/index.js \| shasum` | `09d0983e…` (작업 트리와 동일) |
| 설치 후 `<prefix>/lib/node_modules/@c-d-cc/reap/dist/cli/index.js` | `dcfa945e…` (600418 B) |
| `curl` 로 받은 **npm 배포본** 0.17.5 의 같은 파일 | `dcfa945e…` — **byte-identical** |
| 같은 설치를 `--ignore-scripts` 로 | `09d0983e…` — 신선한 것이 남는다 |
| 격리 HOME 의 npm 로그 | `verbose argv "install" "--global" "@c-d-cc/reap@latest"` |

원인 체인:

1. `npm i -g <tarball>` → `scripts/postinstall.sh` → `reap check-version` → `performAutoUpdate`.
2. `getInstalledVersion()` 은 **`execSync("reap --version")`** 를 쓴다 — PATH 위의 reap 이며,
   설치 중인 그 패키지가 아니다. 이 머신에서는 개발자의 전역 설치 = **0.17.4**.
3. npm latest = **0.17.5** → `installed !== latest` → `npm install -g @c-d-cc/reap@latest` 실행.
4. npm 이 lifecycle script 에 `npm_config_prefix` 를 물려주므로 그 재설치가 **격리 prefix 안으로** 들어가
   방금 설치한 tarball 을 덮어쓴다.

영향은 § 8 에 한정되지 않는다. **§ 2~§ 7 이 전부 배포본을 진단해 왔다** — 게이트의 존재 이유
("배포될 산출물을 실제로 설치해 진단한다")가 조건부로 거짓이다. 조건은 "작업 트리 버전과 같은 번호가
이미 배포돼 있고, PATH 의 reap 버전이 latest 와 다를 때"이며 지금이 정확히 그 상태다.

**gen-087 때는 성립하지 않았다** — 배포본 0.17.5 안에 gen-087 의 `ensureUserLevelAssets` 가 들어 있다.
즉 0.17.5 배포는 gen-087 **이후**에 일어났고, 그 세대의 red/green 전이는 진짜였다. 결함은 그 배포 시점부터
활성화됐다.

이것은 **workaround 로 넘길 수 없다**(genome). 어떻게 처리할지는 유저 판단 사항이라 질문을 보냈다.


## 검사를 실제로 무력화해 보았다 (negative)

세 곳을 일부러 깨뜨리고 각각 red 를 확인한 뒤 복원했다.

| 깨뜨린 것 | 결과 |
|---|---|
| `skipsUserLevelSync` 가 항상 false (진입 훅 우회 제거) | e2e 2건 fail |
| claude-code 제거 패턴을 `/.*/` 로 (prefix anchor 제거) | unit 1건 + e2e 1건 fail |
| `~/.reap/` allowlist 를 sweep 으로 | unit 1건 + e2e 1건 fail |

**첫 번째가 이번 세대의 gen-086 재현이었다.** 진입 훅 우회를 없앴는데 npx 형태 테스트가 **green 이었다** —
훅이 자산을 다시 깔아도 그 직후 uninstall 이 스탬프까지 지우므로 **최종 상태가 동일**했기 때문이다.
부재만 보는 단언은 두 상태를 구분하지 못한다.

구분자를 바꿨다: `~/.claude/agents/` **디렉토리**를 미리 지워두고, uninstall 후에도 그것이 **없는지** 본다.
`installAgents` 는 `ensureDir` 를 부르고 제거는 파일만 unlink 하므로, 디렉토리가 없다는 것은
**재설치가 일어나지 않았다**는 뜻이다. 바꾼 뒤 negative 에서 fail 2건으로 늘었다.

## 테스트 결과 (전부 fresh)

| 스위트 | 이전 | 지금 |
|---|---|---|
| unit | 568 | **597** (+29) |
| e2e | 292 | **300** (+8) |
| scenario | 44 | 44 |
| daemon | 130 | 130 |

전부 0 fail. `check-docs-version.sh` 통과 (로케일 파리티 23 entries × 4).
`cd docs && npx vite build` 성공.

## 사고 보고 — 개발자 실제 홈에서 `uninstall --confirm` 을 실행했다

배선 확인 중 `node dist/cli/index.js uninstall --confirm` 을 **fake HOME 없이** 실행했다.
실제 `~/.claude/commands/reap.*` (19), `~/.claude/agents/reap-*` (2), `~/.reap/reap-guide.md`,
`.install-stamp`, settings.json 의 REAP hook 이 지워졌고 daemon 이 정지됐다.

**복구됨**: 다음 명령(`--help`)의 진입 훅이 gen-087 의 self-heal 로 전부 다시 설치했다.
확인: commands 19 / agents 2 / guide 존재 / hook 1.

**그리고 `~/.reap/reap-portal.2026-02-17.private-key.pem` 은 살아남았다** — allowlist 가
의도대로 동작한 실사례다. 다만 이것은 의도된 실험이 아니었으므로 증거로 삼되 공적으로 삼지 않는다.
이후 모든 수동 실행은 fake HOME + `REAP_DAEMON_PORT` 격리로만 했다.


## D3 해결 — 소스를 건드리지 않고 게이트를 정직하게 만들었다

유저에게 판단을 물었으나 "진행하라"는 지시를 받았고, **소스 변경 없이 게이트 범위 안에서 닫을 수 있음을
측정으로 확인**했다.

### 관측 하나가 진단을 바꿨다

negative 를 돌리려는데 재현이 안 됐다. `reap --version` 이 **0.17.5** 였다 — 아침에는 0.17.4 였다.
내 실험 중 auto-update 가 개발자의 전역 reap 을 실제로 올린 것이다(§ 사고 보고 2). 조건이 사라졌으므로
머신 상태에 기대는 negative 는 성립하지 않는다.

**조건을 강제했다** — `reap --version` 이 `0.17.0` 을 답하는 shim 을 PATH 앞에 놓았다.
§ 6 이 npm 버전을 추론하지 않고 `--ignore-scripts` 로 조건을 강제하는 것과 같은 이유다.

### 고친 것 둘

1. **§ 2 · § 8 의 설치를 `PATH="$PREFIX/bin:$PATH"` 로 수행.** 이것은 우회가 아니라 **실제 전역 설치의
   재현**이다 — 진짜 전역 설치에서는 npm 이 lifecycle script 전에 bin 을 링크하므로 postinstall 이 읽는
   `reap --version` 이 곧 그 설치다. 격리 prefix 만 그렇지 않았다.
2. **설치 직후 번들 sha 가 방금 pack 한 것과 같은지 단언.** 원인이 아니라 **성질**을 검사하므로,
   다음에 무엇이 산출물을 바꾸든 침묵이 통과로 읽히지 않는다.

### red → green (강제 조건 하에서)

| 상태 | 결과 |
|---|---|
| shim + PATH 수정 **없음** | `FAIL what got installed is not what was packed` / packed `d0b42784…` vs installed `dcfa945e…`(배포본) |
| shim + PATH 수정 **있음** | `ok installed, and it is the artifact we packed` → § 8 까지 전 절 통과 |

### 남은 사용자 대면 경로는 backlog 으로

`getInstalledVersion()` 이 PATH 를 읽는 것 자체는 그대로다. 전역 설치 사용자에게는 두 값이 같으므로
무해하지만, **로컬 설치 사용자는 전역 설치가 자기도 모르게 업그레이드된다.**
`auto-update-가-path-의-reap-버전을-읽는다-…md` 로 등록했다(측정·해법·변경 파일 포함).
게이트의 sha 단언은 그 수정 이후에도 남긴다.

## 게이트 § 8 negative — 셋 다 fire 했다

| 깨뜨린 것 | § 8 의 반응 |
|---|---|
| npm 단계 skip (`if (false)`) | `FAIL uninstall did not report a completed removal (npm-not-executed:…)` |
| prefix anchor 제거 (`/.*/ `) | `FAIL uninstall removed something that was not REAP's: …/my-command.md` (제거 수가 25 → 27 로 늘었다) |
| § 2 PATH 수정 제거 (shim 조건) | `FAIL what got installed is not what was packed` |

## 게이트 실측 비용 (조건 4)

| 실행 | real |
|---|---|
| § 8 이전 (baseline) | **16.58s** |
| § 8 포함 | **17.63s** |
| § 8 포함 (재실행) | **14.04s** |

§ 8 의 한계 비용은 **실행 간 편차 안에 있다** — tarball 전역 설치 1회 추가이며 네이티브 의존이 없다.
"수초"라는 예상은 과대평가였다. CI 매 push 에 두어도 문제없다.

## 최종 상태

- 게이트 `exit 0`, `ok` 19건
- unit **597** / e2e **300** / scenario **44** / daemon **130** — 전부 0 fail
- `check-docs-version.sh` 통과, `cd docs && npx vite build` 성공
- `package.json` 버전 무변경. tag / push / publish 없음


## Evaluator 라운드 이후 추가 변경 (04-validation.md § 7 에 상세)

| 항목 | 파일 |
|---|---|
| auto-update 가 다운그레이드하지 않게 — `hasNewerRelease` 신설 + export | `src/cli/commands/check-version.ts` |
| 그 판정의 unit 4건 | `tests/unit/check-version.test.ts` |
| npx 경로 안내 문구 (`packageMayRemain`) | `src/cli/commands/uninstall.ts` |
| 게이트 § 8: daemon 데이터 심기 + before 단언 3종 + bin symlink 부재 확인 | `scripts/check-self-diagnosis.sh` |
| daemon 비기동 구분자를 경과 시간으로 + **살아 있는 daemon 을 실제로 멈추는** e2e | `tests/e2e/uninstall.test.ts` |
| `destroy` → `uninstall` 포인터 e2e (T008 이 계획대로 갖지 못했던 검증) | `tests/e2e/destroy.test.ts` |
| 장식용 unit 1건 삭제 | `tests/unit/uninstall.test.ts` |

`REAP_HOME_ENTRIES` carrier 고아 신호를 따라 같은 사실을 아는 5곳을 표시했다
(양 adapter 의 `installReapGuide`, `installStampPath`, reap 쪽 `DAEMON_ROOT`, `daemon/src/paths.ts`).
daemon 은 별도 npm 패키지라 **상수 공유가 불가능**하므로 표식이 옳은 도구다.
