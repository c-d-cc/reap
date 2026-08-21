# Planning

## Goal

`vision/milestones/` 를 신설해 **goal 과 generation 사이의 계획 단위**를 만들고, 그것이 goal 을
소비하는 **3개 문 전부에 실제로 도달**하게 배선한다.

## 확정된 설계 결정

learning 의 6개 미결을 사용자 확인으로 닫았다.

| # | 결정 | 근거 |
|---|---|---|
| 1 | **경계 3요소 필수** — exit criteria / out of scope / 소속 goal | backlog 원문. 없으면 milestone 은 이름 붙은 memory 다 |
| 2 | **`vision/milestones/<slug>.md` 개별 파일** | `vision/design/` · `life/backlog/` 과 동형 |
| 3 | **갱신 가능한 generation 목록을 갖는다** (사용자 선택) | 목록이 없으면 다음 세대가 여전히 토큰 겹침 휴리스틱에서 나온다 |
| 4 | **완료본은 `vision/milestones/` 에 `status: completed` 로 남는다** | 폴더의 값은 **draft 를 여러 개 미리 두는 것**에 있고, 완료본을 옮기면 코드 경로·경로 상수·양쪽 integrity 검증이 늘어난다. milestone 은 96세대 동안 열 개 남짓일 물건이라 쌓여도 문제가 아니다. **자동 아카이브를 만들지 않는다** — 폴더가 실제로 붐비면 `goals.md` cleanup 과 같은 방식(사람 판단)으로 지운다 |
| 5 | **main 1개 + 나머지는 상황에 따라 소비 가능** (사용자 선택) | 일을 하다 보면 뒤쪽 계획의 항목을 앞당겨야 한다. "활성 1개"는 그것을 막는다. 초점은 하나지만 **소비는 열려 있다** |
| 6 | **milestone-plan 경계 선언만 한다** | plan 은 "무엇을 만들 것인가", milestone 은 "그것을 언제 어떤 순서로". 자리 신설은 별도 backlog |

### 상태는 둘, 초점은 플래그, 유효성은 파생

| 축 | 값 | 저장 위치 |
|---|---|---|
| **상태** | `open` / `completed` | frontmatter `status:` |
| **초점** | main 인가 아닌가. **정확히 하나** | frontmatter `main: true` |
| **유효성** | 경계 3요소가 채워졌는가 | **저장하지 않는다 — 내용에서 파생** |

`reap make milestone` 은 backlog·hook 과 같은 **템플릿 생성 후 채우기** 패턴이라 생성 시점에는
경계가 비어 있다. 앞선 안은 그것 때문에 `draft` 상태를 뒀는데, **main 지정이 검증의 자리가 되면
`draft` 는 필요 없다** — 경계가 빈 milestone 은 "미완성 상태"가 아니라 그냥 **유효하지 않아서
후보를 내지 못하는** milestone 이다. 저장할 상태가 아니라 물어보면 답이 나오는 성질이다.

**소비는 열려 있다.** 문 2·3 의 goal 후보는 **유효한 모든 open milestone** 에서 나오되 **main 이
먼저** 온다. 뒤쪽 계획의 항목을 앞당기는 것은 그 목록에서 고르는 일이지 예외가 아니다.

**main 이 강제하는 것은 개수가 아니라 유일성이다.** `reap milestone main <slug>` 은 경계 3요소를
검증하고, 이전 main 의 플래그를 **자동으로 내린다**. 거부되는 것은 "두 번째 main" 이 아니라
"경계 없는 것을 main 으로 삼는 일" 이다.

### 파일 형태

```markdown
---
goal: <goals.md 의 항목과 일치하는 제목>
status: draft | active | completed
createdAt: <ISO>
---

# <title>

## Exit Criteria
- <판정 가능한 사실. 정량 메트릭 금지>

## Out of Scope
- <무엇이 이 milestone 이 아닌가>

## Generations
- [x] gen-097 — milestone 도입
- [ ] plugin 전환
```

## Requirements

**FR-1** `reap make milestone --title "<t>" --goal "<g>"` 가 `vision/milestones/<slug>.md` 를
`status: draft` + 템플릿으로 만든다.

**FR-2** `reap milestone main <slug>` 이 (a) Exit Criteria 가 비었거나 (b) Out of Scope 가
비었거나 (c) `goal` 이 `goals.md` 의 어떤 항목과도 매칭되지 않거나 (d) 대상이 `completed` 이면
**거부**한다. 통과하면 이전 main 의 플래그를 내리고 대상에 세운다 — **main 은 항상 0개 또는 1개**.

