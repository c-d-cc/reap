---
description: "REAP Planning — 구현 계획을 수립합니다"
---

# Planning (계획 수립)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `planning`인지 확인하라
- `.reap/life/02-formation-spec.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/02-formation-spec.md`에서 요구사항을 읽어라
2. `.reap/genome/constraints.md`에서 기술 제약을 확인하라
3. 구현 계획을 수립하라 (아키텍처 접근법, 기술 선택)
4. 태스크를 분해하라 (순서, 의존관계, 병렬 가능 여부)
   - 태스크는 `- [ ] T001 설명` 형식의 체크리스트로 작성
5. 인간과 함께 계획을 확정하라

## 산출물 생성
- `.reap/templates/03-planning-plan.md`를 읽어라
- 위 Steps의 결과를 반영하여 채워라
- `.reap/life/03-planning-plan.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Growth 단계로 진행하라고 안내하라
