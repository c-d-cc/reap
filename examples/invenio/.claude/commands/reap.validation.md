---
description: "REAP Validation — 테스트와 검증으로 목표 달성을 확인합니다"
---

# Validation (검증)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `validation`인지 확인하라
- `.reap/life/04-growth-log.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)

## Steps

### 1. 자동 검증 실행
- `.reap/genome/constraints.md`의 **Validation Commands** 테이블을 읽어라
- 정의된 명령어를 순서대로 실행하라:
  - 테스트 명령어 실행 → 결과 기록
  - 린트 명령어 실행 → 결과 기록
  - 빌드 명령어 실행 → 결과 기록
  - 타입체크 명령어 실행 → 결과 기록
- 명령어가 정의되지 않은 항목은 건너뛰되, "미정의"로 기록하라

### 2. Convention 준수 검사
- `.reap/genome/conventions.md`의 **Enforced Rules** 테이블을 읽어라
- 정의된 규칙별 검증 명령어를 실행하라
- 위반 사항을 기록하라

### 3. 완료 조건 점검
- `.reap/life/01-conception-goal.md`에서 완료 조건을 읽어라
- `.reap/life/04-growth-log.md`에서 deferred 태스크 목록을 확인하라
- deferred 태스크를 제외한 범위에서 완료 조건을 재평가하라
- goal의 완료 조건을 하나씩 점검하라 (deferred로 인해 부분 달성도 허용)

### 4. 판정
- 모든 자동 검증 통과 + 완료 조건 충족 → **pass**
- 자동 검증 통과 + 일부 완료 조건 deferred → **partial**
- 자동 검증 실패 또는 완료 조건 미충족 → **fail**
- **fail**인 경우: 개발자에게 `reap evolve --back`으로 Growth 복귀를 안내하라

## 산출물 생성
- `.reap/templates/05-validation-report.md`를 읽어라
- 자동 검증 결과, 완료 조건 체크, deferred 항목 목록을 기록하라
- 결과를 pass / partial / fail 로 판정하라
- `.reap/life/05-validation-report.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Adaptation 단계로 진행하라고 안내하라
