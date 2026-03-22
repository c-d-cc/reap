# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | completion.ts에 buildMdHookPrompt() 헬퍼 함수 추가 | Yes |
| T002 | phase "genome"의 prompt에 buildMdHookPrompt() 결과 append | Yes |
| T003 | phase "archive"의 prompt에 buildMdHookPrompt() 결과 append | Yes |
| T004 | evolve.ts buildSubagentPrompt()에 hook prompt 실행 안내 추가 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- completion.ts: HookResult 타입 import 추가, buildMdHookPrompt() 함수로 md hook content를 prompt 문자열에 append
- evolve.ts: "Hook Prompt Execution" 섹션 추가 — subagent가 completion output의 hook prompt를 따르도록 안내
- hook-engine.ts: 변경 없음 (설계대로)
