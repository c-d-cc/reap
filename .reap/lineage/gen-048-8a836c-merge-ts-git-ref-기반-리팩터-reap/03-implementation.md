# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T1 | src/core/git.ts — gitShow, gitLsTree, gitRefExists, gitCurrentBranch | 2026-03-19 |
| T2 | merge.ts 리팩터 — readGenomeFilesFromRef, extractGenomeDiffFromRefs, detectDivergenceFromRefs + diffGenomeMaps 공유 | 2026-03-19 |
| T3 | MergeGenerationManager.createFromBranch() — git ref 기반 detect + 원격 lineage 스캔 | 2026-03-19 |
| T4 | src/cli/commands/merge.ts — reap merge CLI + 01-detect.md 자동 생성 | 2026-03-19 |
| T5 | src/cli/index.ts — merge subcommand 등록 | 2026-03-19 |
| T6 | tsc 통과, bun test 105 pass, npm build 통과 | 2026-03-19 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes

- git.ts: execSync 기반, timeout 설정으로 hang 방지
- merge.ts: diffGenomeMaps로 filesystem/git ref 로직 공유, 기존 함수 하위 호환 유지
- MergeGenerationManager: createFromBranch()가 listMetaFromRef()로 원격 lineage 스캔, parseFrontmatter로 compressed .md도 읽기
- CLI merge: 01-detect.md를 DivergenceReport 기반으로 자동 생성
