# Planning

## Tasks

### Task 1: init auto-adoption
- `src/cli/index.ts:31-39` — 기존 프로젝트 감지 시 mode를 adoption으로 자동 전환
- 기존 테스트(init.test.ts) 업데이트

### Task 2: backlog title fallback
- `src/core/backlog.ts:31` — heading 없으면 frontmatter.title → filename 순서로 fallback
- backlog.test.ts에 시나리오 추가

### Task 3: abort consumed revert
- `src/cli/commands/run/abort.ts` — execute phase에서 consumed backlog 복원
- `src/core/backlog.ts` — revertBacklogConsumed 함수 추가
- abort.test.ts에 시나리오 추가

## Dependencies
3개 독립적, 병렬 실행 가능
