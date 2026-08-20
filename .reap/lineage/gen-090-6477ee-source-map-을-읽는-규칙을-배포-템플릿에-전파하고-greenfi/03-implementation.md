# Implementation

## Completed Tasks

| # | Task | 결과 |
|---|---|---|
| T001 | `tests/e2e/init-basic.test.ts` 에 greenfield source-map 케이스 2개 추가 | RED 확인 (9 pass / 2 fail, ENOENT) |
| T002 | `tests/unit/shipped-source-map-rule.test.ts` 신설 (7 케이스) | RED 확인 (1 pass / 6 fail) |
| T003 | `scripts/check-self-diagnosis.sh` §3 에 source-map assertion | 게이트 FAIL 확인 |
| T004 | `src/templates/evolution.md` — 규칙 + carrier 표식 | 완료 |
| T005 | `src/cli/commands/init/greenfield.ts` — 스텁 생성 + PHASE 6 지시 | 완료 |
| T006 | `src/templates/migration/v0.17.6.md` — §6 추가 | 완료 |
| T007 | `.reap/genome/evolution.md` 문구 정렬 | **adapt phase 로 이동** (아래 § 계획 조정) |
| T008 | 빌드 후 T001~T003 GREEN 전환 확인 | e2e 11/11, unit 7/7, 게이트 전 절 통과 |
| T009 | negative test — 검사가 실제로 잡는지 | 3종 수행 (아래 § 검사 유효성) |
| T010 | 릴리즈 문서 3종 갱신 | NOTES 1 bullet / NOTICE en·ko / 5 로케일 |
| T011 | `vite build` + `check-docs-version.sh` | 둘 다 통과 |
| T012 | 전체 스위트 + typecheck | 아래 § 최종 수치 |
| D001 | (발견) `legacy-init.test.ts` 의 기존 기대값 수정 | 아래 § Discovered Tasks |
| E101 | (evaluator R1) FR3 을 실행하는 e2e assertion 추가 | negative 확인 후 GREEN |
| E102 | (evaluator R1) 동일성 검사의 위치 구멍 차단 | 공격 3종 전부 red |
| E103 | (evaluator R1) 스텁 문구에서 코드베이스 크기 전제 제거 | 재작성 |
| E104 | (evaluator R1) artifact 표기 정확도 2건 정정 | 완료 |

## 계획 조정 — T007 을 adapt phase 로 옮겼다

implementation stage 의 HARD-GATE 는 **"Do NOT modify Genome or Environment directly"** 다.
본 세대는 embryo 라 genome 직접 수정이 허용되지만, REAP 자신의 `.reap/genome/evolution.md` 를
지금 고칠 이유가 없다 — genome 변경의 지정 자리는 **completion 의 adapt phase** 이고,
거기서 302줄 초과 경고(가이드라인 300)를 **잘못 놓인 내용을 옮겨서** 함께 해소해야 한다.
지금 한 줄 더 쓰면 그 작업을 두 번 하게 된다.

**scope 축소가 아니다** — adapt 는 본 세대의 일부다. FR5 는 adapt 에서 이행한다.
FR6(carrier 동일성 검사)은 영어 carrier 둘만 비교하므로 T007 에 의존하지 않는다.

## Discovered Tasks

### D001 — `legacy-init.test.ts` 가 "greenfield 는 source-map 을 만들지 않는다"를 명시적으로 검사하고 있었다

02-planning.md 은 *"기존 케이스의 기대값은 바뀌지 않는다"* 라고 썼다. **틀렸다.**
`init-basic.test.ts` 만 보고 `grep -rn source-map tests/` 를 하지 않은 결과다.
전체 e2e 를 돌려서야 드러났다:

```
tests/e2e/legacy-init.test.ts:127
  // Greenfield override should not create source-map
  expect(await fileExists(... "source-map.md")).toBe(false);
```

**이 실패는 유용했다.** 그 테스트의 시나리오는 `--mode greenfield` 를 **코드가 있는 디렉토리에
강제**하는 경우다 (`package.json` + `src/index.ts` 존재). 초안 스텁은 첫 문장이
*"This project has no source files yet."* 였는데, 그 디렉토리에서는 **거짓**이다.

