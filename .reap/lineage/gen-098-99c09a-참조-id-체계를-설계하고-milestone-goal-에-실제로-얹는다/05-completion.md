# Completion

## Summary

**goal**: 한 항목이 다른 항목을 **제목이 아니라 ID** 로 가리키게 하고, 첫 소비자에 실제로 얹는다.

```
goals.md        - [ ] `goal-004` 배포 형태를 사용자 도구로 인식되게 한다
milestone       id: ms-001 / goal: goal-004
backlog         id: bklog-a3f8c2 / from: gen-098-99c09a
.reap/sequence/ goal.md · milestone.md — append-only (backlog 은 없다)
```

### 소비자가 둘이다 — 모양이 서로 다르다

| 소비자 | 모양 |
|---|---|
| milestone → goal | **한 종류를 가리키는 단일 참조** (`goal: goal-004`) |
| backlog → 원인 | **종류가 열려 있는 단일 참조** (`from: gen-098-99c09a`) |

전자는 goal 만 받고, 후자는 **무엇이든** 받되 **하나만** 받는다 — 종류는 prefix 가 알려준다.
memory 의 `from` 이 쓸 모양이 이것이고, 하나만 얹고 끝냈으면 다음 세대가 처음 마주쳤을 것이다.

**`from` 은 목록이 아니다.** 처음엔 맥락까지 담았는데, 그러면 필드가 "관련 있음"을 뜻하게 되고
그 순간 아무것도 답하지 않는다.

### 계열이 둘이다

| | 유형 | 형태 | 레지스트리 |
|---|---|---|---|
| **Numbered** | goal · milestone · design · idea · memory | `goal-004` | `.reap/sequence/<type>.md` |
| **Hashed** | backlog | `bklog-a3f8c2` | **없음** |

**어느 계열인가는 "그 항목이 얼마나 오래 인용되는가"의 질문이다.** goal 은 몇 년을 불리고,
backlog 은 만들어지고 소비되고 사라진다 — `bklog-…` 를 소비 후에 인용하는 곳이 없으므로
영구 번호를 쓰면 레지스트리가 죽은 행으로만 자란다.

### 레지스트리가 곧 카운터다

`nextId` 는 **레지스트리의 최대값 + 1** 이고 행은 지워지지 않는다. 항목을 지워도 그 번호는 영구히
소진된 채 남으므로, **옛 참조가 다른 것을 가리키게 되는 일이 구조적으로 불가능**하다.
별도 카운터도 상태 파일도 없다.

### SQLite 를 쓰지 않은 이유는 성능이 아니라 merge 다

REAP 은 병렬 브랜치 merge 를 1급으로 갖는다. 두 브랜치가 같은 번호를 부여했을 때 그 충돌은
**사람이 읽고 풀 수 있어야** 하는데, 바이너리는 파일 전체가 한 덩어리라 git 이 아무것도 못 한다.
규모(200행)와 `engines` 부재(Node 22.5+ 요구)도 같은 방향이었다.

### learning 이 문제를 한 곳으로 좁힌 것이 절반이었다

REAP 의 기존 참조 **다섯 중 넷은 이미 안정적**이었다 — milestone·backlog 는 파일 slug,
generation 은 `gen-097-e3ae8e`, carrier 는 손으로 정한 문자열. 불안정한 건 **milestone→goal 하나**고,
이유는 `goals.md` 항목이 **파일이 아니라 줄**이라 가리킬 것이 제목밖에 없어서였다.
memory 는 v0.18 재설계가 파일 단위로 바꾸므로 자연히 해결된다.

그래서 "모든 축에 ID 를 발명한다"가 아니라 **"주소가 없는 하나에 주소를 준다 + 표기를 통일한다"**
가 됐다.

### 규모

