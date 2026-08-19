# Implementation

## Completed Tasks

| # | Task | 파일 | 상태 |
|---|---|---|---|
| T009 | 게이트 절 신설 — 차단 설치 재현 + 자산 단언 (**착수 전 fail 확인**) | `scripts/check-self-diagnosis.sh` | 완료 |
| T001 | claude-code `syncUserLevelAssets(home)` 신설, `home` 주입, `installReapGuide` export | `src/adapters/claude-code/install.ts` | 완료 |
| T002 | opencode `syncUserLevelAssets(home)` 신설, `installReapGuide(home)` export | `src/adapters/opencode/install.ts` | 완료 |
| T003 | `AdapterModule.syncUserLevelAssets(home?)` + 계약 주석 | `src/adapters/types.ts` | 완료 |
| T004 | 두 adapter 배선, `registerSessionIntegration` 을 소유자 경유로 교체 | `src/adapters/{claude-code,opencode}/index.ts` | 완료 |
| T005 | `resolveAgentClient` 추출 + `ensureUserLevelAssets` (stamp 판정) | `src/adapters/index.ts` | 완료 |
| T006 | `resolveAgentClient` 재사용 — config 파싱 중복 제거 | `src/cli/commands/install-skills.ts` | 완료 |
| T007 | `program.parse()` 앞 진입점 배선 | `src/cli/index.ts` | 완료 |
| T008 | `reap-guide.md missing` 안내 교정 | `src/core/integrity.ts` | 완료 |
| T010 | unit 10건 — stamp 의미론 | `tests/unit/user-level-assets.test.ts` | 완료 |
| T011 | e2e 5건 — 진입점 자가치유 | `tests/e2e/user-level-selfheal.test.ts` | 완료 |
| T012 | 전 스위트 + 게이트 + `fix --check` | — | 완료 |
| D001 | 기존 wiring unit 2건이 rename 으로 깨짐 → 2-hop 으로 재작성 | `tests/unit/opencode-commands.test.ts` | 완료 |
| D002 | `update alone` e2e 의 전제가 무효화됨 → 전제 재수립 | `tests/e2e/install-agents.test.ts` | 완료 |
| D003 | dogfooding 동기화 + guide 서술 | `src/templates/reap-guide.md`, `.reap/reap-guide.md` | 완료 |

## 구현 내용

### 단일 소유자 — `syncUserLevelAssets`

"사용자 레벨 자산 일습"을 아는 곳을 adapter 당 하나로 만들었다.

```
adapter.syncUserLevelAssets(home)
  claude-code: slash 19 + agents 2 + reap-guide + SessionStart hook
  opencode   : reap-guide + slash 19 + agents 2
```

세 caller 가 이것을 경유한다 — `installSkills`(출력 있음) / `registerSessionIntegration`(`reap update`) /
`ensureUserLevelAssets`(진입점). **caller 는 셋이지만 목록을 아는 곳은 하나다.**

통합하면서 기존 drift 하나가 닫혔다: `registerSessionIntegration` 이 `reap-guide.md` 를 빼고 있었고,
그 근거 주석("postinstall 이 담당")은 npm 12 에서 성립하지 않는 전제였다.
`reap update` 만 쓰는 사용자는 CLAUDE.md/AGENTS.md 가 빈 경로를 import 하는 상태였다.

`home` 을 전 계층에 매개변수로 주입했다(`installSlashCommandsOnly` / `installReapGuide` /
`registerSessionHooks`). env override 는 **자식 프로세스에만** 닿고 bun 의 in-process `os.homedir()` 는
`$HOME` 을 무시하므로(genome longterm), 주입이 유일한 격리 수단이다.

### 진입점 — 왜 명령 셋이 아니라 전부인가

```ts
// src/cli/index.ts
await ensureUserLevelAssets({ cwd: process.cwd(), version: readVersion() });
program.parse();
```

차단된 사용자가 가진 것은 `reap` 바이너리 하나다. README 가 가리키는 `/reap.init` 은 없는 파일이다.
따라서 **바이너리를 부르는 것 자체**가 조건이어야 한다. 명령 셋을 고르면 "네 번째가 여기 속하는가"를
다음 사람이 다시 판단해야 한다.

### stamp — `~/.reap/.install-stamp`

```json
{ "claude-code": "0.17.5", "opencode": "0.17.5" }
```

- **client 별 키**: claude-code 프로젝트와 opencode 프로젝트를 오갈 때 매번 양쪽을 재복사하지 않는다
- **버전 키**: 업그레이드도 postinstall 이 차단되므로 버전이 바뀌면 다시 동기화한다
- **성공 시에만 기록**: 실패하면 stamp 를 남기지 않아 다음 호출이 재시도한다
- **never throws / never prints**: JSON stdout 계약 불변

## 검증

### 게이트 — 수정 전 fail, 수정 후 pass

`bash scripts/check-self-diagnosis.sh` (새 6절). **[실행]**

수정 전 — 4개 자산이 개별로 보고됐다. 각 단언이 실제로 발화함이 여기서 증명된다.

