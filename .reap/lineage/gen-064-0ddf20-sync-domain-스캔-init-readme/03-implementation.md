# Implementation

## Progress
| Task | Status | Notes |
|------|--------|-------|
| T001 reap.sync.md | ✅ | Domain Knowledge 카테고리 + Domain gaps 추가 |
| T002 genome-sync.ts | ✅ | domain/README.md 힌트 파일 생성 |
| T003 검증 | ✅ | 159 pass, tsc/build 통과 |

## Changes
- `src/templates/commands/reap.sync.md` — Step 2 Domain Knowledge, Step 3 Domain gaps
- `src/core/genome-sync.ts` — domain/README.md 자동 생성

## Issues
- lifecycle 우회: generation 없이 코드 수정+커밋+릴리스 후 소급 생성
