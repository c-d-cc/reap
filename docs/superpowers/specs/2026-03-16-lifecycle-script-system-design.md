# REAP Life Cycle Script System Design

## Goal

REAP의 8-stage Life Cycle 각 단계에서 AI Agent가 수행할 워크플로우를 slash command + prompt template 시스템으로 정의한다. spec-kit의 스크립트+템플릿 패턴을 참고하되, REAP의 4축 구조(.reap/) 안에서 모든 산출물을 관리한다.

## 핵심 결정

1. **실행 주체**: AI Agent가 slash command를 통해 실행. CLI는 상태 추적기 역할만.
2. **산출물 위치**: `.reap/life/`에 저장. 4축 구조 유지. 프로젝트 루트에 별도 디렉토리 없음.
3. **산출물 네이밍**: `{seq}-{stage}-{file}.md` (예: `01-conception-goal.md`)
4. **템플릿 분리**: 산출물 형식은 `.reap/templates/`에 별도 템플릿으로 관리. slash command에서 "이 템플릿을 읽고 채워서 저장하라"고 지시.
5. **Gate 체크**: 엄격. 이전 stage 산출물이 없으면 진행 거부.
6. **에이전트 독립**: slash command 원본은 `.reap/commands/`에 저장. `reap init` 시 `.claude/commands/`로 복사. 추후 다른 에이전트 지원 확장 가능.
7. **Genome 재정의**: 산출물(문서, 코드)이 아닌 원칙/규칙/결정의 집합.
8. **Plan + Tasks 통합**: spec-kit과 달리 `plan.md`와 `tasks.md`를 `03-planning-plan.md` 하나로 합침.
9. **Stage 전환 주체**: CLI(`reap evolve --advance`)는 개발자가 직접 실행. slash command는 "개발자에게 다음 단계 전환을 안내"하되 자동 실행하지 않음.

## 아키텍처 spec과의 변경사항

이 설계는 `2026-03-15-reap-pipeline-architecture-design.md`에서 다음을 변경한다:

- **Genome 내부 구조 변경**: `source-map.json`, `architecture/`, `cheatsheet.md` 제거. `principles.md`, `domain/`, `conventions.md`, `constraints.md`로 재정의. Genome은 산출물이 아닌 원칙/규칙/결정의 집합.
- **`.reap/claude/` 폐기**: `.reap/commands/`로 대체. 에이전트 독립적 구조로 변경. `reap init` 시 `.claude/commands/`로 복사.
- **`.reap/life/` 산출물 추가**: 기존 `current.yml` + `mutations/` + `backlog/`에 stage별 산출물 파일 추가.

## 디렉토리 구조

```
.reap/
├── config.yml
├── commands/                         # slash command 원본 (에이전트 독립)
│   ├── reap.conception.md
│   ├── reap.formation.md
│   ├── reap.planning.md
│   ├── reap.growth.md
│   ├── reap.validation.md
│   ├── reap.adaptation.md
│   └── reap.birth.md
├── templates/                        # 산출물 템플릿
│   ├── 01-conception-goal.md
│   ├── 02-formation-spec.md
│   ├── 03-planning-plan.md
│   ├── 04-growth-log.md
│   ├── 05-validation-report.md
│   ├── 06-adaptation-retrospective.md
│   └── 07-birth-changelog.md
├── genome/                           # 유전 정보 (원칙/규칙/결정)
│   ├── principles.md                 #   아키텍처 원칙/결정 (ADR 스타일)
│   ├── domain/                       #   비즈니스 규칙 (모듈별 분리)
│   ├── conventions.md                #   개발 규칙/컨벤션
│   └── constraints.md                #   기술 제약/선택
├── environment/                      # 외부 환경/제약조건
├── life/                             # 현재 세대 상태 + 산출물
│   ├── current.yml
│   ├── 01-conception-goal.md         # 템플릿에서 생성
│   ├── 02-formation-spec.md
│   ├── 03-planning-plan.md
│   ├── 04-growth-log.md
│   ├── 05-validation-report.md
│   ├── 06-adaptation-retrospective.md
│   ├── 07-birth-changelog.md
│   ├── mutations/
│   └── backlog/
└── lineage/                          # 완료된 세대 아카이브
    └── gen-001-user-auth/
        ├── 01-conception-goal.md
        ├── ...
        ├── 07-birth-changelog.md
        ├── 08-legacy-summary.md
        └── mutations/
```