```
  ok    blocked install leaves no user-level assets (condition reproduced)
  FAIL  a blocked install stays broken after the user's first command
        ~/.reap/reap-guide.md missing — CLAUDE.md imports it by path
        ~/.claude/commands/: 0 of 19 reap.*.md — /reap.* unavailable
        ~/.claude/agents/: 0 of 2 reap-*.md — no evolve/evaluate agent
        ~/.claude/settings.json has no SessionStart hook — no dynamic context
```

수정 후 — 전 절 통과 (`Self-diagnosis passed for v0.17.5.`, opencode 1.3.16 로 실제 실행).

부재 단언이 먼저 있는 이유: `--ignore-scripts` 가 언젠가 postinstall 을 막지 않게 되면
이 절은 **건강한 설치를 검사하며 pass 를 보고**하게 된다 — 잡으려던 결함과 같은 모양이다.

### negative — 각 단언이 무력하지 않음을 확인 **[negative]**

| 깨뜨린 것 | 결과 |
|---|---|
| `syncUserLevelAssets` 에서 `installReapGuide` 제거 | unit 1 fail |
| stamp 를 client 별이 아닌 단일 키로 | unit 5 fail |
| `src/cli/index.ts` 의 진입점 호출 제거 | e2e **4 fail** / 1 pass |

마지막의 1 pass 는 "stdout 이 JSON 으로 파싱된다" — 회귀 가드이지 복구 단언이 아니므로 통과가 맞다.
첫 시도에서 파이썬 치환이 조용히 실패해 "10 pass" 를 받았고, 그것을 negative 결과로 읽을 뻔했다.
**패치가 적용됐는지부터 확인해야 한다** — 적용 실패와 검사 무력은 화면에서 같아 보인다.

### 테스트 **[실행]**

| 스위트 | 명령 | 결과 |
|---|---|---|
| unit | `npm run test:unit` | **565** pass / 0 fail (555 → +10) |
| e2e | `npm run test:e2e` | **292** pass / 0 fail (287 → +5) |
| scenario | `npm run test:scenario` | 44 pass / 0 fail |
| daemon | `cd daemon && bun test` | 130 pass / 0 fail |

`node dist/cli/index.js fix --check` — **0 error / 4 warning**, 전부 기존
(lineage parent 2 + `longterm.md` 51줄 + `environment/summary.md` 273줄). reflect 에서 정리 대상.

### 수동 확인 **[실행]**

격리 HOME 에서 `init` 1회 → commands 19 / agents 2 / guide 존재 / hook 1 / stamp 기록.
2회차 호출 후 `reap.evolve.md` 의 mtime 불변 — 재복사 없음.

## Discovered Tasks

- **D001** — `tests/unit/opencode-commands.test.ts` 의 wiring 검사 2건이 소스 텍스트로 callee 이름을
  단언하고 있어 위임 도입으로 깨졌다. 이름만 갈아끼우면 `syncUserLevelAssets` 가 아무것도 안 해도 통과한다.
  **2-hop** 으로 재작성했다 — (1) `registerSessionIntegration` → `syncUserLevelAssets`,
  (2) `syncUserLevelAssets` → slash/agents/guide(/hook). 정규식 `^\}` 가 반환 타입의 `}> {` 에서
  멈추던 것도 `^\}$` 로 교정.
- **D002** — `install-agents.test.ts` 의 "update alone" 이 `init` 직후 agents 디렉토리가 비어 있음을
  전제했는데 이제 `init` 도 자산을 놓는다. **전제를 지우고 재수립**했다(디렉토리 삭제 후 `update`).
  이 시점엔 stamp 가 이미 current 라 진입점 sync 는 no-op 이므로, 다시 나타난 파일은 `update` 의 것이다.
  opencode 쪽 동일 검사는 config 전환 순서 덕에 전제가 아직 참이라 그대로 뒀다.
- **D003** — application.md 의 dogfooding 대응(`.reap/reap-guide.md` ↔ `src/templates/reap-guide.md`)에 따라
  guide 에 자가치유 서술 1문단 추가 후 양쪽 동기화.

## 알아 둘 것 — 이번 변경의 대가

- **테스트 실행이 개발자의 실제 HOME 에 1회 쓴다.** `tests/helpers/setup.ts` 의 `cli()` 는 HOME 을
  격리하지 않으므로, 스위트의 첫 CLI 호출이 `~/.claude/commands`·`~/.claude/agents`·`~/.reap/` 를
  동기화한다(버전당 1회, stamp 가 이후를 막는다). 내용은 `reap install-skills` 가 쓰는 것과 동일하다.
  본 세션에서 실제로 발생했고 `~/.config/opencode/` 도 함께 채워졌다(opencode 로 전환하는 임시 프로젝트에서
  비격리 `cli()` 가 돌았기 때문). 근본 해소는 `cli()` 의 HOME 격리이며 이번 범위 밖이다.
- **stamp 는 버전 키라 같은 버전 안에서의 번들 자산 수정은 전파되지 않는다.** 이번에 guide 를 고쳤지만
  `~/.reap/reap-guide.md` 는 갱신되지 않았다 — 의도된 절충이며 `install-skills` / `update` /
  버전 변경이 갱신 경로다.
- **`reap destroy` 직전에도 동기화가 돈다.** 사용자 레벨 자산은 프로젝트 스코프가 아니고 오늘의
  postinstall 도 같은 동작이므로 새 회귀는 아니다. 명령을 열거해 예외를 두지 않았다.
