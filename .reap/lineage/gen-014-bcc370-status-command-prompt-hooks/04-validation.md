# Validation

## Result
pass

## Completion Criteria Check
| # | Criterion | Result |
|---|----------|--------|
| 1 | /reap.status slash command 풍부한 정보 출력 | ✅ reap.status.md 생성 |
| 2 | hooks에서 prompt 타입 지원 | ✅ types.ts + 4개 slash command 프롬프트 |
| 3 | reap.next/start/back 프롬프트에 prompt hook 지시 | ✅ |
| 4 | reap-guide.md에 prompt 타입 설명 | ✅ |
| 5 | config.yml에 문서 자동 업데이트 prompt hook | ✅ |
| 6 | README에 /reap.status + prompt hook 반영 | ✅ 영/한 모두 |
| 7 | docs 사이트 페이지 업데이트 | ✅ WorkflowPage + HeroPage |
| 8 | bun test 통과 | ✅ 93 pass, 0 fail |

## Test Results
```
bun test: 93 pass, 0 fail, 211 expect() calls
```
