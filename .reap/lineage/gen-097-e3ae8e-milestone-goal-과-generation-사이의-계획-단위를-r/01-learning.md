# Learning

## Project Overview

REAP 은 96세대를 자기 자신 위에서 돌린 self-hosting 파이프라인이다. 이번 세대 직전에 수행한
자기진단이 이 generation 의 배경이므로 먼저 기록한다.

**gen-071~096 (26세대) 중 새 사용자 기능은 0건이었다.** 배포·설치 결함 9 / 게이트·CI 7 /
자기 정합성 5 / daemon 청소 3 / 문서 사이트 1. 코드에서도 배포 세금(4,481줄)이 라이프사이클
코어(4,222줄)보다 크다. `lifecycle.ts` 는 86줄, `nonce.ts` 는 25줄 — **코어는 건강하고 주변이
무겁다.**

그래서 v0.18 은 두 축을 동시에 다룬다:
- **축 A — 배포 형태**: plugin 전환. 위 9세대 중 8세대가 다룬 결함 class 를 소멸시킨다
- **축 B — 계획·지식 축**: milestone(본 세대) · plan · idea · memory 재설계 · interview · `/reap.plan`

**본 세대는 축 B 의 첫 항목이자 나머지 전부의 선행 조건이다.** milestone 이 정하는 경계 위에서
plan·idea·memory 의 경계가 결정되기 때문이다.

## Source Backlog

`milestone-goal-과-generation-사이의-계획-단위.md` (consumed by gen-097-e3ae8e)

### 문제

Vision 에는 지금 **goal 밖에 없다.** `vision/goals.md` 의 항목은 "외부 프로젝트에서 core lifecycle
검증" 같은 objective — 방향은 맞지만 **언제 끝났다고 할지 알 수 없다.** 그 아래는 곧바로
generation 이다. 그래서:

- goal 하나에 여러 generation 이 필요한데 **그것들을 묶는 단위가 없다.** adapt 는 매번 goals.md 와
  현재 상태의 gap 을 새로 계산하고, 세대 간 연속성은 midterm memory 의 **산문**에 의존한다
- **진행률을 말할 수 없다.** lineage 를 읽고 사람이 판단해야 한다
- **완료 판정의 근거가 없다.** goal 은 `[x]` 로 체크되지만 그 체크의 근거는 어디에도 없다

실제로 midterm memory 가 이 빈자리를 메우고 있다 — 지금 midterm 의 "릴리즈 트랙", "Evaluator
Agent 트랙 — Vision/Goal 위임만 남음"은 **사실상 milestone 이다.** 하지만 memory 는 자유 서술이고
pruning 대상이며 구조를 갖지 않는다.

### 해결 방향

```
Vision
├── Goals      — objective. 막연해도 된다. 방향
├── Milestones — goal 을 쪼갠 계획. 여러 generation 을 품는다. 경계가 명확해야 한다   ← 신설
└── Design     — 특정 주제의 설계 문서
```

**확정된 제약** (backlog 원문):
- **병렬 milestone 을 지원하지 않는다.** 활성 milestone 은 항상 0개 또는 1개
- **명확한 경계 기준을 가져야 한다** — exit criteria / out of scope / 소속 goal
- **정량 메트릭으로 완료를 판정하지 않는다** (Goodhart). 최종 판정은 인간

## Key Findings

### 1. goal 이 시스템에 들어오는 문은 정확히 3개다 — 전수 추적 완료

이번 세대 설계와 검증이 전부 여기 걸린다.

| # | 문 | 코드 | 도달 범위 |
|---|---|---|---|
| 1 | **모든 stage prompt** | `loadReapKnowledge` → `visionGoals` → `buildBasePrompt` 의 `## Vision Goals` 절 (`src/core/prompt.ts:84`) | `src/cli/commands/run/*.ts` **14개 전부**가 이걸 경유한다 |
| 2 | **generation 시작** | `start --phase scan` 의 `"Ask the human for the goal"` (`run/start.ts:31-92`) | 사용자가 goal 을 정하는 순간 |
| 3 | **다음 goal 제안** | `completion --phase adapt` → `buildVisionGapAnalysis` (`run/completion.ts:389`) | 세대 간 연속성의 **유일한 계산 지점** |

`loadReapKnowledge` (`prompt.ts:27`) 는 필드가 **3개**뿐이다 — `visionGoals` / `memoryShortterm` /
`memoryMidterm`. milestone 이 여기 4번째로 들어가면 **문 1은 자동으로 열린다** (14개 command 를
개별로 고칠 필요가 없다).

### 2. milestone 은 기능을 더하는 게 아니라 추측을 명시로 바꾼다

`suggestNextGoals` (`vision.ts:109`) 가 지금 다음 generation 후보를 만드는 방식:

```
goal 제목 토큰 ∩ backlog 제목 토큰 / backlog 토큰 수 >= 0.2  →  관련 있다고 판정
+ backlog priority 가 high 면 +5, medium 이면 +2
→ 상위 3개
```