**FR-3** `reap milestone list` 가 상태별로 묶인 목록을 내고 **main 을 표시**한다.
`reap milestone close <slug>` 가 `status: completed` 전이를 수행한다. **파일은 제자리에 남는다.**
대상이 main 이었으면 플래그를 내리고 **다음 main 을 고르라고 안내**한다 (자동 승계 없음 — 초점은
사람이 정한다).

**FR-4 (문 1)** `buildBasePrompt` 가 `## Milestone` 절을 낸다 — 내용은 **이 generation 이 속한
milestone**(`current.yml.milestoneId`), generation 이 없으면 main. 그것이 main 이 아니면
**main 의 제목을 한 줄로 덧붙인다**(초점이 어디인지 알아야 out-of-scope 판단이 선다).
`run/*.ts` 14개 전부가 `buildBasePrompt` 를 경유하므로 개별 수정 없이 도달한다.

**FR-5 (문 2)** `run start --phase scan` 이 **유효한 모든 open milestone** 의 미체크 generation 을
goal 후보로 제시한다 — **main 이 먼저**, 나머지가 milestone 별로 묶여 뒤에. 각 후보에 출처 slug 를
붙여 `--milestone <slug>` 으로 재호출할 수 있게 한다.

**FR-6 (문 3)** 유효한 open milestone 이 하나라도 있으면 `buildVisionGapAnalysis` 의
"Next Generation Candidates" 절이 **토큰 겹침 휴리스틱 대신 milestone 의 미체크 목록**에서 나온다.
순서는 문 2와 같다 (main 먼저).

**FR-7** `run start --phase create --milestone <slug>` 이 그 milestone 을
`current.yml.milestoneId` 에 기록한다. **미지정 시 main** (main 도 없으면 미기록).
`archive` 가 lineage entry 에 싣는다. `--backlog` 와 같은 형태의 플래그다.

**FR-8** `completion --phase reflect` 가 이번 generation 이 milestone 을 얼마나 전진시켰는지
기록하도록 지시하고, `05-completion.md` 템플릿에 그 절이 있다.

**FR-9** `reap fix --check` 가 `vision/milestones/` 구조를 검증하고, (a) main 파일이
guideline(~80줄)을 넘거나 (b) **open 인데 유효하지 않은**(경계가 빈) milestone 이 있으면 경고한다.
(b) 는 "후보를 내지 못하는 계획이 폴더에 있다"는 신호다.

**FR-10** genome·`reap-guide.md` 가 Vision 3분류(Goals/Milestones/Design)와 **midterm memory 와의
경계**를 갖는다.

## Completion Criteria

1. `make → main → close` 가 동작하고, **경계 3요소가 빈 milestone 을 main 으로 삼는 것이 거부된다**
2. **main 은 항상 0개 또는 1개** — 새 main 지정이 이전 것을 자동으로 내린다.
   그리고 **main 이 아닌 milestone 의 항목도 goal 후보로 나온다** (앞당겨 소비 가능)
3. **문 1·2·3 각각에서 milestone 이 실제로 보인다** (정방향 인과 추적)
4. **각 문의 주입을 제거하면 대응 테스트가 red 가 된다** (역방향 관측자 — gen-096 교훈)
5. 완료된 milestone 이 `status: completed` 로 남고, **후보 조회에서 제외된다** —
   `list` 에서는 보이고 문 2·3 에는 나타나지 않는다
6. genome·reap-guide 가 Vision 3분류와 midterm 경계 선언을 갖는다
7. unit / e2e / scenario 전 스위트 **0 fail** (baseline: 670 / 329 / 44)

## Out of Scope — 명시

- **docs 5 로케일** — v0.18 은 미발행이다. 지금 문서를 고치면 reap.cc 에 없는 기능이 뜬다.
  **v0.18 릴리즈 세대로 미룬다**
- **migration note** — `check-docs-version.sh` § 5 가 note 버전 > 패키지 버전을 막고 본 세대는
  bump 하지 않는다. milestone·plan·idea·memory 규칙 변경을 **한 note 로 묶어** v0.18 릴리즈 세대에서
  작성한다 (learning §5)
- **memory 3-tier 재설계** — 별도 backlog. 본 세대는 **midterm 이 무엇을 milestone 에 넘기는지
  선언까지만** 한다
