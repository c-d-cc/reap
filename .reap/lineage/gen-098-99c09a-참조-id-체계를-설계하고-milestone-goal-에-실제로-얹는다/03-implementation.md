# Implementation Log

## Completed Tasks

| Task | 무엇을 했나 | 검증 |
|---|---|---|
| **T001** | `SEQUENCE_TYPES` · `SequenceEntry` · `Milestone.id` · `VisionGoal.id` | `[실행]` typecheck |
| **T002** | `paths.sequence` = `.reap/sequence/` (**점 없음** — 점은 gitignore 되는 둘뿐) | `[실행]` unit |
| **T003** | `src/core/sequence.ts` — 레지스트리 읽기·`nextId`·`appendEntry` | `[실행]` unit 19 |
| **T004** | `findDuplicates` · `lookup` · `allIds` · `idsOfType` | `[실행]` 동일 |
| **T005** | `tests/unit/sequence.test.ts` | `[실행]` + `[negative]` — 아래 D1 |
| **T006** | `reap make goal` — `goals.md` 에 **append 만** | `[실행]` e2e |
| **T007** | `make milestone` / `make backlog` 이 ID 부여 + frontmatter | `[실행]` e2e |
| **T008** | `reap sequence [type\|id]` | `[실행]` e2e + 실제 저장소 |
| **T009** | `tests/e2e/sequence.test.ts` — 14 케이스 | `[실행]` |
| **T010** | `parseGoals` 가 `` `goal-NNN` `` 을 `id` 로 분리, 제목에서 제거 | `[실행]` unit |
| **T011** | `validateForMain` 이 **ID 로 판정**. 제목 매칭 제거 | `[실행]` unit + 실제 저장소 |
| **T012** | milestone frontmatter `id:` + `goal:` 이 ID | `[실행]` e2e |
| **T013** | **역방향 관측자** — goal 제목을 통째로 바꿔도 참조가 산다 | `[실행]` unit + scenario |
| **T014** | `readBullets`/`readGenerations` 이어진 줄 folding (증상 2·3) | `[실행]` unit |
| **T015** | 6 케이스 + `[negative]` 3 fail 확인 | `[실행]` |
| **T016** | `fix --check` — 중복 ID · ID 없는 항목 · 끊어진 참조 | `[실행]` e2e |
| **T017** | 조건별 개별 케이스. **merge 로 중복이 생기는 경로**를 재현 | `[실행]` e2e 5 |
| **T018** | `init`/`update`/`migrate` 에 `sequence/` + **이 저장소 이관** | `[실행]` self-diagnosis |
| **T019** | reap-guide ×2(기법) · genome ×2(행동 규칙) · `help.ts` | `[실행]` `fix --check` |
| **T020** | `tests/scenario/sequence.test.ts` — 참조의 일생 7단계 | `[실행]` |

## Discovered Tasks

### D1 — 내 헤드라인 테스트가 결함을 보지 못했다

`sequence — a number handed out is never handed out again` 의 첫 케이스는 *"3개 부여 → 항목 하나
삭제 → 다음은 004"* 였다. **`nextId` 를 `개수 + 1` 로 망가뜨려도 통과했다** — 행이 연속이면
`개수` 와 `최대값` 이 같기 때문이다.

기능의 목적을 그대로 문장으로 옮긴 테스트가 그 기능을 관측하지 못한 것이고, gen-096 이 리디렉션에서
겪은 것과 같은 모양이다. **negative 를 돌리지 않았으면 몰랐다.**

고친 방법: 같은 시나리오 끝에 **비연속 행**(다른 브랜치가 병합한 것처럼 `goal-020`)을 넣고
`nextId` 가 `goal-021` 인지 단언. 이제 셋 다 red 가 된다.

### D2 — milestone 이 goals.md 항목 셋에 걸쳐 있었다

이관 중 `v018-지식-축-정리` 가 goal 로 **섹션 이름**을 쓰고 있어 멈췄다. 파고 보니 진짜 문제는
그 milestone 이 goals.md 의 **항목 셋**(`.reap/idea/` · memory 재설계 · interview)을 동시에
섬긴다는 것이었다. 그 셋은 **milestone 의 `## Generations` 와 같은 내용**이다.