조치 2건:
1. 스텁이 트리에 대해 아무것도 주장하지 않게 고쳤다 — `(not recorded yet)`. 코드가 있든 없든 참이다.
2. `legacy-init.test.ts` 의 기대값을 뒤집고 **왜 뒤집혔는지 주석으로 남겼다.**
   회귀 방지 assertion 도 붙였다. 초안은 `not.toContain("no source files yet")` 하나였는데
   **evaluator 가 "생각해낸 문장 하나만 잡는다"고 지적**해 `toContain("(not recorded yet)")` 을
   더했다 — 참인 문구를 고정하는 쪽이 거짓 문구를 하나씩 나열하는 것보다 강하다.

## 변경 내역

### `src/templates/evolution.md` (+2줄)

`## Code Quality Principles` 바로 위에 `<!-- reap:carrier(source-map-read-rule) -->`,
첫 bullet 으로 **Read source-map first** 삽입.

문구의 구조는 planning 에서 정한 대로 **명령형이 먼저, 부재는 예외**다. 다만 정확히 적자면
**예외 절은 조건부다** — "없으면 `summary.md` 가 구조를 갖고 있고, 그것이 커지면 그때 만들어라".
planning 이 쓴 *"예외의 답은 '만들어라'"* 보다 약하다.

의도한 것이다. 무조건 "만들어라"는 이제 막 init 한 빈 프로젝트에도 걸리는데 그때는 쓸 내용이 없다.
**무조건형 지시는 migration note §6 말미가 갖는다** — 그쪽 대상은 코드가 이미 있는 프로젝트라
쓸 내용이 있다. 두 채널이 각자 참인 것을 말한다.

backlog 의 S1 원안(*"있으면 읽는다. 없으면 summary.md 가 갖고 있다"*)은 그래도 쓰지 않았다 —
부재를 정상 상태로 **축복**할 뿐 다음 행동을 주지 않기 때문이다.

표식을 절 **위**에 둔 것은 의도적이다. 아래 T002 의 동일성 검사는 heading 부터 다음 `## ` 까지를
비교하므로, 표식이 절 안에 있으면 migration note 의 "설치할 텍스트" 블록에도 REAP 내부
bookkeeping 이 실려 사용자 genome 까지 따라간다.

### `src/cli/commands/init/greenfield.ts` (+38줄)

- `buildSourceMapStub(projectName)` 신설. `adoption` 의 `generateSourceMap(scan)` 은 쓸 수 없다 —
  greenfield 에는 스캔할 것이 없다. 그래서 **서술하지 않고 가르치는** 스텁이다.
- `execute()` 가 `paths.sourceMap` 에 기록. `completed[]` 에 `write-source-map` 추가
  (adoption 이 이미 쓰는 이름과 동일 — pattern-first).
- PHASE 6 에 채우기 지시 추가, 이후 단계 번호 재조정 (6단계 → 7단계).

스텁 실질 라인 **5줄** (게이트가 세어 보고한다). heading/blockquote/주석만 남지 않는다.

### `src/templates/migration/v0.17.6.md` (+80줄, §6 신설)

`application.md` 의 **3분기 판정**을 그대로 구현했다:

| 사용자 genome 상태 | 지시 |
|---|---|
| 배포 원본과 정확 일치 | **말없이 교체.** note 안에 대조용 원본 전문을 실었다 |
| 이미 source-map 언급 | **no-op, 보고도 하지 않는다** |
| 그 외 (수정/번역됨) | diff 제시 후 확인. 거절 시 `--mark-migrated` 미실행 |

원본 전문을 실을 수 있는 근거는 learning F4 — 그 절이 **v0.16.0 이래 byte-identical** 이다.
그리고 §6 말미에 **"규칙이 가리키는 파일이 실제로 있는가"** 를 묻고, greenfield 출신 프로젝트에
source-map 을 작성하도록 지시한다. 빈 파일을 남기지 말라는 경고도 붙였다 — 아무것도 답하지 않는
source-map 은 부재보다 나쁘다 (규칙이 agent 를 `summary.md` 로 보내지 못하고 빈 파일에 세운다).

