---
description: "REAP Validation — 테스트와 검증으로 목표 달성을 확인합니다"
---

# Validation (검증)

<HARD-GATE>
검증 명령어를 실행하지 않고 "pass"를 판정하지 마라.
이전 실행 결과를 재사용하지 마라 — 반드시 이번 세션에서 새로 실행하라.
"아마 통과할 것이다", "문제없어 보인다" 같은 추측은 검증이 아니다.
증거 없이 주장하지 마라. 이것은 협상 불가다.
</HARD-GATE>

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `validation`인지 확인하라
- `.reap/life/03-implementation.md`가 존재하는지 확인하라
- 미충족 시: ERROR — 사유를 알리고 **중단**

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)

## Re-entry 확인
- `.reap/life/04-validation.md`가 이미 존재하면 **회귀로 인한 재진입**이다
- 이전 validation report를 참고하되, 새로 덮어쓰기하라

## Steps

### 1. 자동 검증 실행
- `.reap/genome/constraints.md`의 **Validation Commands** 테이블을 읽어라
- 정의된 명령어를 **순서대로 모두 실행**하라:
  - 테스트 → 린트 → 빌드 → 타입체크
- 각 명령어의 **실제 출력과 exit code**를 기록하라
- 명령어가 정의되지 않은 항목은 건너뛰되, "미정의"로 기록하라

| 주장 | 필요한 증거 | 부족한 증거 |
|------|-----------|-----------|
| "테스트 통과" | 테스트 명령어 출력: 0 failures | 이전 실행, "통과할 것" |
| "린트 클린" | 린트 출력: 0 errors | 부분 체크, 추정 |
| "빌드 성공" | 빌드 명령어: exit 0 | 린트 통과했으니 빌드도 될 것 |

### 2. Convention 준수 검사
- `.reap/genome/conventions.md`의 **Enforced Rules** 테이블을 읽어라
- 정의된 규칙별 검증 명령어를 실행하라
- 위반 사항을 기록하라

### 3. 완료 조건 점검
- `.reap/life/01-objective.md`에서 완료 조건을 읽어라
- `.reap/life/03-implementation.md`에서 deferred 태스크 목록을 확인하라
- deferred 태스크를 제외한 범위에서 완료 조건을 **하나씩** 점검하라
- 각 조건에 대해 pass/fail/deferred를 판정하라

### 4. Minor Fix (사소한 문제 직접 수정)
- 오타, lint 에러, 사소한 버그 등 **stage 전환 없이 바로 고칠 수 있는 문제**는 직접 수정하라
- 수정한 내용을 산출물의 "Minor Fixes" 섹션에 기록하라
- minor fix 판단 기준: **설계 변경 없이 5분 이내에 해결 가능한 문제**
- minor fix 후 관련 검증 명령어를 **다시 실행**하라

### 5. 판정
- 모든 자동 검증 통과 + 완료 조건 충족 → **pass**
- 자동 검증 통과 + 일부 완료 조건 deferred → **partial**
- 자동 검증 실패 또는 완료 조건 미충족 → **fail**
- **fail**인 경우 회귀 안내:
  - 코드 문제 → `reap evolve --back` (implementation)
  - 계획 문제 → `reap evolve --back planning`
  - 목표 문제 → `reap evolve --back objective`

## Red Flags — 이런 생각이 들면 멈춰라
- "아마 통과할 것이다" → 실행하라
- "이전에 통과했으니까" → 다시 실행하라
- "사소한 거라 괜찮다" → minor fix로 고치고 다시 검증하라
- "빌드는 안 해봤지만 린트가 통과했으니" → 빌드도 실행하라

## 산출물 생성
- `.reap/templates/04-validation.md`를 읽어라
- 자동 검증 결과 (실제 명령어 출력 포함), 완료 조건 체크, deferred 항목, minor fixes를 기록하라
- 결과를 pass / partial / fail 로 판정하라
- `.reap/life/04-validation.md`에 저장하라

## 완료
- pass/partial: "`reap evolve --advance`로 Completion 단계로 진행하세요." 안내
- fail: 회귀 안내
