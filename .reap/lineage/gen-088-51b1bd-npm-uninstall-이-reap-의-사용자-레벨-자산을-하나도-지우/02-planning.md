# Planning

## Goal

`npm uninstall` 이 REAP 의 사용자 레벨 자산을 하나도 지우지 않는다 — **제거 경로 자체가 없다.**
`reap uninstall` 을 신설해 daemon 정리와 npm 패키지 제거까지 한 명령으로 수행하고,
이미 지워버린 사용자를 위한 `npx` 회수 경로를 함께 만든다.

Clarity: **HIGH** (01-learning.md §Clarity). 브레인스토밍 생략, 아래 두 결정만 닫고 바로 분해한다.

## 닫은 결정 2건

### D1. npm 제거를 실행할 설치 형태를 어떻게 판정하는가

`import.meta.url` 에서 위로 올라가 `name === "@c-d-cc/reap"` 인 `package.json` 을 찾아 패키지 루트를 얻고,
그 루트를 담고 있는 `node_modules` 디렉토리를 `npm root -g` 의 출력과 비교한다. 같으면 **global**,
아니면 경로에 `_npx` 가 있으면 **npx**, `node_modules` 안이면 **local**, 그 외는 **checkout**.

- **global 일 때만** 실제 `npm uninstall -g` 를 실행한다.
- 나머지 전부(npx / local / checkout / 판정 실패)는 **실행하지 않고 명령 문자열만 출력**한다.
  backlog 의 지침 그대로 — 사용자의 다른 설치를 지우는 것보다 안 지우는 쪽이 낫다.

**realpath 정규화 필수.** macOS 의 `/var` → `/private/var` symlink 때문에 두 경로가 같은 곳을 가리키면서
문자열이 다르다. node 는 bin symlink 를 해석해 realpath 를 주고 `npm root -g` 는 설정된 prefix 를 그대로
돌려준다 — 정규화 없이는 **전역 설치가 항상 "global 아님"으로 판정된다**. (gen-069 이 같은 함정에 걸렸다.)

대안으로 검토한 "경로 모양으로 판정"(`.../lib/node_modules/@scope/pkg`)은 기각 — Windows 전역 레이아웃에
`lib` 이 없다. `npm root -g` 는 npm 자신에게 묻는 것이라 플랫폼 분기가 없다.

### D2. `daemon stop` 의 기동 부작용을 이번 세대에서 함께 고친다 — Yes

현재 `stopCmd` 는 `daemonRequest("GET","/health")` 를 쓰고 `daemonRequest` 는 `ensureDaemon()` 으로
시작한다 → **꺼져 있으면 띄운 다음 죽인다.** uninstall 이 그 경로를 쓰면 지우려는 순간에 daemon 을 기동시켜
`~/.reap/daemon/` 을 다시 만든다.

evolution.md 「인과로 묶인 검증 동작 fix 는 본 generation 에서 처리」 판정:
- fix 가 small scope 인가 → Yes (비기동 helper 1개 + `stopCmd` 가 그것을 경유).
- 누락 시 본 generation 의 검증이 의미를 잃는가 → **Yes.** "daemon 파일이 지워졌다"를 단언하는데 그 직전에
  daemon 을 띄웠다면 경합을 심는 것이다.
→ 본 generation 에서 처리한다. `stopCmd` 도 같은 helper 를 경유하게 해 두 경로가 갈라지지 않게 한다.

## Requirements

### FR

- **FR1** `reap uninstall` 은 2-phase 다. `--confirm` 없이 부르면 **무엇을 지울지 목록**을 담은
  `status: "prompt"` 를 내고 아무것도 지우지 않는다.
- **FR2** 순서를 강제한다: (1) 진입 훅 우회 → (2) daemon stop(**기동 없이**) → (3) 홈 자산 제거 →
  (4) npm 제거. 앞 단계가 끝나야 다음 단계가 의미를 가진다.
- **FR3** 제거는 **prefix-anchored + item-anchored** 다. `reap.*` / `reap-*` 만 지우고,
  `~/.reap/` 는 디렉토리째가 아니라 REAP 이 만든 항목만 지운다(사용자 파일이 그 안에 있다 — 01 §2).
- **FR4** `settings.json` 은 **REAP 이 넣은 hook 만** 골라 뺀다. 파일을 지우거나 통째로 덮어쓰지 않으며,
  같은 엔트리에 사용자 명령이 섞여 있으면 그 엔트리는 살린다.