## 실행 모델

### 역할 분리

| 구성 요소 | 역할 |
|---|---|
| **CLI (`reap`)** | 상태 추적기. stage 전환 (`evolve --advance/--back`), generation 관리, `fix` |
| **AI Agent** | 워크플로우 실행기. slash command를 통해 각 stage의 실제 작업 수행 |
| **slash command** | stage별 워크플로우 정의. Gate → Steps → 산출물 생성 |
| **template** | 산출물의 형식(format) 정의. AI가 읽고 채워서 life/에 저장 |

### 흐름

```
개발자: /reap.conception (slash command 호출)
   ↓
AI Agent: Gate 체크 (current.yml stage == conception?)
   ↓ 통과
AI Agent: Steps 실행 (environment/ 읽기, genome/ 참조, 인간과 대화)
   ↓
AI Agent: .reap/templates/01-conception-goal.md 읽기
   ↓
AI Agent: 템플릿을 채워서 .reap/life/01-conception-goal.md에 저장
   ↓
개발자: reap evolve --advance (다음 stage로 전환)
   ↓
개발자: /reap.formation (다음 slash command 호출)
   ↓
AI Agent: Gate 체크 (01-conception-goal.md 존재?)
   ...
```

## Slash Command 구조

모든 slash command는 동일한 3단 구조를 따른다:

