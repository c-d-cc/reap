# Implementation
## Progress
| Task | Status | Notes |
|------|--------|-------|
| T001 genome-sync.ts | ✅ | 프로젝트 스캔 + genome 자동 생성 (JS/TS/Go/Python/Rust 지원) |
| T002 init.ts | ✅ | adoption/migration 시 genome-sync 호출 |
| T003 검증 | ✅ | tsc/build/test 통과, reap-marketing 실전 테스트 성공 |
## Changes
- `src/core/genome-sync.ts` — 신규
- `src/cli/commands/init.ts` — adoption/migration 시 genome-sync 호출 추가
