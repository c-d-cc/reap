# Evolution

## Language
Source code is in English. AI responds in user's configured language (config.yml `language` field).

## Clarity-driven Interaction

AI의 소통 깊이는 현재 맥락의 구체화(clarity) 수준에 따라 자동 조절.

| Clarity | 상태 | AI 행동 |
|---------|------|---------|
| High | 목표 명확, backlog 구체적 | 간단 확인 후 실행. 질문 최소화. |
| Medium | 방향은 있으나 세부 미정 | 선택지 + 트레이드오프 제시 |
| Low | 목표 모호, 다음 할 일 불명확 | 적극 interaction — 질문, 예시, 보기 |

### Clarity 판단 기준
- vision/goals.md에 구체적 goal 존재 → high
- backlog에 명확한 task 있음 → high
- genome이 불안정 (embryo, 잦은 수정) → low
- lineage 짧고 방향 미확정 → low

## Genome 관리 원칙

- **Embryo**: genome 직접 수정 가능. 단, 수정 시점을 의식할 것 — 세대 초반에 확립하고, 이후 작업은 그 위에서 수행.
- **Normal**: genome immutable. 변경은 backlog에 등록 → adapt phase에서 적용 → 다음 세대부터 효력.
- **세대 중 발견한 교훈은 completion artifact에 기록**. genome 수정은 adapt phase에서 수행. 세대 도중 genome을 바꾸면 그 전까지의 작업 기반이 흔들린다.

## Vision 활용 원칙

Vision은 Goals, Milestones, Memory, Design 네 가지로 구성된다.

### Goals (`vision/goals.md`)
프로젝트의 장기 목표. adapt phase에서 gap 분석을 통해 다음 generation의 방향을 결정하는 핵심 동력.
- 미완료 `[ ]` 항목이 다음 goal 후보
- generation 완료 시 달성한 goal을 `[x]`로 마킹 제안
- Goals cleanup: goals.md는 **미래** 목표를 위한 공간이지 과거 성과의 아카이브가 아니다. 완료 항목(`[x]`)이 누적되어 문서가 forward-looking 역할을 잃어간다고 판단되면, 구체적으로 어떤 항목을 제거할지 인간에게 제안하고 승인을 받아라. 최근 완료된 항목은 아직 참조 가치가 있을 수 있고, 오래 안정된 항목은 제거해도 된다. 항상 인간 확인 후 제거.

### Milestones (`vision/milestones/`)

goal 과 generation 사이의 계획 단위. 하나의 milestone 안에서 **여러 generation 이 수행된다.**

- **경계 3요소가 없으면 milestone 이 아니다** — 소속 goal(`goal:`) · `## Exit Criteria` · `## Out of Scope`.
  셋 중 하나라도 비면 goal 후보를 내지 못하고 main 이 될 수도 없다. `reap milestone main` 이 거부한다
- **완료 조건은 판정 가능한 사실**이어야 한다. 정량 메트릭 금지(Goodhart) — 최종 판정은 인간이 한다
- **main 은 초점이지 제약이 아니다.** 정확히 하나가 main 이지만, 다음 generation 의 후보는
  **유효한 모든 open milestone** 에서 나온다(main 먼저). 뒤쪽 계획의 항목을 앞당기는 것은 정상이며,
  `reap run start --phase create --milestone <slug>` 으로 명시한다
- **닫는 것은 인간이 한다.** reflect 에서 exit criteria 충족을 판단해 **제안**하되 스스로 닫지 마라
- **milestone 없이도 REAP 은 동작한다.** goal → generation 직결로 충분한 프로젝트가 있다. opt-in

**milestone 과 midterm memory 의 경계**: 계획에 속하는 것(무엇을 언제 어떤 순서로, 무엇이 범위 밖인지,
얼마나 남았는지)은 **milestone 파일**이 갖는다. midterm 은 계획에 담기지 않는 진행 맥락 — 보류된 판단,
합의된 방향, 아직 milestone 이 없는 트랙 — 만 갖는다. 같은 내용을 양쪽에 두지 마라.

### Design (`vision/design/`)
프로젝트의 설계 문서를 보관하는 공간. Memory와의 구분:
- **Design** — 구체적 scope를 가진 설계 문서 (아키텍처 설계, 기능 스펙 등). 독립된 문서로 관리.
- **Memory** — 범용적 맥락 기록 (교훈, 진행 상황, 핸드오프). tier별 단일 파일.

