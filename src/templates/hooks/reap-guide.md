# REAP Guide

## REAP이란

REAP(Recursive Evolutionary Application Pipeline)은 AI와 인간이 협업하여, 세대(Generation)를 거듭하며 Application을 점진적으로 진화시키는 Development Pipeline이다.

## 3 레이어 모델

```
Genome (유전 정보)  →  Evolution (세대를 거친 진화)  →  Civilization (Source Code)
  설계와 지식            생애주기, 변이, 적응             축적된 산출물
```

- **Genome** — Application을 만들기 위한 설계와 지식. `.reap/genome/`에 저장.
- **Evolution** — Generation의 반복을 통해 Genome이 진화하고 Civilization이 성장하는 과정.
- **Civilization** — Source Code. `.reap/` 외부의 프로젝트 코드 전체.

## Genome 구조

```
.reap/genome/
├── principles.md      # 아키텍처 원칙/결정 (ADR 스타일)
├── domain/            # 비즈니스 규칙 (모듈별 분리)
├── conventions.md     # 개발 규칙/컨벤션 + Enforced Rules
└── constraints.md     # 기술 제약/선택 + Validation Commands
```

**Genome 불변 원칙**: 현재 세대는 Genome을 직접 수정하지 않는다. Implementation 중 발견한 문제는 backlog에 `type: genome-change`로 기록하고, Completion 단계에서만 Genome에 반영한다.

**Environment 불변 원칙**: 현재 세대는 Environment를 직접 수정하지 않는다. 세대 진행 중 외부 환경 변화를 발견하면 backlog에 `type: environment-change`로 기록하고, Completion 단계에서 반영한다.

## .reap/ 4축 구조

| 축 | 경로 | 역할 |
|----|------|------|
| **Genome** | `.reap/genome/` | 유전 정보. 원칙, 규칙, 결정의 집합 |
| **Environment** | `.reap/environment/` | 외부 환경. API 문서, 인프라 정보, 비즈니스 제약 |
| **Life** | `.reap/life/` | 현재 세대의 생애주기. 진행 상태와 산출물 |
| **Lineage** | `.reap/lineage/` | 족보. 완료된 세대들의 아카이브 |

## Life Cycle (한 세대의 생애)

```
Objective → Planning → Implementation ⟷ Validation → Completion
```

| Stage | 한국어 | 하는 일 | 산출물 |
|-------|--------|---------|--------|
| **Objective** | 목표 정의 | 이번 세대의 goal + 요구사항 정의. environment, backlog, genome 참조 | `01-objective.md` |
| **Planning** | 계획 수립 | 태스크 분해, 의존관계, 구현 접근법 | `02-planning.md` |
| **Implementation** | 구현 | AI+Human 협업으로 코드 구현. genome 결함 발견 시 backlog 기록 | `03-implementation.md` |
| **Validation** | 검증 | 테스트 실행, 완료 조건 점검. 실패 시 Implementation으로 복귀 가능 | `04-validation.md` |
| **Completion** | 완성 | 회고 + backlog 리뷰 + genome 변경 반영 + 아카이빙 | `05-completion.md` |

## 핵심 개념

### Generation
한 세대. 하나의 목표를 가지고 Life Cycle을 거친다. `life/current.yml`에 상태가 추적된다.

### Backlog
`.reap/life/backlog/`에 다음 세대에 반영할 모든 항목을 저장한다. 각 항목은 markdown + frontmatter 형식:
- `type: genome-change` — Completion에서 genome에 반영 (세대 중 발견한 genome 결함)
- `type: environment-change` — Completion에서 environment에 반영 (세대 중 발견한 외부 환경 변화)
- `type: task` — 다음 Objective에서 goal 후보로 참조 (deferred 태스크, 기술 부채 등)

### Task Deferral
Genome 변경에 의존하는 태스크는 현재 세대에서 완료할 수 없다. `[deferred]`로 마킹하고 backlog에 `type: task`로 추가한다. 부분 완료는 정상이다.

### Micro Loop (이전 stage 회귀)
어떤 stage에서든 이전 stage로 돌아갈 수 있다. `reap evolve --back`으로 바로 이전 stage로, `reap evolve --back [stage]`로 특정 stage로 회귀.

산출물 처리 규칙:
- **대상 stage 이전**: 보존
- **대상 stage**: 덮어쓰기 (implementation만 append)
- **대상 stage 이후**: 보존, 재진입 시 덮어쓰기

회귀 사유는 대상 stage 산출물에 `## Regression` 섹션으로 기록한다.

### Minor Fix
사소한 문제(오타, lint 에러 등)는 stage 전환 없이 현재 stage에서 직접 수정하고 산출물에 기록한다. 판단 기준: 설계 변경 없이 5분 이내에 해결 가능한 문제.

## 역할 분리

| 구성 요소 | 역할 |
|-----------|------|
| **CLI (`reap`)** | 상태 추적기. stage 전환, generation 관리 |
| **AI Agent** | 워크플로우 실행기. slash command를 통해 각 stage 작업 수행 |
| **Human** | 의사결정자. goal 설정, spec 확정, 코드 리뷰, stage 전환 승인 |

## 실행 흐름

```
1. /reap.evolve → 새 Generation 시작
2. /reap.objective → goal + 요구사항 정의
3. reap evolve --advance
4. /reap.planning → 태스크 분해 + 구현 계획
5. reap evolve --advance
6. /reap.implementation → 코드 구현
7. reap evolve --advance
8. /reap.validation → 검증
9. reap evolve --advance
10. /reap.completion → 회고 + genome 반영
11. reap evolve --advance → 아카이빙, 세대 종료
```

각 slash command는 Gate(전제조건 확인) → Steps(작업 실행) → 산출물 생성의 3단 구조를 따른다.
