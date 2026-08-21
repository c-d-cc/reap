# Validation

## 실행한 명령 (fresh)

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run typecheck:docs` | exit 0 |
| `npm run build` | grammars 15 |
| `npm run test:unit` | **771 pass / 0 fail** (baseline 736 → +35) |
| `npm run test:e2e` | **379 pass / 0 fail** (baseline 355 → +24) |
| `npm run test:scenario` | **62 pass / 0 fail** (baseline 55 → +7) |
| `bash scripts/check-self-diagnosis.sh` | `Self-diagnosis passed for v0.17.7.` |
| `npx reap fix --check` | 0 error / **2 warning — 둘 다 gen-052 상속분** |
| `bash scripts/list-carriers.sh --orphans` | `No orphaned carrier markers.` |
| genome 크기 | `evolution.md` **300** / 300 · `application.md` **249** / 250 |

## 완료 기준 대조

`[실행]` 이 세대에서 직접 돌림 / `[negative]` 일부러 깨뜨려 fail 확인 / `[독해]` 읽고 판단.

### 0. 계열이 둘이다 — backlog 은 해시 ✅ (사용자 결정 후 regression)

`[실행]` `tests/unit/sequence.test.ts` § *hashed ids* — 6 케이스. 형태(`bklog-` + 6 hex) ·
500회 무충돌 · **같은 상황 두 번 호출이 다른 ID**(제목 파생 금지) · 두 계열이 서로를 인식하지 않음 ·
잘못된 폭·비-hex 거부.
`[실행]` `a hashed kind writes no registry at all` — 해시 유형은 `.reap/sequence/` 에 **아무것도
쓰지 않는다**. 그것이 이 변경의 요점이다.
`[실행]` `tests/e2e/sequence.test.ts` — `make backlog` 이 해시 ID 를 내고 레지스트리에는
backlog 항목이 **없다**(`context.backlog` 가 `undefined`).
`[실행]` `tests/e2e/early-close.test.ts` — 승계 backlog 도 해시 ID.

**타입 시스템이 호출부를 전부 짚었다** — `SEQUENCED_TYPES` / `HASHED_TYPES` 로 나누자
`make/backlog.ts` · `early-close.ts` · `cli/commands/sequence.ts` · `integrity.ts` 넷이 컴파일
에러로 드러났다. 손으로 찾은 것이 하나도 없다.

### 0-b. `from` — 두 번째 소비자 ✅ (사용자 요청 후 regression)

`[실행]` `tests/e2e/sequence.test.ts` § *a backlog records what caused it* — 7 케이스.
`--from` 이 **하나의 ID** 로 들어감 · **generation 이 아닌 종류도 원인이 될 수 있음**(goal·design·backlog
각각) · **ID 아닌 것은 생성 시점 거부** · 없는 goal ID 는 `fix --check` 가 보고 ·
**권위 있는 출처가 없는 종류는 해석하지 않음**.
`[실행]` `tests/unit/sequence.test.ts` — `isReapId` 가 두 계열 + generation 을 받고 나머지는 거부.
`[실행]` early-close 의 `derivedFrom` → `from` 교체를 unit 2 · e2e 1 이 단언.

**이것이 milestone→goal 과 다른 모양을 검증한다** — 전자는 **한 종류**를 가리키고,
`from` 은 **종류가 열려 있는** 단일 참조다(prefix 가 종류를 알려준다).
memory 의 `from` 이 쓸 모양이 이것이고, `to`(연관 대상)는 그때 목록이 될 것이다.

### 1. ID 부여가 동작하고 번호가 재사용되지 않는다 ✅

`[실행]` `tests/unit/sequence.test.ts` § *a number handed out is never handed out again* — 3 케이스.
`[실행]` `tests/e2e/sequence.test.ts` — `make goal|milestone|backlog` 이 각자 유형에서 번호를 매긴다.
`[실행]` `tests/scenario/sequence.test.ts` — goal 삭제 후 새 goal 이 **`goal-002`** 를 받는다
(죽은 `goal-001` 이 아니라).

`[negative]` `nextId` 를 `개수 + 1` 로 바꿔 3 fail 확인. **첫 시도에서 헤드라인 케이스가 통과했고**
(행이 연속이면 개수 == 최대값), 그래서 비연속 행을 넣어 판별력을 갖게 고쳤다
(03-implementation.md § D1). **negative 를 안 돌렸으면 몰랐다.**

### 2. `milestone main` 이 ID 로 판정한다 ✅

`[실행]` `tests/unit/milestone.test.ts` § validateForMain — 제목 거부 · 섹션명 거부 · 없는 ID 거부 ·
**제목을 통째로 바꿔도 통과**.
`[실행]` `tests/scenario/sequence.test.ts` — 같은 것을 CLI 전 흐름으로.
`[실행]` **실제 저장소에서도 확인** — `goals.md` 의 `goal-004` 제목을 바꾼 뒤 `milestone main` 이
`ok`, 되돌림.

판정 기준이 *"`main` 이 통과한다"* 가 아니라 **"제목을 바꿔도 통과한다"** 인 이유: 전자는 제목
매칭이 살아 있어도 통과한다.

### 3. 중복 ID · ID 없는 항목 · 끊어진 참조를 각각 보고한다 ✅

**계열마다 중복의 뜻이 다르다.** numbered 는 *레지스트리 안에서 같은 번호가 두 행*(병합이 만든다),
hashed 는 *살아 있는 파일들 사이에서 같은 ID*(파일 복사가 만든다). 둘 다 검사한다.


`[실행]` `tests/e2e/sequence.test.ts` § *fix --check reports…* — 5 케이스, **조건마다 개별**.
`[실행]` 중복 케이스는 **두 브랜치가 각각 레지스트리 끝에 행을 덧붙여 git 이 충돌 없이 병합한
결과**를 파일로 재현한다. 그것이 이 검사가 존재하는 유일한 이유다.
`[실행]` 마지막 케이스가 **완전히 이관된 프로젝트는 ID 경고 0** 임을 단언 — 항상 뜨는 경고가
아님을 보장한다.

### 4. 증상 2·3 이 사라진다 ✅

`[실행]` `tests/unit/milestone.test.ts` § *a bullet wrapped onto more lines* — 6 케이스.
**exit criteria 케이스를 반드시 포함**했다(증상 3 이 완료 판정 기준을 잘라먹었으므로).
HTML 주석 블록이 마지막 항목에 folding 되지 않는 것도 단언 — milestone 이 장문 메모를 거기 둔다.

`[negative]` folding 을 제거해 3 fail 확인.

### 5. 이 저장소의 기존 항목에 ID 가 부여됐다 — **범위를 좁혔다** ⚠️

`[실행]` goal **21**(번호) · milestone **2**(번호) · backlog **2**(해시) 부여 완료.
`fix --check` ID 경고 0. `sequence/backlog.md` 는 **삭제했다** — 해시 유형은 레지스트리를 갖지 않는다.

**계획은 `design 4` 도 포함했으나 하지 않았다.** `vision/design/*.md` 는 frontmatter 가 없고
코드에 읽는 곳도 없어, ID 를 부여하면 레지스트리 행이 파일에 닻을 내리지 못한다 — 이 세대가
스스로 세운 *"소비자 없는 체계는 검증되지 않는다"* 를 축소판으로 반복하게 된다.
`ds-`·`idea-`·`mem-` prefix 는 예약돼 있고 레지스트리도 읽고 쓸 수 있다 (03-implementation.md § D4).

goal 은 23 → **21** 이 됐다. `지식 축` milestone 이 goals.md 항목 셋에 걸쳐 있었고, 그 셋이
milestone 의 `## Generations` 와 같은 내용이라 covering goal 하나로 접었다 (§ D2).

### 6. genome · reap-guide 가 ID 체계를 서술한다 ✅

`[실행]` `fix --check` 크기 경고 0 (`evolution.md` 298/300, `application.md` 249/250).
`[실행]` `list-carriers.sh --orphans` 고아 0.
`[독해]` 문장 자체 — 산문이라 실행 가능한 검사가 없다.

**분업을 명확히 했다**: `reap-guide` 가 기법(prefix 표·레지스트리 형식·append-only 인 이유)을,
genome 이 행동 규칙(ID 를 손으로 짓지 마라 · `reap sequence` 로 조회하라 · ID 경고를 무시하지 마라)을
갖는다. 300줄을 넘겨 접는 과정에서 reap-guide 와 **축자 중복이던 memory decision tree** 도
포인터로 바꿨다.

### 7. 전 스위트 0 fail ✅

`[실행]` **771 / 379 / 62.**

## Self-audit (gen-064 절차)

| 항목 | 결과 |
|---|---|
| (1) 완료 기준이 테스트로 재현되는가 | 7개 중 6개 테스트, 1개(산문)는 `fix --check` |
| (2) **변경한 함수의 caller 전수 확인** | 8개 함수 grep → **결함 1건 발견** (아래) |
| (3) 사용자 명령 시퀀스를 테스트가 그대로 실행하는가 | scenario 가 `make goal → make milestone → main → 제목변경 → 삭제 → 재부여` 를 그대로 |

**(2)가 잡은 것**: `createDeferredBacklog`(early-close 승계 경로)가 ID 없이 backlog 를 만들고
있었다. `reap make backlog` 만 고치고 **backlog 를 만드는 다른 경로를 놓친 것**이다.
early-close 가 `assignId` 로 부여하도록 고치고 관측자를 붙였다 — `[negative]` id 전달을 제거해
1 fail 확인.

## 이 검증이 보지 못하는 것

- **`goals.md` 에 ID 가 붙은 뒤 agent 가 실제로 그것을 인용하는가.** 검증한 것은 CLI 가 강제하는
  경로까지다. genome 은 "ID 를 손으로 짓지 마라"고 지시하지만 **그 지시를 지키는지 보는 검사는 없다**
- **`ds-`·`idea-`·`mem-` prefix 는 예약만 됐다.** 레지스트리가 그 유형을 읽고 쓸 수 있다는 것은
  unit 이 보지만, **실제 소비자와 함께 동작하는 것은 보지 못한다**
- **idea 와 memory 가 어느 계열인지 결정하지 않았다.** 둘 다 backlog 과 같은 churn 을 갖는다
  (`freememo` 는 "어디로든, 또는 삭제", memory 는 reflect 마다 pruning). 지금은 numbered 에 있고,
  소비자가 생기는 세대가 이 선례를 놓고 판단해야 한다 — **옮기는 것은 `HASHED_TYPES` 에 한 줄**이고
  타입 시스템이 나머지를 짚어준다
- **레지스트리를 사람이 손으로 망가뜨린 경우 전부.** 표 형식이 깨지면 그 행은 조용히 무시된다
  (`readRegistry` 가 파싱 실패 행을 건너뛴다). 의도된 관대함이지만 **알려주지는 않는다**
- **migration note 가 기존 프로젝트에서 실제로 동작하는가** — 아직 작성하지 않았다(v0.18 릴리즈
  세대). 지금 상태로는 **기존 프로젝트가 이 버전을 받으면 ID 경고를 보게 된다**
- **`reap update` 는 `goals.md` 에 ID 를 부여하지 않는다.** 사용자 소유 파일이라 의도된 것이고,
  도달 경로는 migration note 뿐이다

## Evaluator

`evaluator: true` 이지만 **띄우지 않았다** — 이 세션은 subagent 호출을 사용자 명시 요청 시에만
하도록 지시받았다. longterm 은 *"독립 검토는 한 번으로 수렴하지 않는다"* 고 기록한다.

## Verdict

**pass.**

전 게이트·전 스위트 초록이고 완료 기준 7개 중 6개 충족, 1개(기준 5)는 **명시적으로 좁혔다** —
design·idea·memory 의 ID 부여를 소비자가 생기는 세대로 미뤘고 근거를 남겼다.