**토큰 겹침 휴리스틱이다.** 한국어 조사가 STOP_WORDS 로 들어가 있는 것에서 보이듯 언어에도
민감하다. milestone 이 도입되면 "다음에 무엇을 할지"는 **추측이 아니라 milestone 이 명시적으로
갖는 목록**에서 나온다. 즉 이 세대의 가치는 새 개념 추가보다 **기존 추측 경로의 대체**에 있다.

이것이 설계 판단에 미치는 영향: **milestone 이 활성일 때 `suggestNextGoals` 는 무엇을 하는가.**
(a) 완전히 대체 (b) milestone 목록을 우선하고 그 뒤에 붙임 (c) 그대로 둠 — 셋 중 골라야 하고,
`buildVisionGapAnalysis` 의 3개 절 중 **"Next Generation Candidates" 절이 그 자리**다.

### 3. 배선 지점이 전부 기존 패턴 위에 있다 — 새 구조가 필요 없다

| 필요한 것 | 기존 패턴 | 위치 |
|---|---|---|
| `vision/milestones/` 경로 | `paths.visionDesign` 과 동형 | `core/paths.ts:63` |
| `reap make milestone` | `RESOURCES = ["backlog", "hook"]` 배열 + dispatch | `cli/commands/make/index.ts` — 3줄 추가 |
| 템플릿 강제 + 채우기 지시 | `makeBacklog` 의 `prompt` 필드 | `make/backlog.ts` |
| `GenerationState.milestoneId?` | `sourceBacklog?: string` 바로 옆 | `types/index.ts:75` |
| lineage entry 기록 | `goal` / `status` 를 쓰는 자리 | `core/archive.ts:67,99` |
| 구조 검증 + 크기 경고 | memory tier 검증과 동형 | `core/integrity.ts:124-134, 179-193, 585-620` |

**새 lifecycle stage 도, 새 nonce 전이도 필요 없다.** backlog 의 설계 원칙 *"milestone 은 계획이지
실행 단위가 아니다"* 가 코드 구조로도 확인된다.

### 4. 이번 세대는 embryo 다 — genome 을 직접 고칠 수 있다

`type: embryo`. milestone 도입은 `genome/application.md` 의 Vision 3분류와
`genome/evolution.md` 의 memory 분류 규칙을 함께 건드리므로, backlog→adapt 우회 없이
**본 세대에서 직접 수정 가능하다.** 단 evolution.md 는 현재 299줄로 guideline(~300줄) 경계에 있다.

### 5. 규칙이 기존 프로젝트에 도달하는 채널은 migration note 뿐

`src/templates/evolution.md` 를 고쳐도 그것은 `initCommon` 하나에서만 소비된다 —
**`reap update` 와 `reap init --repair` 는 genome 을 건드리지 않는다** (user-owned 자산이므로
올바른 설계). 따라서 milestone 규칙을 기존 프로젝트에 전달하려면
`src/templates/migration/vX.Y.Z.md` 가 필요하다.

**단, 버전 게이트가 걸린다**: `check-docs-version.sh` § 5 가 note 버전 > 패키지 버전을 막는다.
현재 `package.json` 은 0.17.7 이고 이미 발행됐다. 따라서 migration note 는 **다음 bump 와 같은
세대**에 있어야 하고, 본 세대는 bump 를 하지 않으므로 **note 작성은 v0.18 릴리즈 세대로 미룬다.**
그때 milestone·plan·idea·memory 의 규칙 변경을 한 note 로 묶는 것이 자연스럽다.

### 6. midterm memory 와의 경계가 이 작업의 실질 난이도다

지금 midterm 이 담고 있는 것을 실제로 읽어보면:

- "릴리즈 — 0.17.6 은 발행됐고, 그 뒤 문서 정리가 얹혔다 (사용자 판단 대기)" → **milestone**
- "0.18 — 별도 브랜치, 6건" + 순서 + 미결 셋 → **milestone**
- "Embryo → Normal transition" → 보류된 판단. milestone 아님
- "Evaluator Agent 트랙 — Vision/Goal 위임만 남음" → **milestone**

**midterm 의 대부분이 milestone 으로 이동한다.** 그러면 midterm 에 무엇이 남는가 — 이 질문에
답하지 않으면 같은 내용이 두 곳에 생긴다. 그리고 그 규칙은 genome·`reap-guide.md`·5개 로케일이
함께 아는 사실이라 **carrier `memory-tier-classification`** 대상이다.

이미 후속 backlog 가 있다: `memory-를-3-tier-에서-flat-메타데이터로-재설계한다.md` (v0.18).
**본 세대는 그 재설계를 하지 않는다** — 다만 milestone 이 midterm 에서 무엇을 가져가는지
**명시적으로 선언**해야 그 backlog 가 전제를 가질 수 있다.

## Previous Generation Reference

gen-096 (docs prerender + 로케일 URL 분리). fitness: `fitness good. proceed`.

