# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/cli/commands/destroy.ts` — destroyProject 함수 구현 | Yes |
| T002 | `src/cli/index.ts` — destroy 서브커맨드 등록 + readline 확인 프롬프트 | Yes |
| T003 | `src/cli/commands/clean.ts` — cleanProject 함수 구현 | Yes |
| T004 | `src/cli/index.ts` — clean 서브커맨드 등록 + 인터랙티브 질문 | Yes |
| T005 | 타입 체크 통과 확인 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| - | - | - | - |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| - | - | - |

## Implementation Notes
- `destroy.ts`: `.reap/`, `.claude/commands/reap.*`, `.claude/skills/reap.*`, `.claude/CLAUDE.md` REAP 섹션, `.gitignore` REAP 항목 삭제
- `clean.ts`: lineage 압축/삭제, hooks 유지/초기화, genome template override/유지, backlog 보존/삭제
- readline 기반 prompt 함수를 index.ts에 추가 (외부 의존성 없음)
- destroy 확인: `destroy <project-name>` 정확 입력 필요
- clean: 진행 중 세대 경고 후 확인
