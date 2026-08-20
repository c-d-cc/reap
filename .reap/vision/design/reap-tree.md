# REAP Tree — 계층형 pipeline 설계

> 상태: **기획 단계 (미착수)**. 2026-08-19 작성. 이 문서는 결정문이 아니라 **결정해야 할 것의 목록과 각 선택지의 대가**를 담는다. 잠정 방향은 `잠정` 으로 표시하며, 확정 전까지 구현하지 않는다.
> 관련: `vision/goals.md` § Tree — 계층형 pipeline

---

## 1. 동기

REAP 은 **프로젝트 하나 = pipeline 하나**를 전제한다. `.reap/life/current.yml` 은 단일 활성 generation 을 담고, lineage 는 선형 + merge DAG 하나이며, genome·vision·memory 는 그 하나의 pipeline 을 위해 존재한다.

대규모 프로젝트에서 이 전제가 깨진다. 하나의 goal 이 **서로 다른 저장소 · 서로 다른 팀 · 서로 다른 리듬**을 가진 하위 작업으로 갈라지는데, REAP 에는 그것을 표현할 수단이 없다. 실제로 관측되는 증상은 둘이다:

- **generation 비대화** — 여러 저장소에 걸친 작업을 억지로 한 세대에 담는다. artifact 가 커지고 validation 이 무엇을 검증하는지 흐려진다
- **지식 파편화** — 하위 저장소를 REAP 밖에서 관리한다. 그쪽에서 얻은 교훈이 상위 genome 에 도달하지 않고, 상위 원칙이 하위에 전달되지 않는다

REAP 자신이 이미 이 상태에 가깝다. `tests/` 는 별도 저장소(submodule)이고 `docs/` 는 자체 빌드를 갖는다. 지금은 하나의 `.reap/` 이 둘을 모두 관장하지만, 각자가 독립 lifecycle 을 가질 규모가 되면 같은 문제를 맞는다.

## 2. 정의

**Tree** 는 parent REAP pipeline 하위에서 child REAP pipeline 이 실행되는 **계층 구조**다.

- 각 노드는 **자기 repo 와 자기 `.reap/` 를 독립적으로 소유**한다
- 노드끼리 합쳐지지 않는다. 관계는 **포함(수직)** 이지 분기·재결합(수평)이 아니다
- REAP 은 이 구조 위에서 **orchestration engine 과 지식 전파 규칙**을 제공한다

### merge 와의 차이 — 이 구분이 설계의 출발점

| | merge | tree |
|---|---|---|
| 대상 | **같은** repo 의 병렬 브랜치 | **서로 다른** repo |
| 관계 | 수평 — 갈라졌다가 다시 합쳐짐 | 수직 — 상위가 하위를 포함 |
| genome | 3-way diff 로 **교차(crossover)** | **상속(inheritance)** — 합치지 않음 |
| 종료 | 하나로 수렴 | 수렴하지 않음. 계속 병존 |
| 생명주기 | 하나의 lifecycle (detect→mate→…) | **노드마다 독립 lifecycle** |
| 상태 | 하나의 `current.yml` | 노드마다 `current.yml` |

merge 를 확장해서 tree 를 만들 수 없다. merge 의 모든 단계(detect/mate/merge/reconcile)가 "결국 하나가 된다"를 전제하기 때문이다.

### monorepo 와의 차이

tree 는 **디렉토리 구조가 아니라 pipeline 구조**다. monorepo 안의 패키지들은 `.reap/` 하나를 공유해도 되고(현재 REAP 이 그렇다), 서로 다른 repo 가 tree 를 이뤄도 된다. 판단 기준은 "저장소가 나뉘어 있는가"가 아니라 **"독립된 lifecycle 과 독립된 genome 이 필요한가"** 다.

---

## 3. 노드 모델

### 3.1 노드의 정체

노드 = **REAP 프로젝트 하나**. 즉 `.reap/` 를 가진 저장소. 새로운 종류의 객체를 만들지 않는다.

### 3.2 관계를 누가 아는가 — 세 가지 안

