# Completion

## Retrospective
Hook system을 stage-level로 전면 개편. 기존 4+4개 → 8+8개 = 16개 이벤트.
각 lifecycle stage 완료 시 개별 hook이 발동되어 더 세밀한 자동화 가능.
docs도 Normal/Merge로 분리하여 가독성 향상.

## Genome Changes
- constraints.md: 16개 event 반영
- domain/hook-system.md: 전면 재작성
