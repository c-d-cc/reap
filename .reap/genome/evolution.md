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

### 테스트 피드백 루프
- 테스트 실행 중 환경 문제나 새로운 깨달음이 발생하면, completion artifact에 기록하고 필요 시 genome에 반영.
- 테스트 실패 원인이 환경 차이(OS, Node 버전 등)인 경우 environment에 기록.

## 중단된 Generation 복구

유저가 중간에 중단(Esc, 세션 종료 등)하면 generation이 불완전한 상태로 남을 수 있다.

- 복구 시: `.reap/life/current.yml`에서 현재 stage/phase 확인 → **중단된 시점의 phase부터 다시 실행**. 다음 phase의 nonce가 아직 발급되지 않은 상태이므로, 같은 phase를 재실행하면 정상 진행된다.
- 예: completion fitness에서 중단 → `reap run completion --phase fitness --feedback "..."` 로 재실행 → adapt → commit.
- **절대로 current.yml을 수동 편집하지 않는다**. nonce가 꼬이면 abort 후 재시작이 더 안전.

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

## Completion 시 환경 갱신

reflect phase에서 environment/summary.md를 점진적으로 업데이트:
- implementation에서 변경한 파일/모듈을 기준으로 영향받는 environment 섹션만 수정
- 전체 재작성 아님 — 변경된 부분만 반영 (파일 추가/삭제, 의존성 변경, 빌드 변경 등)
- Tech Stack, Source Structure, Tests 섹션이 주요 갱신 대상

## genome vs environment 경계

- **genome (application.md)**: prescriptive — "이렇게 해야 한다" (원칙, 설계 결정, 컨벤션, 규칙). genome은 normal mode에서 immutable이므로, 자주 변하는 사실 정보를 넣으면 안 된다.
- **environment (summary.md)**: descriptive — "현재 이런 상태다" (기술 스택, 소스 구조, 빌드, 테스트, 의존성). 코드가 바뀌면 environment만 업데이트.
- 판단 기준: "이 정보가 바뀌면 genome을 수정해야 하나?" → Yes면 genome, No면 environment.