| 안 | 기록 위치 | 장점 | 대가 |
|---|---|---|---|
| **A. parent 단독** | parent 의 `.reap/tree.yml` 만 | child 는 완전히 무지 → 자율성 최대, 단독 실행 자명 | **지식 하향 전파가 불가능**하다. child agent 는 parent 원칙을 볼 방법이 없다 |
| **B. 양방향** | parent 목록 + child `config.yml` 의 `parent` 참조 | child 가 상속 지식을 스스로 당겨올 수 있음 | child repo 가 parent 없이 불완전해 보일 위험 → fallback 필수 |
| **C. child 단독** | child 만 parent 를 앎 | 등록 부담 없음 (child 가 자진 신고) | parent 가 자기 child 를 열거할 수 없다. 관측이 성립하지 않음 |

**잠정: B (양방향).** 단 **parent 참조가 없거나 해석 불가하면 child 는 standalone 으로 정상 동작해야 한다.** 이것이 tree 설계 전체를 지배하는 안전장치다 (§7 원칙 3).

### 3.3 주소 지정 — 경로가 아니라 remote

child 를 **로컬 경로로 기록하면 머신에 종속된다.** gen-081/082 가 같은 함정을 두 번 밟았다 — 테스트가 개발자 머신의 git config 와 `XDG_CONFIG_HOME` 부재를 읽고 있었다.

**잠정**: 정본 식별자는 **git remote URL**(+ 선택적 branch). 로컬 경로는 캐시로만 두고, 없으면 해석 실패가 아니라 "미해석 노드"로 관측에서 제외한다.

### 3.4 깊이

임의 깊이를 허용하면 **지식 전파와 실패 전파가 재귀**가 된다. 조부모의 genome 이 손자에게 어떻게 도달하는지, 손자의 실패가 어디까지 올라가는지가 전부 문제가 된다.

**잠정**: 깊이 자체는 제한하지 않되, **전파는 1-hop 으로 고정**한다. 조부모 지식은 부모가 자기 것으로 소화해서 내려보낸다. 손자 결과는 부모가 요약해서 올린다. 각 노드는 자기 바로 위·아래만 안다.

---

## 4. 실행 orchestration

### 4.1 세 가지 모델

**M1 — 관측형 (observational)**
parent 는 child 상태를 **읽기만** 한다. child 는 사람이 자기 repo 에서 평소처럼 `/reap.evolve` 로 돌린다. parent 는 harvest 시점에 child lineage 를 수집해 자기 context 에 요약으로 넣는다.

- 장점: child 자율성 100%, 실패 전파 없음, 기존 lifecycle 무변경. **오늘 당장 구현 가능**
- 단점: "orchestration engine"이라 부르기 민망하다. 계획 분배가 없다

**M2 — 위임형 (delegating)**
parent 의 planning 이 child 에게 **goal 을 배정**한다. child 는 그 goal 로 자기 generation 을 돌린다. parent 는 배정한 것과 돌아온 것을 대조한다.

- 장점: tree 의 실질적 가치. 계획이 위에서 아래로 흐르고 결과가 위로 올라온다
- 단점: 배정 채널이 필요하다 (child backlog 에 항목을 넣는가? parent 가 child repo 에 쓰는 것은 §7 원칙 2 위반). **배정과 수확 사이의 시간이 열려 있다** — parent generation 이 그동안 무엇을 하는가
- 대가: parent 의 generation 이 child 를 기다리면 **며칠 단위로 열린 채 남는다.** 지금 lifecycle 은 그런 시간 규모를 전제하지 않는다

**M3 — 내포형 (nested execution)**
parent 의 implementation stage 가 child lifecycle 전체를 **동기 실행**한다 (subagent).

- 장점: 한 세션에서 끝난다. 흐름이 자명하다
- 단점: **context 폭발** (child 의 전 stage artifact 가 parent 세션에 쌓인다), **실패 전파가 치명적** (child 하나가 막히면 parent 가 멈춘다), **self-fitness 위험** (§6), 사람이 child 를 직접 돌리는 정상 경로와 충돌
- 판단: **채택하지 않는 쪽이 유력하다.** 독립 repo 의 자율성을 깨는 대가가 얻는 것보다 크다

**잠정: M1 → M2 순차 도입. M3 은 명시적으로 보류.**

### 4.2 병렬 child

Milestone 은 병렬을 금지한다(활성 1개). tree 도 같은 결론일까?

**아니다 — 오히려 병렬이 tree 의 존재 이유에 가깝다.** 서로 다른 팀·다른 저장소가 동시에 진행하는 것을 표현하려는 것이기 때문이다. 다만 조건을 붙인다:

