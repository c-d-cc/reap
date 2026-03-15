# REAP Pipeline Architecture Design

## 1. REAP의 재정의

REAP은 **"EA(Enterprise Application)가 무엇인지를 정의하고, AI와 인간이 협업하여 목표 단위로 점진적으로 구축하는 Development Pipeline"**이다.

기존의 템플릿 기반 소스 생성기에서 벗어나, 도메인에 무관한 데이터 중심 비즈니스 애플리케이션(마스터 데이터 관리, 트랜잭션 처리, 워크플로우, 리포팅)을 구축하기 위한 파이프라인을 제공한다.

## 2. 핵심 원칙

### SSOT = Code
코드가 유일한 진실의 원천이다. 마크다운 명세가 아닌 실행 가능한 코드가 시스템의 최종 진실이다.

### Definitions = 개발 가이드
`.reap/definitions/`는 AI와 인간이 시스템을 이해하고 개발하기 위한 필수 참조 문서다. 코드를 만들기 위한 의도를 담지만, 최종 진실은 코드에 있다. `reap diff`는 "가이드와 구현 사이에 차이가 있는가?"를 감지한다. 차이가 발견되면 인간이 어느 쪽을 수정할지 판단한다 — definition이 잘못된 것일 수도 있고, 구현이 가이드를 따르지 않은 것일 수도 있다.

### Source Map (자동생성)
코드 파싱으로 자동 생성되는 구조화된 인덱스. AI가 시스템을 탐색할 때 첫 진입점으로 사용한다. 백그라운드에서 수시로 자동 갱신된다.

### 목표 기반 Iterate
한번에 전체를 만들지 않는다. 목표를 설정하고, 그 목표를 달성하기 위한 정의 → 계획 → 구현 → 검증 → 회고를 반복한다.

## 3. 파이프라인 흐름

```
Bootstrap (Genesis) → Iterate #1 → Iterate #2 → ... → Iterate #N
                          ↑
                    reap scan (백그라운드 수시 자동)
```

- **Bootstrap**: `.reap/`이 없는 상태에서 최초 진입. 진입 모드에 따라 프로젝트를 초기화하고 첫 iterate를 시작한다.
- **Iterate**: 목표 단위의 개발 사이클. 모든 작업(define, plan, build)은 iterate 안에서 일어난다.
- **reap scan**: 파이프라인의 별도 노드가 아닌, 백그라운드 유틸리티로서 Source Map을 수시 갱신한다.

## 4. Iterate 내부 흐름 (7단계)

```
목표 설정 → Define → Plan → Build → Verify → Retrospect → Complete
                              ↑
                        definition 수정 허용
                        (변경 이력 추적)
```

| 단계 | 설명 |
|------|------|
| **목표 설정** | 이번 iterate에서 달성할 목표를 정의. iterates/current.yml에 기록. |
| **Define** | 목표 달성에 필요한 definition을 작성하거나 보완한다. |
| **Plan** | 구현 계획을 수립하고 작업을 분해한다. |
| **Build** | AI+Human 협업으로 코드를 구현한다. Build 중 definition에 문제를 발견하면 수정 가능하되, 변경 이력을 추적한다. |
| **Verify** | 테스트와 검증을 통해 목표 달성을 확인한다. Build ↔ Verify 사이에서 작은 루프 반복 가능. |
| **Retrospect** | 회고. definition 변경량, 교훈, 다음 iterate에 반영할 사항을 기록한다. |
| **Complete** | 완료 처리. iterate 기록이 history/로 이동한다. |

## 5. .reap/ 3단 구조

`.reap/` 디렉토리는 프로젝트의 "두뇌" 역할을 하며, 3개의 핵심 축으로 구성된다:

| 축 | 역할 |
|----|------|
| **architecture/** | 시스템 레벨의 전략과 구조 |
| **definitions/** | 모듈 레벨의 개발 가이드 |
| **iterates/** | 목표 기반 실행과 기록 |

### 전체 디렉토리 구조

```
my-project/
  src/                              # SSOT (코드)
  .reap/                            # REAP Registry
    config.yml                      # 프로젝트 설정
    source-map.json                 # 자동생성 (수시 갱신)
    cheatsheet.md                   # AI 규칙서 (아래 설명 참조)

    architecture/                   # 시스템 레벨
      application/                  # 앱 아키텍처, 레이어, 스택, 모듈 의존성
      infra/                        # 인프라, CI/CD, 환경 설정
      test/                         # 테스트 전략

    definitions/                    # 모듈 레벨 (개발 가이드)
      domain/                       # 비즈니스 개념, 모듈 의도
        order/                      # 모듈별 폴더로 격리
        inventory/
      ui/                           # 화면 구성, 컴포넌트
      logic/                        # 비즈니스 규칙, 밸리데이션
      data/                         # 스키마, 마이그레이션, 시드 데이터
      process/                      # 워크플로우, 상태 흐름, 스케줄링
      auth/                         # 사용자, 역할, 권한
      integration/                  # 외부 시스템 연동
      program/                      # 배치 프로그램, 데이터 처리
      scenario/                     # 테스트 시나리오 (모듈별)

    iterates/                       # 실행
      current.yml                   # 현재 진행 중 iterate (목표+상태)
      backlog/                      # 예정된 목표들

    history/                        # 완료된 iterate + retrospect (자동 기록)

    sources/                        # Migration 모드에서만 존재
      legacy-erp/                   # as-is 시스템 N개
        source-map.json             # 자동 스캔 결과
        analysis.md                 # 분석 소견
      old-crm/
        source-map.json
        analysis.md

    claude/                         # Claude Code 연동 (아래 설명 참조)
```

### cheatsheet.md
AI가 수시로 참조하는 규칙서. "~할 때는 ~해라", "~는 ~를 봐라" 같은 프로젝트 고유의 개발 규칙을 인간이 작성한다. architecture/가 시스템의 구조적 전략을 다룬다면, cheatsheet은 일상적인 개발 작업에서 AI가 따라야 할 실무적 지침을 담는다.

### claude/
Claude Code 전용 연동 계층. REAP이 자동 생성하는 CLAUDE.md, 슬래시 커맨드 등을 포함한다. 다른 AI 에이전트 지원 시 `cursor/`, `copilot/` 등 동일 레벨에 추가할 수 있다. 세부 구조는 후속 작업에서 정의한다.

### Iterate 운영 규칙
- **한 번에 하나의 iterate만 활성화**된다 (`current.yml`은 단일 파일).
- `iterates/backlog/`에는 인간 또는 retrospect 단계에서 도출된 다음 목표들이 저장된다.
- `reap iterate` 실행 시 backlog에서 선택하거나 새 목표를 입력할 수 있다.
- 현재 단계는 `current.yml` 안에 추적된다.

### Definition Aspects (9개)

각 aspect 하위에 **모듈명 폴더**로 격리한다. 동일 모듈의 다른 관점은 폴더명으로 연결된다.

| Aspect | 설명 | 포맷 |
|--------|------|------|
| domain | 비즈니스 개념, 엔티티, 관계, 모듈 의도 | YAML + Markdown |
| ui | 화면 구성, 컴포넌트, 네비게이션 | YAML + Markdown |
| logic | 비즈니스 규칙, 밸리데이션, 계산 | YAML + Markdown |
| data | 스키마, 마이그레이션, 시드 데이터 | YAML + Markdown |
| process | 워크플로우, 상태 흐름, 스케줄링 | YAML + Markdown |
| auth | 사용자, 역할, 권한 | YAML + Markdown |
| integration | 외부 시스템 연동 | YAML + Markdown |
| program | 배치 프로그램, 데이터 처리, 실행 단위 작업 | YAML + Markdown |
| scenario | 테스트 시나리오 (architecture/test 전략에 따른 모듈별 검증) | YAML + Markdown |

Definition 포맷: 메타데이터 성격(스키마, 필드 목록)은 **YAML**, 서술적 내용(비즈니스 설명, 규칙)은 **Markdown**.

## 6. 진입 모드 (3가지)

시작점만 다르고, 일단 파이프라인에 올라타면 동일한 iterate 루프를 탄다.

### Greenfield
빈 상태에서 새로 구축.

Bootstrap iterate:
1. 스택 선택 + 스캐폴딩
2. `.reap/` 생성
3. architecture 정의
4. 초기 definitions 작성
5. → iterate 루프 진입

### Migration
N개의 as-is 시스템을 참조하여 새 시스템 구축. as-is 분석과 to-be 정의가 명확히 분리된다.

Bootstrap iterate:
1. as-is 시스템 경로들 지정 (1개 이상)
2. 각 시스템 스캔 → `sources/{name}/source-map.json`
3. 각 시스템 분석 → `sources/{name}/analysis.md` (AI+Human, 무엇을 가져갈지/버릴지)
4. to-be architecture 정의 (as-is 분석 참조)
5. to-be definitions 작성 (as-is에서 가져올 것, 새로 만들 것 구분)
6. → iterate 루프 진입

### Adoption
기존 앱을 그대로 유지한 상태에서 REAP 파이프라인을 접목.

Bootstrap iterate:
1. 현재 코드 스캔 + Source Map
2. `.reap/` 생성
3. architecture/definitions 자동 추출 + 인간 보완
4. cheatsheet 설정
5. → iterate 루프 진입

## 7. AI-Human 역할 분담

단계에 따라 주도하는 쪽이 다르다.

| EA 구성 요소 | 주도 |
|-------------|------|
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

## 8. CLI 명령어

| 명령어 | 역할 | 비고 |
|--------|------|------|
| `reap init` | `.reap/` 생성 + bootstrap iterate 시작 | 최초 1회 |
| `reap iterate` | 새 목표 설정 + iterate 시작 | 핵심 명령어 |
| `reap scan` | Source Map 갱신 | 백그라운드 자동 + 수동 가능 |
| `reap diff` | Definition ↔ Code 차이 감지 | 유틸리티 |
| `reap sync` | diff 결과를 바탕으로 차이 해소. 방향은 인간이 판단 (Definition→Code 또는 Code→Definition) | 유틸리티 |
| `reap status` | 현재 iterate + 전체 현황 | 유틸리티 |

## 9. 설계 결정 사항

| 항목 | 결정 | 이유 |
|------|------|------|
| MVP 형태 | CLI 도구 | 가장 빠르게 파이프라인 로직에 집중 가능 |
| 기술 스택 | 기본 Spring Boot + React, 확장 가능 | 기본 스택으로 깊이 확보, 구조는 개방 |
| 모델링 | EMM(Enterprise Meta Model) = 참조 모델 (비종속) | 시니어~입문 모두 수용. 강제하지 않되 가이드 제공 |
| AI 에이전트 | Claude Code 최적화 (MVP) | 다른 에이전트 확장은 추후 |
| Definition 포맷 | YAML + Markdown 혼합 | 메타데이터는 YAML, 서술은 Markdown |

## 10. 후속 작업

이 문서는 REAP Pipeline의 큰 틀 아키텍처를 정의한다. 다음 세부 사항은 별도 iterate에서 다룬다:

- Definition 파일의 구체적 포맷과 예시 (domain, ui, logic 등)
- Source Map의 구조와 생성 규칙
- Cheatsheet의 구조와 내용
- CLI 구현 기술 스택 결정
- Claude Code 연동 방식 (슬래시 커맨드, skills 등)
- iterate current.yml의 상세 스키마
- reap diff / sync의 동작 메커니즘
