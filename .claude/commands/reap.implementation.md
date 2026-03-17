---
description: "REAP Implementation — AI+Human 협업으로 코드를 구현합니다"
---

# Implementation (구현)

<HARD-GATE>
02-planning.md의 태스크 목록 없이 코드를 작성하지 마라.
Genome(conventions.md, constraints.md)을 위반하는 코드를 작성하지 마라.
Genome을 직접 수정하지 마라 — 문제를 발견하면 backlog에 기록하라.
Environment를 직접 수정하지 마라 — 변화를 발견하면 backlog에 기록하라.
</HARD-GATE>

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `implementation`인지 확인하라
- `.reap/life/02-planning.md`가 존재하는지 확인하라
- git working tree가 clean인지 확인하라 (`git status`)
  - uncommitted 변경이 있으면: ERROR — "먼저 커밋하세요." 안내 후 **중단**
- 미충족 시: ERROR — 사유를 알리고 **중단**

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)
- `.reap/genome/conventions.md`를 읽어라 — 구현 중 수시로 참조할 규칙
- `.reap/genome/constraints.md`를 읽어라 — 기술 제약

## Re-entry 확인
- `.reap/life/03-implementation.md`가 이미 존재하면 **회귀로 인한 재진입**이다
- 기존 log를 읽고, `## Regression` 섹션이 있으면 회귀 사유를 파악하라
- 회귀 재진입 시 기존 log에 **append**하라 (기존 완료 기록 유지)

## Steps

### 1. 태스크 목록 로드
- `.reap/life/02-planning.md`에서 태스크 목록을 읽어라
- 이미 `03-implementation.md`가 존재하면 읽어라 (기존 기록 유지)
- 미완료(`[ ]`) 태스크를 식별하라

### 2. 순차 구현
- 미완료 태스크부터 순서대로 구현하라
- `03-implementation.md`를 태스크 또는 Phase 단위로 갱신하라
- conventions.md의 규칙을 **반드시** 준수하라
- constraints.md의 기술 제약을 **반드시** 준수하라

### 3. Genome/Environment 변경 발견 시
- 명세와 다르게 구현해야 할 부분을 발견하면:
  a. `.reap/life/backlog/`에 기록하라:
     ```markdown
     ---
     type: genome-change
     target: genome/[해당 파일]
     ---
     # [제목]
     [무엇이 다른지, 어떻게 바꿔야 하는지]
     ```
  b. 해당 변경에 의존하는 태스크를 `02-planning.md`에서 `[deferred]`로 마킹하라
  c. deferred 사유를 기록하라
- **Genome이나 Environment 파일을 직접 수정하면 안 된다. 이것은 협상 불가다.**

### 4. 완료 마킹
- 완료된 태스크는 `02-planning.md`에서 `[x]`로 마킹하라

## 에스컬레이션
다음 상황에서는 **멈추고 인간에게 물어라**:
- 태스크의 요구사항이 불명확할 때
- 아키텍처 결정이 필요한데 planning에 없을 때
- 기존 코드와 충돌이 발생할 때
- 예상보다 범위가 훨씬 클 때

## 산출물 생성
- `.reap/templates/03-implementation.md`를 읽어라 (또는 기존 log가 있으면 append)
- 완료 태스크, deferred 태스크(사유 포함), genome-change backlog 항목, 구현 메모를 기록하라
- `.reap/life/03-implementation.md`에 저장하라

## 완료
- "`reap evolve --advance`로 Validation 단계로 진행하세요." 안내
- "Validation에서 문제 발견 시 `reap evolve --back`으로 돌아올 수 있습니다." 안내