- **parent 의 활성 generation 은 여전히 1개**다. 병렬인 것은 child 들이지 parent 가 아니다
- parent 는 **barrier 를 강제하지 않는다.** "모든 child 완료 대기"는 가장 느린 child 에 전체를 묶는다. 대신 **harvest 시점에 완료된 것만 취한다**
- 같은 파일을 건드리는 sibling 이 생기면 그것은 tree 문제가 아니라 **merge 문제**다 (§2)

### 4.3 실패 전파

**fail-fast 를 채택하지 않는다.** child 하나의 abort 가 tree 를 멈추면 독립성이 무의미하다.

- child abort → parent 는 해당 항목을 **미달로 기록**하고 나머지를 진행
- child early-close → **partial 로 수확**. deferred backlog 는 child 에 남는다 (child 소유)
- child 가 응답 없음(오래 진행 없음) → parent 는 **stale 로 표시**할 뿐 아무것도 하지 않는다

---

## 5. 지식 관리 — 이 설계의 진짜 난제

orchestration 은 배관이고, **어려운 것은 지식이 어느 방향으로 얼마나 흐르는가**다.

### 5.1 하향 전파 (parent → child)

| 대상 | 전파? | 근거 |
|---|---|---|
| `genome/invariants.md` | **상속 (강제)** | 절대 제약. 하위가 상위 invariant 를 어기면 tree 가 성립하지 않음 |
| `genome/application.md` | **상속 (참조)** | 아키텍처·컨벤션은 공유되어야 함. 단 child 고유 항목이 추가될 수 있음 |
| `genome/evolution.md` | **상속 (참조)** | AI 행동 규칙. 상위와 다르게 행동할 이유가 없음 |
| `vision/goals.md` | **부분** — parent goal 중 child 에 배정된 것만 | 전부 내리면 child 가 자기 것이 아닌 목표를 진다 |
| `vision/memory/` | **전파 안 함** | 노드별 맥락. 섞이면 양쪽 다 오염된다 |
| `environment/` | **전파 안 함** | descriptive. repo 마다 사실이 다르다 |

**상속의 형태 — 세 안**
- (a) **복사 동기화** — child 에 `genome/inherited/` 를 두고 parent 것을 읽기 전용으로 복사. 장점: child 단독 실행 시에도 존재. 단점: drift (parent 가 바뀌면 언제 갱신되나)
- (b) **참조** — child 가 실행 시 parent repo 를 읽음. 장점: 항상 최신. 단점: parent 접근 불가 시 child 가 절름발이가 된다 (§7 원칙 3 위반)
- (c) **요약 주입** — parent 가 child prompt 에 넣음. M1 에서는 불가능(parent 가 child 실행에 개입하지 않으므로)

**잠정: (a) 복사 동기화 + 명시적 갱신 시점.** drift 는 "언제 갱신하는가"를 정하면 통제되지만, 접근 실패는 통제되지 않는다.

**상속분은 child 가 수정할 수 없다.** 이의가 있으면 child 가 backlog(`type: genome-change`)를 제기하고 **parent 의 adapt phase 가 판단**한다. genome immutability 원칙이 tree 축으로 확장된 형태다.

### 5.2 상향 요약 (child → parent)

원문 전체를 올리면 parent context 가 죽는다. child 하나의 lineage 만 해도 세대당 5개 artifact 다.

**잠정**: 기존 **2-level lineage compression 을 재사용**한다. child 의 L1 압축본(goal + 결과 + 특이사항)만 parent 가 수집해 `.reap/tree/<child>/digest.md` 에 둔다. parent 의 static knowledge 에는 digest 만 들어간다.

올려야 할 것: **완료된 goal, 실패·중단, parent 원칙과 충돌한 지점, 상위로 승격할 만한 교훈.**
올리지 않을 것: 코드 변경 상세, 테스트 수치, 실행 로그. (memory 정책과 같은 기준)

### 5.3 충돌 감지

child 가 parent 원칙을 어긴 것을 **누가 감지하는가**. 지금 답이 없다.

후보: harvest 시 parent agent 가 digest 를 읽고 판단 / evaluator agent 에 위임 / 검사 스크립트. **evaluator 위임이 유력하다** — 이미 advisor 모델이고 self-review bias 를 줄이기 위해 만든 장치다.

---

## 6. Fitness 와 인간의 위치