```markdown
# [Stage Name] ([한국어 레이블])

## Gate (전제조건)
- [ ] current.yml의 stage가 [stage]인지 확인
- [ ] [이전 산출물]이 .reap/life/에 존재하는지 확인
→ 미충족 시: 사유를 알리고 중단

## Steps
1. [구체적 행동 지시]
2. [구체적 행동 지시]
...

## 산출물 생성
- `.reap/templates/[template].md`를 읽어라
- 위 Steps의 결과를 반영하여 채워라
- `.reap/life/[output].md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 다음 단계로 진행하라고 안내
```

## Stage별 정의

### Conception (목표 설정)

| 항목 | 내용 |
|---|---|
| **Gate** | current.yml stage == conception |
| **Steps** | 1. `.reap/environment/` 읽기 (외부 환경 변화 파악) |
| | 2. `.reap/lineage/`에서 직전 세대 adaptation 참조 |
| | 3. `.reap/life/backlog/`에서 예정된 목표 확인 |
| | 4. `.reap/genome/` 현재 상태 파악 |
| | 5. 인간과 대화하여 이번 세대의 goal 확정 |
| **산출물** | `01-conception-goal.md` — 목표, 완료 조건, 범위, 관련 genome 영역 |

### Formation (명세 정의)

| 항목 | 내용 |
|---|---|
| **Gate** | current.yml stage == formation, `01-conception-goal.md` 존재 |
| **Steps** | 1. `01-conception-goal.md`에서 goal과 범위 읽기 |
| | 2. `.reap/genome/`에서 관련 명세 읽기 (principles, domain, conventions, constraints) |
| | 3. goal 달성에 필요한 명세가 부족하면 보완 계획 수립 |
| | 4. genome 수정이 필요한 부분 발견 시 `.reap/life/mutations/`에 기록 |
| | 5. 인간과 함께 spec 확정 |
| **산출물** | `02-formation-spec.md` — 기능 명세, 요구사항, 수용 기준 |

### Planning (계획 수립)

| 항목 | 내용 |
|---|---|
| **Gate** | current.yml stage == planning, `02-formation-spec.md` 존재 |
| **Steps** | 1. `02-formation-spec.md`에서 요구사항 읽기 |
| | 2. `.reap/genome/constraints.md`에서 기술 제약 확인 |
| | 3. 구현 계획 수립 (아키텍처 접근법, 기술 선택) |
| | 4. 태스크 분해 (순서, 의존관계, 병렬 가능 여부) |
| | 5. 인간과 함께 계획 확정 |
| **산출물** | `03-planning-plan.md` — 구현 계획 + 태스크 체크리스트 (통합) |

### Growth (구현)

| 항목 | 내용 |
|---|---|
| **Gate** | current.yml stage == growth, `03-planning-plan.md` 존재 |
| **Steps** | 1. `03-planning-plan.md`에서 태스크 목록 읽기 |
| | 2. 계획에 따라 코드 구현 |
| | 3. 명세와 다르게 구현해야 할 부분 발견 시 `.reap/life/mutations/`에 기록 |
| | 4. **mutation이 발생하여 genome 수정이 필요한 경우, 해당 mutation에 의존하는 태스크를 deferred로 마킹하고 backlog에 추가** |
| | 5. 완료/deferred 태스크를 growth log에 기록 |
| **산출물** | `04-growth-log.md` — 완료 태스크, deferred 태스크(사유 포함), 발생한 mutation, 구현 메모 |

### Validation (검증)

| 항목 | 내용 |
|---|---|
| **Gate** | current.yml stage == validation, `04-growth-log.md` 존재 |
| **Steps** | 1. `01-conception-goal.md`에서 완료 조건 읽기 |
| | 2. **deferred 태스크를 제외한 범위에서 완료 조건을 재평가** |
| | 3. 테스트 실행 (완료된 범위에 대해서만) |
| | 4. goal의 완료 조건을 하나씩 점검 (deferred로 인해 부분 달성도 허용) |
| | 5. 문제 발견 시 `reap evolve --back`으로 Growth 복귀 가능 |
| **산출물** | `05-validation-report.md` — 테스트 결과, 완료 조건 체크, deferred 항목 목록, pass/partial/fail |

### Adaptation (회고)

| 항목 | 내용 |
|---|---|
| **Gate** | current.yml stage == adaptation, `05-validation-report.md` 존재 |
| **Steps** | 1. `.reap/life/mutations/` 전체 리뷰 |
| | 2. 이번 세대에서 얻은 교훈 정리 |
| | 3. genome에 반영할 변경 사항을 adaptation으로 기록 |
| | 4. **deferred 태스크를 다음 세대 목표로 `.reap/life/backlog/`에 추가** |
| | 5. 그 외 다음 세대 목표 후보도 backlog에 추가 |
| | 6. 인간과 함께 회고 확정 |
| **산출물** | `06-adaptation-retrospective.md` — 교훈, genome 변경 제안, deferred 태스크 인계, 다음 세대 backlog |

### Birth (출산)

| 항목 | 내용 |
|---|---|
| **Gate** | current.yml stage == birth, `06-adaptation-retrospective.md` 존재 |
| **Steps** | 1. `.reap/life/mutations/`의 mutation들을 genome에 반영 |
| | 2. `06-adaptation-retrospective.md`의 genome 변경 제안을 반영 |
| | 3. 변경된 genome을 인간이 확인 |
| | 4. 변경 내역을 changelog에 기록 |
| **산출물** | `07-birth-changelog.md` — genome에 반영한 변경 목록 (mutation/adaptation별) |

### Legacy (완료)

Legacy는 slash command가 아닌 CLI(`reap evolve --advance`)가 자동 처리:

1. `07-birth-changelog.md` 존재 확인
2. `.reap/life/`의 모든 산출물과 `mutations/`를 `.reap/lineage/gen-xxx-yyy/`로 이동
3. `08-legacy-summary.md` 생성 — 아래 형식으로 CLI가 자동 생성 (템플릿 없음):
   ```
   # Generation [id] Summary
   - Goal: [current.yml의 goal]
   - Started: [startedAt]
   - Completed: [completedAt]
   - Genome Version: [genomeVersion] → [genomeVersion + 1]
   - Mutations: [count]건
   - Files: [산출물 목록]
   ```
4. `.reap/life/current.yml` 초기화
5. `.reap/life/` 산출물 및 `mutations/` 정리 (backlog/는 유지)

### 태스크 Deferral (세대 간 인계)

Genome 불변 원칙에 의해, 현재 세대에서 genome 수정이 필요한 태스크는 현재 세대에서 완료할 수 없다. 이런 태스크는 **deferred**로 마킹하고 다음 세대로 넘긴다.

**Deferral 흐름:**
1. Growth 중 mutation 발견 → `.reap/life/mutations/`에 기록
2. 해당 mutation에 의존하는 태스크를 `03-planning-plan.md`에서 `[deferred]`로 마킹
3. `04-growth-log.md`에 deferred 사유 기록
4. Validation에서 deferred 태스크는 검증 대상에서 제외
5. Adaptation에서 deferred 태스크를 backlog에 추가 (다음 세대 목표 후보)

**태스크 상태:**
- `[ ]` — 미완료
- `[x]` — 완료
- `[deferred]` — 다음 세대로 인계 (사유: mutation 의존)

**부분 완료는 정상이다.** 세대의 목표를 100% 달성하지 못해도 된다. genome 수정이 필요한 부분은 Birth에서 genome을 갱신한 뒤, 다음 세대에서 이어서 진행한다. 이것이 진화의 본질이다.

### Growth ↔ Validation 루프

`reap evolve --back`으로 Validation에서 Growth로 복귀 시:
- `04-growth-log.md`에 append 모드로 추가 기록 (기존 내용 유지)
- `05-validation-report.md`는 다시 Validation 진입 시 갱신 (덮어쓰기)
- `/reap.growth` slash command 재실행 시 `03-planning-plan.md`의 미완료 태스크부터 재개

## current.yml 스키마

```yaml
id: gen-001              # 세대 ID
goal: "사용자 인증 구현"    # 세대 목표
stage: growth            # 현재 Life Cycle stage
genomeVersion: 1         # 이 세대가 시작된 시점의 genome 버전
startedAt: '2026-03-16'  # 세대 시작 일시
completedAt: ''          # 세대 완료 일시 (Legacy 진입 시 기록)
```

## Mutation 파일 포맷

`.reap/life/mutations/` 안에 개별 YAML 파일로 저장.

파일명: `{timestamp}-{short-desc}.yml` (예: `1710547200-api-auth-change.yml`)

```yaml
id: mut-001
generationId: gen-001
target: genome/domain/auth.md     # 변경 대상 genome 파일
description: "API 인증 방식을 JWT에서 OAuth2로 변경 필요"
reason: "외부 서비스 연동 요구사항 발견"
suggestedChange: |
  ## 인증
  - 기존: JWT 기반 자체 인증
  - 변경: OAuth2 + OIDC 연동
