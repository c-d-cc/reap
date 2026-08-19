# Validation

## Verdict

**pass.** 세 결함 모두 수정·검증됐고 네 스위트 전부 0 fail. 계획의 완료 기준 7개 중 7개 충족.

## 실행 결과 — 전부 fresh (이전 실행 재사용 없음)

| 항목 | 명령 | 결과 |
|---|---|---|
| typecheck | `npm run typecheck` | 통과, 0 error |
| build | `npm run build` | 통과, 152 modules / 0.60 MB |
| unit | `npm run test:unit` | **555 pass / 0 fail** (기준선 545 + 신규 10) |
| e2e | `npm run test:e2e` | **287 pass / 0 fail** (기준선 279 + 신규 8) |
| scenario | `npm run test:scenario` | **44 pass / 0 fail** (무변경) |
| daemon | `cd daemon && npm test` | **130 pass / 0 fail** (무변경 — 본 세대는 `daemon/` 을 건드리지 않았다) |

기준선은 착수 전 같은 명령으로 실측했다. **상위 지시가 준 unit 538 은 낡은 값이고 실측은 545 였다** — 이 수치를 그대로 믿었으면 "10 늘었어야 할 게 17 늘었다"로 잘못 읽었을 것이다.

evaluator 가 같은 세 스위트를 **독립적으로 재실행**해 동일한 수치를 냈다.

## 완료 기준 대조

### 1. `[실행]` `reap run push` 가 git 의 말을 전달한다

sandbox(`git init` + remote 없음 / remote 만 있고 upstream 없음)에서 `node dist/cli/index.js run push`:

- `"No configured push destination"` + `"git remote add"` 포함 — git 이 낸 문장 그대로
- `"no upstream branch"` + `"--set-upstream"` 포함
- 옛 문구 `"Check remote configuration and network."` **미출현**

명령: `bunx bun test tests/e2e/push-error.test.ts` (3 케이스, 성공 push 포함).

### 2. `[실행]` validation work 를 두 번 호출해도 같은 출력

`bunx bun test tests/e2e/validation-rerun.test.ts` — 5 케이스.

두 번째 호출이 `status: "prompt"` / `phase: "work"` 이고 **prompt 문자열이 첫 호출과 완전히 동일**하며, `evaluator: true` 일 때 `context.evaluator.prompt` 가 두 번 다 비어있지 않다.

**본 세대가 실제 저장소에서 자기 수정의 첫 사용자다** — 이 artifact 를 쓰기 직전 `node dist/cli/index.js run validation` 을 두 번 호출해 evaluator prompt(10,924자)를 두 번 다 받았다. gen-084 는 손으로 재구성했고 gen-085 는 `/tmp` 에 저장해야 했던 일이다.

### 3. `[실행]` artifact 미작성 시의 `nextCommand` 가 실제로 실행된다

같은 e2e 파일. emit 된 `nextCommand` 문자열을 **파싱해 그대로 실행**하며(문구 반복 단언이 아니라), 결과가 error 가 아님을 단언한다. artifact 를 채운 뒤 같은 명령이 `prompt`/`work` 로 통과하는 것까지 이어서 확인.

### 4. `[실행]` `DaemonNotInstalledError` 가 명시 경로를 안다

`bunx bun test --isolate tests/unit/daemon-availability.test.ts` — 신규 3 케이스.

- `explicitMiss` 가 있으면 채널명(`REAP_DAEMON_BIN` / `.reap/config.yml 'daemonBin'`)과 **경로**를 말하고 generic hint 는 말하지 않는다
- 아무도 지정하지 않았으면 `DAEMON_LOCATE_HINT` + `DAEMON_INSTALL_COMMAND` — **종전 문구 그대로**
- 인자 없는 생성(기존 모든 throw 지점의 형태)이 종전 메시지를 유지

`ensureDaemon` 이 `locateDaemon()` 의 `explicitMiss` 를 에러에 넘기는 **배선 자체는 `[독해]` + typecheck** 다. `ensureDaemon` 은 비공개이고 실제 spawn 을 시도하므로, 검증하려면 주입 seam 을 새로 뚫어야 한다 — 지목된 수정 범위를 넘어선다. 타입상 그 자리에 들어갈 수 있는 값이 `explicitMiss` 하나뿐이라 오배선 위험은 낮다.

### 5. `[negative]` 셋 다 고의로 깨뜨려 fail 을 봤다

| 깨뜨린 것 | fail | 복원 후 |
|---|---|---|
| `describeExecError` 가 항상 `null` | unit 4 / e2e 2 | 0 fail |
| 두 graph 의 self-loop 제거 | unit 2 / e2e 3 | 0 fail |
| `missingDaemonRemedy` 가 `explicitMiss` 무시 | unit 2 | 0 fail |

**첫 시도에서 daemon 항목은 fail 이 1건뿐이었다.** 원인은 내가 쓴 단언 하나가 무력했던 것 — 상세는 03-implementation.md § Discovered Issues. 판별력 있는 단언(경로 문자열)으로 바꾼 뒤 2건이 됐다. **negative 를 돌리지 않았으면 그 테스트를 실제보다 신뢰한 채 넘어갔을 것이다.**