`Human Judges Fitness` 와 `Self-fitness Prohibited` 는 invariant 다. tree 는 여기서 위험을 만든다.

**parent agent 가 child 결과를 평가하면 그것은 self-fitness 인가?**

같은 pipeline 의 상위 노드가 하위 결과를 채점하는 것은 **self 에 가깝다.** 특히 M2/M3 처럼 parent 가 goal 을 배정했다면, 자기가 시킨 일을 자기가 평가하는 구조가 된다.

**잠정 결론**:
- **child 의 fitness 는 child 에서 인간이 한다.** child 는 완결된 REAP 프로젝트이므로 원래 그렇게 동작한다
- **parent 는 child 를 평가하지 않는다.** parent 가 하는 것은 *수확(harvest)* — 배정한 것과 돌아온 것을 **대조**할 뿐이다. 대조는 사실 확인이지 적합도 판정이 아니다
- parent 의 fitness 는 여전히 parent 세대에 대해 인간이 한다

**남은 문제**: 사람이 한 명이면 같은 사람이 child 에서 한 번, parent 에서 또 한 번 판정한다. 이중 부담이다. child fitness 를 parent 로 **승계**하는 경로가 필요할 수 있다 — 다만 승계가 곧 "parent 가 평가한 것으로 간주"가 되면 위 결론이 무너진다. **미결.**

---

## 7. 설계 원칙 (초안)

1. **관측 우선, 강제는 나중.** M1 을 먼저 완성한다. 처음부터 실행 제어를 넣으면 독립 repo 의 자율성이 깨지고, 실패 시 tree 전체가 멈춘다
2. **child 의 `.reap/` 은 child 소유.** parent 는 **읽되 쓰지 않는다.** 배정조차 직접 쓰기가 아니어야 한다
3. **단독 실행이 항상 가능해야 한다.** child repo 를 혼자 clone 해서 `/reap.evolve` 를 돌리면 그냥 동작한다. tree 는 그 위에 얹는 layer 이지 전제가 아니다
4. **opt-in.** tree 를 모르는 기존 프로젝트의 동작은 byte-identical 이어야 한다 (`evaluator` 와 같은 패턴: config flag → caller 게이트 → 내부 silent-fail)
5. **전파는 1-hop.** 각 노드는 바로 위·아래만 안다

---

## 8. 무결성

- **nonce transition graph 는 노드 경계를 넘지 않는다.** 노드 내부 lifecycle 의 보증 장치이며, 저장소가 다르면 검증할 대상 자체가 다르다
- parent–child 사이는 nonce 가 아니라 **기록된 사실**로 확인한다 — child lineage entry 의 id / commit hash / 완료 시각
- **사람이 child repo 에서 parent 몰래 세대를 도는 것은 정상 경로다.** 이것을 막으려 하면 안 된다. parent 는 harvest 시 자기가 마지막으로 본 것과의 차이를 보면 된다
- 즉 **tree 는 강제 장치가 아니라 관측·전파 장치**다

---

## 9. 단계별 로드맵

각 phase 는 **관측 가능한 완료 조건**을 갖는다. 조건이 서지 않으면 다음으로 가지 않는다.

### Phase 0 — 설계 확정 (문서만)
이 문서의 `잠정` 을 결정으로 바꾸고 §11 미결을 닫는다.
**완료 조건**: 미결 질문에 전부 답이 적혔고, 기각안에 기각 사유가 적혔다.

### Phase 1 — 관측 (M1)
parent 가 child 목록을 갖고, child lineage digest 를 수집해 자기 context 에 노출한다. 실행 제어 없음.
**완료 조건**: parent 프로젝트에서 child 세대를 돌린 뒤, parent 의 context 에 그 세대의 요약이 나타난다. child 는 tree 를 몰라도 정상 동작한다.

### Phase 2 — 지식 전파
parent genome/invariants 하향 상속 + child 교훈 상향 요약 + 충돌 감지.
**완료 조건**: parent genome 변경이 child 에 도달하고, child 가 상속분을 수정하려 하면 막힌다. child 의 원칙 위반이 harvest 에서 드러난다.

### Phase 3 — orchestration (M2)
goal 배정 + 수확 대조.
**완료 조건**: parent 가 배정한 goal 이 child backlog 로 나타나고, child 완료 후 parent 가 배정↔결과를 대조한 기록을 남긴다.

