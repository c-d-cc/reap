# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T1 | `detectMigrationGaps()` — checkIntegrity() 래퍼로 전환 | yes |
| T2 | `buildMigrationSpec()` — slash commands 29→32, 누락 3개 추가 | yes |
| T3 | `checkUserLevelArtifacts()` — integrity.ts에 falsy 검사 추가 | yes |
| T4 | fix.ts `checkProject()` — user-level 검사 병합 | yes |
| T5 | Validation — tsc, 600 tests, build 통과 | yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes

### T1: detectMigrationGaps() 리팩토링
- 기존 60줄 하드코딩 코드를 `checkIntegrity()` 호출 4줄로 교체
- integrity errors만 gaps로 반환 (warnings는 migration-blocking이 아님)
- integrity.ts에 `checkDirectoryStructure()` 검사 추가 (genome/, environment/, life/, lineage/, hooks/, hooks/conditions/)

### T2: buildMigrationSpec() 업데이트
- 누락 커맨드: reap.evolve.recovery, reap.refreshKnowledge, reap.update-genome

### T3: checkUserLevelArtifacts()
- `~/.claude/skills/reap.*` → error (user-level에 project skill이 있으면 안 됨)
- `~/.claude/commands/reap.*`, `~/.config/opencode/commands/reap.*`, `.claude/commands/reap.*` → warning
- readdir 실패 시 (디렉토리 없음) 정상 처리

### T4: fix.ts 통합
- checkProject()에서 checkIntegrity()와 checkUserLevelArtifacts()를 Promise.all로 병렬 실행
- 결과를 IntegrityResult로 병합
