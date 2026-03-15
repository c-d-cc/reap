---
description: "REAP Birth — Genome을 진화시키고 다음 세대의 초기 상태를 생성합니다"
---

# Birth (출산)

Mutation과 Adaptation을 Genome에 반영하고 다음 세대의 초기 상태를 생성하는 단계입니다.

## 해야 할 것

1. `.reap/life/mutations/`의 Mutation들을 Genome에 반영하세요
2. Adaptation에서 기록한 Genome diff를 적용하세요
3. 변경된 Genome을 검토하세요 (인간 확인)
4. `reap evolve --advance`로 Legacy 단계로 진행하세요
   - CLI가 자동으로 다음 세대의 초기 상태를 생성합니다
   - 현재 세대 기록이 Lineage로 이동합니다
