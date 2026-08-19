# Validation

## 검증 근거 표기

- `[실행]` — 이 세대에서 그 명령을 직접 돌렸다. **그 항목을 실행하는 명령을 지목할 수 있을 때만** 붙인다
- `[negative]` — 일부러 깨뜨려 검사가 fail 하는 것을 확인했다
- `[독해]` — 코드를 읽고 판단했다. 돌려보지 않았다

## 1. 기본 검사 (fresh)

| 항목 | 명령 | 결과 | 근거 |
|---|---|---|---|
| TypeCheck | `npm run typecheck` | 통과 (출력 없음) | `[실행]` |
| Build | `npm run build` | `index.js 0.61 MB` | `[실행]` |
| Unit | `npm run test:unit` | **600 pass / 0 fail** (45 files) | `[실행]` |
| E2E | `npm run test:e2e` | **302 pass / 0 fail** (36 files) | `[실행]` |
| Scenario | `npm run test:scenario` | **44 pass / 0 fail** (4 files) | `[실행]` |
| Daemon | `cd daemon && bun test tests/` | **130 pass / 0 fail** (25 files) | `[실행]` |
| 자기진단 게이트 | `bash scripts/check-self-diagnosis.sh` | `exit 0`, `ok` 19건 | `[실행]` |
| 문서 게이트 | `bash scripts/check-docs-version.sh` | 통과 (로케일 파리티 23×4) | `[실행]` |
| docs 빌드 | `cd docs && npx vite build` | `✓ built` | `[실행]` |
| 구조 진단 | `node dist/cli/index.js fix --check` | 0 error / **4 warning (전부 기존)** | `[실행]` |
| carrier 고아 | `bash scripts/list-carriers.sh --orphans` | 신규 고아 0 (§ 3 참조) | `[실행]` |

baseline 대비: unit 568 → **600** (+32), e2e 292 → **302** (+10), scenario·daemon 무변경.
(evaluator 지적 반영 후 수치. 1차 라운드는 597 / 300 이었다.)

`fix --check` 의 warning 4건은 전부 착수 시점과 동일하다 — lineage parent ×2, `longterm.md` 51줄,
`environment/summary.md` 297줄. 신규 0건.

## 2. 완료 기준 대조 (02-planning.md)

### C1 — 네 표면 + stamp + daemon 데이터 전부 부재, 개수 단언 뒤에

**충족** `[실행]` `[negative]`

`tests/e2e/uninstall.test.ts` "every REAP surface is gone and the user's own files are not".
순서를 강제한다: `status === "ok"` → `typeof removedCount === "number"` →
`removedCount >= commands + agents` → **그다음에야** 부재. 설치 상태의 개수(19 commands / 2 agents)는
`installedHome()` 이 uninstall 전에 단언한다.

게이트 § 8 이 같은 것을 **진짜 전역 설치**에서 확인한다 — `ok uninstall ran and reported 25 removals`
→ `ok every REAP surface is gone, including the package`.

### C2 — negative: 사용자 파일 · `reapdev.*` · 사용자 SessionStart hook 생존

**충족** `[실행]` `[negative]`

e2e 와 게이트 § 8 양쪽에서 확인. 무력화 시험: claude-code 제거 패턴을 `/.*/ ` 로 바꾸자
unit 1건 + e2e 1건 + 게이트 § 8 이 fail 했고, § 8 의 제거 수가 25 → **27** 로 늘어난 것이
"사용자 파일 2개를 더 지웠다"는 직접 증거였다.

### C3 — npx 형태에서 재설치가 일어나지 않는다

**충족** `[실행]` `[negative]` — **단, 처음 쓴 단언은 무력했다**

진입 훅 우회(`skipsUserLevelSync`)를 없앤 negative 에서 그 테스트가 **green 이었다**. 훅이 자산을
다시 깔아도 직후 uninstall 이 스탬프까지 지우므로 최종 상태가 동일하기 때문이다 — gen-086 이 걸린 것과
같은 모양이다.

구분자를 바꿨다: `~/.claude/agents/` **디렉토리**를 미리 지워두고 uninstall 후에도 없는지 본다.
`installAgents` 는 `ensureDir` 를 부르고 제거는 파일만 unlink 하므로, **디렉토리가 없다 = 재설치가 없었다**.
바꾼 뒤 negative 에서 fail 2건.