- **FR5** `agentClient` 설정과 무관하게 **양 adapter 를 모두 정리**한다(없으면 no-op).
- **FR6** daemon: `~/.reap/daemon/` 전체를 지우되, `DaemonAvailability.source === "checkout"` 이면
  그 체크아웃은 npm 제거 대상에서 **뺀다**.
- **FR7** npm 제거는 seam 뒤에 둔다. 테스트가 **실제 npm 을 부르지 않고 어떤 인자로 부르려 했는지** 단언할 수 있어야 한다.
- **FR8** npm 제거 실패는 **전체 실패가 아니다.** 앞 단계 결과를 보존하고 사용자에게 실행할 명령을 그대로 건넨다.
- **FR9** `reap uninstall` 은 `ensureUserLevelAssets` 진입 훅을 건너뛴다 — 그러지 않으면 지우기 직전에 설치한다.
- **FR10** 발견성: `reap --help` 노출 + `reap destroy` 출력의 후속 안내 + README 5 + reap.cc 5 로케일.

### 완료 기준 (검증 가능)

- **C1** 격리 `HOME`+`XDG_CONFIG_HOME` 에서 `syncUserLevelAssets` → `uninstall --confirm` 후
  네 표면(slash/agent/guide/hook) + stamp + daemon 데이터가 **전부 부재**. 부재를 읽기 전에
  `status: "ok"` 와 **숫자 개수**를 먼저 요구한다.
- **C2** negative: 사용자 파일 · `reapdev.*` · 사용자의 다른 SessionStart hook 이 **살아남는다.**
- **C3** npx 형태 재현(자산 있음 + **스탬프 없음**) 에서 uninstall 이 **재설치를 일으키지 않는다.**
- **C4** 설치 형태 판정과 npm 인자가 unit 으로 고정된다 — global 일 때만 실행, checkout daemon 은 인자에서 제외.
- **C5** 자기진단 게이트 § 8 이 **진짜 전역 설치**를 지우고, 패키지 디렉토리 부재까지 확인한다.
  이 항목만이 npm 제거의 `[실행]` 근거다.
- **C6** 기존 baseline 유지: unit ≥568 / e2e ≥292 / scenario 44 / daemon 130, 0 fail.
  `fix --check` 는 0 error / 4 warning(기존) 그대로.
- **C7** 검사를 **먼저 실패시킨다.** 각 신규 검사는 수정 전(또는 일부러 깨뜨린 상태)에서 fail 하는 것을
  확인한 뒤에야 유효하다고 적는다.

## Implementation Plan

순서는 의존 방향을 따른다: 계약 → adapter 구현 → daemon → 명령 → 배선 → 발견성 → 테스트.

- [ ] **T001** `src/adapters/types.ts` — `AdapterModule.removeUserLevelAssets(home?)` 추가 +
      `UserLevelRemovalResult { removed: string[]; kept: string[] }` 타입. `syncUserLevelAssets` 주석
      바로 옆에 두어 **자산 목록을 아는 곳이 서로를 본다**(공유 불가한 대칭이므로 carrier 표식
      `reap:carrier(user-level-asset-set)` 을 양쪽에 심는다).
      검증: typecheck + T012 unit.
- [ ] **T002** `src/adapters/claude-code/install.ts` — `removeUserLevelAssets(home)` 구현.
      `installSlashCommandsOnly`/`installAgents`/`installReapGuide`/`registerSessionHooks` 의 역연산을
      각각 작은 함수로. settings.json 은 **inner hook 단위 필터** 후 빈 엔트리만 제거(FR4).
      검증: T012 unit + T013 e2e.
- [ ] **T003** `src/adapters/opencode/install.ts` — 동일. 경로는 반드시 `opencodeCommandsDir` /
      `opencodeAgentsDir` 경유(XDG). 검증: T012 unit + T013 e2e.
- [ ] **T004** `src/adapters/{claude-code,opencode}/index.ts` — `AdapterModule` 에 배선.
      `src/adapters/index.ts` — `removeInstallStamp(home)` 추가(스탬프는 dispatcher 소유).
      검증: typecheck + T012.
- [ ] **T005** `src/cli/commands/daemon/client.ts` — `stopDaemonIfRunning()` 신설:
      `ensureDaemon` 을 거치지 않는 직접 fetch → pid → SIGTERM. 종료 대기 포함.
      `src/cli/commands/daemon/index.ts` 의 `stopCmd` 가 이것을 경유(D2).
      검증: 기존 `e2e/daemon-lifecycle.test.ts` case 2 가 그대로 통과 + T015.
