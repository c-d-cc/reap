# REAP Workflow Architecture Design

## 1. REAP이란

**REAP**(Recursive Evolutionary Application Pipeline)은 AI와 인간이 협업하여, 세대(Generation)를 거듭하며 Application을 점진적으로 진화시키는 Development Pipeline이다.

Application의 유전 정보(Genome)를 정의하고, 각 세대에서 목표를 설정하여 구현하고, 그 과정에서 발생한 변이(Mutation)와 적응(Adaptation)을 다음 세대에 반영한다. 세대를 거듭하며 축적된 산출물이 Application의 Source Code — 즉 **Civilization**이다.

**REAP Workflow**는 이 파이프라인 위에서 실제로 Application을 만들어가는 개발 워크플로우를 의미한다.

## 2. 핵심 원칙

### 3 레이어 모델

```
Genome (유전 정보)  →  Evolution (세대를 거친 진화)  →  Civilization (Source Code)
  설계와 지식            생애주기, 변이, 적응             축적된 산출물
```

- **Genome** — 어떻게 만들지. 아키텍처, 명세, 규칙 등 Application을 만들기 위한 설계와 지식.
- **Evolution** — 만들어가는 과정. Generation의 반복을 통해 Genome이 진화하고 Civilization이 성장한다.
- **Civilization** — 만들어진 것. Source Code. 세대를 거치며 축적된 산출물이다.

`reap diff`는 Genome과 Civilization 사이의 차이를 감지한다.

### 세대 기반 진화
세대(Generation)마다 하나의 목표를 설정하고, 그 목표를 달성하기 위한 생애주기(Life Cycle)를 거친다. 세대가 거듭될수록 Genome이 진화하고 Civilization이 성장한다.

- **Genome의 진화** — 세대를 거치며 아키텍처 결정이 다듬어지고, 명세가 정교해지고, 개발 규칙이 축적된다. 처음에는 대략적이던 설계가 실제 구현 경험을 통해 구체화된다.
- **Civilization의 성장** — 세대를 거치며 Source Code가 축적된다. 데이터 모델이 확장되고, 비즈니스 로직이 추가되고, UI가 풍부해지고, 테스트가 촘촘해진다.

### Genome 불변 원칙
현재 세대는 Genome을 직접 수정하지 않는다. 세대 중 발견한 문제는 변이(Mutation)로 기록하고, 회고에서 도출한 교훈은 적응(Adaptation)으로 기록한다. 현재 세대의 Birth 단계에서 이 diff들을 Genome에 반영하고 다음 세대의 초기 상태를 생성한다.

### Environment
Application이 대응해야 하는 외부 환경. 고객, 규제, 시장, 외부 시스템 등. 환경 변화는 진화의 압력이 되어 새로운 Generation의 목표를 만든다.

## 3. 진화 메타포

| 진화 개념 | REAP 매핑 | 설명 |
|-----------|-----------|------|
| **Genesis** | Bootstrap | 최초 탄생. 종의 기원 |
| **Generation** | 하나의 Iterate | 한 세대. 목표를 가지고 태어나 살고 완료됨 |
| **Genome** | 명세 + 지식 | 유전 정보. 세대를 거치며 진화함 |
| **Life Cycle** | Generation 내부 흐름 | 한 세대의 생애주기 |
| **Mutation** | Growth 중 발견한 명세 문제 | 세대 중 발생하는 변이. 기록만 하고 현재 Genome은 수정하지 않음 |
| **Validation** | Verify | 검증. 구현이 목표에 부합하는지 확인 |
| **Adaptation** | Retrospect | 다음 세대를 위한 적응. Genome diff로 기록 |
| **Birth** | 다음 세대 출산 | Mutation + Adaptation을 Genome에 반영하고 다음 세대의 초기 상태를 생성 |
| **Legacy** | 완료 | 현재 세대 기록을 Lineage로 이동 |
| **Lineage** | History | 족보. 과거 세대들의 기록 |
| **Civilization** | Source Code | 세대를 거치며 축적된 산출물 |
| **Environment** | 외부 환경 | Application이 대응해야 하는 비즈니스 환경. 환경 변화가 진화의 압력이 됨 |

### Genome 진화 흐름

```
Generation #1 (Genome v1으로 시작)
  → Growth 중 명세 문제 발견 → Mutation 기록 (Genome 수정 안 함)
  → Validation → 검증
  → Adaptation → Genome diff 기록
  → Birth → Mutation + Adaptation을 Genome에 반영 → Genome v2
         → 다음 세대(Gen #2)의 초기 상태 생성
  → Legacy → 현재 세대 기록을 Lineage로 이동
  → Civilization 성장 (Source Code 축적)

Generation #2 (Genome v2로 시작, 초기 상태 이미 존재)
  → Conception부터 바로 시작
  → ...
```