### C4 — 설치 형태 판정과 npm 인자가 unit 으로 고정

**충족** `[실행]`

`tests/unit/uninstall.test.ts` — global / local / npx / checkout / unknown 5종,
realpath 차이(`/var` vs `/private/var`)와 **정규화 없을 때 local 로 오판되는 mirror**,
`npmRemovalTargets` 의 checkout 제외, `REAP_PACKAGE` 가 `package.json` 과 일치하는지.

### C5 — 게이트 § 8 이 진짜 전역 설치를 지운다

**충족** `[실행]` `[negative]`

구현 **전** red: `FAIL reap uninstall --confirm exited 1 / error: unknown option '--confirm'`.
구현 후 green 4줄. negative 3종 전부 fire (§ 3).

### C6 — baseline 유지

**충족** `[실행]` — § 1 표.

### C7 — 검사를 먼저 실패시켰다

**충족** `[실행]` `[negative]` — § 3.

## 3. 무력화 시험 (negative) 전수

| # | 깨뜨린 것 | 어디가 fail 했는가 |
|---|---|---|
| 1 | `skipsUserLevelSync` 항상 false | e2e 2건 (개선 후. 개선 전에는 1건) |
| 2 | claude-code 제거 패턴 `/.*/ ` | unit 1 + e2e 1 + 게이트 § 8 (`my-command.md` 지목, 제거 수 25→27) |
| 3 | `~/.reap/` allowlist → sweep | unit 1 + e2e 1 |
| 4 | uninstall 의 npm 단계 skip | 게이트 § 8 (`npm-not-executed:{...}`) |
| 5 | 게이트 § 2 의 PATH 수정 제거 (+ 버전 shim) | 게이트 § 2 (`what got installed is not what was packed`) |

5번은 **조건을 강제해야 했다.** 실험 도중 개발자의 전역 reap 이 0.17.4 → 0.17.5 로 올라가
조건이 사라졌기 때문이다(03 § 사고 보고). `reap --version` 이 `0.17.0` 을 답하는 shim 을 PATH 앞에
두어 재현했다 — § 6 이 npm 버전을 추론하지 않고 `--ignore-scripts` 로 조건을 강제하는 것과 같은 이유.

## 4. carrier

`reap:carrier(user-level-asset-set)` 3파일 (adapter 2 + types),
`reap:carrier(reap-home-asset-set)` 5파일.

후자는 처음에 **고아였다** — `--orphans` 가 잡았고, 그 신호대로 같은 사실을 아는 나머지를 표시했다:
양 adapter 의 `installReapGuide`, `installStampPath`, reap 쪽 `DAEMON_ROOT`, daemon 패키지의 `daemon/src/paths.ts`.
daemon 은 **별도 npm 패키지라 상수 공유가 불가능**하므로 표식이 옳은 도구다(공유 가능하면 공유가 낫다).

남은 고아 `id` 는 `RELEASE_NOTES.md` 산문 안의 `reap:carrier(id)` 예시이며 **착수 전부터 있었다**
(`git show HEAD:RELEASE_NOTES.md | grep -c` 로 확인).

## 5. 이 검증이 보지 못하는 것

정직하게 적는다 — 통과는 "검사 범위 안에서 문제없음"일 뿐이다.

- **`npm uninstall -g` 의 실패 경로는 실행되지 않았다.** `runNpmUninstall` seam 에 실패를 주입하는
  unit 이 없다(계획 FR8 은 있었으나 seam 은 `execute()` 안에서만 쓰이고 `execute` 는 `emitOutput` 으로
  프로세스를 끝내 unit 에서 부르기 어렵다). 실패 시 앞 단계 결과가 보존된다는 것은 `[독해]` 다 —
  코드상 npm 호출이 마지막이고 결과가 `context.npm.error` 로만 흐른다.
- **Windows 는 표본 밖이다.** 자기를 지우는 npm 호출이 파일 잠금으로 실패할 수 있다는 서술은 `[독해]`.
- **`npx` 실제 경로는 재현하지 않았다.** e2e 는 `_npx` 를 **경로 문자열로** 판정하는 unit 과
  "스탬프 없는 상태"를 재현하는 e2e 로 나눠 덮었다. 진짜 `npx @c-d-cc/reap uninstall` 은 배포 후에만 가능하다.
