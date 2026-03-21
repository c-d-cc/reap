# REAP MANAGED — Do not modify directly. Use reap run commands.
# Objective

## Goal
auto-report on error + /reap.config 커맨드 추가 + config 필드 backfill

## Completion Criteria
- reap run 에러 시 자동 gh issue report (예상치 못한 에러만)
- reap-guide.md에 에러 감지 → report 규칙 추가
- /reap.config 커맨드로 설정 확인
- help에서 config 라인 제거
- init 시 모든 config 필드 명시, update 시 누락 필드 backfill
- 539 tests 유지 + 신규

## Scope
- **Exclusions**: AI migration agent는 다음 generation으로 이월