판단 기준: "이 내용이 하나의 독립된 주제로 문서화할 만한가?" → Yes면 Design, No면 Memory.

<!-- reap:carrier(memory-tier-classification) -->
### Memory (`vision/memory/`)
AI가 프로젝트 맥락을 자유롭게 기록하는 공간. 3-tier 구조는 **"무엇을 위한 내용인가"(content-type)** 기준으로 분류한다. lifespan으로 판단하지 마라 — AI는 미래를 모르므로 그 추론이 매번 부담이 되고 오분류를 누적시킨다.

| 파일 | 역할 | 1-line 판단 기준 |
|------|------|------------------|
| `shortterm.md` | **Session handoff** — 다음 세션에 넘길 즉각적 맥락 | "지금 당장 필요한가?" |
| `midterm.md` | **Ongoing tracks** — 진행 중인 멀티-generation 작업 | "아직 완료 안 된 큰 트랙인가?" |
| `longterm.md` | **Design lessons** — 반복 참조할 설계 교훈 | "이 교훈이 미래 generation에서 같은 실수를 막는가?" |

### Memory 분류 Decision Tree (AI용 의무 절차)

memory에 무언가를 쓰려고 할 때 위에서 아래로 적용한다.

```
1. 다음 세션에서 즉시 필요한가?
   → Yes: shortterm.md

2. 아직 완료되지 않은 진행 중인 트랙/계획인가?
   → Yes: midterm.md

3. 완료됐지만 설계 교훈으로 남겨야 하는가?
   → Yes: longterm.md

4. 완료됐고 특별한 교훈도 없는가?
   → 기록하지 않는다 (memory에 보관 불필요, lineage에 보존됨)
```

**중요**: "혹시 쓸모 있을지도" 같은 추측으로 longterm에 쌓지 마라. 사라져도 lineage/git history에 보존된다.

### Memory Pruning 정책 — reflect phase 의무

`reap run completion --phase reflect` 시 cleanup 은 **의무**다. tier 별 절차와 판단 기준은
`~/.reap/reap-guide.md` § Memory Pruning Policy 가 소유한다 — 함께 자동 로드되므로 여기 옮겨 적지 않는다.

요지: shortterm 은 **매 generation 교체**(누적 금지), midterm 은 **트랙 완료 시 삭제**,
longterm 은 **genome 과 중복되면 삭제**.

### Memory에 쓰지 않을 것 · 활용 원칙

목록과 상세는 `~/.reap/reap-guide.md` § Memory 가 소유한다. 요지만 남긴다 —
**environment·artifact·genome·lineage 가 이미 갖는 것은 memory 에 쓰지 않는다.** 읽기·쓰기와
tier 간 이동은 자유이며, longterm 30~50줄 / midterm 50~70줄을 넘으면 pruning 미수행 신호다.

<!-- reap:carrier(source-map-read-rule) -->
## Code Quality Principles

새 코드를 작성하기 전에 반드시 기존 코드를 읽고 패턴을 파악한다.

- **Read source-map first**: 코드를 고치기 전에 `environment/source-map.md` 를 연다. `summary.md` 는 자동 로드되지만 source-map 은 **on-demand** 라 열지 않으면 모듈별 역할·소유권을 모르는 채로 고치게 된다. `reap index` 는 무엇이 무엇을 부르는지 답하지만 **왜 그렇게 생겼는지는 답하지 못한다**. 그 파일이 없는 프로젝트라면(REAP 이 만들기 전에 init 된 것) `summary.md` 가 담은 구조 서술을 대신 읽고, 코드의 형태를 서술할 필요가 처음 생길 때 source-map 을 쓴다.
- **Pattern-first**: 같은 역할의 기존 코드가 어떤 구조를 따르는지 먼저 확인. 새 코드는 그 패턴을 따른다.
- **Consistency over preference**: 개인 선호보다 기존 코드베이스의 일관성이 우선. 더 나은 패턴이 있더라도, 기존과 다른 방식으로 작성하면 불일치가 생긴다 — 바꾸려면 전체를 바꿔라.
- **No duplication**: 같은 로직이 두 곳에 존재하면 안 된다. 중복을 발견하면 공통화한다.
- **Verify before commit**: 새 코드가 기존 패턴과 일치하는지, 중복은 없는지 커밋 전에 확인한다.
- **Enforced conventions in application.md**: 코드만으로 파악이 어려운 의도적 설계 결정(특정 패턴이 강요되는 경우)은 application.md에 명시한다. 코드에 위반이 섞여있을 수 있으므로, application.md에 명시된 convention이 코드의 현재 상태보다 우선한다.

