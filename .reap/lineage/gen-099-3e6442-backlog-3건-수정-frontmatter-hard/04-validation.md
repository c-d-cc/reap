# REAP MANAGED — Do not modify directly. Use reap run commands.
# Validation Report

## Result: pass

## Completion Criteria Check
| Criterion | Result | Notes |
|-----------|--------|-------|
| frontmatter hard-gate | pass | artifact + current.yml + reap-guide |
| status/help 버전 출력 | pass | version.ts + latest 확인 |
| completion auto-archive | pass | genome phase에서 자동 실행 |
| 테스트 통과 | pass | 539 pass / 0 fail |

## Test Results
- `bun test`: 539 pass / 0 fail (56 files, 5.03s)
- `bunx tsc --noEmit`: OK
