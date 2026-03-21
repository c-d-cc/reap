# REAP MANAGED — Do not modify directly. Use reap run commands.
# Validation Report

## Result: pass

## Completion Criteria Check
| Criterion | Result | Notes |
|-----------|--------|-------|
| emitOutput context에 reap-guide.md 내용 포함 | PASS | REAP_HELP_TOPIC=lifecycle 테스트에서 context.reapGuide에 전체 가이드 포함 확인 |
| ReapPaths.packageHooksDir로 경로 해석 | PASS | join(ReapPaths.packageHooksDir, "reap-guide.md") 사용 |
| 파일 없는 경우 graceful fallback | PASS | readTextFile은 null 반환, ?? "" 로 빈 문자열 fallback |
| 기존 help 동작 영향 없음 | PASS | topic 분기만 수정, 일반/비지원 언어 분기 미변경 |
| bunx tsc --noEmit 통과 | PASS | 타입 에러 없음 |
| bun test 전체 통과 | PASS | 569 pass, 0 fail |

## Test Results
- `bunx tsc --noEmit`: PASS
- `bun test`: 569 pass, 0 fail, 2006 expect() calls
- 기능 테스트: `REAP_HELP_TOPIC=lifecycle node dist/cli.js run help` — context.reapGuide에 reap-guide.md 전문 포함 확인

## Deferred Items
없음

## Minor Fixes (Fixed Directly in This Stage)
| File | Change | Reason |
|------|--------|--------|

## Issues Discovered
없음
