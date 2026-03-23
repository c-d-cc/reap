---
type: task
status: consumed
priority: low
consumedBy: gen-166-04291a
---

# integrity check에서 source-map.md 줄수 경고 제외

source-map.md는 sync 시 AI가 압축하므로 줄수 경고 불필요. integrity.ts에서 source-map.md를 GENOME_LINE_WARNING_THRESHOLD 검사 대상에서 제외.
