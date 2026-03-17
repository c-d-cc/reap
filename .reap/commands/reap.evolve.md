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
  stage: conception
  genomeVersion: [세대 수 + 1]
  startedAt: [현재 ISO 8601 타임스탬프]
  ```
- "Generation gen-XXX 시작. `/reap.conception`으로 목표를 설정하세요." 안내

### 2. 다음 단계로 전진 (advance)
- 현재 stage에서 다음 stage로 전환하라
- 단계 순서: conception → formation → planning → growth → validation → adaptation → birth → legacy
- `current.yml`의 `stage`를 다음 단계로 갱신하라
- **legacy 진입 시**:
  - `completedAt`에 현재 타임스탬프를 추가하라
  - `.reap/life/`의 산출물 파일(`01-*.md` ~ `07-*.md`)을 `.reap/lineage/[gen-id]-[goal-slug]/`로 이동하라
  - `.reap/life/mutations/`의 파일도 lineage로 이동하라
  - `08-legacy-summary.md`를 생성하라
  - `current.yml`을 비워라
  - "Generation 완료. 새 세대를 시작하려면 `/reap.evolve`를 다시 실행하세요." 안내
- legacy 외: "Stage를 [다음 단계]로 전환했습니다. `/reap.[다음 단계]`로 진행하세요." 안내

### 3. 이전 단계로 회귀 (back)
- Validation → Growth 회귀만 허용
- 현재 stage가 `validation`이 아니면: "Validation → Growth 회귀만 지원됩니다." 안내 후 중단
- `current.yml`의 `stage`를 `growth`로 변경하라
- "Growth 단계로 복귀했습니다. `/reap.growth`로 미완료 태스크를 이어가세요." 안내

## 안전장치
- `current.yml`에 활성 Generation이 있는데 새 Generation을 시작하려 하면: "Generation [id]가 진행 중입니다 (stage: [stage]). 완료 후 새 세대를 시작하세요." 안내 후 중단
- 알 수 없는 stage이면: "알 수 없는 stage입니다. `.reap/life/current.yml`을 확인하세요." 안내 후 중단
