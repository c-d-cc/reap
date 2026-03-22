# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/core/integrity.ts` — checkIntegrity() 함수 신규 생성 (config/current/lineage/genome/backlog/artifact 검증) | Yes |
| T002 | `src/cli/commands/fix.ts` — checkProject() 함수 export 추가 | Yes |
| T003 | `src/cli/index.ts` — fix 커맨드에 --check 옵션 추가 | Yes |
| T004 | `src/templates/hooks/onLifeCompleted.integrity-check.sh` — hook 템플릿 생성 | Yes |
| T005 | `src/cli/commands/init.ts` — hook 템플릿 설치 로직 추가 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- `checkIntegrity()`는 read-only 검사만 수행 (기존 `fixProject()`는 repair 담당)
- IntegrityResult: errors (구조적 결함, 반드시 수정 필요), warnings (권고 사항)
- `reap fix --check`은 errors가 있으면 exit 1, warnings만 있으면 exit 0
- hook은 always condition, order 90 (completion 후 마지막에 실행)
- init.ts에 `.reap/hooks/`로 `on*.sh` 파일 자동 설치 로직 추가
- `bunx tsc --noEmit` 및 `bun test` (600 pass) 모두 통과