- 신규: `core/sequence.ts` · `cli/commands/sequence.ts` · `cli/commands/make/goal.ts`
- 테스트 **+57**: unit 736→**771**, e2e 355→**379**, scenario 55→**62**. 전부 0 fail
- 전 게이트 통과: typecheck ×2 · build · self-diagnosis(8절) · `fix --check` 0 error ·
  `--orphans` 고아 0. genome `evolution.md` 298/300 · `application.md` 249/250

## Lessons Learned

### 잘된 것 — 타입이 계열 변경의 파급을 전부 짚었다

validation 을 마친 뒤 사용자가 "backlog 은 sequence 가 아니라 해시여야 한다"고 지적해
implementation 으로 되돌렸다. `SEQUENCE_TYPES` 하나를 `SEQUENCED_TYPES` / `HASHED_TYPES` 로
나누자 **컴파일 에러가 호출부 넷을 그대로 짚었다** — `make/backlog.ts` · `early-close.ts` ·
`cli/commands/sequence.ts` · `integrity.ts`.

이 세대가 앞서 `createDeferredBacklog` 를 **caller grep 으로** 겨우 찾았던 것과 대비된다.
같은 종류의 누락을 한 번은 사람이 찾고 한 번은 타입이 찾았다 — **union 을 좁히면 타입이
찾아준다**는 것이 그 차이다.

### 잘된 것 — negative 가 내 헤드라인 테스트를 무너뜨렸다

`a number handed out is never handed out again` 의 첫 케이스는 기능의 목적을 그대로 문장으로 옮긴
것이었다. **`nextId` 를 `개수 + 1` 로 망가뜨려도 통과했다** — 행이 연속이면 개수와 최대값이 같다.

단언은 옳았고 **입력이 너무 가지런했다.** 판별하는 입력은 *구멍이 있는 레지스트리*(다른 브랜치가
병합한 모양)였고, 그것을 케이스에 넣자 셋 다 red 가 됐다. gen-096 의 "기능을 지우면 무엇이 여전히
초록인가"의 한 겹 안쪽 형태라 longterm 에 접어 넣었다.

### 개선할 것 — 한 종류를 고치고 그 종류의 다른 입구를 놓쳤다

`reap make backlog` 에 ID 부여를 넣고 끝냈는데, **backlog 를 만드는 경로가 하나 더 있었다** —
early-close 의 `createDeferredBacklog`. 그 경로로 생긴 backlog 는 ID 가 없어 다음 세대가 참조할 수
없다.

**잡은 것은 gen-064 의 self-audit 절차(caller 전수 grep)** 다. 테스트는 전부 초록이었다.
"이 기능을 만드는 곳이 여기 하나인가"를 묻지 않으면 테스트가 알려주지 않는다.

### 두 번째 — 게이트가 "정상 동작에 대한 경고"를 잡았다

`fix --check` 에 "ID 없는 goal" 경고를 넣자 **자기진단 게이트가 FAIL** 했다. 게이트의 fixture 가
goals.md 에 항목을 손으로 덧붙이는데, 그것이 `reap init` 이 안내하는 실제 사용자 경로였다.
즉 **모든 새 프로젝트가 첫날부터 경고를 본다.**

검사를 약화시키지 않고 **원인 쪽을 고쳤다** — `init` prompt 가 `reap make goal` 을 쓰라고
지시하고 이유까지 말한다. genome 이 경계하는 것이 *"항상 뜨는 경고는 훑고 넘긴다"* 이므로,
경고를 지우는 것과 경고가 뜰 이유를 없애는 것은 다르다.

### 세 번째 — 잘못 부여한 번호는 되돌릴 수 없다

이관 중 `지식 축` milestone 이 goals.md **항목 셋**에 걸쳐 있음을 발견했다. 그 셋은 milestone 의
`## Generations` 와 같은 내용이었다 — gen-097 이 milestone↔midterm 에 그은 경계가 goals.md 에도
적용된다는 뜻이다.

