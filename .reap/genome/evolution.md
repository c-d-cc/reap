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

Vision은 Goals, Memory, Design 세 가지로 구성된다.

### Goals (`vision/goals.md`)
프로젝트의 장기 목표. adapt phase에서 gap 분석을 통해 다음 generation의 방향을 결정하는 핵심 동력.
- 미완료 `[ ]` 항목이 다음 goal 후보
- generation 완료 시 달성한 goal을 `[x]`로 마킹 제안
- Goals cleanup: goals.md는 **미래** 목표를 위한 공간이지 과거 성과의 아카이브가 아니다. 완료 항목(`[x]`)이 누적되어 문서가 forward-looking 역할을 잃어간다고 판단되면, 구체적으로 어떤 항목을 제거할지 인간에게 제안하고 승인을 받아라. 최근 완료된 항목은 아직 참조 가치가 있을 수 있고, 오래 안정된 항목은 제거해도 된다. 항상 인간 확인 후 제거.

### Design (`vision/design/`)
프로젝트의 설계 문서를 보관하는 공간. Memory와의 구분:
- **Design** — 구체적 scope를 가진 설계 문서 (아키텍처 설계, 기능 스펙 등). 독립된 문서로 관리.
- **Memory** — 범용적 맥락 기록 (교훈, 진행 상황, 핸드오프). tier별 단일 파일.

판단 기준: "이 내용이 하나의 독립된 주제로 문서화할 만한가?" → Yes면 Design, No면 Memory.

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

`reap run completion --phase reflect` 시 다음 cleanup을 **의무적으로** 수행한다:

**Shortterm — 매 generation 의무 cleanup**:
- 이전 세션의 핸드오프 중 "이미 처리됨" 항목은 삭제
- 새 generation의 핸드오프로 **교체** (덮어쓰기). 누적 금지.
- 결과적으로 shortterm.md는 항상 "최근 1~2 generation 분량".

**Midterm — 트랙 완료 시 cleanup**:
- 트랙이 완료되면 핵심 결정만 longterm으로 **승격** 후 midterm에서 해당 섹션 **삭제**
- 판단 기준: "이 트랙에 다음 step이 있는가?" — No 면 삭제
- 결과적으로 midterm.md는 항상 "현재 살아있는 트랙만".

**Longterm — 주기적 cleanup (10 generation마다 또는 reflect에서 비대화 감지 시)**:
- 섹션이 genome(application.md / evolution.md)에 이미 명문화됐으면 **중복 → 삭제**
- 프로젝트 초기 전환 맥락(e.g., v0.X→v0.Y 차이)이 더 이상 행동 지침이 아니면 **삭제**
- 판단 기준: "이 교훈이 없으면 다음 agent가 같은 실수를 할 것인가?" — No 면 삭제
- 결과적으로 longterm.md는 항상 "지금도 행동 지침이 되는 교훈만".

### Memory에 쓰지 않을 것

- 코드 변경 상세 (environment/summary.md가 담당)
- 테스트 수치, 실행 로그 (artifact가 담당)
- genome (application.md / evolution.md) 에 이미 있는 원칙 (중복 금지)
- generation-specific debug 일지 (lineage에 자연 보존, memory 자리 차지 금지)

### Memory 활용 — 자유와 책임

- **자유로운 읽기/쓰기** — genome처럼 제약 없음
- **tier 간 이동도 자율** — shortterm 의 항목이 트랙으로 발전하면 midterm으로, 트랙이 완료되어 교훈만 남으면 longterm으로
- **아키텍처 변경 시 반드시 반영** — 새 기능/구조 추가 시 evolution.md / application.md / memory 모두 동기화
- **비대화는 실패 신호** — longterm 30~50줄 / midterm 50~70줄을 넘으면 pruning 미수행 의심. reflect에서 정리.

## Self-exploration 우선

첫 generation(또는 genome이 빈약한 상태)에서는 코드 변경보다 자기 탐구를 우선.
실제 코드베이스를 읽고 genome/environment/vision을 채우는 것이 코드 수정보다 먼저.

## Code Quality Principles

새 코드를 작성하기 전에 반드시 기존 코드를 읽고 패턴을 파악한다.

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
| 외부 도구 / subprocess / daemon 통합 | e2e (subprocess + 포트/HOME 격리 + git init fixture) |

### 외부 도구 / subprocess / daemon e2e 패턴 (gen-069)

REAP daemon 같은 별도 프로세스로 동작하는 컴포넌트를 e2e 검증할 때 다음 패턴 차용:

1. **포트 격리** — env var (예: `REAP_DAEMON_PORT`) 로 user 영역의 default port (17224) 와 충돌 회피. helper 가 비어있는 포트 할당.
2. **HOME 격리** — `HOME` env var override 로 user 영역 `~/.reap/daemon/` 미접근 보장. 모든 daemon side-effect 가 test 임시 디렉토리에 갇힘.
3. **Fixture = git project** — 실제 daemon 이 기대하는 입력 (git-init 된 source tree) 그대로 재현. fixture 는 별도 `tests/fixtures/<name>/` 디렉토리.
4. **macOS realpath 정규화** — `/var` → `/private/var` symlink 가 path comparison fail 유발. fixture path 는 `realpath()` 로 정규화 후 비교 (현재 deferred — gen-069 의 디버깅 cost 사례).
5. **Helper 단일 import** — spawn/stop/register/copy 를 `tests/helpers/<tool>.ts` 한 곳으로 추출. e2e 파일은 helper 만 import.
6. **격리 효과 보장 — 외부 사용자 영역 미접근**: 이 패턴은 user 가 자기 환경에서 같은 도구를 동시에 실행 중이어도 e2e 가 user state 를 건드리지 않음을 의미.

향후 외부 도구 통합 (예: MCP server, 다른 sidecar) 도 같은 4-축 (process / port / HOME / fixture) 으로 격리.

### 테스트 피드백 루프
- 테스트 실행 중 환경 문제나 새로운 깨달음이 발생하면, completion artifact에 기록하고 필요 시 genome에 반영.
- 테스트 실패 원인이 환경 차이(OS, Node 버전 등)인 경우 environment에 기록.

## 중단된 Generation 복구

유저가 중간에 중단(Esc, 세션 종료 등)하면 generation이 불완전한 상태로 남을 수 있다.

- 복구 시: `.reap/life/current.yml`에서 현재 stage/phase 확인 → **중단된 시점의 phase부터 다시 실행**. 다음 phase의 nonce가 아직 발급되지 않은 상태이므로, 같은 phase를 재실행하면 정상 진행된다.
- 예: completion fitness에서 중단 → `reap run completion --phase fitness --feedback "..."` 로 재실행 → adapt → commit.
- **절대로 current.yml을 수동 편집하지 않는다**. nonce가 꼬이면 abort 후 재시작이 더 안전.

## 조기 종료(early-close) 판단

`reap run early-close` 는 implementation/validation 단계에서만 사용 가능한 lightweight 종료 path 다. 다음 상황에서 고려한다.
- 작업 일부는 완성되어 가치가 있으나 잔여 task 가 별도 generation 으로 나누는 게 더 합리적인 경우.
- 외부 의존 차단(API 변경, 환경 이슈)으로 현 generation 에서 마무리 불가하지만 진행분은 살리고 싶을 때.
- 단순 폐기(abort)와 정식 완료(completion) 둘 다 부적절할 때.

판단 기준:
- 진행분이 **lineage 에 보존할 가치가 있는가** → No 면 abort 선택.
- 잔여 task 가 **별도 generation 가치를 가지는가** → No(자잘한 follow-up)면 그대로 completion 까지 가서 hints 에만 기록.
- `--defer-tasks` 옵션으로 deferred backlog 본문을 명시 지정 가능. 미지정 시 implementation artifact 에서 unchecked `- [ ]` 라인 자동 추출.

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

본 generation 의 목적이 X 의 검증 인프라 구축인데, 검증을 돌리면서 X 가 의존하는 다른 동작 Y 가 실제로 깨져있음을 발견한 경우:

- **fix Y 가 본 generation scope 가 아니라도 인과로 묶여있다 — 분리하면 검증이 의미를 잃는다**.
- **gen-065 lesson 의 일반화**: 인과 chain 의 어느 한 곳만 끊으면 새 누락 path 생성. 본 generation 에서 X+Y 를 같은 묶음으로 처리.
- **gen-069 사례**: daemon e2e 검증 인프라 (X) 구축 중 typescript-tags.scm 의 call_expression 캡처 누락 (Y) 발견. fix 가 1-line 이고 본 generation 의 case 2/3 가 직접 의존 → 즉시 fix. 분리했으면 본 generation e2e 가 fail 한 채 commit 됐을 것.

판단 기준:
- fix 가 small scope (1~수 라인) 인가 → Yes 면 본 generation.
- fix 누락 시 본 generation 의 검증이 실패하거나 의미를 잃는가 → Yes 면 본 generation 강제.
- fix 가 큰 design 변경을 동반하는가 → Yes 면 backlog 화 + 본 generation 의 해당 검증 cases 만 skip + 다음 generation 에서 enable.

## 사용자 UX gap은 verification 항목으로 명시 (gen-063 교훈)

새 client adapter / 외부 도구 통합 / 사용자 진입점 추가 시, planning의 verification 체크리스트에는 다음 4가지를 **모두 명시**해야 한다:

1. **Static knowledge 자동 로드 메커니즘** — client native 방식 (e.g., `@` import / `instructions` 필드)
2. **Dynamic state refresh trigger** — session 시작 / 도구 호출 시점 갱신
3. **Entry-point 파일** — 사용자가 첫 진입 시 보는 안내 (CLAUDE.md / AGENTS.md / 등)
4. **Trigger 등록 — slash commands / shortcuts** — 사용자가 native UI로 REAP를 호출할 수 있는 경로

(4)는 가장 잊기 쉬운 항목이다. gen-063에서 OpenCode adapter는 (1)~(3)을 모두 갖췄지만 (4)가 누락되어, 사용자가 fitness 단계에서 "agent는 동작하지만 슬래시 트리거가 안 됨"을 발견함. follow-up backlog `opencode-slash-commands.md`로 처리하기로 했지만, 처음부터 verification에 포함됐으면 본 generation에서 끝났을 작업.

판단 기준: "이 client/통합을 처음 받은 사용자가 5분 안에 평소처럼 REAP를 호출할 수 있는가?" — Yes면 OK, No면 (1)~(4) 중 누락이 있다.

### 사용자 직접 테스트가 e2e가 못 잡는 갭을 잡는다 (gen-064 사례)

gen-064는 (4) slash trigger 등록을 구현했고, e2e (`installSkills` 직접 호출) 가 모두 통과했다. 그러나 사용자가 fitness 직전 코드 직접 검토 중 결정적 갭 발견: **`reap update` 흐름은 `installSkills` 가 아닌 `registerSessionIntegration` 만 호출**하므로, user-level sync가 그쪽에 없으면 backlog verification ("`reap update` 후 reap.* 19 자동 배치") 과 코드 불일치. e2e는 verification scenario의 **일부 CLI entry point만 cover** 했고, 사용자가 실제 시나리오의 다른 entry point에서 갭을 잡아냄.

교훈:
- **fitness 전 self-audit 체크리스트**: (1) backlog verification 의 각 시나리오가 e2e 1:1 mirror 되는가, (2) 변경 함수의 caller 가 모두 검증되었는가, (3) 사용자가 따라할 명령 시퀀스를 e2e 가 그대로 재현하는가.
- **agent의 추상적 추론보다 사용자가 코드를 직접 읽기가 강력**. plan 단계의 잘못된 가정(`registerSessionIntegration`이 SessionStart 매번 호출이라는 추정)이 implementation까지 그대로 흘러갔지만 fitness 직전 사용자 검토에서 catch → back regression path가 graceful 하게 처리. lifecycle이 정상 작동한 사례.
- **사용자 인 더 루프(human-in-the-loop)는 자동화 신뢰의 마지막 safety net**. AI는 자기 작업의 모든 entry point를 자기 검증할 수 없다 — 사용자 직접 테스트와 코드 직접 검토가 그 갭을 메운다. 본 사례가 fitness phase 의 가치를 입증.

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

## 아키텍처 변경 시 genome 동기화

새 기능/구조를 추가하거나 아키텍처를 변경했을 때, 해당 변경이 AI의 행동 방식에 영향을 준다면 반드시 genome(evolution.md 또는 application.md)에 반영해야 한다.

판단 기준: "다음 세션의 새 agent가 이 변경을 몰라도 올바르게 동작할 수 있는가?" → No이면 genome 업데이트 필수.

## Completion 시 환경 갱신

reflect phase에서 environment/summary.md를 점진적으로 업데이트:
- implementation에서 변경한 파일/모듈을 기준으로 영향받는 environment 섹션만 수정
- 전체 재작성 아님 — 변경된 부분만 반영 (파일 추가/삭제, 의존성 변경, 빌드 변경 등)
- Tech Stack, Source Structure, Tests 섹션이 주요 갱신 대상

**낡은 서술은 제거한다 — 갱신은 append-only가 아니다**:
- 더 이상 사실이 아닌 문장을 삭제한다 (제거된 파일/모듈, 폐기된 결정, 낡은 의존성 메모)
- **generation별 changelog 항목을 쌓지 않는다.** summary.md는 현재 상태를 서술하지, 그렇게 된 경위를 서술하지 않는다 — 경위는 lineage와 git history가 소유한다
- 어떤 절이 "gen-NNN에서 무엇이 바뀌었다"의 나열이 되었다면 현재형 서술 하나로 접는다

## genome vs environment 경계

- **genome (application.md)**: prescriptive — "이렇게 해야 한다" (원칙, 설계 결정, 컨벤션, 규칙). genome은 normal mode에서 immutable이므로, 자주 변하는 사실 정보를 넣으면 안 된다.
- **environment (summary.md)**: descriptive — "현재 이런 상태다" (기술 스택, 소스 구조, 빌드, 테스트, 의존성). 코드가 바뀌면 environment만 업데이트.
- 판단 기준: "이 정보가 바뀌면 genome을 수정해야 하나?" → Yes면 genome, No면 environment.