- [ ] **T006** `src/cli/commands/uninstall.ts` 신설 — 설치 형태 판정(D1) + npm seam(FR7) + 2-phase(FR1)
      + 순서 강제(FR2) + 실패 격리(FR8). 순수 판정 로직은 export 해 unit 이 부를 수 있게 한다.
      검증: T012 unit + T013/T014 e2e + T016 게이트.
- [ ] **T007** `src/cli/index.ts` — `uninstall` 명령 등록(설명 문구가 곧 `--help` 노출) +
      `program.parse()` 앞 `ensureUserLevelAssets` **우회**(FR9). 우회 판정은 이름 붙인 함수 하나로 두고
      **왜 예외인지**를 주석이 소유한다. 검증: T014 e2e (npx 형태).
- [ ] **T008** `src/cli/commands/destroy.ts` — 성공 출력에 "REAP 자체를 지우려면 `reap uninstall`" 후속 안내.
      검증: 기존 `e2e/destroy.test.ts` 갱신 + 문자열 단언 추가.
- [ ] **T009** `README.md` + `README.{ko,ja,de,zh-CN}.md` — Installation 절 뒤 Uninstall 안내.
      `npx @c-d-cc/reap uninstall` 회수 경로 포함. 검증: 수동 + `check-docs-version.sh` 통과.
- [ ] **T010** `docs/src/pages/CLIPage.tsx` + `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` —
      `uninstallTitle/Desc/Note` 3키 × 5 로케일. 검증: `cd docs && npx vite build` 성공 +
      `bash scripts/check-docs-version.sh`.
- [ ] **T011** `src/templates/reap-guide.md` 동기화 — 새 CLI 명령이 생겼으므로 § CLI Commands 에 추가
      (dog-fooding 규칙: 메타 파일 변경은 템플릿에도 반영). 검증: 수동 diff.
- [ ] **T012** `tests/unit/uninstall.test.ts` 신설 — 설치 형태 판정(4종 + realpath 차이) / npm 인자 /
      checkout daemon 제외 / settings.json hook 수술(사용자 hook 보존) / prefix 패턴.
      **먼저 실패시킨다**(C7).
- [ ] **T013** `tests/e2e/uninstall.test.ts` 신설 — C1(부재는 개수 단언 뒤에) + C2(negative 생존).
      `cliWithHome` 패턴으로 `HOME` + `XDG_CONFIG_HOME` 양축 격리.
- [ ] **T014** T013 에 npx 형태 케이스 추가 — 자산을 깔고 **스탬프만 지운 뒤** uninstall →
      재설치 없음 + 스탬프 미생성(C3). gen-087 상호작용의 유일한 실증.
- [ ] **T015** T013 에 daemon/npm 케이스 추가 — checkout 에서 실행 시 npm 을 **부르지 않고** 명령만
      안내하는지(`npm.executed === false`), daemon 이 꺼진 상태에서 uninstall 이 daemon 을
      **띄우지 않는지**(`~/.reap/daemon/` 미재생성).
- [ ] **T016** `scripts/check-self-diagnosis.sh` § 8 신설 — 전용 `HOME`/prefix 에 tarball 전역 설치 →
      사용자 파일·`reapdev.*`·사용자 hook 을 심음 → `npm_config_prefix` 를 준 채 `reap uninstall --confirm`
      → 자산 부재 + 사용자 것 생존 + **패키지 디렉토리 부재**. C5 의 `[실행]` 근거.

## 테스트 전략

| 변경 | 레벨 | 근거 |
|---|---|---|
| 판정 함수 / npm 인자 / settings.json 수술 | unit | 순수 로직, seam 주입 가능 |
| 제거 전체 흐름 · negative · npx 형태 | e2e | CLI → JSON output, 자식 프로세스라 seam 주입 불가 |
| 실제 전역 npm 제거 | 자기진단 게이트 § 8 | **진짜 전역 설치가 존재하는 유일한 자리** |
| `daemon stop` 회귀 | 기존 e2e | `daemon-lifecycle.test.ts` case 2 |

**부재 단언 규약(gen-083/086)**: 모든 부재 단언은 (a) `status: "ok"` 확인, (b) 숫자 개수 확인,
(c) 그 다음에야 부재 확인 순서로 쓴다. 그리고 단언 문구는 **두 상태에서만 참인 것**을 지목한다 —
설치 상태에서도 참인 문자열을 찾으면 그 단언은 무력하다(gen-086 이 그 함정에 걸렸다).

**영향받는 기존 테스트**: `e2e/destroy.test.ts`(출력 메시지 변경), `e2e/cli-commands.test.ts`
(명령 목록이 있다면), `e2e/daemon-lifecycle.test.ts`(stop 경로 변경 — 통과해야 함).

