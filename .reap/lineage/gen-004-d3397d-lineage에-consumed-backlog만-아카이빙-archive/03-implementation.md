# Implementation — gen-004-d3397d

## Goal
lineage에 consumed backlog만 아카이빙 — archive.ts 수정

## Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| T001 | archive.ts — backlog/ 제외 복사, consumed만 별도 아카이빙 | Done |
| T002 | typecheck + build | Done |
| T003 | e2e 전체 통과 (init 62, lifecycle 16, multi-gen 34) | Done |

## Changes
- `src/core/archive.ts` — life/ 복사 시 backlog/ 제외, consumed만 lineage에 복사 후 life에서 삭제, pending은 유지
