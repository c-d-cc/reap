---
type: genome-change
status: consumed
consumedBy: gen-046-b949b6
target: genome/domain/lifecycle-rules.md
---

# Merge lifecycle 규칙을 domain/lifecycle-rules.md에 추가

현재 lifecycle-rules.md는 normal lifecycle만 기술. Merge lifecycle 규칙 추가 필요:
- Merge stage 순서: Detect → Genome Resolve → Source Resolve → Sync Test → Completion
- Merge artifact 이름 매핑 (01-detect.md ~ 05-completion.md)
- Merge regression 규칙 (sync-test 실패 시 source-resolve 또는 genome-resolve로)
- MergeGenerationManager와 GenerationManager의 분리 원칙