- **daemon 이 실제로 떠 있을 때의 stop 은 § 8·e2e 에서 실행되지 않았다.** 양쪽 다 daemon 이 없는 포트를
  쓴다(`daemonStopped === null` 을 단언). 살아 있는 daemon 을 멈추는 경로는 기존
  `e2e/daemon-lifecycle.test.ts` case 2 가 덮으며, 그 테스트는 새 helper 를 경유해 통과한다 — 다만
  그것은 `daemon stop` 이지 `uninstall` 이 아니다.
- **로컬 설치(local) 형태의 실제 동작은 unit 판정뿐이다.** 게이트는 전역만 만든다.

## 6. 판정

**pass.**

모든 기본 검사와 게이트가 fresh 로 통과했고, 완료 기준 C1~C7 이 전부 충족됐으며, 각 신규 검사는
무력화 시험으로 유효성을 확인했다. § 5 의 미검증 항목은 전부 **기능 범위 밖이거나 배포 후에만 가능한 것**이며
계획된 완료 기준에 포함되지 않았다.


## 7. Evaluator 라운드 — 1건 high, 6건 low. 전부 처리했다

`reap-evaluate` 를 독립 검증자로 돌렸다. **모든 검사가 이미 초록인 상태에서** 다음을 찾아냈다.

### HIGH — 내가 넣은 게이트 수정이 다음 릴리즈를 red 로 만든다

evaluator 주장: § 2 의 `PATH="$PREFIX/bin:$PATH"` 는 postinstall 이 읽는 `reap --version` 을
**설치 중인 그 패키지**로 바꾼다. CI 는 `.dev-build` 를 찍지 않으므로(`scripts/build.sh` 는 `CI` 가
비어 있을 때만) `+dev` 조기 반환이 사라지고, `performAutoUpdate` 는 `installed === latest` 로만
판단하므로 **아직 배포되지 않은 상위 버전을 "latest 와 다르다"로 읽어 다운그레이드**한다.
`release.yml` 은 게이트를 `npm publish` **앞에서** 돌린다 → 버전을 올리는 순간 red.

**직접 재현했다** (`[실행]`, `scratchpad/ci/repro.sh`):

```
# tarball 에서 dist/.dev-build 제거 + version=0.99.0 → 재pack → PATH 수정과 함께 설치
packed    = d0b42784…
installed = dcfa945e…  (version 0.17.5)   ← 배포본으로 다운그레이드됨
RESULT: DIFFERENT — gate assertion would FAIL
```

**evaluator 가 옳다.** 내 변경이 만든 회귀이며, 고치는 것은 범위 확장이 아니라 **작업을 끝내는 것**이다.

수정: `check-version.ts` 의 판정을 `installed === latest` 에서
`hasNewerRelease(installed, latest)` = `semverGt(latest, installed)` 로 바꿨다.
비교는 `core/semver.ts` 가 소유한다(단일 소유자). 같은 재현 스크립트로:

```
packed    = c7dd0c16…
installed = c7dd0c16…  (version 0.99.0)
RESULT: identical — gate would pass
```

**사용자에게도 옳은 수정이다** — auto-update 가 뒤로 가지 않는다. 다만 영향 범위는 좁다:
로컬 빌드는 `+dev` 로 먼저 걸러지고, 배포된 버전은 정의상 latest 보다 앞설 수 없다.
**실제 피해자는 릴리즈 파이프라인과 CI 산출물로 설치하는 사람**이다 — 과장하지 않는다.

`hasNewerRelease` 를 export 해 **테스트가 실제 판정 함수를 부르게** 했다
(`tests/unit/check-version.test.ts`, 4 케이스). negative: `latest !== installed` 로 되돌리자 **2건 fail**.

### LOW 6건 — 처리 내역