**이 프로젝트 자신에게는 다시 뜨지 않는다** — `config.yml` 의 `lastMigratedVersion` 이 이미
0.17.6 이다. 맞는 동작이다. REAP 은 규칙을 이미 갖고 있다.

### `scripts/check-self-diagnosis.sh` (+29줄, §3 내부)

init 직후 `source-map.md` 의 **존재**와 **실질 라인 수 ≥ 1** 을 요구한다.
e2e 와 중복이 아니다 — e2e 는 소스 트리를 돌리고 게이트는 **npm 이 실제로 푸는 것**을 돌린다.
배포 산출물만 깨지는 결함은 이 프로젝트에서 이미 두 번 나왔다.

### 테스트

| 파일 | 내용 |
|---|---|
| `tests/e2e/init-basic.test.ts` | +3 케이스 (존재 / 실질 라인 / **PHASE 6 prompt**). 두 번째는 `checkIntegrity` 의 placeholder 판정과 **같은 필터**를 쓴다 |
| `tests/e2e/legacy-init.test.ts` | 기대값 1개 뒤집기 + 스텁 문구 회귀 방지 2개 (D001, E103) |
| `tests/unit/shipped-source-map-rule.test.ts` | 신설 8 케이스. 핵심은 **note 의 설치 블록 == 템플릿이 배포하는 절** (containment 가 아니라 **equality**, 그리고 두 블록 중 **두 번째**) |

### 릴리즈 문서

`RELEASE_NOTES.md` What's New 에 bullet 1개, `RELEASE_NOTICE.md` v0.17.6 의 en·ko 에 문장 1개,
`docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` 의 **기존 0.17.6 항목**에 각 언어로 1문단.
새 버전 섹션을 만들지 않았다 — 만들면 `check-docs-version.sh` 의 (1)(3) 이 깨진다.

## 검사 유효성 — 여섯 번 깨뜨려 봤다

| # | 무엇을 깨뜨렸나 | 어떤 검사가 잡았나 | 결과 |
|---|---|---|---|
| N1 | 템플릿 문구의 `open` → `Open` (한 글자) | `shipped-source-map-rule` 의 동일성 케이스 | **정확히 그 1개만** fail |
| N2 | 스텁을 heading 만 남기도록 축소 | 게이트 §3 의 실질 라인 분기 | `scaffolding only (0 content lines)` 로 FAIL |
| N3 | 위와 같은 상태에서 e2e | `init-basic` 의 실질 라인 케이스 | 10 pass / 1 fail |
| N4 | PHASE 6 의 source-map step 삭제 | `init-basic` 의 prompt 케이스 (E101) | 11 pass / 1 fail |
| N5 | **note 의 두 블록을 서로 바꿈** (evaluator 가 제시한 공격) | 동일성 + 원본 케이스 (E102) | 6 pass / **2** fail |
| N6 | note 의 블록 1개 삭제 | 블록 수 + 동일성 + 원본 | 5 pass / **3** fail |

여섯 다 복원 후 재실행해 GREEN 을 확인했다. `git diff --stat` 으로 복원을 확인했다.

**N5 가 이번 세대에서 가장 중요한 negative 다.** 초안의 검사는
`expect(note).toContain(rules)` 였고 **이 공격을 통과시켰다** — 현재 텍스트가 "대조용 원본" 블록에
들어가 있어도 containment 는 만족되므로, 설치 블록이 낡고 대조 블록도 틀린 상태로 초록이 된다.
evaluator 가 메모리 상에서 재현해 보였고, 그 뒤 검사를 **위치 고정 + equality** 로 바꿨다.
지금은 N5 가 red 다.