## Testing Principles

### 필수 규칙
- **신규 기능 = 테스트 필수**: 새 기능을 구현하면 반드시 해당 기능의 테스트 코드를 함께 작성한다. 테스트 없는 기능은 완성이 아니다.
- **기존 기능 수정 = 기존 테스트 수정**: 기존 로직을 변경하면, 관련 테스트를 찾아서 변경된 로직에 맞게 수정하고 재실행한다.
- **테스트 실행은 fresh**: 이전 실행 결과를 재사용하지 않는다. 매번 새로 실행.

### 테스트 레벨 기준
- **Unit test**: 독립된 함수/모듈의 입출력 검증. 외부 의존성 없는 pure logic에 적합.
- **E2E test**: CLI 명령어 → JSON output 검증. 전체 흐름의 정상 동작 확인.
- **Scenario test**: 실제 사용 시나리오를 sandbox 환경에서 재현. 여러 명령어 조합, 상태 전이, 에러 복구 등 복합 동작 검증.

### 테스트 레벨 선택 기준
| 변경 유형 | 필요 테스트 |
|----------|-----------|
| core 함수 추가/수정 (backlog.ts, archive.ts 등) | unit test |
| CLI command 추가/수정 | e2e test |
| lifecycle 흐름 변경 (stage 전환, nonce 등) | e2e + scenario test |
| init/genome/environment 구조 변경 | scenario test (sandbox) |
| prompt 변경 | 기능적 영향 있으면 e2e, 없으면 skip |
| 외부 도구 / subprocess 통합 | e2e (subprocess + 읽는 축 전부 격리 + git init fixture) |

### 외부 도구 / 사용자 영역을 건드리는 e2e 격리 (gen-069, gen-082, gen-089)

프로세스가 **읽는 축을 전부** 격리한다 — 하나만 막으면 새어나간다. `HOME` 을 가짜로 주면
`XDG_CONFIG_HOME` 도 함께 처리하고(gen-082), 포트를 쓰는 도구면 포트도 env 로 옮긴다.
helper 는 `tests/helpers/<tool>.ts` 한 곳으로 모으고 e2e 는 helper 만 import 한다.
fixture 는 그 도구가 실제로 기대하는 입력(예: git-init 된 트리)을 그대로 재현한다.

- **env override 가 닿지 않는 축은 값을 주입한다.** 무엇이 닿지 않는지는 런타임·플랫폼 사실이므로
  `environment/summary.md` § 테스트 가 갖는다 — 여기서 열거하면 그 목록이 곧 낡는다

### 테스트 피드백 루프
- 실행 중 얻은 깨달음은 completion artifact 에 기록하고 필요하면 genome 에 반영한다
  (환경 차이가 원인이면 environment — § genome vs environment 경계 참조).

## 중단된 Generation 복구

유저가 중간에 중단(Esc, 세션 종료 등)하면 generation이 불완전한 상태로 남을 수 있다.

- 복구 시: `.reap/life/current.yml`에서 현재 stage/phase 확인 → **중단된 시점의 phase부터 다시 실행**. 다음 phase의 nonce가 아직 발급되지 않은 상태이므로, 같은 phase를 재실행하면 정상 진행된다.
- 예: completion fitness에서 중단 → `reap run completion --phase fitness --feedback "..."` 로 재실행 → adapt → commit.
- **절대로 current.yml을 수동 편집하지 않는다**. nonce가 꼬이면 abort 후 재시작이 더 안전.

## 조기 종료(early-close) 판단

무엇을 할 수 있는 명령인지는 `~/.reap/reap-guide.md` § Termination Paths 가 소유한다.
여기는 **언제 그것을 고르는가**만 다룬다 — 진행분은 가치가 있는데 잔여 task 를 별도 generation 으로
나누는 게 낫거나, 외부 의존 차단으로 마무리는 불가하나 진행분은 살리고 싶을 때.

