# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | CLI entry point: allowUnknownOption, passArgs 수집, runCommand에 argv 전달 | Yes |
| T002 | 6개 source 수정: start, back, abort, merge-start, merge, pull — env var를 argv 파싱으로 교체 | Yes |
| T003 | 6개 template 수정: $ARGUMENTS 추가 | Yes |
| T004 | 테스트 업데이트: unit + E2E — process.env 조작을 argv 전달로 변경 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| T005 | genome conventions.md 수정 | Completion 단계 | - |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| - | conventions.md:54 | env var 패턴 → argv 패턴 설명 |

## Implementation Notes
- getPositionals() 헬퍼: value flag를 건너뛰어 positional과 flag value를 올바르게 분리
- Commander.js allowUnknownOption() 사용으로 pass-through args 지원
- 582 tests all pass, TypeScript clean
