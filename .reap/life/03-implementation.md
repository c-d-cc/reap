# REAP MANAGED — Do not modify directly. Use 'reap run <stage> --phase <phase>' to update.
# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/core/generation.ts` CURRENT_YML_HEADER 상수 변경 | Yes |
| T002 | `src/templates/artifacts/01-objective.md` gate 문구 변경 | Yes |
| T003 | `src/templates/artifacts/02-planning.md` gate 문구 변경 | Yes |
| T004 | `src/templates/artifacts/03-implementation.md` gate 문구 변경 | Yes |
| T005 | `src/templates/artifacts/04-validation.md` gate 문구 변경 | Yes |
| T006 | `src/templates/artifacts/05-completion.md` gate 문구 변경 | Yes |
| T007 | `src/templates/artifacts/merge/01-detect.md` gate 문구 변경 | Yes |
| T008 | `src/templates/artifacts/merge/02-mate.md` gate 문구 변경 | Yes |
| T009 | `src/templates/artifacts/merge/03-merge.md` gate 문구 변경 | Yes |
| T010 | `src/templates/artifacts/merge/04-sync.md` gate 문구 변경 | Yes |
| T011 | `src/templates/artifacts/merge/05-validation.md` gate 문구 변경 | Yes |
| T012 | `src/templates/artifacts/merge/06-completion.md` gate 문구 변경 | Yes |
| T013 | 전체 테스트 실행 및 통과 확인 (619 pass, 0 fail) | Yes |
| T014 | 현재 life/ artifact gate 문구 새 형식 적용 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| 없음 | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| 없음 | | |

## Implementation Notes
- 변경 범위: 템플릿 11파일 + generation.ts 상수 1개 = 총 12곳
- `# REAP MANAGED — Do not modify directly. Use reap run commands.` → `# REAP MANAGED — Do not modify directly. Use 'reap run <stage> --phase <phase>' to update.`
- current.yml용 header: `# REAP MANAGED — Do not modify directly. Use reap run next/back/start/abort.` → `# REAP MANAGED — Do not modify directly. Use 'reap run <stage> --phase <phase>' to update.`
- integrity.ts의 검증 로직(`startsWith("# REAP MANAGED")`)과 strip 정규식(`^# REAP MANAGED[^\n]*\n`)은 문구 뒷부분만 변경되므로 수정 불필요
