---
description: "REAP Growth — AI+Human 협업으로 코드를 구현합니다"
---

# Growth (Build)

AI와 Human이 협업하여 Civilization(Source Code)을 구현하는 단계입니다.

## 해야 할 것

1. Planning에서 세운 계획에 따라 코드를 구현하세요
2. 명세(Genome)와 다르게 구현해야 할 부분을 발견하면 Mutation으로 기록하세요:
   - `.reap/life/mutations/`에 YAML 파일로 기록 (id, file, description, createdAt)
3. 구현이 완료되면 `reap evolve --advance`로 Validation 단계로 진행하세요
4. Validation에서 문제가 발견되면 `reap evolve --back`으로 다시 Growth로 돌아올 수 있습니다
