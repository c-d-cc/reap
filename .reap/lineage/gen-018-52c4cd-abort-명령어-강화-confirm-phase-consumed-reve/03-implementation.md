# Implementation Log — gen-018-52c4cd

## Completed Tasks

### T001: revertBacklogConsumed 함수 추가
- `src/core/backlog.ts`에 `revertBacklogConsumed(backlogDir, genId)` 함수 추가
- scanBacklog로 전체 조회 → consumedBy === genId 필터 → status를 pending으로 변경, consumedBy/consumedAt 제거
- 반환값: revert된 항목 수

### T002: CLI 옵션 추가
- `src/cli/index.ts`의 run 커맨드에 `--source-action`, `--save-backlog` 옵션 추가
- options 타입에 sourceAction, saveBacklog 필드 추가

### T003: run/index.ts에서 abort에 extra args 전달
- abort 분기에서 `{ reason, sourceAction, saveBacklog }` 를 JSON.stringify하여 extra로 전달
- options 타입에 sourceAction, saveBacklog 추가

### T004: abort.ts 2-phase 구현
- **confirm phase** (default): 현재 generation 정보를 prompt로 출력, 사용자에게 확인/reason/source-action/save-backlog 안내
- **execute phase**: reason/sourceAction/saveBacklog 파싱, save-backlog 시 aborted-{genId}.md 생성, revertBacklogConsumed 호출, life/ 정리

### T005: reap.abort.md 스킬 파일 업데이트
- 2-phase 사용법, 옵션 설명, execute 동작 설명 추가

### T006: e2e 테스트 작성
- `tests/e2e/abort.test.ts` — 9개 테스트
- confirm prompt 반환, execute 동작 (life/ 정리, backlog revert), --save-backlog, no active generation 에러

### T007: 전체 테스트 통과 확인
- 168 pass / 0 fail (기존 159 + 신규 9)
