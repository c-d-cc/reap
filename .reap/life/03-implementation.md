# REAP MANAGED — Do not modify directly. Use reap run commands.
# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | import에 ReapPaths 값 import로 변경 | Yes |
| T002 | import에 join (from "path") 추가 | Yes |
| T003 | topic 분기에서 reap-guide.md를 readTextFile로 읽기 | Yes |
| T004 | emitOutput context에 reapGuide 필드 추가 | Yes |
| T005 | bunx tsc --noEmit 통과 | Yes |
| T006 | bun test 전체 통과 (569 pass, 0 fail) | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- `src/cli/commands/run/help.ts` 단일 파일 수정
- `import type { ReapPaths }` → `import { ReapPaths }` 변경 (정적 메서드 접근 필요)
- `join` from `path` 추가하여 경로 구성
- topic 분기 상단에서 `ReapPaths.packageHooksDir` + `reap-guide.md` 경로로 파일 읽기
- `readTextFile`이 null 반환 시 빈 문자열로 fallback (`?? ""`)
- context 객체에 `reapGuide` 키로 포함
- prompt에 reapGuide 참조 안내 문구 추가