**세대 배분**: 최소 3~4 generation. Phase 1 은 단독 1세대, Phase 2 는 지식 규칙 때문에 2세대가 될 수 있다.

---

## 10. 예상 표면 (참고 — 확정 아님)

```
.reap/
├── config.yml          # tree: true (opt-in), parent: <remote>  ← child 쪽
├── tree.yml            # child 목록 (remote, branch, 마지막 harvest)  ← parent 쪽
├── tree/
│   └── <child-name>/
│       └── digest.md   # child lineage L1 요약 (parent 소유, 읽기용)
└── genome/
    └── inherited/      # parent 로부터 복사된 읽기 전용 genome  ← child 쪽
```

```
reap tree list                 # child 목록과 상태
reap tree add <remote>         # child 등록
reap tree harvest              # child digest 수집 + 갱신
reap tree sync-genome          # 상속 genome 갱신 (child 에서 실행)
```

`reap tree harvest` 는 **child repo 에 아무것도 쓰지 않는다** (§7 원칙 2).

---

## 11. 미결 질문 — Phase 0 에서 닫아야 할 것

1. **goal 배정 채널** — parent 가 child repo 에 쓰지 않으면서 어떻게 배정하는가. child 가 harvest 를 당기는(pull) 모델인가?
2. **fitness 이중 부담** (§6) — child fitness 를 parent 로 승계할 것인가. 승계하면 self-fitness 경계가 어떻게 유지되는가
3. **상속 genome 갱신 시점** — parent 가 바뀐 것을 child 가 언제 아는가. SessionStart 마다? harvest 시? 수동?
4. **child 가 여러 parent 를 갖는 경우** — 공유 라이브러리는 자연히 그렇게 된다. 금지할 것인가, DAG 을 허용할 것인가. **"Tree"라는 이름이 이미 답을 전제하고 있다는 점을 의식할 것**
5. **code index 와의 관계** — cross-repo 심볼 그래프·impact 분석이 tree 축을 인지해야 하는가. **전제가 바뀌었다**: 인덱스는 `.reap/.index/` 에 프로젝트별로 살고 커밋 기준으로 갱신되므로, 지금은 구조적으로 노드 내부만 본다. 노드 경계를 넘으려면 각 child 의 스냅샷을 parent 가 읽는 형태가 되는데, 그것은 "parent 는 child 의 `.reap/` 을 읽되 쓰지 않는다"(§ 원칙 2)와는 맞지만 **child 의 커밋이 움직일 때 parent 인덱스가 언제 낡는가**라는 질문을 새로 만든다. 미결.
6. **stale 판정 기준** — child 가 얼마나 조용하면 stale 인가. 시간 기준은 머신 상태에 의존하지 않는가
7. **Milestone 과의 접점** — parent 의 milestone 이 child 들에게 분배되는가. 분배된다면 child 는 자기 milestone 을 갖는가

---

## 12. 채택하지 않을 것 (현재 판단)

- **M3 내포형 실행** — context 폭발 + 실패 전파 + self-fitness 위험. 얻는 것보다 대가가 크다 (§4.1)
- **merge 확장으로 구현** — merge 는 "결국 하나가 된다"를 전제한다 (§2)
- **CI 오케스트레이터화** — REAP 은 빌드 파이프라인이 아니다. child 실행 주체는 사람과 그 사람의 agent 다
- **parent 가 child 파일을 직접 쓰기** — 한 번 허용하면 소유권 경계가 사라진다 (§7 원칙 2)
- **fail-fast** — 독립성과 양립하지 않는다 (§4.3)

---

## 13. 검증 전략

tree 는 **두 프로젝트가 있어야 검증된다** — 단위 테스트로 잡히지 않는다.

- **scenario test**: `tests/fixtures/` 에 parent + child 두 프로젝트를 만들고, child 에서 세대를 돌린 뒤 parent harvest 결과를 확인
- **회귀 보장**: tree 미설정 프로젝트의 모든 출력이 byte-identical 임을 검사 (`evaluator` opt-in 검증 패턴 재사용)
- **검사를 먼저 실패시킨다** — harvest 를 구현하기 전에 검사를 돌려 fail 을 확인한다 (gen-073 교훈)
- **머신 상태를 읽지 않는다** — fixture 는 `git init -b main` + repo 별 identity 설정. 로컬 경로 비교는 realpath 정규화 (gen-081 교훈)
