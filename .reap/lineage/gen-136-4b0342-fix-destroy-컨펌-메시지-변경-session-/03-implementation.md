# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/cli/index.ts` destroy 컨펌 메시지를 `yes destroy`로 변경 | Yes |
| T002 | `src/templates/hooks/session-start.cjs` language destructure + langSection 생성 + reapContext 삽입 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- T001: `expectedInput`을 `destroy ${projectName}`에서 `"yes destroy"` 문자열 리터럴로 변경. 프롬프트 메시지와 비교 로직은 이미 `expectedInput` 변수를 참조하므로 추가 수정 불필요.
- T002: line 157에서 `language` destructure 추가, line 163-166에 langSection 빌드 로직 추가 (opencode-session-start.js와 동일 패턴), line 219 reapContext에 `${langSection}` 삽입.
