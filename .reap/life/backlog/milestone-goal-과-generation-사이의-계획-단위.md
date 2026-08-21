---
type: task
status: pending
priority: high
createdAt: 2026-08-18T23:12:12.967Z
---

# Milestone — goal 과 generation 사이의 계획 단위

## Problem

Vision 에는 지금 **goal 밖에 없다**. `vision/goals.md` 의 항목은 "objective" — "외부 프로젝트에서 core lifecycle 검증", "Vision/Goal/Memory 관리 위임" 같은, 방향은 맞지만 **언제 끝났다고 할지 알 수 없는** 다소 막연한 목표들의 모음이다.

그 아래는 곧바로 generation 이다. 그래서 다음이 성립하지 않는다:

- goal 하나를 달성하는 데 여러 generation 이 필요한데, **그 generation 들을 하나로 묶는 단위가 없다.** adapt phase 는 매번 goals.md 와 현재 상태의 gap 을 새로 계산해 다음 목표를 제안하며, 세대 간 연속성은 midterm memory 의 산문에 의존한다
- 진행률을 말할 수 없다. "이 goal 이 얼마나 진행됐는가"에 답하려면 lineage 를 읽고 사람이 판단해야 한다
- **완료 판정이 없다.** goal 은 `[x]` 로 체크되지만 그 체크의 근거가 무엇인지는 어디에도 없다

실제로 midterm memory 가 이 빈자리를 임시로 메우고 있다 — "Evaluator Agent 트랙 — Vision/Goal 위임만 남음", "Daemon 트랙 — 유저 판단으로 일시 보류" 같은 항목은 사실상 milestone 이다. 하지만 memory 는 자유 서술이고 pruning 대상이며 구조를 갖지 않는다.

## Solution

Vision 안에 **Milestone** 을 도입한다. goal 을 달성하기 위해 **분해된 계획**이며, 하나의 milestone 안에서 **여러 generation 이 수행된다**.

```
Vision
├── Goals      — objective. 막연해도 된다. 방향
├── Milestones — goal 을 쪼갠 계획. 여러 generation 을 품는다. 경계가 명확해야 한다   ← 신설
└── Design     — 특정 주제의 설계 문서
```

### 확정된 제약

- **병렬 milestone 을 지원하지 않는다.** 활성 milestone 은 항상 0개 또는 1개. 동시에 여러 계획을 여는 것은 계획하지 않은 것과 같다
- **명확한 경계 기준을 가져야 한다.** 아래에서 정의

### 정의해야 할 것

**1. 경계 기준 — 이 개념의 핵심**

milestone 은 시작과 끝이 관측 가능해야 한다. 최소한 다음을 갖는다:

- **완료 조건 (exit criteria)** — 무엇이 참이 되면 이 milestone 이 끝나는가. 서술이 아니라 **판정 가능한 형태**여야 한다
- **범위 밖 (out of scope)** — 무엇은 이 milestone 이 아닌가. 경계는 안쪽만으로 정의되지 않는다
- **소속 goal** — 어느 goal 을 달성하기 위한 것인가. goal 없는 milestone 은 허용하지 않는다

주의: **정량 메트릭으로 완료를 판정하지 말 것.** "테스트 N개 통과", "커버리지 X%" 류는 Goodhart 로 간다 — REAP 은 이미 self-fitness 를 금지하고 인간 판단을 fitness 로 삼는다. 완료 조건은 *"이 동작이 실제로 되는가"* 같은 **검증 가능한 사실**이어야 하고, **최종 판정은 인간이 한다.**

**2. 저장 형태와 위치**
- `vision/milestones/<slug>.md` 개별 파일인가, `vision/milestones.md` 단일 파일인가. goals.md 가 단일 파일인 것과의 일관성 검토
- 완료된 milestone 은 어디로 가는가 — 파일에 `[x]` 로 남는가, lineage 로 이동하는가, 삭제하고 goal 체크만 남기는가. **goals.md cleanup 원칙(과거 아카이브가 아니라 forward-looking 문서)이 여기에도 적용된다**
- 활성 milestone 이 1개라는 제약을 **어디가 강제하는가** — 파일 규약인가 CLI 검사인가

**3. Generation 과의 연결**
- `current.yml` 에 소속 milestone 을 기록하는가. lineage entry 에는?
- `reap run start` 가 활성 milestone 을 어떻게 다루는가 — goal 후보 제안이 milestone 의 남은 작업에서 나와야 한다
- backlog 와의 관계 — milestone 이 backlog 를 소유하는가, 독립인가. **backlog 는 "다음에 할 일", milestone 은 "왜 하는지의 묶음"** 이라는 구분이 성립하는지 확인
- milestone 도중 goal 이 바뀌면(사용자가 방향을 틀면) milestone 은 어떻게 되는가 — abort 개념이 필요한가

