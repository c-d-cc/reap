# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `merge-mate.ts` --phase complete에 `02-mate.md` 존재 검증 추가 | Y |
| T002 | `merge-merge.ts` --phase complete에 `03-merge.md` 존재 검증 추가 | Y |
| T003 | `merge-sync.ts` --phase complete에 `04-sync.md` 존재 검증 추가 | Y |
| T004 | `merge-validation.ts` 기존 `05-validation.md` 검증 확인 — 변경 불필요 | Y |
| T005 | `merge-generation.ts` complete() backlog carry-forward 수정 | Y |
| T006 | `merge-mate.test.ts` artifact 미존재 에러 테스트 추가 | Y |
| T007 | `merge-merge.test.ts` artifact 미존재 에러 테스트 추가 | Y |
| T008 | `merge-sync.test.ts` artifact 미존재 에러 테스트 추가 | Y |
| T009 | `merge-completion.test.ts` backlog carry-forward 테스트 추가 | Y |
| T010 | 전체 검증: 605 tests pass, tsc clean, build ok | Y |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes

### Bug 1: Artifact 존재 검증

merge-validation의 기존 패턴(`05-validation.md` 존재 확인)을 mate, merge, sync에 동일하게 적용.
`--phase complete` 핸들러 시작부, phase nonce 검증 직후에 artifact 존재 체크를 추가.

### Bug 2: Backlog carry-forward

`MergeGenerationManager.complete()`의 backlog 처리가 `rename()`으로 전부 이동하던 것을 `GenerationManager.complete()`와 동일하게 수정:
- 각 항목을 `readTextFile()`로 읽어서 `status: consumed` 또는 `consumed: true` 여부 판단
- lineage에 항상 `writeTextFile()`로 복사
- consumed인 항목만 `unlink()`로 삭제, pending은 life/backlog에 유지

추가로 artifact 이동 시 REAP MANAGED 헤더 strip 로직도 normal lifecycle과 동일하게 맞춤.

### 변경 파일 목록
- `src/cli/commands/run/merge-mate.ts` — artifact 존재 검증 추가
- `src/cli/commands/run/merge-merge.ts` — artifact 존재 검증 추가
- `src/cli/commands/run/merge-sync.ts` — artifact 존재 검증 추가
- `src/core/merge-generation.ts` — backlog carry-forward + artifact strip 수정
- `tests/commands/run/merge-mate.test.ts` — artifact 미존재 테스트 추가 + 기존 테스트에 artifact 추가
- `tests/commands/run/merge-merge.test.ts` — 동일
- `tests/commands/run/merge-sync.test.ts` — 동일
- `tests/commands/run/merge-completion.test.ts` — backlog carry-forward 테스트 추가