판단 기준:
- 진행분이 **lineage 에 보존할 가치가 있는가** → No 면 abort.
- 잔여 task 가 **별도 generation 가치를 가지는가** → No(자잘한 follow-up)면 completion 까지 가서 hints 에만 기록.

## Echo Chamber 방지

- AI 자율 추가는 현재 goal의 직접 인과 범위 내에서만 허용
- "있으면 좋겠다" 수준은 backlog에 등록 후 인간 검토
- 자율 추가에는 `[autonomous]` 태그 부착

## Workaround 금지 — 근본 원인 추적 원칙

문제를 만나면 workaround로 넘기지 않는다. 반드시 근본 원인을 추적하고 수정 계획을 세운다.

- **즉시 수정 가능**: 현재 generation 내에서 수정
- **즉시 수정 불가**: 원인 분석 + backlog 등록 (재현 조건, 근본 원인, 수정 방향 포함)
- **절대 하지 않을 것**: 에러를 수동으로 우회하고 언급 없이 넘어가기

판단 기준: "이 문제가 다음에 또 발생하면 같은 workaround를 반복해야 하는가?" → Yes이면 반드시 근본 수정 필요.

### 인과로 묶인 검증 동작 fix 는 본 generation 에서 처리 (gen-069)

X 의 검증 인프라를 만들다가 X 가 의존하는 Y 가 깨져 있음을 발견하면, **fix Y 가 scope 밖이라도
인과로 묶여 있다 — 분리하면 검증이 의미를 잃는다.** 인과 chain 을 한 곳만 끊으면 새 누락 path 가 생긴다.

판단 기준: fix 가 small scope 인가 / 빠뜨리면 본 generation 의 검증이 실패하거나 의미를 잃는가
→ Yes 면 본 generation. 큰 design 변경을 동반하면 backlog 화 + 해당 검증만 skip + 다음 세대에서 enable.

## 사용자 UX gap은 verification 항목으로 명시 (gen-063 교훈)

새 client adapter / 외부 도구 통합 / 사용자 진입점 추가 시, planning의 verification 체크리스트에는 다음 4가지를 **모두 명시**해야 한다:

1. **Static knowledge 자동 로드 메커니즘** — client native 방식 (e.g., `@` import / `instructions` 필드)
2. **Dynamic state refresh trigger** — session 시작 / 도구 호출 시점 갱신
3. **Entry-point 파일** — 사용자가 첫 진입 시 보는 안내 (CLAUDE.md / AGENTS.md / 등)
4. **Trigger 등록 — slash commands / shortcuts** — 사용자가 native UI로 REAP를 호출할 수 있는 경로

(4)가 가장 잊기 쉽다 — gen-063 은 (1)~(3)을 갖추고 (4)만 빠뜨렸고, 사용자가 fitness 에서 발견했다.
판단 기준: **"이 통합을 처음 받은 사용자가 5분 안에 평소처럼 REAP 를 호출할 수 있는가?"**

### 검증 전 self-audit — 통과한 e2e 는 시나리오의 일부만 덮는다 (gen-064)

fitness 전에 셋을 확인한다: (1) verification 의 각 시나리오가 e2e 로 1:1 재현되는가,
(2) **변경한 함수의 caller 를 전부 확인했는가**, (3) 사용자가 따라할 명령 시퀀스를 e2e 가
그대로 실행하는가.

(2)가 gen-064 의 실제 결함이었다 — e2e 는 `installSkills` 를 직접 불렀고 `reap update` 는
`registerSessionIntegration` 만 부른다. 전부 초록인 채로 진입점 하나가 비어 있었다.

## 반복 누락은 지시가 아니라 검사로 막는다 (gen-073 교훈)

같은 절차가 두 번 이상 누락되면, **지시문을 더 자세히 쓰는 것은 이미 실패한 방법**이다.

gen-073 사례: `reapdev.versionBump` skill 은 `docs/src/i18n/translations/` 아래 5개 로케일 파일을 **이름까지 명시**하고 있었다. 그럼에도 v0.17.1 릴리즈에서 문서 갱신이 통째로 누락됐고, 그 이전에는 en/ko 만 갱신하고 ja/de/zh-CN 을 빠뜨려 changelog 가 로케일마다 달라진 적도 있다.