createdAt: '2026-03-16T10:00:00Z'
```

## Backlog 파일 포맷

`.reap/life/backlog/` 안에 개별 마크다운 파일로 저장.

파일명: `{priority}-{short-desc}.md` (예: `01-payment-integration.md`)

```markdown
# [목표 제목]

## 배경
[왜 이 목표가 필요한지]

## 예상 범위
[관련 genome 영역, 대략적 크기]

## 출처
[어느 세대의 adaptation에서 도출되었는지]
```

## Genome 구조

Genome은 Application의 **원칙, 규칙, 결정의 집합**이다. 산출물(문서, 다이어그램, 코드)이 아니라 그것들을 만들어내는 본질(essence)을 담는다.

```
.reap/genome/
├── principles.md      # 아키텍처 원칙/결정 (ADR 스타일)
├── domain/            # 비즈니스 규칙/도메인 정의 (모듈별 분리)
├── conventions.md     # 개발 규칙/컨벤션
└── constraints.md     # 기술 제약/선택
```

### Genome 불변 원칙

현재 세대는 genome을 직접 수정하지 않는다:
- Growth 중 발견한 문제 → `.reap/life/mutations/`에 기록
- Adaptation에서 도출한 교훈 → `06-adaptation-retrospective.md`에 genome diff로 기록
- Birth에서만 mutation + adaptation을 genome에 반영

### Genome vs Civilization

| | Genome (정의) | Civilization (발현) |
|---|---|---|
| 아키텍처 | 원칙/결정 ("레이어드 아키텍처") | 문서, 다이어그램 |
| 비즈니스 | 규칙 ("주문은 결제 전 취소 가능") | 구현 코드 |
| API | 계약/원칙 | 구현 코드 |
| 개발 | 컨벤션/규칙 | 설정 파일, 린터 |

## Init 변경사항

`reap init` 명령이 추가로 수행할 것:

1. `.reap/commands/`에 slash command 원본 저장
2. `.reap/templates/`에 산출물 템플릿 저장
3. `.reap/genome/` 초기 구조 생성 (principles.md, domain/, conventions.md, constraints.md)
4. `.claude/commands/`로 slash command 복사 (Claude Code용)

기존의 `source-map.json`, `architecture/` 디렉토리는 genome에서 제거.

## 후속 작업

- 각 산출물 템플릿의 상세 내용 정의
- 각 slash command의 상세 프롬프트 작성
- Legacy 자동화 로직 구현 (CLI)
- lineage 아카이빙 시 mutation 파일 이동 로직
- `reap init`의 기존 코드 수정