**4. Lifecycle 통합 지점**
- **adapt phase** — 다음 generation 제안이 milestone 을 최우선 참조해야 한다. 현재는 goals.md gap 분석뿐
- **reflect phase** — 이번 generation 이 milestone 을 얼마나 전진시켰는지 기록. milestone 완료 여부 판정 시점이 여기인가
- **완료 순간** — milestone 이 끝났다고 누가 선언하는가. agent 제안 + 인간 승인 (embryo→normal 전환 패턴 재사용)
- SessionStart dynamic context 에 활성 milestone 을 노출할 것인가. **노출한다면 static 이 아니라 dynamic 인 근거를 확인할 것** (generation state 의존성이 있는가)

**5. Memory 와의 정리**
- midterm memory 가 지금 담당하는 "진행 중인 큰 트랙"이 milestone 으로 옮겨간다면, **midterm 의 역할이 무엇으로 남는가.** 둘 다 남기면 같은 내용이 두 곳에 생긴다 — memory decision tree 를 갱신해야 한다
- 이것은 genome(evolution.md) 의 memory 분류 규칙과 `reap-guide.md`, 그리고 5개 로케일 문서가 함께 아는 사실이다 → **carrier 표식(`memory-tier-classification`) 대상**

### 설계 원칙 (초안 — 검토 대상)

- **milestone 없이도 REAP 이 동작해야 한다.** 기존 프로젝트와 소규모 프로젝트는 goal → generation 직결로 충분하다. opt-in
- **milestone 은 계획이지 실행 단위가 아니다.** lifecycle stage 를 추가하지 않는다. generation 이 여전히 유일한 실행 단위
- **경계 기준 없는 milestone 은 만들 수 없게 한다.** 완료 조건이 비어 있으면 생성 거부 — 그것이 없으면 milestone 은 그냥 이름 붙은 memory 다

## Files to Change

**설계 산출물 (1차)**
- `.reap/vision/design/milestone.md` — 경계 기준 정의 + 저장 형태 + lifecycle 통합 지점 결론
- `.reap/vision/goals.md` — Milestone 트랙 항목 추가

**구현 시**
- `src/core/paths.ts` — `vision/milestones/` 경로
- `src/core/vision.ts` — milestone 파싱, 활성 milestone 판정(1개 제약), gap 분석에 milestone 우선 반영
- `src/core/milestone.ts` (신규) — 생성·완료·조회. 완료 조건 부재 시 생성 거부
- `src/types/index.ts` — `Milestone`, `GenerationState.milestoneId?`
- `src/cli/commands/make/` — `reap make milestone` (backlog·hook 과 같은 패턴, 템플릿 강제)
- `src/cli/index.ts` — `reap milestone list|status|close` 필요 여부
- `src/cli/commands/run/start.ts` — 활성 milestone 을 goal 후보 제안에 반영
- `src/cli/commands/run/completion.ts` — reflect(전진 기록) / adapt(다음 제안) 통합
- `src/core/prompt.ts` — `buildBasePrompt` 에 활성 milestone 주입
- `src/cli/commands/load-context.ts` + `src/core/dump-state-sync.ts` — dynamic 노출 시 **양쪽 동일 출력** (byte-identical 규약)
- `src/core/integrity.ts` — `vision/milestones/` 구조 검증 + 크기 guideline
- `src/templates/artifacts/normal/05-completion.md` — milestone 전진 기록 절
- `src/templates/reap-guide.md` ↔ `~/.reap/reap-guide.md` — Milestone 절 + `.reap/` 구조도
- `.reap/genome/application.md` / `evolution.md` — Vision 3분류(Goals/Milestones/Design) + memory 와의 경계 갱신
- `src/templates/evolution.md` — 위와 동일 내용의 배포 템플릿
- `src/templates/migration/vX.Y.Z.md` — 기존 프로젝트에 규칙 변경을 전달 (템플릿만 고치면 도달하지 않는다, gen-072)
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` — **5개 로케일 전부**
- tests: unit(경계 판정·1개 제약) + scenario(milestone 하나에 generation 2개 이상)

## 판단 메모

- **Tree backlog 와 층위가 다르다.** milestone 은 하나의 pipeline 안에서 generation 들을 묶는 **시간축** 단위, tree 는 pipeline 자체를 여러 개로 나누는 **공간축** 단위. 독립적으로 설계 가능하며 섞지 말 것
- **midterm memory 와의 역할 정리가 이 작업의 실질적 난이도다.** 개념 추가보다 기존 개념의 경계 재정의가 더 어렵고, 그 규칙은 genome·guide·5개 로케일이 함께 아는 사실이라 carrier 관리가 필요하다
- 활성 milestone 1개 제약은 **강제할지 규약으로 둘지**를 초기에 정할 것. 강제하면 CLI 가 거부해야 하고, 규약이면 검사만 한다