## 4. REAP Workflow 흐름

```
Genesis → Generation #1 → Generation #2 → ... → Generation #N
                ↑                                       ↓
          reap scan (백그라운드 수시 자동)         Civilization (성장)
```

- **Genesis**: `.reap/`이 없는 상태에서 최초 진입. 진입 모드에 따라 프로젝트를 초기화하고 첫 Generation을 시작한다.
- **Generation**: 목표 단위의 개발 사이클. 모든 작업은 Generation 안에서 일어난다.
- **reap scan**: 백그라운드 유틸리티로서 Civilization의 현재 상태를 Source Map(`genome/source-map.json`)으로 갱신한다.

## 5. Life Cycle (한 세대의 생애)

```
Conception → Formation → Planning → Growth → Validation → Adaptation → Birth → Legacy
(목표 설정)   (Define)     (Plan)    (Build)   (Verify)   (Retrospect)  (출산)  (완료)
```

| 단계 | 진화 용어 | 설명 |
|------|-----------|------|
| **Conception** | 수태 | 이번 세대의 목표를 정의. Environment 변화와 backlog를 참조. life/current.yml에 기록 |
| **Formation** | 형성 | 목표 달성에 필요한 명세를 Genome으로부터 읽고 보완 계획 수립 |
| **Planning** | 계획 | 구현 계획을 수립하고 작업을 분해 |
| **Growth** | 성장 | AI+Human 협업으로 Civilization(코드) 구현. 명세 문제 발견 시 Mutation으로 기록 |
| **Validation** | 검증 | 테스트와 검증으로 목표 달성 확인. Growth ↔ Validation 작은 루프 가능 |
| **Adaptation** | 적응 | 회고. Mutation 정리, 교훈 도출, Genome diff 작성 |
| **Birth** | 출산 | Mutation + Adaptation을 Genome에 반영. 다음 세대의 초기 상태 생성 |
| **Legacy** | 유산 | 완료. 현재 Generation 기록이 Lineage로 이동 |

## 6. .reap/ 4축 구조

`.reap/` 디렉토리는 진화 파이프라인을 중심으로 4개의 핵심 축으로 구성된다:

| 축 | 역할 |
|----|------|
| **genome/** | 유전 정보. Application을 만들기 위한 설계와 지식. 세대를 거치며 진화 |
| **environment/** | 외부 환경. Application이 대응해야 하는 비즈니스 환경, 고객, 규제, 외부 시스템 |
| **life/** | 현재 세대의 생애주기. 진행 중인 Generation의 상태 |
| **lineage/** | 족보. 완료된 세대들의 기록과 적응 |

Civilization(Source Code)은 `.reap/` 외부에 존재한다 — 프로젝트 루트의 코드 파일들이 곧 Civilization이다.

### 전체 디렉토리 구조

```
my-project/
  src/                              # Civilization (축적된 산출물)
  .reap/                            # REAP Registry (진화 파이프라인)
    config.yml                      # 프로젝트 설정 (유일한 루트 파일)

    genome/                         # 유전 정보 (세대를 거치며 진화)
      source-map.json               # Civilization 자동 인덱스 (수시 갱신)
      cheatsheet.md                 # AI 규칙서
      architecture/                 # 시스템 레벨 전략과 구조
      ...                           # Genome 내부 구조는 후속 작업에서 상세 정의

    environment/                    # 외부 환경
      stakeholders.md               # 고객, 사용자, 이해관계자
      regulations.md                # 규제, 컴플라이언스, 법적 요구사항
      externals.md                  # 외부 시스템, 연동 대상, 의존성
      market.md                     # 시장 환경, 경쟁, 비즈니스 제약

    life/                           # 현재 세대의 생애주기
      current.yml                   # 현재 Generation (목표+단계+상태)
      mutations/                    # Growth 중 발견한 Genome 변이 기록
      backlog/                      # 다음 세대 후보 목표들

    lineage/                        # 족보 (완료된 세대들)
      gen-001/                      # Generation 1 기록
        summary.md                  # 세대 요약
        adaptations/                # 다음 세대를 위한 Genome diff
      gen-002/
        ...

    origins/                        # Migration 모드에서만: 기원 시스템들
      legacy-erp/                   # as-is 시스템
        source-map.json             # 자동 스캔 결과
        analysis.md                 # 분석 소견

    claude/                         # Claude Code 연동
```

### 진화 흐름과 구조의 관계

```
1. Environment를 관찰   →  외부 환경 변화 파악 (진화의 압력)
2. Genome을 읽고        →  설계와 지식 파악
3. Life에서 살아가고     →  목표를 향해 Growth, Mutation 기록
4. Birth               →  Adaptation을 Genome에 반영, 다음 세대 초기 상태 생성
5. Legacy              →  현재 세대 기록을 Lineage로 이동
6. Civilization 성장    →  Source Code가 세대를 거치며 축적
```

### Generation 운영 규칙
- **한 번에 하나의 Generation만 활성화**된다 (`life/current.yml`은 단일 파일).
- `life/backlog/`에는 인간 또는 Adaptation 단계에서 도출된 다음 목표들이 저장된다.
- `reap evolve` 실행 시 backlog에서 선택하거나 새 목표를 입력할 수 있다.
- 현재 단계(Life Cycle stage)는 `current.yml` 안에 추적된다.

### claude/
Claude Code 전용 연동 계층. REAP이 자동 생성하는 CLAUDE.md, 슬래시 커맨드 등을 포함한다. 다른 AI 에이전트 지원 시 `cursor/`, `copilot/` 등 동일 레벨에 추가할 수 있다.

## 7. 진입 모드 (3가지)

시작점만 다르고, 일단 REAP Workflow에 올라타면 동일한 Generation 루프를 탄다.

### Greenfield
Civilization이 아직 없는 상태에서 새로 구축.

Genesis:
1. 스택 선택 + 스캐폴딩
2. `.reap/` 생성
3. 초기 Genome 구성
4. → 첫 Generation 시작

### Migration
N개의 as-is 시스템(기존 Civilization)을 참조하여 새로운 Genome을 만들고 새 시스템을 구축.

Genesis:
1. as-is 시스템 경로들 지정 (1개 이상)
2. 각 시스템 스캔 → `origins/{name}/source-map.json`
3. 각 시스템 분석 → `origins/{name}/analysis.md` (AI+Human, 무엇을 가져갈지/버릴지)
4. to-be Genome 구성 (as-is 분석 참조)
5. → 첫 Generation 시작

### Adoption
기존 Civilization을 그대로 유지한 상태에서 REAP Workflow를 접목.

Genesis:
1. 현재 Civilization 스캔 + Source Map
2. `.reap/` 생성
3. Genome 자동 추출 + 인간 보완
4. → 첫 Generation 시작

## 8. AI-Human 역할 분담

Life Cycle 단계와 Application 구성 요소에 따라 주도하는 쪽이 다르다.

| 구성 요소 | 주도 |
|-----------|------|
| 비즈니스 도메인 | **Human** |
| 데이터 모델 | **협업** |
| 비즈니스 규칙 | **협업** |
| 프로세스/워크플로우 | **협업** |
| 사용자와 권한 | **협업** |
| UI/UX | **협업** |
| 통합 (외부 연동) | **협업** |
| 비기능 요구사항 | **Human** |
| 인프라 구성 | **AI 주도** |
| 데이터 마이그레이션 | **AI 주도** |
| 문서화 및 매뉴얼 | **AI 주도** |
| 테스트 | **AI 주도** |

## 9. CLI 명령어

| 명령어 | 역할 | 비고 |
|--------|------|------|
| `reap init` | `.reap/` 생성 + Genesis 시작 | 최초 1회 |
| `reap evolve` | 새 목표 설정 + Generation 시작 | 핵심 명령어 |
| `reap scan` | Civilization → Source Map 갱신 | 백그라운드 자동 + 수동 가능 |
| `reap diff` | Genome ↔ Civilization 차이 감지 | 유틸리티 |
| `reap sync` | diff 결과를 바탕으로 차이 해소. 방향은 인간이 판단 | 유틸리티 |
| `reap status` | 현재 Generation + 전체 현황 | 유틸리티 |
| `reap fix` | .reap/ 상태 검증 + 복구 | 예기치 못한 상태에서 정상으로 복원 |

## 10. 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| MVP 형태 | CLI 도구 | 가장 빠르게 파이프라인 로직에 집중 가능 |
| 기술 스택 | 기본 Spring Boot + React, 확장 가능 | 기본 스택으로 깊이 확보, 구조는 개방 |
| AI 에이전트 | Claude Code 최적화 (MVP) | 다른 에이전트 확장은 추후 |
| 명세 포맷 | YAML + Markdown 혼합 | 메타데이터는 YAML, 서술은 Markdown |

## 11. 후속 작업

이 문서는 REAP Workflow의 큰 틀 아키텍처를 정의한다. 다음 세부 사항은 별도 Generation에서 다룬다:

- Genome 내부 구조 상세 설계 (아키텍처, 명세 파일 포맷, 예시)
- Environment 파일 포맷과 활용 방식
- Source Map의 구조와 생성 규칙
- Cheatsheet의 구조와 내용
- CLI 구현 기술 스택 결정
- Claude Code 연동 방식
- life/current.yml의 상세 스키마
- Mutation / Adaptation의 포맷과 Genome 반영 메커니즘
- reap diff / sync의 동작 메커니즘