gen-097 이 milestone↔midterm 에 그은 경계가 goals.md 에도 적용된다 — **계획을 goal 항목으로
쪼개 적지 마라.** 셋을 covering goal 하나로 접었다:

```
- [ ] `goal-018` 지식 축을 정리한다 — 참조 체계 · idea 자리 · memory 재설계 · 대화 절차
      <!-- 어떤 generation 으로 나뉘는지는 milestone 파일이 갖는다 -->
```

**부여 후 삭제가 아니라 부여 전에 재구조화했다** — 번호는 재사용되지 않으므로, 잘못 부여하면
그 번호가 영구히 죽는다. 이관 스크립트를 되돌리고 goals.md 를 먼저 고친 뒤 다시 돌렸다.

이 규칙을 genome 의 milestone 절에 한 문장으로 추가했다.

### D3 — 게이트가 "모든 새 프로젝트가 첫날부터 경고" 를 잡았다

`check-self-diagnosis.sh` 가 FAIL 했다:

```
WARNING vision/goals.md: 1 item(s) have no id — e.g. "Verify a freshly installed REAP…"
```

게이트의 fixture 가 goals.md 에 항목을 **손으로 덧붙이고** 있었고, 그것이 실제 사용자의 경로다 —
`reap init` 은 goals.md 를 대화로 채우게 한다. 즉 **경고가 정상 동작에 대해 뜬다.**

검사를 약화시키지 않았다. genome 이 경계하는 것이 *"항상 뜨는 경고는 훑고 넘긴다"* 이므로
**원인 쪽을 고쳤다** — `init` 의 prompt(greenfield · adoption)가 이제
`reap make goal --title … --section …` 을 쓰라고 지시하고, 손으로 쓰지 말라는 이유까지 말한다.
게이트의 fixture 도 사용자와 같은 경로를 쓴다.

### D4 — design · idea · memory 의 ID 부여를 미뤘다 (계획 축소)

02-planning.md 의 완료 기준 5 는 `design 4` 를 포함했다. **하지 않았다.**

`vision/design/*.md` 는 **frontmatter 가 없고**(전부 `# 제목` 으로 시작) 코드에 읽는 곳도 없다.
ID 를 지금 부여하면 레지스트리 행이 파일에 닻을 내리지 못하고, 참조하는 소비자도 없다 —
이 세대가 스스로 세운 *"소비자 없는 체계는 검증되지 않는다"* 를 축소판으로 반복하는 것이다.

**prefix 만 예약했다.** `ds-` · `idea-` · `mem-` 은 `SEQUENCE_TYPES` 에 있고 레지스트리도
읽고 쓸 수 있다. 실제 부여는 그것을 참조하는 세대(memory 재설계 · idea 자리)가 한다.

## Architecture Decisions

### 레지스트리가 곧 카운터다

`nextId` 는 **레지스트리의 최대값 + 1** 이고, 행은 지워지지 않는다. 그래서 별도 카운터 필드도,
상태 파일도 없다. 항목을 지워도 그 번호는 영구히 소진된 채로 남는다 — 옛 참조가 다른 것을
가리키게 되는 일이 **구조적으로** 불가능하다.

### SQLite 를 쓰지 않은 이유는 성능이 아니라 merge 다

REAP 은 병렬 브랜치 merge 를 1급으로 갖는다(`mate`→`merge`→`reconcile`). 두 브랜치가 같은 번호를
부여했을 때 그 충돌은 **사람이 읽고 풀 수 있어야** 하는데, 바이너리는 파일 전체가 한 덩어리라
git 이 아무것도 못 한다. 규모(200행)와 `engines` 부재(Node 22.5+ 요구)도 같은 방향이었다.

### ID 는 검사를 하나 늘린다