이월되는 교훈 둘:

- **관측자 없는 기능을 만들지 마라.** gen-096 은 리디렉션을 구현하고 unit 657 + 게이트 2종을
  통과했는데, **그 기능을 한 줄로 꺼도 전부 초록이었다.** 모든 단언이 순수 함수와 파일 안
  문자열 순서에 있었기 때문이다. → 본 세대는 **"milestone 주입을 껐을 때 무엇이 빨개지는가"**
  에 답할 수 있어야 한다
- **독립 검토는 한 번에 수렴하지 않는다.** gen-096 은 4라운드를 받았고 **매 라운드의 결함이 직전
  라운드의 수정 안에 있었다.** 4차 수정분은 아직 검토받지 않았다

## Backlog Review

`life/backlog/` 는 현재 **비어 있다** (source backlog 소비 후).

직전에 v0.17 잔여 9건을 `vision/design/backlogs_v0.17_residual/` 로 이관했다 — 7건이 REAP 자기
기계장치에 대한 것이라, plugin 전환 후 무엇이 살아남는지 판정하기 전에 고치면 헛일이 되기
때문이다. 그 폴더의 README 가 항목별 재검토 질문과 소멸 후보 여부를 갖는다.

**본 세대와 관련 있는 것은 없다.** v0.18 계획 6건은 `backlogs_v0.18/` 에 있으며, 그중
`memory-...재설계` 가 본 세대의 §6 결정에 **종속**된다(선행-후행 관계이지 병행 아님).

## Technical Deep-Dive — 닫아야 할 설계 결정 6개

backlog 가 5개를 열어뒀고, 사용자가 **6번째**를 추가했다.

**1. 경계 기준.** exit criteria / out of scope / 소속 goal. 정량 금지, 최종 판정은 인간.

**2. 저장 형태.** `vision/milestones/<slug>.md` 개별 파일 vs 단일 파일 · 완료 후 행선지 ·
활성 1개 제약을 **CLI 가 강제**할지 규약으로 둘지.

**3. generation 과의 연결.** `current.yml.milestoneId` · lineage entry · backlog 와의 관계
("backlog 는 다음에 할 일, milestone 은 왜 하는지의 묶음" 구분이 성립하는가).

**4. lifecycle 통합 지점.** adapt(제안) / reflect(전진 기록) / 완료 선언 주체(agent 제안 + 인간
승인 — embryo→normal 패턴 재사용) / dynamic context 노출 여부.

**5. midterm memory 와의 경계** — §6 참조. **실질 난이도.**

**6. "실현 가능한 generation 단위" (사용자 추가).** milestone 이 **계획된 generation 목록을
갖는가**, 아니면 exit criteria 만 갖고 adapt 가 매번 파생하는가.

이 6번이 §2(추측→명시)와 직결된다. 목록을 갖지 않으면 다음 generation 은 여전히 토큰 겹침
휴리스틱에서 나오고, milestone 은 "이름 붙은 midterm memory" 가 된다. 반대로 목록을 고정하면
계획이 현실을 못 따라간다. **갱신 가능한 목록**이 답으로 보이지만, 그 순간 `plan` backlog 와
겹치기 시작하므로 **plan 과의 경계를 여기서 함께 그어야 한다** — 나중에 하면 두 축이 어긋난다.

## Context for This Generation

**Clarity: high.**

근거: (a) source backlog 가 문제·해결·결정 항목·변경 파일을 전부 명시한다 (b) 파이프라인 배선
지점을 이 세션에서 전수 추적했다 (c) 사용자가 검증 방법을 직접 지정했다.

**검증 방법은 사용자가 지정했다** — *"무리하게 검증을 하기보다 milestone 문서 및 goal 을 소비하는
agent prompt 들과의 인과성 내부 검토로 검증한다."* 실행 가능한 형태로 옮기면:

```
[정방향] milestone 을 하나 만든다 → 문 1·2·3 각각에 실제로 도달하는가
[역방향] 활성 milestone 을 비운다 → 무엇이 여전히 초록인가   ← gen-096 교훈
[경계]   exit criteria 없는 milestone 생성이 거부되는가 / 활성 2개를 만들면 어떻게 되는가
```

unit test 는 경계 판정(1개 제약, exit criteria 부재 거부)에만 걸고, 나머지는 위 추적으로 대체한다.

**가정**:
- 본 세대는 **버전 bump 를 하지 않는다.** migration note 는 v0.18 릴리즈 세대에서 다른 규칙
  변경과 묶는다 (§5)
- 본 세대는 **memory 재설계를 하지 않는다.** midterm→milestone 의 경계 선언까지만 한다 (§6)
- 본 세대는 **plugin 전환과 독립적이다.** main 에 들어가고, plugin 브랜치가 이것을 상속한다
- 완성 직후 **첫 milestone 을 v0.18 로 생성**해 도그푸딩한다 — 만든 것으로 즉시 다음 계획을 세운다
