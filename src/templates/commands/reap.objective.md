---
description: "REAP Objective — 이번 Generation의 목표와 명세를 정의합니다"
---

# Objective (목표 정의)

<HARD-GATE>
이 커맨드의 산출물(01-objective.md)이 인간에 의해 확정되기 전까지 어떤 코드도 작성하지 마라.
goal이 모호하면 추측하지 말고 인간에게 물어라. 이것은 협상 불가다.
</HARD-GATE>

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `objective`인지 확인하라
- 미충족 시: ERROR — "현재 stage가 objective가 아닙니다. `reap evolve`로 새 Generation을 시작하거나 `reap status`로 현재 상태를 확인하세요." 출력 후 **중단**

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)
- 이 정보를 이후 모든 산출물과 대화에서 참조하라

## Re-entry 확인
- `.reap/life/01-objective.md`가 이미 존재하면 **회귀로 인한 재진입**이다
- 기존 산출물을 읽고, `## Regression` 섹션이 있으면 회귀 사유를 파악하라
- 기존 내용을 참고하되, 회귀 사유에 맞게 수정하여 덮어쓰기하라

## Steps

### 1. Environment 스캔
- `.reap/environment/` 디렉토리의 모든 파일을 읽어라
- 이 디렉토리에는 외부 환경 정보가 저장된다: 외부 API 문서, 제품 요구사항, 팀 의사결정 로그, 참조 자료 등
- 비어있다면 인간에게 알려라: "`.reap/environment/`에 외부 컨텍스트가 없습니다. 제품 요구사항, 외부 API 문서, 참조 자료 등을 추가하면 더 정확한 목표를 설정할 수 있습니다."

### 2. 이전 세대 참조
- `.reap/lineage/`에서 가장 최근 세대의 `05-completion.md`가 있으면 읽어라
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
  - 이것은 Genome 불변 원칙의 유일한 예외이다: **첫 세대 Objective에서만 genome 직접 작성이 허용된다**
- **이후 세대인 경우**:
  - 각 파일의 건강 상태를 평가하라:
    - **placeholder만 있는 파일** → "genome 보완 필요" 플래그
    - **100줄 초과 파일** → "domain/으로 분리 필요" 플래그
    - **domain/에 README.md만 있고 규칙 파일이 없는 경우** → "도메인 규칙 미정의" 플래그
    - **constraints.md에 Validation Commands가 비어있는 경우** → "테스트 명령어 미정의" 플래그
- genome 상태를 인간에게 보고하라

### 5. Goal + Spec 설정
- 위 정보를 바탕으로 인간과 대화하여 이번 세대의 goal을 구체화하라
- genome 보완이 필요하면 이번 세대 goal에 포함할지 논의하라
- 좋은 goal의 기준:
  - 하나의 Generation에서 달성 가능한 크기
  - 검증 가능한 완료 조건 (모호한 표현 금지)
  - 관련 genome 영역이 명확

### 6. Genome 갭 분석
- goal 달성에 필요하지만 genome에 없는 정보를 식별하라
- 누락된 정보 각각에 대해 `.reap/life/backlog/`에 기록하라:
  ```markdown
  ---
  type: genome-change
  target: genome/domain/{topic}.md
  ---
  # [제목]
  [구체적으로 무엇이 부족한지, 어떻게 바꿔야 하는지]
  ```

### 7. 요구사항 확정
- 기능 요구사항(FR)과 비기능 요구사항을 정리하라
- 수용 기준을 정의하라
- **제한**: 기능 요구사항은 최대 10개. 10개를 초과하면 세대를 분리하라.
- **제한**: 완료 조건은 최대 7개. 각각 검증 가능해야 한다.
- 인간과 함께 확정하라

## 에스컬레이션
다음 상황에서는 추측하지 말고 **멈추고 인간에게 물어라**:
- goal의 범위가 불명확할 때
- 두 가지 이상의 합리적인 해석이 가능할 때
- genome에 모순되는 정보가 있을 때

## 자기 검증
산출물 저장 전에 확인하라:
- [ ] goal이 한 문장으로 명확히 기술되어 있는가?
- [ ] 완료 조건이 모두 검증 가능한가? ("개선한다", "좋게 한다" 같은 모호한 표현이 없는가?)
- [ ] 범위에 제외 사항이 명시되어 있는가?
- [ ] 기능 요구사항에 FR-XXX 번호가 붙어있는가?

❌ 나쁜 완료 조건: "서비스를 안정화한다"
✅ 좋은 완료 조건: "`npm run lint` 에러 0건, `npm run build` 성공"

## 산출물 생성
- `.reap/templates/01-objective.md`를 읽어라
- 위 Steps에서 확정된 내용을 반영하여 채워라
- `.reap/life/01-objective.md`에 저장하라

## 완료
- 인간에게 산출물을 보여주고 확인을 받아라
- 확인 후: "`reap evolve --advance`로 Planning 단계로 진행하세요." 안내