두 브랜치가 각각 레지스트리 **끝에** 행을 덧붙이면 줄이 다르므로 **git 이 충돌 없이 둘 다
병합한다.** 같은 번호를 가진 항목이 둘 생기고 아무것도 알아채지 못한다. `findDuplicates` 가
그것만을 위해 있고, e2e 가 그 병합 결과를 파일로 재현해 단언한다.

### `reap make goal` — 사용자 소유 파일에 쓰는 첫 경로

`goals.md` 는 사용자가 쓰는 파일이다. 안전을 플래그가 아니라 **구조**에 뒀다 —
`appendGoalLine` 은 줄을 **끼워 넣기만** 하고 기존 줄을 읽어 다시 쓰는 코드가 없다.
e2e 가 "원본의 모든 줄이 그대로 있고 줄 수가 정확히 1 늘었다"를 단언한다.

## Deferred Items

- **design · idea · memory ID 부여** — D4
- **carrier `<slug>-<hash8>`** — 다음 generation (backlog `bl-002`)
- **migration note · docs 5 로케일** — v0.18 릴리즈 세대. 버전 bump 를 동반해야 한다

---

## D5 — backlog 은 번호가 아니라 해시다 (사용자 결정, validation 후 regression)

validation 을 마친 뒤 사용자가 지적했다: **backlog 은 계속 소비되고 삭제되므로 sequence 를
쓰면 안 된다.** `reap run back` 으로 implementation 까지 되돌려 반영했다.

### 근거 — 번호는 나중에 인용될 때만 값을 한다

`bl-013` 을 소비 후에 인용하는 곳이 **없다**. 살아 있는 동안의 참조는
`current.yml.sourceBacklog` 하나이고, 소비되면 lineage 가 파일 자체를 갖는다. 그런데 레지스트리는
append-only 이므로 **backlog 하나당 죽은 행 하나가 영구히 쌓인다.** 98세대면 100행이 넘고,
그 대부분이 존재하지 않는 것의 이름이다.

해시는 그 부기 없이 고유성을 준다.

### 계열이 둘이 됐다

| | 유형 | 형태 | 레지스트리 |
|---|---|---|---|
| **Numbered** | goal · milestone · design · idea · memory | `goal-004` | `.reap/sequence/<type>.md` |
| **Hashed** | backlog | `bklog-a3f8c2` | **없음** |

**어느 계열인가는 "그 항목이 얼마나 오래 인용되는가"의 질문이다.** goal 은 몇 년을 불린다.
backlog 은 만들어지고 소비되고 사라진다.

`SEQUENCED_TYPES` / `HASHED_TYPES` 로 나눴고, **타입 시스템이 backlog 을 sequenced 로 가정한
호출부를 전부 짚어줬다** — `make/backlog.ts` · `early-close.ts` · `cli/commands/sequence.ts` ·
`integrity.ts`. 하나도 손으로 찾지 않았다.

### 해시는 제목에서 파생시키지 않는다

`makeHashedId` 는 **난수**다. 제목을 해싱하면 제목이 바뀔 때 ID 도 바뀌고, 그것이 정확히 ID 가
피하려는 것이다. unit 이 *"같은 상황에서 두 번 부르면 다른 ID"* 를 단언한다.

### 검사가 계열마다 다르다

레지스트리가 없으므로 중복 탐지 대상도 다르다:
- **Numbered** — 레지스트리 안에서 같은 번호가 두 행 (병합이 만든다)
- **Hashed** — **살아 있는 파일들 사이**에서 같은 ID (파일을 복사하면 원본 ID 가 따라온다)

후자를 `integrity.ts` 에 넣었다. 형식 위반(`bklog-` + 6 hex 가 아닌 것)도 함께 본다.

### `reap sequence bklog-…` 는 에러가 아니다

레지스트리가 없는 것은 **설계**이지 결함이 아니다. 거부하는 대신
*"이건 해시 ID 라 행이 없다. `life/backlog/` 나 `lineage/` 를 보라"* 고 답한다.

### idea · memory 도 같은 성질을 갖는다 — 미결로 남긴다

`idea/freememo/` 는 backlog 원문이 **"어디로든, 또는 삭제"** 라 적었고, memory 는 reflect 마다
pruning 된다. **둘 다 backlog 과 같은 churn 을 갖는다.**

