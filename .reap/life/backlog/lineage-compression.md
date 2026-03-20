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

## 분석 결과 (2026-03-20)

### Level 1 (디렉토리 → .md): 안전
- frontmatter에 DAG 메타데이터(id, parents, genomeHash) 보존
- merge의 공통 조상 탐색, genome diff 비교 모두 정상 동작

### Level 2 (5개 Level 1 → epoch .md): DAG 파괴 — 위험
- Level 1의 frontmatter를 strip하고 body만 파싱 (320행)
- epoch 파일에 개별 generation의 parents/genomeHash 미포함
- 원본 Level 1 파일 삭제 → DAG parent 참조 소실
- merge 공통 조상 BFS 탐색 끊어질 수 있음

## 수정 방향
- Level 1: /reap.next 아카이빙에 자동 실행 가능
- Level 2: DAG 메타데이터를 epoch 파일에 보존하도록 수정 필요
  - 방안 A: epoch frontmatter에 포함된 generation들의 meta 배열 저장
  - 방안 B: Level 2 폐지, Level 1만 사용
  - 방안 C: meta.yml만 별도 보존 (epoch + meta index)