**부여한 뒤 지운 게 아니라 부여 전에 되돌렸다.** 번호는 재사용되지 않으므로 잘못 부여하면 그
번호가 영구히 죽는다. 이관 스크립트를 통째로 revert 하고 goals.md 를 먼저 재구조화한 뒤 다시 돌렸다.
**append-only 의 대가는 실수의 비가역성**이고, 그것을 이 세대가 자기 이관에서 먼저 겪었다.

### `from` 검증은 권위 있는 출처가 있는 것만 한다

`goal-NNN` 은 `goals.md` 에, `ms-NNN` 은 milestone 파일에 있어야 한다. `gen-…` 은 lineage 압축으로
사라졌을 수 있고 `ds-`·`idea-`·`mem-` 은 아직 부여하지 않으므로 **형식만** 본다.
전부 해석하라고 요구하면 **REAP 이 정상 동작하는 것에 대해 경고한다** — 이 세대가 자기진단
게이트에서 이미 한 번 걸린 함정이다.

오타는 **생성 시점에 거부**한다. 허공을 가리키는 링크를 만들어 두고 나중에 보고하는 것보다 낫다.

## Milestone Progress

`v018-지식-축-정리` (`ms-002`) 의 첫 항목 **참조·ID 체계를 완료**로 체크했다.
남은 것 다섯 — carrier hash8 → 경계 설계(3축) → memory → idea → interview.

**exit criteria 는 아직 충족되지 않았다.** 첫 조건("한 자리가 다른 자리를 가리키는 방식이
하나다")조차 milestone→goal 하나만 그렇고 memory 의 `from`/`to` 와 idea 졸업 경로는 소비자가
아직 없다. **닫을 때가 아니다.**

## Next Generation Hints

- **idea 와 memory 가 어느 계열인지 아직 정하지 않았다.** 둘 다 backlog 과 같은 churn 을 갖는다 —
  `freememo` 는 원문이 "어디로든, 또는 삭제"라 적었고 memory 는 reflect 마다 pruning 된다.
  지금은 numbered 에 있고, **소비자가 생기는 세대가 이 선례를 놓고 판단**하면 된다.
  옮기는 것은 `HASHED_TYPES` 에 한 줄이고 타입이 나머지를 짚어준다

- **다음은 `carrier ID 에 hash8`** (`bl-002`). 이 세대의 해시 생성·고유성 검사·레지스트리를
  재사용하므로 직후여야 한다. `backlogs_v0.17_residual` 의 `list-carriers.sh 산문 오탐` 건을
  **같은 세대에서** 처리할 것 — 형식이 바뀌면 어차피 같은 파일을 만진다
- **`ds-`·`idea-`·`mem-` 은 prefix 만 예약**했다. 소비자가 생기는 세대가 부여한다
- **기존 프로젝트는 이 버전을 받으면 ID 경고를 본다.** migration note 가 유일한 도달 채널이고
  버전 bump 를 동반해야 하므로 v0.18 릴리즈 세대가 쓴다. **`reap update` 는 goals.md 를 고치지
  않는다** — 사용자 소유 파일이라 의도된 것이다
- **레지스트리를 사람이 망가뜨린 경우를 아무것도 보지 않는다.** 표 형식이 깨진 행은 조용히
  무시된다. 관대함은 의도했지만 알려주지는 않는다 — 필요해지면 검사 대상

## Change Proposals

- **genome 직접 수정** (embryo): `evolution.md` 에 `### 참조는 ID 로 한다` 신설,
  Milestones 절에 *"계획을 goal 항목으로 쪼개 적지 마라"* 추가. 기법은 `reap-guide` 로 옮기고
  genome 은 행동 규칙만 갖게 분업. 300줄을 넘겨 **reap-guide 와 축자 중복이던 memory decision
  tree** 를 포인터로 접었다
- **배포 템플릿 동기화**: `src/templates/evolution.md` · `reap-guide.md` ×2
- **`init` prompt 변경**: greenfield · adoption 이 `reap make goal` 을 안내한다
- **backlog 없음.** 발견한 것은 전부 처리했거나(early-close ID) 계획된 deferral 이다