**N1 이 중요한 이유**: 동일성 검사가 없으면 migration note 는 "이 텍스트를 설치하라"고 계속
말하면서 그 텍스트가 더 이상 배포본과 같지 않게 된다 — 아무도 두 파일을 함께 읽지 않으므로
조용히 어긋난다. 표식은 grep 하는 사람에게만 도움이 되고, 이 검사는 그럴 필요를 없앤다.

**게이트의 존재 분기(파일 자체가 없음)는 T003 시점에 이미 FAIL 을 봤다** — 수정 전 상태에서
실제로 돌렸다. 따라서 §3 의 두 분기 모두 red 를 확인했다.

## 최종 수치

| 스위트 | baseline | 현재 | 판정 |
|---|---|---|---|
| unit | 575 | **583** (+8) | 0 fail |
| e2e | 326 | **329** (+3) | 0 fail |
| scenario | 44 | **44** | 0 fail |
| typecheck | — | 통과 | — |
| `check-self-diagnosis.sh` | — | **전 절 통과** (opencode 1.3.16) | source-map 5 content lines |
| `check-docs-version.sh` | — | 통과 (로케일 24항목 parity) | — |
| `docs` vite build | — | 통과 | — |

e2e 의 +3 은 전부 `init-basic` 의 신규 test 다. `legacy-init` 의 변경은 **기존 test 안의
기대값 수정**이지 test 추가가 아니다 — 초안이 이것을 "신규 3" 으로 셌고 evaluator 라운드 1 이
잡았다. 사소해 보이지만 이 lineage 는 검증 주장이 실제와 어긋나 반복해서 물렸다.

## Backlog 등록 (out-of-scope, strictEdit)