판단 기준: **"이 절차를 사람이 매번 기억해야 하는가?"** → Yes 면 검사를 만들어라.

- 검사는 **실행 가능**해야 한다 (script / test / CI step). 체크리스트 문서는 검사가 아니다
- **우회 불가능한 경로에 연결**한다 (release workflow, phase 전환, commit hook 등)
- 지시문에는 검사 실행을 추가하고, **왜 지시문만으로는 부족한지 근거도 함께 적는다.** 그래야 다음 사람이 "지시를 더 자세히 쓰자"로 되돌아가지 않는다

### 검사를 만들 때 — 먼저 실패시켜라

검사를 만든 뒤 곧바로 통과하는 것을 확인하면, **그 검사가 실제로 결함을 잡는지 알 수 없다.** "검사가 동작한다"와 "검사가 무력하다"가 구분되지 않는다.

- 수정 **전** 상태에서 먼저 돌려 fail 을 확인한다. 그 fail 이 곧 검사의 유효성 근거다
- 개별 항목도 마찬가지 — 정상 값을 일부러 깨뜨려 fail 을 확인하고 복원한다 (negative test)
- **검사가 못 잡는 것을 결과와 함께 기록한다.** 통과는 "검사 범위 안에서 문제없음"일 뿐이다. 한계를 적어두지 않으면 다음 사람이 그 검사를 실제보다 신뢰한다

### 게이트에 대해 쓰는 문장의 규율

- **잡는다고 적은 사례는 재현해 확인한 것만 적는다.** gen-078 의 한 항목이 **거짓인 채 다섯 세대를
  살아남았다**(CI 는 내내 초록). 재현 실패는 "주장이 거짓"이 아니라 **"내 변형이 그 결함이 아니다"** 일 수 있다
- **"돌았는가"가 아니라 "답이 맞는가"를 묻는다.** "심볼 수 > 0" 이 걸려 있는 동안 대표 기능이
  5개월간 0을 반환했다. 알려진 관계를 지목하고 비율이 아니라 **절대수**를 본다 — `0/0` 이 통과한다
- **부재 단언은 스스로 먼저 증명한다.** 크래시·필드명 변경도 "부재"로 읽힌다 — 상태와 숫자를 먼저 요구하라. 같은 이유로 **검사 범위를 좁히면 기준이 통과로 바뀐다**: 기준에 적힌 명령을 적힌 그대로 돌려라
- **끄는 스위치를 두지 않는다.** 비용이 문제면 실행 시점을 옮겨라
- **두 층은 서로를 추론하지 못한다** — "파일이 놓였는가"와 "클라이언트가 읽는가"는 별개다(gen-063)
- **기능을 지우면 무엇이 여전히 초록인가**를 물어라. gen-096 은 리디렉션을 한 줄로 끌 수 있었고 unit 657·게이트 둘 다 통과했다 — 단언이 전부 순수 함수와 **파일 안 문자열 순서**에 있었기 때문이다. 그리고 **케이스 표의 모든 행이 한 전제를 공유하면 행을 늘려도 소용없다**: 27개 브라우저 판정이 전부 *"`/` 에 도착"* 으로 시작해 진입 지점이 변수가 된 적이 없었다

### 검증 근거는 종류를 구분해 적는다 — 그리고 "실행"은 명령을 지목할 수 있어야 한다

artifact 에 "확인함"이라고만 적으면 **직접 돌려본 것과 코드를 읽고 판단한 것이 같아 보인다.** 두 세대 연속으로 그 구분이 무너져 blocking 결함이 나왔다.

항목마다 근거의 종류를 붙인다:

- `[실행]` — 이 세대에서 그 명령을 직접 돌렸다
- `[negative]` — 일부러 깨뜨려 검사가 fail 하는 것을 확인했다
- `[독해]` — 코드를 읽고 판단했다. 돌려보지 않았다

**`[실행]` 을 붙이려면 그 항목을 실행하는 명령을 지목할 수 있어야 한다.** 지목할 수 없으면 `[독해]` 다 — 의심스러우면 `grep -rn "<함수명>" tests/` 로 확인하고 0건이면 `[독해]` 다. gen-083 은 미검증 항목을 충족으로 적어 evaluator 에게 잡혔고, 그 교훈으로 만든 이 표기법이 gen-084 에서 **한 칸 옆에서 똑같이 어긋났다** — 기능은 정상이었지만 그것을 실행하는 것이 게이트에도 테스트에도 없었다. "정상이었다"는 이 문제의 답이 아니다.