지금은 `SEQUENCED_TYPES` 에 두었다 — 소비자가 없어 결정할 근거가 없기 때문이다.
**그 세대가 이 선례를 놓고 판단하면 된다**: 계열을 옮기는 것은 `HASHED_TYPES` 배열에 한 줄이고,
타입 시스템이 나머지를 짚어준다.

---

## D6 — backlog frontmatter 에 `from` (사용자 요청, 두 번째 regression)

**`from` 은 가장 직접적인 원인 하나의 ID 다.** 나중에 문서 간 연관을 따라가는 실마리다.

```yaml
id: bklog-a3f8c2
from: gen-098-99c09a
```

**목록이 아니다** (사용자 지적, 2차 수정). 처음에 `[gen-097-e3ae8e, ms-002]` 처럼 맥락까지 담았는데,
그러면 필드가 **"관련 있음"** 을 뜻하게 되고 그 순간 아무것도 답하지 않는다. `ms-002` 는 그 backlog 가
속한 milestone 이지 그것을 만들게 한 것이 아니다 — 만든 것은 `gen-097` 이다.

**종류를 generation 으로 한정하지도 않는다.** 대개 그렇지만, 결론이 일을 만들어낸 design 문서 ·
goal · milestone · 둘로 쪼개진 backlog 무엇이든 원인이 될 수 있고 종류는 prefix 가 알려준다.

읽는 쪽은 대괄호와 따옴표를 관대하게 받되 **첫 항목만** 취한다 — 손으로 쓴 파일과 앞선 목록 형태가
둘 다 읽힌다.

### `derivedFrom` 과 합쳤다

`createDeferredBacklog` 이 이미 `derivedFrom: {gen-id}` 를 쓰고 있었다 — **이름만 다른 같은 필드**다.
확인해보니 **쓰기만 하고 읽는 코드가 없었다**(테스트 3곳이 문자열을 단언할 뿐).
`from: [{gen-id}]` 로 대체해 이름을 하나로 만들었다.

### 이 세대에 넣은 이유

이 generation 의 목표가 *"체계를 세우고 **첫 소비자에 얹는다**"* 였는데, `from` 은 **두 번째
소비자**다. 함께 나가면 체계가 소비자 하나가 아니라 둘로 검증된 채 나간다 — 그리고 그 둘이
성격이 다르다: milestone→goal 은 **한 종류를 가리키는 단일 참조**, `from` 은 **여러 종류가 섞이는
목록**이다. 후자가 memory 의 `from`/`to` 가 쓸 모양이다.

### 검증은 권위 있는 출처가 있는 것만 한다

| 참조 | 어떻게 다루나 |
|---|---|
| `goal-NNN` | `goals.md` 에 있어야 한다 — 없으면 warning |
| `ms-NNN` | milestone 파일에 있어야 한다 — 없으면 warning |
| `gen-NNN-hash` | **형식만** 본다 — lineage 압축으로 사라졌을 수 있다 |
| `ds-`·`idea-`·`mem-` | **형식만** 본다 — prefix 만 예약됐고 아직 부여하지 않는다 |
| 그 외 | REAP ID 가 아니면 warning |

**전부 해석하라고 요구하면 REAP 이 정상 동작하는 것에 대해 경고한다** — D3 에서 이미 한 번 걸린
함정이라 같은 실수를 두 번 하지 않았다.

**오타는 생성 시점에 거부한다.** `--from` 이 ID 가 아닌 것을 받으면 `make backlog` 이 실패한다 —
허공을 가리키는 링크를 만들어 두고 나중에 보고하는 것보다 낫다.

### `from` 이 없으면 prompt 가 요구한다

`make backlog` 이 `from` 없이 불리면 *"한 문서가 이것을 만들게 했다면 그 ID 를 넣어라 —
**하나, 가장 직접적인 것**"* 이라고 말한다. 강제하지 않는 이유는 **원인이 정말 없는 backlog 도
있기 때문**이고, 빈 값을 강제하면 아무 ID 나 채워 넣게 된다.