- **`.reap/plan/` · `.reap/idea/` 자리 신설** — 별도 backlog. 경계 문장만 genome 에 남긴다
- **plugin 전환** — 독립. 본 세대는 main 에 들어가고 plugin 브랜치가 상속한다

## Implementation Plan

### A. 코어 (T001~T006)

- [ ] T001 `src/types/index.ts` — `Milestone` 인터페이스 + `GenerationState.milestoneId?`
      (`sourceBacklog` 바로 옆). *테스트: typecheck*
- [ ] T002 `src/core/paths.ts` — `visionMilestones`. *테스트: unit(경로 조합)*
- [ ] T003 `src/core/milestone.ts` 신규 — **파싱**. frontmatter(goal/status/createdAt) +
      `## Exit Criteria` · `## Out of Scope` · `## Generations` 체크리스트.
      **`YAML.parse → stringify` 왕복 금지** (longterm 교훈) — 상태 전이는 줄 단위 치환.
      *테스트: unit*
- [ ] T004 `src/core/milestone.ts` — **조회·검증**. `listMilestones` / `mainMilestone` /
      `isValid`(경계 3요소 — 파생) / `candidateMilestones`(유효한 open 전부, main 먼저) /
      `validateForMain`(FR-2 의 4개 거부 조건). *테스트: unit*
- [ ] T005 `src/core/milestone.ts` — **전이**. `setMain`(이전 main 플래그 내림 포함) / `close`.
      파일은 제자리에 남고 frontmatter 의 `status:` · `main:` 한 줄씩만 바뀐다
      (줄 단위 치환 — YAML 왕복 금지). **두 파일을 고치는 연산이므로 부분 실패 시 상태를 확인**할 것.
      *테스트: unit + e2e*
- [ ] T006 unit 작성 — T003~T005. **각 거부 조건을 개별 케이스로** 쓴다. 한 케이스가 여러 조건을
      덮으면 그중 하나만 실제로 검증된다 (longterm: 묶으면 검증 수가 항목 수보다 작아진다)

### B. CLI 표면 (T007~T009)

- [ ] T007 `src/cli/commands/make/milestone.ts` + `make/index.ts` 의 `RESOURCES` 에 추가.
      `makeBacklog` 패턴 그대로 — 템플릿 생성 후 `prompt` 로 채우기 지시. *테스트: e2e*
- [ ] T008 `src/cli/commands/milestone.ts` 신규 (`list` / `main` / `close`) +
      `src/cli/index.ts` 라우팅. *테스트: e2e*
- [ ] T009 e2e — `make → main → close` 전체 흐름 + **거부 경로 3종**(경계 미충족 / goal 불일치 /
      completed 를 main 으로) + **main 교체가 이전 것을 내리는지**

### C. 3개 문 배선 + 관측자 (T010~T015) — **본 세대의 핵심**

- [ ] T010 **문 1** — `prompt.ts` 의 `ReapKnowledge` 에 milestone 필드 추가,
      `loadReapKnowledge` 가 읽고, `buildBasePrompt` 가 `## Vision Goals` 뒤에 `## Milestone` 절을
      낸다. 내용은 generation 의 milestone(없으면 main), main 과 다르면 main 제목 한 줄 추가.
      **milestone 이 하나도 없으면 절 자체가 없다**
- [ ] T011 unit **역방향 관측자** — `buildBasePrompt` 출력이 milestone 의 **제목과 미체크
      generation** 을 담는지 + **generation 의 milestone 이 main 과 다를 때 둘 다 보이는지** 단언.
      T010 의 주입을 지우면 red
- [ ] T012 **문 2** — `run/start.ts` scan 이 유효한 open milestone 전부의 미체크 generation 을
      **main 먼저** 순으로 제시하고 각 후보에 출처 slug 를 붙인다.
      `create --milestone <slug>` (미지정 시 main) 이 `milestoneId` 를 `current.yml` 에 기록
- [ ] T013 e2e **역방향 관측자** — `run start --phase scan` 의 stdout 이 milestone 유래 후보를
      담는지 + **main 이 아닌 milestone 의 항목도 후보에 있는지**(이번 결정의 핵심). T012 를 지우면 red
- [ ] T014 **문 3** — `vision.ts` 의 `buildVisionGapAnalysis` 가 후보 milestone 목록을 받아
      "Next Generation Candidates" 절을 **대체**(main 먼저). `completion.ts:389` 호출부에서 전달.
      유효한 open milestone 이 없으면 기존 `suggestNextGoals` 경로 그대로