**`[실행]` 은 시간이 지나면 거짓이 된다 — 값을 바꿨으면 그 값을 측정한 앞쪽 문장을 다시 돌려라.** 값 옆의 carrier 는 grep 이라도 되지만 **artifact 에는 표식이 없다.** 편집 후 묻는 질문은 "무엇 옆에 있나"가 아니라 **"내가 방금 바꾼 것을 측정한 문장이 무엇인가"** 다. **수치만 보면 안 된다** — gen-095 에서 두 번 발생했고 두 번 다 줄 수가 우연히 같아 수치 확인은 통과했을 것이다.

### 독립 검토는 한 번으로 수렴하지 않는다 (gen-089)

evaluator 호출은 **1회 감사가 아니다.** gen-089 는 3라운드가 필요했고 **2·3라운드의 결함은 전부
직전 라운드의 수정 안에 있었다** — 매 라운드가 전 검사 초록인 상태에서 시작했다.

- 수정 라운드를 **2회 이상 예산에 넣어라**. 지적은 **먼저 재현하고** 고친다
- **통과하는 negative 는 "수정이 불필요"가 아니라 "내 검사가 그 결함을 덮지 않는다"** 이다.
  green 을 허가로 읽으면 옳은 수정을 지운다
- 해소된 concern 도 `--severity none` 으로 낮추지 마라 — 그 채널은 "미해결"이 아니라
  "fitness 를 보는 사람이 알아야 할 것"을 나른다

## 아키텍처 변경 시 genome 동기화

새 기능/구조를 추가하거나 아키텍처를 변경했을 때, 해당 변경이 AI의 행동 방식에 영향을 준다면 반드시 genome(evolution.md 또는 application.md)에 반영해야 한다.

판단 기준: "다음 세션의 새 agent가 이 변경을 몰라도 올바르게 동작할 수 있는가?" → No이면 genome 업데이트 필수.

<!-- reap:carrier(environment-refresh-targets) -->
## Completion 시 환경 갱신

reflect phase에서 environment/ 를 점진적으로 업데이트:
- implementation에서 변경한 파일/모듈을 기준으로 영향받는 environment 섹션만 수정
- 전체 재작성 아님 — 변경된 부분만 반영 (파일 추가/삭제, 의존성 변경, 빌드 변경 등)
- `summary.md` — Tech Stack, Tests, 그 외 매 세션 로드되는 것
- `source-map.md` — 코드의 구조: 추가·삭제된 모듈과 각각이 무엇을 위한 것인지. **구조 서술을 갖고 있는 쪽을 갱신한다 — 양쪽에 두지 않는다**

**낡은 서술은 제거한다 — 갱신은 append-only가 아니다**:
- 더 이상 사실이 아닌 문장을 삭제한다 (제거된 파일/모듈, 폐기된 결정, 낡은 의존성 메모)
- **generation별 changelog 항목을 쌓지 않는다.** summary.md는 현재 상태를 서술하지, 그렇게 된 경위를 서술하지 않는다 — 경위는 lineage와 git history가 소유한다
- 어떤 절이 "gen-NNN에서 무엇이 바뀌었다"의 나열이 되었다면 현재형 서술 하나로 접는다

## genome vs environment 경계

- **genome (application.md)**: prescriptive — "이렇게 해야 한다" (원칙, 설계 결정, 컨벤션, 규칙). genome은 normal mode에서 immutable이므로, 자주 변하는 사실 정보를 넣으면 안 된다.
- **environment (`summary.md`, `source-map.md`)**: descriptive — "현재 이런 상태다" (기술 스택, 구조, 빌드, 테스트, 의존성). 코드가 바뀌면 environment만 업데이트. `summary.md` 는 매 세션 로드되므로 파일 수에 비례해 커지는 서술을 담지 않는다. `source-map.md` 는 on-demand 이며, 구조 서술이 그럴 만큼 커지면 그쪽이 집이다.
- 판단 기준: "이 정보가 바뀌면 genome을 수정해야 하나?" → Yes면 genome, No면 environment.
