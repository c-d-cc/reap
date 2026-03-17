---
description: "REAP Implementation — AI+Human 협업으로 코드를 구현합니다"
---

# Implementation (구현)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `implementation`인지 확인하라
- `.reap/life/02-planning.md`가 존재하는지 확인하라
- git working tree가 clean인지 확인하라 (`git status`). uncommitted 변경이 있으면 인간에게 먼저 커밋하도록 안내하라.
- 미충족 시: 사유를 알리고 중단

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)
- `.reap/genome/conventions.md`를 읽어라 — 구현 중 수시로 참조할 규칙

## Re-entry 확인
- `.reap/life/03-implementation.md`가 이미 존재하면 **회귀로 인한 재진입**이다
- 기존 log를 읽고, `## Regression` 섹션이 있으면 회귀 사유를 파악하라
- 회귀 재진입 시 기존 log에 **append**하라 (기존 완료 기록 유지)

## Steps
1. `.reap/life/02-planning.md`에서 태스크 목록을 읽어라
2. 이미 `03-implementation.md`가 존재하면 읽어라 (기존 기록 유지, append 모드)
3. 미완료(`[ ]`) 태스크부터 순서대로 구현하라
   - `03-implementation.md`를 태스크 또는 Phase 단위로 갱신하라
   - 서브에이전트에게 구현을 위임한 경우, 위임 단위 완료 후 갱신해도 된다
   - conventions.md의 규칙을 준수하라
   - constraints.md의 기술 제약을 준수하라
4. 명세와 다르게 구현해야 할 부분을 발견하면:
   a. `.reap/life/backlog/`에 마크다운 파일로 기록하라:
      ```markdown
      ---
      type: genome-change
      target: genome/[해당 파일]
      ---
      # [제목]
      [무엇이 다른지, 어떻게 바꿔야 하는지]
      ```
   b. 해당 genome 변경에 의존하는 태스크를 `02-planning.md`에서 `[deferred]`로 마킹하라
   c. deferred 사유를 기록하라
5. 완료된 태스크는 `[x]`로 마킹하라

## 산출물 생성
- `.reap/templates/03-implementation.md`를 읽어라 (또는 기존 log가 있으면 append)
- 완료 태스크, deferred 태스크(사유 포함), 발생한 genome-change backlog 항목, 구현 메모를 기록하라
- `.reap/life/03-implementation.md`에 저장하라

## 완료
- `/reap.evolve`로 Validation 단계로 진행하라고 안내하라
- Validation에서 문제 발견 시 `/reap.evolve`로 Implementation에 돌아올 수 있음을 안내하라
