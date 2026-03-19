---
type: genome-change
status: consumed
consumedBy: gen-025
target: genome/conventions.md
---
# Release Conventions에 RELEASE_NOTES.md 워크플로우 추가

Release Conventions 섹션에 다음 내용 추가:
- `RELEASE_NOTES.md`: version bump가 있는 generation completion 시 onGenerationComplete hook이 자동 생성
- `release.yml`: RELEASE_NOTES.md가 있으면 사용, 없으면 --generate-notes fallback
- 릴리스 노트는 마지막 태그 이후의 lineage generation들을 스캔하여 작성
