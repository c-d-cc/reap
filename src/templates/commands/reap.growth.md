---
description: "REAP Growth — AI+Human 협업으로 코드를 구현합니다"
---

# Growth (구현)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `growth`인지 확인하라
- `.reap/life/03-planning-plan.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)
- `.reap/genome/conventions.md`를 읽어라 — 구현 중 수시로 참조할 규칙

## Steps
1. `.reap/life/03-planning-plan.md`에서 태스크 목록을 읽어라
2. 이미 `04-growth-log.md`가 존재하면 읽어라 (Validation에서 복귀한 경우 — 기존 기록 유지)
3. 미완료(`[ ]`) 태스크부터 순서대로 구현하라
   - `04-growth-log.md`를 태스크 또는 Phase 단위로 갱신하라
   - 서브에이전트에게 구현을 위임한 경우, 위임 단위 완료 후 갱신해도 된다
   - conventions.md의 규칙을 준수하라
   - constraints.md의 기술 제약을 준수하라
4. 명세와 다르게 구현해야 할 부분을 발견하면:
   a. `.reap/life/mutations/`에 YAML 파일로 기록하라
   b. 해당 mutation에 의존하는 태스크를 `03-planning-plan.md`에서 `[deferred]`로 마킹하라
   c. deferred 사유를 기록하라
5. 완료된 태스크는 `[x]`로 마킹하라

## 산출물 생성
- `.reap/templates/04-growth-log.md`를 읽어라 (또는 기존 log가 있으면 append)
- 완료 태스크, deferred 태스크(사유 포함), 발생한 mutation, 구현 메모를 기록하라
- `.reap/life/04-growth-log.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Validation 단계로 진행하라고 안내하라
- Validation에서 문제 발견 시 `reap evolve --back`으로 돌아올 수 있음을 안내하라
