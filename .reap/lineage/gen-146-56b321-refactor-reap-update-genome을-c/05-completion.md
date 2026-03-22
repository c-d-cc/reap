# Completion

## Summary
- **Goal**: refactor: reap update-genome을 CLI subcommand에서 slash command로 변환
- **Period**: 2026-03-22 ~ 2026-03-23
- **Genome Version**: v55 → v56
- **Result**: pass
- **Key Changes**:
  - `src/cli/commands/update-genome.ts` → `src/cli/commands/run/update-genome.ts`: CLI subcommand에서 run command로 변환
  - `src/cli/index.ts`: `program.command("update-genome")` 블록 및 import 제거
  - `src/cli/commands/run/index.ts`: `"update-genome"` dispatcher 등록
  - `src/templates/commands/reap.update-genome.md`: 신규 slash command 템플릿
  - `src/cli/commands/init.ts`: COMMAND_NAMES에 `"reap.update-genome"` 추가
  - `docs/`: CLIPage에서 update-genome 섹션 제거, 4개 translation 파일 정리

## Retrospective

### Lessons Learned
#### What Went Well
- 기존 코드가 이미 emitOutput/emitError 패턴을 사용하고 있어 변환이 매우 간단했음
- isReapProject 체크를 run dispatcher가 이미 수행하므로 중복 코드 제거

#### Areas for Improvement
- 없음

### Genome Change Proposals
| Target File | Change Description | Reason |
|-------------|-------------------|--------|
| constraints.md | CLI Subcommands 9→8, Slash Commands Normal 18→19 | update-genome이 CLI에서 slash command로 이동 |
| source-map.md | CLI Commands에서 update-genome 제거, run scripts 카운트 정확하게 30개로 업데이트 | 실제 코드와 일치 |

### Deferred Task Handoff
| Task | Description | Related Backlog | Backlog File |
|------|-------------|-----------------|-------------|

### Next Generation Backlog


---

## Genome Changelog

### Genome-Change Backlog Applied
| Backlog File | Target | Change Description | Applied |
|-------------|--------|-------------------|---------|

### Retrospective Proposals Applied
| Target File | Change Description | Applied |
|-------------|-------------------|---------|
| constraints.md | CLI Subcommands 9→8 (update-genome 제거), Slash Commands Normal 18→19 (+reap.update-genome) | Yes |
| source-map.md | CLI Commands에서 update-genome 제거, run scripts 30개로 정확히 업데이트, templates commands 29개 | Yes |

### Genome Version
- Before: v55
- After: v56

### Modified Genome Files
- constraints.md
- source-map.md