### 6. 스위트 0 fail — 위 표. 기준선 대비 감소 0

### 7. 버전 무변경 / backlog 신설 0

`package.json` **0.17.5 그대로**. `reap make backlog` 미실행, `.reap/life/backlog/` 는 source 1건 consumed + pending 7건으로 착수 시점과 동일.

`node dist/cli/index.js fix --check` — **0 error / 3 warning**, 전부 기존 항목(lineage parent 2건 + `environment/summary.md` 273줄 > 가이드라인 250). 본 세대가 만든 것이 아니며 reflect 에서 다룬다.

## Evaluator 리뷰 (`reap-evaluate`, advisor)

권고: **pass**. typecheck / build / 세 스위트를 독립 실행해 동일 수치 확인. 계획이 검증하지 않은 두 속성을 직접 재현했다:

- **재진입 후 전진** — `run validation` 3회 후 `--phase complete` 가 정상 auto-advance
- **재진입 후 back** — `run back` 이 여전히 implementation 으로 회귀 (self-loop 키가 `back.ts` 의 `targetStage !== fromStage` 필터에 걸러진다)

둘 다 신규 테스트에 단언이 없으나 동작은 정상이다. 그리고 계획이 **추론으로만** 기각했던 자격증명 유출 위험을 **실측**했다 — `https://x-access-token:<token>@host/` remote 로 transport 에러를 내니 git 이 URL 의 토큰을 지우고 출력한다.

### 제기된 우려 — 전부 low, 진행 무관

| | 내용 | 처리 |
|---|---|---|
| L1 | `resolveDaemonBin` 이 프로덕션 dead code 가 됐다 (`ensureDaemon` 이 `locateDaemon` 으로 옮겨가면서). export 와 자기 테스트만 남음 | **미수정** — 제거는 범위 확장 |
| L2 | `installCommand` 필드 주석이 존재하지 않는 호출자를 말한다 | **수정함.** "REAP 이 사실이 아닌 말을 하는 것"을 고치는 세대에서 나온 문장이라 그대로 둘 수 없었다 |
| L3 | `expect(remedy).toContain("daemonBin")` 이 generic 분기도 통과시킨다 | **수정함** — 그 줄을 지우고 왜 판별력이 없는지 주석으로 남겼다 |
| L4 | `validation-rerun` 4·5번은 수정 전에도 통과한다 (회귀 guard 지 결함 증거가 아니다) | 옳다. negative 를 3 fail 로 센 것이 그것을 이미 반영한다 |
| L5 | `describeExecError` 의 stdout / `err.message` 단은 미검증. 5번 테스트 주석의 "fallback rung" 서술이 부정확 | **주석 수정함.** 두 단은 여전히 미검증이다 — 루프 3줄 |
| 범위 밖 | `src/cli/commands/run/pull.ts:22` 에 이번에 지운 문장이 fetch 경로에 남아 있다 | **미수정.** 계획 § Scope 가 명시 배제한 항목 |

L2·L3·L5 는 계획의 "Minor Fix" 기준(설계 변경 없이 5분 내) 안이며 stage 전환 없이 현 단계에서 처리한 뒤 해당 테스트를 재실행했다(44 pass / 0 fail). typecheck·build 도 재실행해 통과.

**evaluator 는 범위 확장을 제안하지 않았다** — 유저 지시를 prompt 에 명시했고, 인접 항목 1건을 "제안 아님"으로 표시해 보고했다. `report-evaluator --severity low` 로 기록한다.

## 검사가 잡지 못하는 것

통과는 "검사 범위 안에서 문제없음"일 뿐이다. 한계를 적어둔다:

- **`ensureDaemon` 의 배선** — `[독해]` + typecheck 뿐. 위 §4 참조
- **`describeExecError` 의 stdout / `err.message` 단** — git 이 실패를 stderr 에 쓰므로 실제 git 으로는 도달하지 않는다
- **결함 3 의 사용자 도달** — 이 에러 메시지가 오늘 사용자 화면에 뜨는 경로는 **없다**(learning §3 에서 `daemonRequest` 소비처를 전수 확인). 짝이 맞지 않던 상태의 교정이며, 값어치는 "다음 소비처가 이미 갈린 안내를 물려받는다"에 있다. **이 항목에 사용자 대면 `[실행]` 증거는 없고, 만들 수도 없다**
- **linux 미검증** — 로컬 macOS 에서만 돌았다. push 하지 않으므로 reap-test dispatch 는 이번에도 실행되지 않는다. 신규 테스트 3개 파일은 gen-081 의 머신 의존 함정(`git init -b main` 명시, per-repo identity)을 따랐으나 **그것은 예방이지 확인이 아니다**
- **merge lifecycle 의 self-loop** — graph 데이터와 unit 단언으로만 확인. merge validation 을 실제로 두 번 호출한 e2e 는 없다 (merge lifecycle e2e 자체가 없다)
