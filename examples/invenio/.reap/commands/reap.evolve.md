---
description: "REAP Evolve — 새 Generation을 시작하거나 라이프사이클 단계를 전환합니다"
---

# Evolve (단계 전환)

## Context
- `.reap/life/current.yml`을 읽어라
- 내용이 비어있으면 → 활성 Generation 없음
- 내용이 있으면 → 현재 세대 정보 (id, goal, stage) 확인

## 모드 판단
인간의 요청에 따라 아래 3가지 중 하나를 수행하라:

### 1. 새 Generation 시작 (current.yml이 비어있을 때)
- 인간에게 이번 세대의 goal을 물어라
- `.reap/lineage/` 디렉토리의 기존 세대 수를 세어 genomeVersion을 결정하라
- 다음 세대 ID를 생성하라 (기존 세대 수 + 1, `gen-XXX` 형식)
- `current.yml`에 다음을 작성하라:
  ```yaml
  id: gen-XXX
  goal: [인간이 제시한 목표]
  stage: objective
  genomeVersion: [세대 수 + 1]
  startedAt: [현재 ISO 8601 타임스탬프]
  timeline:
    - stage: objective
      at: [현재 ISO 8601 타임스탬프]
  ```
- "Generation gen-XXX 시작. `/reap.objective`로 목표를 정의하세요." 안내

### 2. 다음 단계로 전진 (advance)
- 현재 stage에서 다음 stage로 전환하라
- 단계 순서: objective → planning → implementation → validation → completion
- `current.yml`의 `stage`를 다음 단계로 갱신하라
- `timeline`에 entry를 추가하라:
  ```yaml
  - stage: [다음 stage]
    at: [현재 ISO 8601]
  ```
- **completion에서 advance 시**:
  - `completedAt`에 현재 타임스탬프를 추가하라
  - `.reap/life/`의 산출물 파일(`01-*.md` ~ `05-*.md`)을 `.reap/lineage/[gen-id]-[goal-slug]/`로 이동하라
  - `.reap/life/backlog/`의 파일도 lineage로 이동하라
  - `06-legacy.md`를 생성하라
  - `current.yml`을 비워라
  - "Generation 완료. 새 세대를 시작하려면 `/reap.evolve`를 다시 실행하세요." 안내
- 그 외: "Stage를 [다음 단계]로 전환했습니다. `/reap.[다음 단계]`로 진행하세요." 안내

### 3. 이전 단계로 회귀 (back)
- 어떤 stage에서든 이전 stage로 돌아갈 수 있다 (micro loop)
- `--back` 단독: 바로 이전 stage로 회귀
- `--back [stage]`: 지정한 stage로 직접 회귀
- 첫 stage(objective)에서는 회귀 불가

**회귀 프로토콜:**
1. 인간에게 회귀 사유를 물어라
2. 회귀 사유와 참조 정보를 수집하라:
   - **reason**: 왜 돌아가는지
   - **refs**: 관련 파일/위치 (산출물 섹션, 소스코드 위치)
3. `current.yml`을 수정하라:
   - `stage`를 대상 stage로 변경
   - `timeline`에 회귀 entry를 추가:
     ```yaml
     - stage: [대상 stage]
       at: [현재 ISO 8601]
       from: [원래 stage]
       reason: [회귀 사유]
       refs:
         - [참조 1]
         - [참조 2]
     ```
4. 산출물 처리:
   - **대상 stage 이전**: 보존
   - **대상 stage**: 재진입 시 덮어쓰기 (implementation만 append)
   - **대상 stage 이후**: 보존, 재진입 시 덮어쓰기
5. 회귀 사유를 대상 stage 산출물 상단에 `## Regression` 섹션으로 기록하라:
   ```markdown
   ## Regression
   - **From**: [원래 stage]
   - **Reason**: [회귀 사유]
   - **Refs**: [참조 목록]
   - **Affected**: [영향받는 이후 산출물]
   ```
6. "[stage] 단계로 복귀했습니다. `/reap.[stage]`로 진행하세요." 안내

## 안전장치
- `current.yml`에 활성 Generation이 있는데 새 Generation을 시작하려 하면: ERROR — "Generation [id]가 진행 중입니다 (stage: [stage]). 완료 후 새 세대를 시작하세요." **중단**
- 알 수 없는 stage이면: ERROR — "알 수 없는 stage입니다." **중단**
