---
description: "REAP Conception — 이번 Generation의 목표를 설정합니다"
---

# Conception (목표 설정)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `conception`인지 확인하라
- 미충족 시: "현재 stage가 conception이 아닙니다. `reap evolve`로 새 Generation을 시작하거나 `reap status`로 현재 상태를 확인하세요." 출력 후 중단

## Steps
1. `.reap/environment/` 디렉토리의 모든 파일을 읽어라 (외부 환경 변화 파악)
2. `.reap/lineage/`에서 가장 최근 세대의 `06-adaptation-retrospective.md`가 있으면 읽어라 (이전 세대 교훈 참조)
3. `.reap/life/backlog/`의 모든 파일을 읽어라 (예정된 목표 확인)
4. `.reap/genome/`의 principles.md, conventions.md, constraints.md를 읽어라 (현재 genome 상태 파악)
5. 위 정보를 바탕으로 인간과 대화하여 이번 세대의 goal을 구체화하라
6. 좋은 goal의 기준: 하나의 Generation에서 달성 가능한 크기, 검증 가능한 완료 조건, 관련 genome 영역이 명확

## 산출물 생성
- `.reap/templates/01-conception-goal.md`를 읽어라
- 위 Steps에서 확정된 내용을 반영하여 채워라
- `.reap/life/01-conception-goal.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Formation 단계로 진행하라고 안내하라
