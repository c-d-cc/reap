---
description: "REAP Conception — 이번 Generation의 목표를 설정합니다"
---

# Conception (목표 설정)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `conception`인지 확인하라
- 미충족 시: "현재 stage가 conception이 아닙니다. `reap evolve`로 새 Generation을 시작하거나 `reap status`로 현재 상태를 확인하세요." 출력 후 중단

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)
- 이 정보를 이후 모든 산출물과 대화에서 참조하라

## Steps

### 1. Environment 스캔
- `.reap/environment/` 디렉토리의 모든 파일을 읽어라
- 이 디렉토리에는 외부 환경 정보가 저장된다: 외부 API 문서, 제품 요구사항, 팀 의사결정 로그, 참조 자료(llms.txt 등)
- 비어있다면 인간에게 알려라: "`.reap/environment/`에 외부 컨텍스트가 없습니다. 제품 요구사항, 외부 API 문서, 참조 자료 등을 추가하면 더 정확한 목표를 설정할 수 있습니다."

### 2. 이전 세대 참조
- `.reap/lineage/`에서 가장 최근 세대의 `06-adaptation-retrospective.md`가 있으면 읽어라
- 이전 세대의 교훈과 다음 세대 제안을 참고하라

### 3. Backlog 확인
- `.reap/life/backlog/`의 모든 파일을 읽어라
- deferred 태스크와 예정된 목표를 확인하라

### 4. Genome Health Check
- `.reap/genome/`의 모든 파일을 읽어라 (principles.md, conventions.md, constraints.md, domain/)
- **첫 세대인 경우** (`.reap/lineage/`가 비어있는 경우):
  - genome이 모두 placeholder인 것은 정상이다
  - 인간에게 "첫 세대이므로 genome 초기 구성이 필요합니다"라고 안내하라
  - 인간과 함께 Tech Stack, Core Beliefs, Validation Commands 등을 채워라
  - 이것은 Birth 수정 원칙의 유일한 예외이다: **첫 세대 Conception에서만 genome 직접 작성이 허용된다**
- **이후 세대인 경우**:
  - 각 파일의 건강 상태를 평가하라:
    - **placeholder만 있는 파일** → "genome 보완 필요" 플래그
    - **100줄 초과 파일** → "domain/으로 분리 필요" 플래그
    - **domain/에 README.md가 없는 경우** → "domain 작성 가이드 미설치" 플래그
    - **domain/에 README.md만 있고 규칙 파일이 없는 경우** → "도메인 규칙 미정의" 플래그
    - **domain/ 파일이 100줄 초과** → "domain 파일 분리 필요" 플래그
    - **constraints.md에 Validation Commands가 비어있는 경우** → "테스트 명령어 미정의" 플래그
- genome 상태를 인간에게 보고하라

### 5. Goal 설정
- 위 정보를 바탕으로 인간과 대화하여 이번 세대의 goal을 구체화하라
- genome 보완이 필요하면 이번 세대 goal에 포함할지 논의하라
- 좋은 goal의 기준:
  - 하나의 Generation에서 달성 가능한 크기
  - 검증 가능한 완료 조건
  - 관련 genome 영역이 명확

## 산출물 생성
- `.reap/templates/01-conception-goal.md`를 읽어라
- 위 Steps에서 확정된 내용을 반영하여 채워라
- `.reap/life/01-conception-goal.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Formation 단계로 진행하라고 안내하라
