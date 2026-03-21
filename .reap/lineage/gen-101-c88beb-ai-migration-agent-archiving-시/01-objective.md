# REAP MANAGED — Do not modify directly. Use reap run commands.
# Objective

## Goal
AI migration agent + archiving 시 REAP MANAGED 헤더 제거

## Completion Criteria
- reap update에서 deterministic migration 후 gap 감지 시 AI migration prompt 출력
- AI migration prompt에 최신 REAP 기대 구조 spec 포함
- gm.complete()에서 artifact를 lineage로 복사할 때 REAP MANAGED 첫 줄 strip
- 550 tests 유지 + 신규
