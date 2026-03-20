---
type: task
status: pending
priority: medium
---

# Lineage Compression을 슬래시 커맨드 워크플로우에서 실행

## 현황
- compression.ts 코드 존재, generation.ts에서 호출
- 하지만 /reap.next 슬래시 커맨드는 AI가 직접 파일 조작하므로 compression 함수 미호출
- 72세대 9,840줄 — 기준(5,000줄 + 5세대) 초과

## 고려사항
- 분산 워크플로우(reap pull/push/merge)에서 compression이 상대 branch의 lineage를 훼손할 수 있음
- 다른 머신에서 아직 참조 중인 generation을 압축하면 merge 시 문제 발생 가능
- DAG 구조에서 단순 순번 기반 compression이 아닌 DAG-aware compression 필요할 수 있음

## 방향
- 자동 compression을 /reap.next에 넣을지, 수동 커맨드로 제공할지 결정 필요
- 분산 환경에서 안전한 compression 전략 설계 필요
