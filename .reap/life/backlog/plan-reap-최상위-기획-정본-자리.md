---
type: task
status: pending
priority: high
createdAt: 2026-08-19T00:10:31.212Z
---

# plan — .reap 최상위 기획 정본 자리

> 사용자 결정 (2026-08-19):
> - **`.reap/plan/` 최상위**로 둔다 (vision 하위 아님). `vision/design/` 은 유지
> - **내부 구조를 규정하지 않는다** — 표준 하위 구조도, 예시도 두지 않는다
> - **결정 로그(decisions)를 두지 않는다** — 근거는 S2
> - 구현돼도 plan 에 남고 **상태만 바뀐다**
> - **plan 이 goal 의 원천**이다
> - **`/reap.plan` skill 은 별도 backlog** 로 분리한다 (`reap-plan-skill-...md`)

## Problem

REAP 에는 **"무엇을 만들 것인가"의 정본이 없다.**

현재 네 자리 중 어디도 그 역할을 하지 않는다:

| 자리 | 답하는 질문 | plan 을 담을 수 없는 이유 |
|---|---|---|
| `genome/` | 어떻게 만들 것인가 | 처방적 원칙. normal 에서 immutable |
| `environment/` | 지금 무엇이 있는가 | **현재 사실**. 미구현 기획은 사실이 아니다 |
| `vision/goals.md` | 어디로 갈 것인가 | 목표 목록. 제품 명세를 담는 형식이 아니다 |
| `vision/design/` | 이 주제를 어떻게 설계할 것인가 | **개별 주제 단위**. 다수 문서가 서로를 참조하는 정본 세트를 담기엔 층위가 다르다 |

그래서 방대한 기획이 있는 프로젝트는 그것을 **REAP 밖에 둘 수밖에 없다.** 실제 사례를 확인했다 — 한 프로젝트의 제품 기획 정본이 9개 문서 1,380줄로 서로를 정본으로 가리키며 존재하는데, REAP 은 그 존재를 모른다.

결과:

- **agent 가 제품이 무엇인지 모르는 채로 세대를 돈다.** genome(어떻게)과 environment(지금 뭐가 있는지)는 알지만 "무엇을 만들기로 했는가"는 모른다
- **goal 이 매번 사람 머릿속에서 나온다.** 방대한 기획이 이미 있는데 adapt phase 는 그것을 보지 못하고 `goals.md` 의 짧은 목록만 본다
- 기획과 구현의 대조가 불가능하다 — 무엇을 만들기로 했는지가 파일로 없으니 "계획대로 됐는가"를 판정할 근거가 없다

## Solution

### S1. `.reap/plan/` — 최상위 자리

vision 하위가 아니라 **`.reap/` 직속**이다. 근거:

- **vision 은 방향이고 짧다.** goals · design · memory 는 모두 "어디로 갈 것인가"의 변주이며 각각 수십~수백 줄이다. 방대한 기획 정본이 그 안에 들어가면 **부피가 방향을 밀어낸다**
- **층위가 다르다.** vision 은 *파이프라인이 어디로 가는가*, plan 은 *civilization(제품)이 무엇인가*. 후자는 genome/environment 와 같은 급의 지식 축이다

지식 축이 셋에서 넷으로 늘어난다:

| 축 | 질문 | 성격 |
|---|---|---|
| `genome/` | **어떻게** 만드는가 | 처방적 · 불변 |
| `environment/` | **지금** 무엇이 있는가 | 서술적 · 사실 |
| `plan/` | **무엇을** 만들 것인가 | 규정적 · 정본 ← **신설** |
| `vision/` | **어디로** 가는가 | 방향 · 계획 |

(`idea/` 는 별도 backlog. 위 넷이 "단단한 지식"이고 idea 가 "아직 안 굳은 것"이다.)

### S2. 내부 구조를 규정하지 않는다

`reap init` 은 **`.reap/plan/` 만 만들고 비워 둔다.** 하위 디렉토리도, 예시 구조도, 템플릿도 두지 않는다.

근거:

- **초반에 굳힌 형식은 끝까지 따라다닌다.** REAP 이 예시를 하나 제시하면 그것이 사실상 표준이 되고, 기본값은 대부분 그대로 남는다. 프로젝트마다 기획의 성격이 다른데 REAP 이 그것을 미리 알 수 없다
- 참고한 기획 방법론 자신이 **"어느 문서가 어느 폴더에 사는지만 정하고, 그 안의 형식은 프로젝트가 필요해진 시점에 정한다"** 고 명시한다. REAP 은 그보다 한 단계 더 뒤로 물러서서 **자리만 준다**

**결정 로그(decisions)는 두지 않는다** — 사용자 결정 (2026-08-19):

- 참고 사례에서 결정 로그가 **잘못된 anchor 로 작용한 부분이 많았다.** 한번 적힌 결정이 재검토를 막는 방향으로 굳는다
- **REAP 은 이미 generation 기반 기록 체계를 갖고 있다.** lineage(세대별 결과·특이사항), stage artifact(01~05), completion 의 reflect/fitness/adapt 기록, backlog. 무엇을 왜 그렇게 정했는지는 이미 여기에 남는다
- 같은 사실을 두 곳에 두면 어긋난다. **plan 은 "무엇을 만들 것인가"만 담고, "왜 그렇게 정했는가"는 generation 기록이 갖는다**

