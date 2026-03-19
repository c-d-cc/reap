---
type: genome-change
status: consumed
consumedBy: gen-046-b949b6
target: genome/source-map.md
---

# source-map.md에 merge 모듈 반영

신규 파일 4개를 source-map.md C4 Component 다이어그램에 추가:
- src/core/lineage.ts — lineage 조회 공유 유틸
- src/core/merge-lifecycle.ts — MergeLifeCycle 클래스
- src/core/merge-generation.ts — MergeGenerationManager 클래스
- src/core/merge.ts — merge 핵심 로직 (diff, conflict, sync test)