## Scope — 하지 않는 것

- `scripts/postuninstall.sh` **신설하지 않는다** (측정으로 폐기).
- npm 12 `--allow-scripts` 문법 재측정 — 이번 계획이 의존하지 않는다.
- `resolveDaemonBin` 의 dead code 제거 — 무관.
- 버전 bump / tag / push / publish — 하지 않는다.
- genome 수정 — embryo 이지만 immutable 로 취급. 이슈는 backlog 로.
- 0.18 트랙 backlog 6건 — 별도 브랜치.

## Additional Findings

- `~/.reap/` 에 **사용자 소유 private key** 가 실재한다(개발자 머신 실측). `rm -rf ~/.reap` 는 파괴적이며,
  이 사실은 source backlog 에 없었다. FR3 의 item-anchored 요구가 여기서 나왔다.
- `emitOutput` 은 항상 `process.exit(0)` 하므로(`core/output.ts:30`) 2-phase 는 분기 없이 성립한다.
- `ensureUserLevelAssets` 는 스탬프가 현재 버전이면 즉시 반환한다 — **스탬프가 있으면 T014 가 아무것도
  증명하지 못한다.** 그래서 T014 는 스탬프를 지운 상태를 만든다.
- `daemonRequest` 는 첫 줄에서 `ensureDaemon()` 을 부른다. daemon 을 건드리는 새 코드는 이 함수를
  **쓰면 안 된다**.

## Risks

| 위험 | 완화 |
|---|---|
| realpath 불일치로 전역 판정 실패 → npm 제거가 조용히 안 됨 | T012 가 `/var` vs `/private/var` 케이스를 명시 단언. T016 이 실제 전역에서 확인 |
| settings.json 수술이 사용자 hook 을 깬다 | inner hook 단위 필터 + T012/T013 negative |
| 게이트 § 8 이 앞 절의 환경을 오염 | 전용 `HOME`/prefix 를 새로 만들고 **맨 끝**에 둔다 |
| 자산 목록이 install 과 uninstall 사이에서 어긋난다 | 같은 파일 안에 인접 배치 + carrier 표식 + **"sync → uninstall → 0" e2e 가 곧 합의 검사** |

## Human Confirmation (2026-08-20)

D1 · D2 · T016 모두 **승인**. 붙은 조건을 계획에 반영한다.

### D2 (daemon stop 비기동화) 조건

- **사용자 대면 동작이 바뀐다**: 지금은 꺼져 있어도 띄웠다 죽이며 "stopped" 를 보고한다.
  바뀐 뒤에는 "not running" 이다. 기존 e2e/unit 이 그 동작을 단언하는지 **먼저 grep** 하고,
  있으면 새 동작에 맞게 고친다.
- 03-implementation.md 의 Discovered Tasks 에 D2 로 남기고 **동작 변경 사실을 명시**한다.

### T016 (게이트 § 8) 조건 4

1. **먼저 실패시킨다.** `uninstall` 구현 **전에** § 8 을 쓰고 red 를 확인한다. 그 출력을 artifact 에 인용.
2. **부재 단언이 스스로 증명하게 한다.** exit code + `status: "ok"` + 지운 항목의 **숫자**를 먼저 요구한 뒤에야
   파일 부재를 읽는다.
3. **생존 단언을 같은 절에** 넣는다 — 사용자 파일 · `reapdev.*.md` · 사용자 SessionStart hook.
   제거만 보는 게이트는 "전부 지움"도 통과시킨다.
4. **실측 비용을 보고한다.** § 8 추가 전후 게이트 실행 시간을 재서 artifact 에 적는다("수초"는 추정이었다).

### `~/.reap/` 제거는 allowlist 로 고정

지울 항목을 **명시적으로 열거**하고, 열거되지 않은 것은 무조건 남긴다. blocklist(알려진 사용자 파일을 피함)로
쓰면 다음에 새로 생기는 사용자 파일을 못 피한다. 코드 주석이 **실측 근거**를 소유한다 —
"이 디렉토리에는 REAP 이 만들지 않은 것이 실재한다".

### realpath 주석

macOS 만의 문제로 보이지 않게 **조건을 적는다** — symlink 를 거치는 모든 환경에서 성립한다.

### 작업 순서 변경 (조건 1 반영)

T016(게이트 § 8) 을 **T006 앞으로 당긴다.** 구현 전에 red 를 봐야 유효성 근거가 된다.
최종 순서: T001~T005 → **T016(red 확인)** → T006~T008 → T009~T011 → T012~T015 → T016 재실행(green).