**중복 주의 — REAP 이 이미 갖고 있는 것을 plan 안에 다시 만들지 말 것.** 기획 방법론이 흔히 두는 자리 대부분은 REAP 에 다른 이름으로 존재한다:

| 흔한 기획 저장소 요소 | REAP 의 대응물 |
|---|---|
| 작업 단위 목록(issues) | backlog + generation |
| 실행 계획(implements) | planning stage artifact + milestone |
| 조사 노트(research) | `idea/research/` (별도 backlog) |
| 마일스톤 | milestone (별도 backlog) |
| 세션 handoff | `memory/shortterm.md` |
| 결정 로그 | lineage + completion artifact (위 결정) |

plan 에 들어갈 자격이 있는 것은 **위 어디에도 대응물이 없는 것** — 제품이 무엇이고 무엇을 보장해야 하는가 — 뿐이다.

### S3. 상태 표시 — 이 작업의 핵심 난제

"구현돼도 plan 에 남고 상태만 바뀐다"가 결정됐다. 그런데 **상태를 어느 단위에 붙이는가**가 정해지지 않았고, 이것이 S4 의 전제다.

- **문서 단위 status** — 가장 싸다. 그러나 **한 문서 안에 구현된 절과 미구현 절이 섞인다.** 200줄짜리 문서가 "절반 구현"인 상태를 표현할 수 없다
- **항목 단위 status** — 정확하다. 그러나 ID 체계를 요구하게 되고, 그것은 S2 의 "구조를 규정하지 않는다"와 정면 충돌한다
- **별도 index 가 추적** — plan 문서는 손대지 않고 진입점 파일이 구현 상태를 표기. 문서와 상태가 분리되어 **어긋난다**

**어느 것도 공짜가 아니다.** 판단 기준으로 삼을 것: *"adapt phase 가 이 표시를 읽고 미구현분을 goal 후보로 뽑을 수 있는가."* 그게 안 되면 S4 가 성립하지 않는다.

**S2 와의 긴장을 의식할 것** — 상태 표시는 형식이다. 구조를 규정하지 않기로 했는데 상태 표시를 요구하면 그만큼은 형식을 강제하는 셈이다. **최소한만 요구하고 나머지는 열어 두는 선**을 찾아야 한다.

### S4. plan 이 goal 의 원천

adapt phase 의 gap 분석이 지금은 `goals.md` 만 본다. plan 이 생기면 **plan 의 미구현분도 goal 후보**가 된다.

- `src/core/vision.ts` 의 gap 분석에 plan 축 추가
- `reap run completion --phase adapt` 의 다음 goal 제안이 plan 을 참조

**전제**: S3 의 상태 표시가 있어야 한다. 없으면 adapt 는 방대한 문서를 매번 통째로 읽어야 하고, 그것은 context 상 불가능하다. **S3 → S4 는 인과로 묶여 있으므로 분리해서 구현하면 S4 가 헛돈다.**

**하지 않을 것**: `goals.md` 를 plan 이 대체하지 않는다. plan 은 *무엇을 만들 것인가*(내용 축), goals/milestone 은 *무엇을 언제 할 것인가*(시간 축).

### S5. 로딩 — 방대해서 자동 로드할 수 없다

genome / environment summary / vision goals / memory 3종은 매 세션 static 자동 로드된다. **plan 은 여기에 넣을 수 없다** — 확인한 사례만 해도 1,380줄이고 실제로는 더 커진다.

따라서 **진입점 하나만 static 로드하고 나머지는 on-demand** 로 둔다. 진입점이 담을 것은 "어떤 문서가 있고 각각 무엇의 정본인가" 뿐이다.

미결:
- 진입점의 **이름과 형식** — S2 가 구조를 규정하지 않으므로 이것도 최소한이어야 한다
- **누가 갱신하는가** — 수기 갱신은 반드시 어긋난다 (REAP 이 carrier 목록에서 이미 겪었다). 자동 생성 / 명령 / 방치 중 선택
- 진입점이 없는 프로젝트(사람이 안 만든 경우)에서 **agent 가 plan 을 어떻게 발견하는가**

### S6. 범위 — 코드로 기획 엔진을 만들지 않는다

이 backlog 는 **자리와 로딩 규칙, goal 연동까지**다. "어떻게 기획하는가"는 `/reap.plan` skill 이 갖고, **별도 backlog** 로 분리한다 (사용자 결정).

- 외부에서 이미 쓴 기획서를 **가져다 놓는 것**이 1급 사용 형태다. **skill 없이도 plan 은 완전히 성립해야 한다**
- 이 backlog 만 완료된 상태에서도 사용자는 plan 을 쓸 수 있어야 한다

## Files to Change

