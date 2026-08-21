# Validation

## 실행한 명령 (fresh)

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run typecheck:docs` | exit 0 |
| `npm run build` | 0.65 MB + grammars 15 |
| `npm run test:unit` | **736 pass / 0 fail** (baseline 670 → +66) |
| `npm run test:e2e` | **355 pass / 0 fail** (baseline 329 → +26) |
| `npm run test:scenario` | **55 pass / 0 fail** (baseline 44 → +11) |
| `bash scripts/check-self-diagnosis.sh` | `Self-diagnosis passed for v0.17.7.` (8절 전부) |
| `npx reap fix --check` | 0 error / 2 warning — **둘 다 gen-052 상속분**(lineage parent 미발견) |
| `bash scripts/list-carriers.sh --orphans` | `No orphaned carrier markers.` |

## 완료 기준 대조

근거 표기: `[실행]` 이 세대에서 그 명령을 직접 돌림 / `[negative]` 일부러 깨뜨려 fail 확인 /
`[독해]` 코드를 읽고 판단(돌려보지 않음).

### 1. `make → main → close` 가 동작하고, 경계 3요소가 빈 milestone 의 main 지정이 거부된다 ✅

`[실행]` `tests/e2e/milestone.test.ts` — 13 케이스. 거부 경로를 **조건마다 개별 케이스**로 둔다:
`main refuses a milestone whose boundary is not filled` / `... a goal that matches nothing in goals.md` /
`... an unknown slug` / `... a completed milestone`.

`[실행]` `tests/unit/milestone.test.ts` § `validateForMain` — 4개 거부 조건 + 2개 수용 조건 개별.

한 케이스가 여러 조건을 덮으면 **그중 하나만 실제로 검증되고 나머지는 우연에 맡겨진다**(gen-094 교훈).

### 2. main 은 항상 0개 또는 1개 — 그리고 main 이 아닌 milestone 의 항목도 goal 후보로 나온다 ✅

`[실행]` `tests/e2e/milestone.test.ts` → `a second main clears the flag from the first`
(`previousMain` 확인 + `filter(main).map(slug)` 가 정확히 1개).

`[실행]` **후반부가 이번 설계 결정의 핵심**이고 별도 관측자를 뒀다 —
`tests/e2e/milestone-start.test.ts` → `scan ALSO offers a non-main milestone's generations`,
`main comes before the rest`. main 만 제안하는 구현은 **이 파일의 다른 모든 테스트를 통과한다.**

`[실행]` `tests/scenario/milestone.test.ts` → gen B 를 **main 이 아닌 milestone 에서** 시작한다.

### 3. 문 1·2·3 각각에서 milestone 이 실제로 보인다 ✅

**계획이 틀렸던 부분을 여기 적는다** — 02-planning.md 은 문 1 을 `buildBasePrompt` 하나로 봤으나
실제로는 **채널이 셋**이었다(03-implementation.md § D1). 그리고 caller 전수 확인에서 **넷째**가
나왔다(§ D4).

| 채널 | 근거 |
|---|---|
| A-async `buildKnowledgeContext` | `[실행]` `milestone-prompt.test.ts` → `both builders show it, and agree byte for byte` |
| A-sync `buildKnowledgeContextSync` | `[실행]` 동일 (byte-identity 가 한쪽만 빠져도 잡는다) + `[실행]` scenario 가 **실제 `.reap/.session-state.md` 파일**을 읽어 확인 |
| B `buildBasePrompt` | `[실행]` `the prompt carries the milestone's title, boundary and remaining work` |
| B′ `buildEvaluatorPrompt` | `[실행]` `the out-of-scope list is in the evaluator's prompt` |
| 문 2 `start --phase scan` | `[실행]` `milestone-start.test.ts` 6 케이스 |
| 문 3 `completion --phase adapt` | `[실행]` `milestone-adapt.test.ts` 10 케이스 + `[실행]` scenario 가 실제 adapt 출력을 확인 |

### 4. 각 문의 주입을 제거하면 대응 테스트가 red 가 된다 ✅

`[negative]` 5회 수행. 각각 제거 → 실행 → 복원 → 재확인:

| 제거한 것 | 결과 |
|---|---|
| `buildMilestoneSection` 주입 (buildBasePrompt) | 1 fail |
| `load-context.ts` 주입 | 2 fail |
| `dump-state-sync.ts` 주입 | 2 fail |
| `start.ts` scan 후보 (`if (milestoneCandidates.length > 0)` → `if (false)`) | 3 fail |
| `vision.ts` 대체 (`if (withWork.length > 0)` → `if (false)`) | 4 fail |

