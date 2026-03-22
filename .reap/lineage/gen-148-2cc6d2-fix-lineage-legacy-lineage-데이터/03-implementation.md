# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | gen-004-04e465.md legacy 날짜 교정 | yes |
| T002 | gen-036-0ba2b6.md legacy 날짜 교정 | yes |
| T003 | gen-039-722d63.md legacy 날짜 교정 | yes |
| T004 | gen-040-308d77.md legacy 날짜 교정 | yes |
| T005 | gen-041-c7b6c0.md legacy 날짜 교정 | yes |
| T006 | gen-042-2a4313.md legacy 날짜 교정 | yes |
| T007 | gen-043-078edf.md legacy 날짜 교정 | yes |
| T008 | gen-044-782053.md legacy 날짜 교정 | yes |
| T009 | gen-045-3785e0.md legacy 날짜 교정 | yes |
| T010 | gen-102-95708b.md frontmatter 복구 | yes |
| T011 | gen-111-845eb4.md frontmatter 복구 | yes |
| T012 | gen-113-42d502.md frontmatter 복구 | yes |
| T013 | gen-122-519e18.md frontmatter 복구 | yes |
| T014 | gen-123-98fe85.md frontmatter 복구 | yes |
| T015 | gen-124-ea5e55.md frontmatter 복구 | yes |
| T016 | gen-125-aed658.md frontmatter 복구 | yes |
| T017 | migration.ts에 estimateGenDates() 헬퍼 함수 추가 | yes |
| T018 | migration.ts L95-96의 legacy-N placeholder를 estimateGenDates() 호출로 대체 | yes |
| T019 | reap fix --check 검증 — legacy date 및 frontmatter 오류 모두 해소 | yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes

### Phase 1: Legacy 날짜 교정 (9건)
- git log에서 추출한 커밋 시간을 `startedAt/completedAt`로 사용
- gen-004, gen-040~043은 동일 커밋(batch migration)에서 생성되어 같은 타임스탬프를 공유

### Phase 2: Frontmatter 복구 (7건)
- git commit 메시지에서 goal 추출
- 인접 generation의 parent chain에서 parents 결정
- genomeHash는 인접 generation의 값으로 추정

### Phase 3: migration.ts 개선
- `estimateGenDates()` 헬퍼: `child_process.execSync`로 git log 호출, 5초 타임아웃
- fallback: git 실패 시 현재 시간 사용
- startedAt: `--diff-filter=A`로 최초 커밋 시간, completedAt: 마지막 커밋 시간

### 검증 결과
- `bunx tsc --noEmit`: 통과
- `bun test`: 600 pass / 0 fail
- `reap fix --check`: legacy date/frontmatter 관련 오류 없음 (source-map.md 줄 수 경고만 잔존 — 범위 외)