**구조**
- `src/core/paths.ts` — `plan` 경로 (`ReapPaths`)
- `src/core/integrity.ts` — 디렉토리 검증. **빈 상태가 정상**. 크기 guideline 은 두지 않는다 (방대한 것이 정상이므로)
- `src/cli/commands/init/common.ts` — 디렉토리 생성 (하위 구조 없음, S2)
- `src/cli/commands/update.ts` — **기존 프로젝트 보충**. 없으면 기존 사용자에게 도달하지 않는다
- `src/templates/migration/vX.Y.Z.md` — 지식 축이 넷이 되었음을 기존 프로젝트에 전달 (gen-072 교훈)

**로딩**
- `src/templates/claude-md-section.md` — 진입점 static import 추가 (현재 9 → 10)
- `src/adapters/opencode/install.ts` — `REAP_INSTRUCTIONS` 배열 동기화 (현재 9개)
- `src/core/prompt.ts` — `buildBasePrompt` 에 plan on-demand 안내

**goal 연동**
- `src/core/vision.ts` — gap 분석에 plan 축 추가 (S3 확정 후)
- `src/cli/commands/run/completion.ts` — adapt 의 다음 goal 제안이 plan 참조

**문서·genome**
- `src/templates/reap-guide.md` ↔ `~/.reap/reap-guide.md` — `.reap/` 구조도 + **지식 4축 절 신설** + plan 절
- `.reap/genome/application.md` — 지식 계층 서술. **State Management 절의 자리 목록 갱신**
- `src/templates/evolution.md` ↔ `.reap/genome/evolution.md` — plan 활용 원칙 (design/goals 와의 경계, decisions 를 두지 않는 이유)
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` — **5개 로케일 전부**

**테스트**
- scenario — `init` 후 디렉토리 존재, `update` 로 보충, 빈 상태에서 `fix --check` 경고 0, plan 있는 프로젝트에서 adapt 가 plan 을 참조

## Verification

1. **신규 프로젝트** — `reap init` 후 `.reap/plan/` 존재. **하위 디렉토리가 만들어지지 않았는가** (S2 — 구조를 규정하지 않기로 했으므로 생성도 하지 않는다). **빈 상태에서 `fix --check` 경고 0**
2. **기존 프로젝트** — `reap update` 후 보충됨
3. **자동 로드 비용** — plan 에 1,000줄 이상을 넣어도 세션 context 증가가 **진입점 수준**에 머무는가. 본문이 로드되면 S5 설계 실패
4. **agent 가 plan 을 실제로 읽는가** — 새 세션에서 "이 제품이 무엇을 하기로 되어 있나"에 답할 수 있는가. **진입점만 로드되므로 agent 가 스스로 본문을 열어야 한다.** 안 열면 설계가 무력한 것이다
5. **진입점이 없는 프로젝트**에서도 4가 가능한가 (S5 마지막 미결)
6. **상태 표시가 adapt 에서 쓰이는가** (S3→S4) — 미구현 항목이 goal 후보로 실제로 올라오는가. 이것이 안 되면 S4 는 구현된 척만 한 것이다
7. **실제 자료로 검증** — 확인된 사례(9문서 1,380줄)를 그대로 `plan/` 에 넣고 1·3·4·5·6 을 다시 확인. **가상의 작은 예제로는 "방대함"이 검증되지 않는다**
8. `npm run typecheck` + unit/e2e/scenario 회귀 없음

## Open Decisions

- [ ] **상태 표시 단위** (S3) — 문서 단위 / 항목 단위 / 별도 index. **S4 의 전제이므로 가장 먼저 결정**. S2 와의 긴장(형식 최소화) 고려
- [ ] **상태 어휘** — `planned` / `implemented` / `superseded` 정도인가, 더 필요한가
- [ ] **진입점의 이름·형식·갱신 주체** (S5)
- [ ] **진입점이 없을 때의 발견 경로** (S5)

## Related

- `reap-plan-skill-기획-방법론-기반-작성-유지-절차.md` — **분리된 짝.** 이 backlog 가 자리를 만들고, 그쪽이 채우고 유지하는 절차를 만든다. **이 backlog 가 선행**
- `milestone-goal-과-generation-사이의-계획-단위.md` — **S4 가 직접 맞물린다.** plan(내용 축) → milestone(시간 축) → generation. milestone 이 먼저 서면 plan 의 goal 원천 기능이 붙을 자리가 명확해진다
- `idea-아직-단단하지-않은-지식의-자리.md` — 둘 다 `.reap/` 최상위에 자리를 추가한다. **지식 축 재정의를 두 번 하지 말 것** — 건드리는 문서(genome, reap-guide, 5 로케일, migration note)가 거의 같다

## 판단 메모 — 확인이 필요한 위험

**REAP 자신에게는 plan 이 비어 있게 된다.** REAP 은 도구이고 그 설계는 `vision/design/` 에 있다. 즉 이 기능은 **dog-fooding 되지 않는다** — 본 repo 에서 검증할 수 없는 첫 기능이 된다.

그래서 Verification 7(실물을 넣어 확인)이 **선택이 아니라 필수**다. 이것 없이는 "빈 디렉토리가 잘 만들어진다"만 검증하고 끝난다.