| # | 지적 | 처리 |
|---|---|---|
| 1 | daemon 테스트의 `~/.reap/daemon` 부재 단언이 두 상태를 구분 못 한다. **D2 의 negative 가 없다** | 구분자를 **경과 시간**으로 바꿨다. `ensureDaemon` 은 3초 폴링 후 포기하고 비기동 경로는 즉시 반환한다 → `< 2500ms`. negative(`daemonRequest` 기반으로 되돌림)에서 **3201ms 로 fail**. 첫 시도(`daemonStopped === null`)는 **단독 실행 시 negative 에서도 통과했다** — 못 뜬 daemon 도 null 을 준다 |
| 2 | 게이트 § 8 의 `[ -d daemon ]` 이 공허하다 (§ 8 은 daemon 을 만들지 않는다). `.install-stamp` 에 before 단언 없음. bin symlink 미확인 | daemon 데이터를 **심고**, `.install-stamp` · daemon dir · bin link 에 before 단언 추가, 제거 후 **bin symlink 부재**도 확인 |
| 3 | unit "it never looks at the real home directory" 는 `mkdtemp` 의 성질이지 코드의 성질이 아니다 | **삭제** |
| 4 | npx 경로의 안내 문구가 틀렸다 — "패키지가 아직 설치돼 있다"는 npx 사용자에게 정반대다 | `packageMayRemain = !npmRan && kind !== "npx"` 로 분기, 문구도 "If the package is still installed…" 로 완화 |
| 5 | `npmRemovalTargets` 의 `checkout` 분기가 도달 불가 — 저장소의 workspace daemon 은 `source: "package"` 로 분류된다 | 가드는 유지하되 **§ 8 에 기록**: FR6 을 실제로 지키는 것은 install-kind 게이트이지 daemon-source 검사가 아니다 |
| 6 | T008 이 계획에 적힌 검증(`destroy.test.ts` 갱신) 없이 done 으로 표시됐다 | `tests/e2e/destroy.test.ts` 에 테스트 추가 — 제거 있을 때와 **no-op 일 때 양쪽**에서 `nextStep`/message 확인 |

### evaluator 가 나 대신 닫아 준 것

- **FR8 (npm 실패 격리) 을 `[독해]` 에서 실측으로 올렸다.** 격리 전역 prefix + `npm uninstall` 에 exit 1 을
  주는 shim → `executed:false, attempted:true, error:"npm ERR! simulated failure"`, 홈 자산은 전부 제거,
  패키지만 남음. § 5 첫 항목은 더 이상 미검증이 아니다.
- **진짜 `_npx` 경로 모양을 재현했다** — `<tmp>/_npx/abc123/node_modules/@c-d-cc/reap` 배치에서
  `installKind: npx`, 26 removed, npm 미호출.
- **파괴 안전성을 적대적으로 시험했다** — `~/.reap/` 하위 사용자 디렉토리, `/etc/hosts` 를 가리키는 symlink
  (링크만 끊기고 대상 무사), 디렉토리인 `reap.weird.md`(unlink 실패 → `kept` 로 정직하게 보고).
  깨뜨리지 못했다.

### 새로 추가한 것 — 살아 있는 daemon 을 실제로 멈춘다

evaluator 의 "확인 불가" 목록에 있던 항목이다. `spawnTestDaemon` 으로 격리 포트(17286)·격리 HOME 에
진짜 daemon 을 띄우고, `uninstall` 이 **그 pid 를 보고**하고, 포트가 조용해지고,
daemon 이 스스로 만든 `~/.reap/daemon/` 이 사라지는 것을 확인한다.

## 8. 이 검증이 여전히 보지 못하는 것 (§ 5 개정)

- **Windows** — 자기를 지우는 npm 호출이 파일 잠금으로 실패할 수 있다는 서술은 `[독해]`.
- **네트워크를 타는 진짜 `npx @c-d-cc/reap uninstall`** — 배포 후에만 가능하다. 경로 판정과
  "스탬프 없는 상태"는 각각 unit·e2e 로 덮었고 evaluator 가 실제 `_npx` 배치로도 확인했다.
- **로컬(local) 설치 형태의 실제 동작** — unit 판정뿐. 게이트는 전역만 만든다.
- **`source === "checkout"` 인 daemon 을 npm 인자에서 빼는 분기** — 현재 도달 불가(LOW 5).
  가드가 아니라 install-kind 게이트가 FR6 을 지킨다.
- **`reap daemon status` 는 여전히 보고하려고 daemon 을 띄운다** — D2 는 `stop` 만 고쳤다.
  범위 밖이며 completion hints 에 남긴다.

## 9. 판정 (개정)

**pass.**

evaluator 라운드 이후 재실행한 모든 검사가 통과했고(§ 1 수치 갱신), high 1건은 **원인을 고쳐**
red → green 을 재현으로 확인했으며, low 6건은 전부 처리했다. § 8 의 미검증 항목은 배포 후에만 가능하거나
계획된 완료 기준 밖이다.
