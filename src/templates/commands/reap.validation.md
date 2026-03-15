---
description: "REAP Validation — 테스트와 검증으로 목표 달성을 확인합니다"
---

# Validation (검증)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `validation`인지 확인하라
- `.reap/life/04-growth-log.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Steps
1. `.reap/life/01-conception-goal.md`에서 완료 조건을 읽어라
2. `.reap/life/04-growth-log.md`에서 deferred 태스크 목록을 확인하라
3. deferred 태스크를 제외한 범위에서 완료 조건을 재평가하라
4. 테스트를 실행하라 (완료된 범위에 대해서만)
5. goal의 완료 조건을 하나씩 점검하라 (deferred로 인해 부분 달성도 허용)
6. 문제 발견 시: 개발자에게 `reap evolve --back`으로 Growth 복귀를 안내하라

## 산출물 생성
- `.reap/templates/05-validation-report.md`를 읽어라
- 테스트 결과, 완료 조건 체크, deferred 항목 목록을 기록하라
- 결과를 pass / partial / fail 로 판정하라
- `.reap/life/05-validation-report.md`에 저장하라

## 완료
- 개발자에게 `reap evolve --advance`로 Adaptation 단계로 진행하라고 안내하라