- `source-map-부재를-fix-check-가-보고할-것인가-…md` — **의도적으로 하지 않은 것**과 그 근거.
  규칙이 조건부인 동안 checker 가 부재를 경고하면 REAP 이 자기모순에 빠진다(#22 의 형태).
  재개 조건 2가지를 명시했다.
- `list-carrierssh-가-산문-속-reapcarrierid-언급을-orphan-으로-보고한다.md` —
  `--orphans` 가 항상 출력하는 가짜 항목 1건. `RELEASE_NOTES.md:47` 의 v0.17.3 설명 문장이며
  본 세대 이전부터 있었다 (`git diff` 로 확인).

## 알려진 한계 — 검사가 못 잡는 것

- **`.reap/genome/evolution.md`(한국어)는 동일성 검사 밖에 있다.** byte 비교가 불가능하므로
  carrier 표식만 연결한다. 한국어 문구가 영어 규칙과 의미상 어긋나도 아무 검사도 잡지 못한다.
  **게다가 지금은 표식조차 없다** — `grep -rn "reap:carrier(source-map-read-rule)"` 는 2개 파일만
  돌려준다 (테스트 파일 제외). adapt 에서 붙인다. `list-carriers.sh --orphans` 는 **표시되지 않은
  세 번째 carrier 를 탐지할 수 없다** — 그것이 #21/#22 의 상태였다 (evaluator R1 concern 4).
- **note 의 "원본" 블록이 v0.17.5 가 실제로 배포한 것이라는 보장은 없다.** 검사는 "그 블록이
  source-map 을 언급하지 않는다"만 고정한다. git 태그를 읽는 테스트는 checkout 의 태그 유무에
  의존하므로 CI 에서 신뢰할 수 없다. **본 세대에서는 evaluator 가 `git show v0.17.5:` 로 대조해
  확인했다** — 그 확인은 사람(또는 다음 evaluator)이 반복해야 한다.
- **릴리즈 문서에 이 변경이 실렸는지는 어떤 게이트도 확인하지 않는다.**
  `check-docs-version.sh` 는 버전 집합만 본다 (learning F7). 사람이 봐야 하는 항목이다.
- **migration note 가 실제로 사용자 genome 을 올바르게 고치는지는 검증되지 않았다.**
  note 의 *내용*(원본·신형·3분기가 존재하는가)만 검사한다. agent 가 그것을 읽고 수행하는 것은
  층2(`check-agent-integration.sh`)의 영역이며, 그쪽에도 migration 시나리오는 없다.
- **`reap init --repair` / `reap update` 는 여전히 source-map 을 보충하지 않는다.**
  의도한 제외다 (02-planning.md § 의도적 제외). 기존 프로젝트의 유일한 채널은 migration note 이며,
  그 채널이 실패하면(사용자가 거절하거나 세션이 끊기면) 그 프로젝트는 규칙만 갖고 파일은 없는
  상태로 남는다 — 그때를 위해 규칙 문구가 부재를 견디도록 쓰여 있다.

---

# 2차 구현 — 결정 B (fitness 이후 회귀)

fitness 단계에서 evaluator 가 지적하고 팀 리드를 거쳐 **사용자가 B 를 선택**했다.
`reap run back` 으로 completion → validation → implementation 으로 두 번 내려왔고,
`02-planning.md` 에 **계획 수정 절을 추가**했다 (덮어쓰지 않았다 — 무엇이 왜 늘었는지 남기려고).

## 무엇이 결함이었나

**읽기 규칙을 추가하면서 대응하는 쓰기 의무를 남기지 않았다.** 배포 genome 이 동시에 두 가지를
말하고 있었다 — "source-map 을 읽어라" 와 "구조는 summary.md 에 갱신하라". 4곳 전부 확인했다:
`src/templates/evolution.md:199`, `.reap/genome/evolution.md:290`,
`src/cli/commands/run/completion.ts:82`, 그리고 Genome vs Environment Boundary 절.

**이 세대의 변경이 직접 만든 결함**이고, 그대로 두면 신규 프로젝트의 스텁이 영원히
`(not recorded yet)` 로 남는다 — **본 세대의 migration note 가 스스로 "부재보다 나쁘다"고 부르는
상태**를 installer 가 만든다.

## Completed Tasks — 2차

| # | Task | 결과 |
|---|---|---|
| T101 | `src/templates/evolution.md` — refresh targets + boundary + absence clause + 표식 | 완료 |
| T102 | `src/cli/commands/run/completion.ts` — reflect prompt + 표식 | 완료 |
| T103 | `src/templates/migration/v0.17.6.md` — §7 신설 + 설치 블록 동기화 | 완료 |
| T104 | 재검증 (스위트 3 · typecheck · build · 게이트 2 · `fix --check` · docs build) | 전부 통과 |
| T105 | `[negative]` C9 — 한쪽만 고친 상태에서 red 인가 | **확인** (아래) |
| T106 | `.reap/genome/evolution.md` (ko) | **adapt phase** — FR5 와 같은 자리 |
| D002 | (발견) `toBe(2)` 가 설계대로 red 를 냈고, 그것이 요구한 재작성을 수행 | 아래 § D002 |

## 변경 내역 — 2차

### `src/templates/evolution.md`

- `## Environment Refresh at Completion` — "Primary update targets: Tech Stack, **Source Structure**,
  Tests" 한 줄을 **두 파일을 각각 지목하는 두 줄**로. 마지막 절이 핵심이다:
  *"Whichever file holds your structure description is the one to update; do not maintain it in both."*
  **소유 모델을 정하지 않는다** — 어느 쪽이 갖든 그쪽을 갱신하라고만 말한다.
- `## Genome vs Environment Boundary` — environment 의 집을 `summary.md` **와** `source-map.md`
  둘로. 각각의 성질(자동 로드 / on-demand)도 한 줄로.
- **absence clause 를 조건형으로** (FR10). 이전 문구는
  *"a project that has none **keeps** its structure description in `summary.md`"* 로 **지시가 아니라
  사실 주장**이었고, 0.17.6 이전 greenfield 프로젝트에는 보장되지 않는다 —
  **이 세대가 고치는 결함이 한 조항 옆에서 반복된 형태**였다. 이제
  *"read whatever structure `summary.md` carries instead, and write a source-map the first time you
  need to describe the code's shape"* 로, 관찰이 아니라 행동을 준다.
- `reap:carrier(environment-refresh-targets)` 표식.

### `src/cli/commands/run/completion.ts`

reflect prompt 의 항목 2 가 두 파일을 지목한다. `application.md` 는 규칙 텍스트와 `run/*.ts`
prompt 문자열을 **하나의 사실**로 규정하며, **#21 이 이 집합의 일부만 갱신해서 생겼다.**
표식을 함께 심었다. 기능 변화가 없는 prompt 문자열이므로 genome § 테스트 레벨 기준에 따라 신규
테스트는 만들지 않되 전체 스위트로 회귀 0 을 확인했다.

### `src/templates/migration/v0.17.6.md` §7

기존 프로젝트 도달. 두 원본 전문 + 두 교체본 + §6 과 **같은 3분기 판정**.
말미에 *"이 note 가 정하지 않는 것"* 을 명시했다 — **어느 파일이 구조를 소유해야 하는가는 여전히
사용자의 것**이고, note 는 "갖고 있는 쪽을 갱신하라"만 말한다.

### 릴리즈 문서

NOTES 1문장 · NOTICE en·ko · 5 로케일 — 전부 **기존 0.17.6 항목에 덧붙였다**.
사용자가 migration note 를 적용하면 절이 둘이 되므로 그 사실이 읽을 자리에 있어야 한다.

## D002 — `toBe(2)` 가 설계대로 작동해 스스로의 재작성을 요구했다

§7 이 markdown 블록 4개를 더하자 `expect(blocks.length).toBe(2)` 가 red 가 됐다 (`Received: 6`).

**이것이 그 단언을 `>= 2` 로 두지 않은 이유 그대로다.** `>= 2` + 마지막 블록 지목이었다면
equality 대상이 **조용히 §7 의 블록으로 갈아타고** 초록이 됐을 것이다. red 는 주석이 적어둔 지시를
집행했다 — *"산문 기준으로 재식별하라."*

그래서 `fencedMarkdown`(인덱스 기반)을 **`blockAfter(body, marker)`(산문 앵커 기반)** 으로 교체했다.
note 가 더 자라도 깨지지 않고, 인덱스 산술이 사라졌으므로 블록 수 단언도 필요 없어졌다.
**주석에 이력을 남겼다** — 다음 사람이 인덱스로 되돌아가지 않도록.

동시에 §7 이 만든 **새 carrier 쌍**(template ↔ note 의 교체 텍스트)도 같은 방식으로 묶었다.
묶지 않았으면 §6 에서 방금 없앤 결함을 §7 이 그대로 다시 들여왔을 것이다.

## 검사 유효성 — 2차 negative 4건

| # | 무엇을 깨뜨렸나 | 결과 |
|---|---|---|
| **C9/T105** | 템플릿의 규칙 문구만 고치고 note 는 그대로 | `install block is exactly …` 1개 red |
| N9 | 템플릿의 refresh bullet 을 한 단어 변경 | `what the note tells projects to install …` 1개 red |
| N10 | 템플릿의 boundary bullet 을 한 단어 변경 | 같은 케이스 1개 red |
| N11 | note 에서 `environment-refresh-targets` 표식 제거 | `both markers are present …` 1개 red |
| N12 | note 의 앵커 문장(`Replace that single line with:`) 변경 | 해당 케이스 1개 red |

다섯 다 복원 후 GREEN 확인, `git diff --stat` 으로 잔해 0 확인.
**각 변형이 정확히 1개씩만 red 를 만든다** — L5 의 규율대로 개수와 판별력이 일치한다.

## 최종 수치 — 2차

| 스위트 | 1차 | 2차 | 판정 |
|---|---|---|---|
| unit | 583 | **585** (+2) | 0 fail |
| e2e | 329 | **329** | 0 fail |
| scenario | 44 | **44** | 0 fail |

typecheck · build · `check-self-diagnosis.sh`(전 절) · `check-docs-version.sh` · docs `vite build`
전부 통과. `fix --check` **0 error / 3 warning** (전부 상속분, 변화 없음).

`bash scripts/list-carriers.sh` → `environment-refresh-targets (4 files)`.
**`.reap/genome/evolution.md` 가 합류하면 5** — adapt 에서 확인한다 (C8).