- [ ] T015 unit **역방향 관측자** — 유효한 open milestone 이 있을 때 후보가 **토큰 휴리스틱 결과와
      다른지** 단언한다. "후보가 나온다"만 보면 대체를 지워도 통과한다 (gen-096: 기능을 지웠을 때
      무엇이 여전히 초록인가)

### D. 기록·검증 (T016~T018)

- [ ] T016 `completion.ts` reflect prompt 에 milestone 전진 기록 지시 +
      `src/templates/artifacts/normal/05-completion.md` 에 `## Milestone Progress` 절. *테스트: e2e*
- [ ] T017 `src/core/archive.ts` — lineage entry 에 `milestoneId`. *테스트: unit*
- [ ] T018 `src/core/integrity.ts` — `vision/milestones/` 디렉토리 검증(124-134행 패턴) +
      **main 파일만** 크기 guideline ~80줄(585-620행 패턴) + **open 인데 유효하지 않은 milestone**
      경고(FR-9b). completed 는 기록이므로 크기를 묻지 않는다. *테스트: unit*

### E. 규칙 전파 (T019) — embryo 이므로 genome 직접 수정

- [ ] T019 `.reap/genome/application.md`(Vision 3분류) · `.reap/genome/evolution.md`(milestone 판단
      기준 + **midterm 경계 선언**) · `src/templates/evolution.md`(동일) ·
      `src/templates/reap-guide.md` ↔ `~/.reap/reap-guide.md`(Milestone 절 + `.reap/` 구조도) ·
      `src/cli/commands/help.ts`(topic).
      **evolution.md 는 현재 299줄로 guideline(~300) 경계** — 추가분만큼 중복 절을 접는다.
      *테스트: 없음(산문). `reap fix --check` 로 크기만 확인*

### F. 시나리오 (T020)

- [ ] T020 `tests/scenario/` — **milestone 2개, 그중 하나가 main**. main 지정 → gen A 를
      **main 에서** 시작(문 2 후보 확인) → 완료(adapt 에서 문 3 확인) →
      **gen B 를 main 이 아닌 milestone 에서 시작**(앞당겨 소비 — 이번 결정의 핵심 경로) →
      main 을 `close` → **completed 가 `list` 에는 있고 문 2·3 에는 없는지** + **남은 milestone 을
      새 main 으로 지정할 수 있는지** 확인

## 테스트 영향 — 기존 것 중 고쳐야 할 것

| 기존 테스트 | 왜 영향받나 |
|---|---|
| `buildBasePrompt` 를 단언하는 unit | 절이 하나 늘어난다. milestone 이 **하나도 없으면** 출력이 **바이트 동일**해야 하며, 그것을 단언하는 케이스를 추가한다 |
| `buildVisionGapAnalysis` unit | milestone 인자가 늘어난다. 미전달 시 기존 동작 유지 단언 |
| `run start --phase scan` e2e | 출력에 절이 늘어날 수 있다. milestone 없을 때 기존 출력 유지 단언 |
| `run start --phase create` e2e | 플래그가 하나 는다(`--milestone`). 미지정 시 기존 동작 단언 |
| `integrity` / `fix --check` unit | 검증 대상 디렉토리가 하나 는다 |
| `archive` unit | lineage entry 필드가 는다 |

**"milestone 이 없으면 이전과 동일"** 을 각 지점에서 단언한다 — opt-in 이라는 설계 원칙이
테스트로 지켜져야 기존 사용자가 영향받지 않는다.

## Additional Findings

- `suggestNextGoals` 의 매칭은 `score >= 0.2` 토큰 겹침이고 STOP_WORDS 에 한국어 조사가 들어 있다.
  milestone 대체가 제거하는 것은 **이 언어 민감성**이기도 하다
- `make/index.ts` 의 `RESOURCES` 는 `as const` 배열이라 추가가 3줄이다
- `GenerationState` 에 optional 필드를 더하는 것은 `evaluatorConcerns` 선례가 있다 —
  **`CONFIG_DEFAULTS` 에 넣지 않는다**(`lastMigratedVersion` 교훈: optional tracking 필드는
  spurious diff 를 만든다)

## 인간 확인 필요

계획을 확정하기 전에 사용자 확인을 받는다 (HARD-GATE).
