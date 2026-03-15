---
description: "REAP Formation — 목표 달성에 필요한 명세를 정의합니다"
---

# Formation (명세 정의)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `formation`인지 확인하라
- `.reap/life/01-conception-goal.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/01-conception-goal.md`에서 goal과 범위를 읽어라
2. `.reap/genome/`에서 goal과 관련된 명세를 읽어라:
   - `principles.md` — 관련 아키텍처 원칙
   - `domain/` — 관련 비즈니스 규칙
   - `conventions.md` — 적용될 개발 규칙
   - `constraints.md` — 기술 제약
3. goal 달성에 필요한 명세가 부족하면 보완 계획을 수립하라
4. genome 수정이 필요한 부분을 발견하면 `.reap/life/mutations/`에 YAML 파일로 기록하라
5. 인간과 함께 spec을 확정하라

## 산출물 생성
- `.reap/templates/02-formation-spec.md`를 읽어라
- 위 Steps의 결과를 반영하여 채워라
- `.reap/life/02-formation-spec.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Planning 단계로 진행하라고 안내하라
