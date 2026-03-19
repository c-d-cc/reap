## What's New

- **Merge Generation Lifecycle**: 멀티머신에서 분기된 generation을 병합하는 특수 5단계 lifecycle (Detect → Genome Resolve → Source Resolve → Sync Test → Completion)
- **MergeGenerationManager**: GenerationManager와 완전 분리된 merge 전용 매니저
- **Lineage 공유 유틸**: lineage.ts로 공통 조회 로직 추출 (listMeta, readMeta, nextSeq, resolveParents)
- **Merge artifact 템플릿 5종**: init/update 시 ~/.reap/templates/merge/에 자동 설치
- **Genome conflict detection**: diff 추출, WRITE-WRITE / CROSS-FILE conflict 분류, sync test 실행

## Generations

- **gen-046-b949b6**: Merge Generation lifecycle 구현
