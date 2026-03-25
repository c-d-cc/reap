# Learning — gen-004-d3397d

## Goal
lineage에 consumed backlog만 아카이빙 — archive.ts 수정

## Key Findings

### 현재 문제 (v0.16 archive.ts)
- line 28-34: `life/` 전체를 `cp(src, dest, { recursive: true })`로 lineage에 복사
- backlog/ 포함 전체가 복사됨 → pending backlog도 lineage에 들어감
- 이후 pending만 다시 life/backlog/에 써주지만 lineage에는 이미 전부 있음

### v0.15 패턴 (generation.ts line 228-243)
- backlog를 별도 처리: consumed만 lineage/backlog/에 복사
- consumed 항목은 life/backlog/에서 삭제 (unlink)
- pending 항목은 life/backlog/에 그대로 유지

### 수정 방향
archive.ts에서 life/ 복사 시 backlog/ 디렉토리를 제외하고, consumed backlog만 별도로 lineage에 복사.

## Clarity Level: High
- v0.15 코드 분석 완료, 변경 대상 파일 1개 (archive.ts)
