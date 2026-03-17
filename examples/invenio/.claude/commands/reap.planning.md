---
description: "REAP Planning — 구현 계획을 수립하고 태스크를 분해합니다"
---

# Planning (계획 수립)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `planning`인지 확인하라
- `.reap/life/01-objective.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)

## Re-entry 확인
- `.reap/life/02-planning.md`가 이미 존재하면 **회귀로 인한 재진입**이다
- 기존 산출물을 읽고, `## Regression` 섹션이 있으면 회귀 사유를 파악하라
- 기존 내용을 참고하되, 회귀 사유에 맞게 수정하여 덮어쓰기하라
- 이미 `03-implementation.md`가 존재하면 구현 진행 상황도 참고하라 (완료된 태스크를 유지할지 판단)

## Steps
1. `.reap/life/01-objective.md`에서 요구사항과 수용 기준을 읽어라
2. `.reap/genome/constraints.md`에서 기술 제약과 Validation Commands를 확인하라
3. `.reap/genome/conventions.md`에서 개발 규칙과 Enforced Rules를 확인하라
4. 구현 계획을 수립하라 (아키텍처 접근법, 기술 선택)
   - principles.md의 Core Beliefs와 Architecture Decisions를 준수하라
   - constraints.md의 Tech Stack 선택 사유를 존중하라
5. 태스크를 분해하라 (순서, 의존관계, 병렬 가능 여부)
   - 태스크는 `- [ ] T001 설명` 형식의 체크리스트로 작성
6. 인간과 함께 계획을 확정하라

## 산출물 생성
- `.reap/templates/02-planning.md`를 읽어라
- 위 Steps의 결과를 반영하여 채워라
- `.reap/life/02-planning.md`에 저장하라

## 완료
- `/reap.evolve`로 Implementation 단계로 진행하라고 안내하라