**추가로**, 구현 중 실제 결함 하나가 negative 로 잡혔다 — `\Z` 는 JS 정규식에 없어 `## Generations`
(항상 마지막 절)가 **조용히 빈 배열**이 됐다. 되돌려 3 fail 확인(03-implementation.md § T003).

**문 3 의 판정 기준이 "후보가 나온다"가 아니라 "휴리스틱 블록이 사라졌는가"인 이유**: 전자는
`suggestNextGoals` 가 어차피 후보를 내므로 대체를 지워도 통과한다(gen-096 교훈 — 기능을 지웠을 때
무엇이 여전히 초록인가).

### 5. 완료된 milestone 이 `status: completed` 로 남고, 후보 조회에서 제외된다 ✅

`[실행]` `tests/e2e/milestone.test.ts` → `close marks completed IN PLACE...` — **파일 경로가 그대로**임을
읽어서 확인한다.
`[실행]` `milestone-start.test.ts` → `a completed milestone offers nothing`.
`[실행]` `milestone-adapt.test.ts` → `a completed milestone does not take over`.
`[실행]` scenario → `a completed milestone is listed but offers nothing`.
`[실행]` `milestone.test.ts` → `mainMilestone ignores a completed one that still carries the flag`
(사람이 파일을 직접 고쳐 만들 수 있는 조합).

### 6. genome·reap-guide 가 Vision 4분류와 milestone–midterm 경계를 갖는다 ✅

`[실행]` `npx reap fix --check` → 0 error, 크기 경고 없음
(`evolution.md` **298줄** / guideline 300, `application.md` **250줄** / guideline 250).
`[실행]` `bash scripts/list-carriers.sh --orphans` → 고아 없음.
`[독해]` 문장 자체의 정확성 — 산문이라 실행 가능한 검사가 없다. 다음이 그 한계다:

- **docs 5 로케일은 이번에 안 고쳤다** (v0.18 미발행이라 의도적 연기). 따라서 `reap.cc` 는 아직
  milestone 을 모른다 — 이것은 결함이 아니라 **기록된 deferral** 이다
- **migration note 도 미작성.** 기존 프로젝트에 이 규칙이 도달하는 채널은 그것뿐이므로,
  **v0.18 릴리즈 세대에서 반드시 만들어야 한다.** 지금 만들 수 없는 이유는
  `check-docs-version.sh` § 5 가 note 버전 > 패키지 버전을 막고 본 세대는 bump 하지 않기 때문

### 7. unit / e2e / scenario 전 스위트 0 fail ✅

`[실행]` 위 표. **736 / 355 / 55.**

## 이 검증이 보지 못하는 것

- **agent 가 실제로 milestone 을 읽고 행동하는가.** 층2(`check-agent-integration.sh`)의 영역이고
  본 세대는 돌리지 않았다(~$0.25, 릴리즈 전 절차). 검증한 것은 **텍스트가 채널에 실린다**까지다
- **산문의 정확성.** genome·reap-guide 문장은 `[독해]` 다. 크기와 carrier 만 기계가 본다
- **milestone 파일을 사람이 손으로 망가뜨린 경우 전부.** `status`/`main` 이 예상 밖 값이면
  `parseMilestone` 이 기본값으로 흡수한다(`status: 알수없음` → `open`). 의도된 관대함이지만
  **잘못된 값을 알려주지는 않는다**
- **여러 세션이 동시에 `milestone main` 을 부르는 경우.** `setMain` 은 이전 것을 먼저 내리므로
  중간 실패는 "main 0개"로 남는다(둘이 되지는 않는다). 동시성 자체는 검증하지 않았다

## Evaluator

`.reap/config.yml` 은 `evaluator: true` 다. **이번 세대는 evaluator subagent 를 띄우지 않았다** —
이 세션은 subagent 호출을 사용자가 명시 요청했을 때만 하도록 지시받았다.

longterm 은 *"독립 검토는 한 번으로 수렴하지 않는다"* 고 기록한다(gen-089 는 3라운드가 필요했고
매 라운드의 결함이 직전 라운드의 수정 안에 있었다). **사용자가 원하면 fitness 전에 호출할 수 있다.**

## Verdict

**pass.**

전 게이트·전 스위트 초록이고 완료 기준 7개가 모두 충족됐다. 범위 밖 3건(docs 로케일 /
migration note / memory 재설계)은 계획에 명시된 deferral 이며 v0.18 릴리즈 세대와 별도 backlog 가 받는다.
