---
description: "REAP Birth — Genome을 진화시키고 세대를 마무리합니다"
---

# Birth (출산)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `birth`인지 확인하라
- `.reap/life/06-adaptation-retrospective.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)

## Steps

### 1. Mutation + Adaptation 수집
- `.reap/life/mutations/` 디렉토리의 모든 mutation을 읽어라
- 각 mutation의 `target`과 `suggestedChange`를 확인하라
- `.reap/life/06-adaptation-retrospective.md`에서 genome 변경 제안을 읽어라

### 2. Genome 수정 (맵 원칙 준수)
- mutation과 adaptation을 `.reap/genome/`의 해당 파일에 반영하라:
  - `principles.md`, `domain/`, `conventions.md`, `constraints.md` 중 해당하는 파일 수정
- **맵 원칙을 반드시 지켜라**:
  - 각 genome 파일은 **~100줄 이내**를 유지하라
  - 100줄을 초과하면 상세 내용을 `domain/` 하위 파일로 분리하라
  - 에이전트가 다음 세대에서 읽었을 때 **즉시 행동 가능한 수준**으로 작성하라
  - placeholder나 모호한 표현 대신 구체적이고 검증 가능한 문장을 사용하라
- **domain/ 파일 작성 시 `domain/README.md`의 가이드를 따르라**:
  - 비즈니스 도메인 단위로 파일 분리 (코드 구조가 아닌 규칙 묶음 단위)
  - 코드에서 직접 읽을 수 없는 지식을 기록 (정책 의도, 수치/조건, 상태 전이, 도메인 용어)
  - 파일당 40~80줄 권장, 100줄 상한
  - 파일명은 kebab-case, 비즈니스 도메인을 직관적으로 나타내는 이름

### 3. 검증
- 변경된 genome이 기존 코드/테스트와 충돌하지 않는지 확인하라
- constraints.md의 Validation Commands가 정의되어 있으면 실행하여 검증하라
- genome 변경으로 인해 기존 conventions 위반이 새로 생기지 않는지 검사하라

### 4. 인간 확인
- 변경된 genome 내용을 인간에게 보여주고 확인을 받아라
- 변경 내역을 changelog에 기록하라

## 산출물 생성
- `.reap/templates/07-birth-changelog.md`를 읽어라
- genome에 반영한 변경 목록 (mutation별, adaptation별)을 기록하라
- `.reap/life/07-birth-changelog.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Legacy 단계로 진행하라고 안내하라
- Legacy 진입 시 CLI가 자동으로 lineage 아카이빙을 수행함을 안내하라
