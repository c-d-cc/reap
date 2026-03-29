---
title: daemon E2E 테스트 보강
priority: medium
created: 2026-03-29
---

## 개요

daemon Phase 1-4 구현 완료. 유닛/통합 테스트 114개 통과하나 E2E 시나리오 커버리지에 gap 존재.

## 추가 필요한 테스트

### 높은 우선순위

- **증분 인덱싱 E2E**: 파일 변경 → incremental pipeline → 변경된 파일만 재파싱 + 그래프 업데이트 확인
- **에러 케이스**: 잘못된 프로젝트 경로, 인덱스 없는 프로젝트 조회, git repo 아닌 디렉토리
- **Worktree fork 후 분기**: main 인덱스 fork → worktree에서 파일 수정 → 각각 다른 결과 확인

### 중간 우선순위

- **Idle 타임아웃**: 짧은 타임아웃 설정 → 활동 없이 대기 → 서버 자동 종료 확인
- **Lifecycle hook 연동**: start.ts/completion.ts에서 triggerIndexing 호출 확인 (mock 기반)
- **CLI `reap daemon` 명령**: spawn → status → query → stop 전체 흐름

### 낮은 우선순위

- **동시 요청**: 여러 인덱싱 요청 동시 발생 시 indexing lock 동작 확인
- **대규모 프로젝트**: 수천 파일 규모에서의 인덱싱 성능/메모리
