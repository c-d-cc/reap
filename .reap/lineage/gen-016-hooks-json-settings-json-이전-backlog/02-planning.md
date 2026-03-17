# Planning

## Summary
hooks.json 대신 settings.json에 SessionStart hook을 등록하도록 hooks.ts를 수정하고, hooks.json→settings.json migration을 추가한다. 또한 reap.start.md에 backlog 스캔 단계를 추가한다.

## Technical Context
- **Tech Stack**: TypeScript, Node.js fs/promises, JSON 파일 읽기/쓰기
- **Constraints**:
  - settings.json 기존 내용(permissions, plugins 등) 반드시 보존
  - settings.json의 hooks 형식: `{ hooks: { SessionStart: [{ matcher, hooks: [...] }] } }`
  - hooks.json 형식: `{ SessionStart: [{ matcher, hooks: [...] }] }` (hooks wrapper 없음)
  - 파일 I/O는 src/core/fs.ts 유틸 사용

## Tasks

### Phase 1: settings.json 경로 추가
- [ ] T001 `src/core/paths.ts` — `userClaudeSettingsJson` static getter 추가 (`~/.claude/settings.json`)

### Phase 2: hooks.ts 수정 (FR-001, FR-002, FR-004)
- [ ] T002 `src/core/hooks.ts` — `registerClaudeHook()` 수정: hooks.json 대신 settings.json의 `hooks.SessionStart` 배열에 등록, 기존 settings 내용 보존
- [ ] T003 `src/core/hooks.ts` — `syncHookRegistration()` 수정: settings.json 대상으로 hook 동기화

### Phase 3: Migration (FR-003)
- [ ] T004 `src/core/hooks.ts` — `migrateHooksJsonToSettings()` 함수 추가: hooks.json의 REAP SessionStart hook을 settings.json으로 이전 후 hooks.json에서 제거
- [ ] T005 `src/cli/commands/update.ts` — update 흐름에서 migration 호출 (syncHookRegistration 전에 실행)

### Phase 3b: update.ts 로그 메시지 수정
- [ ] T006 `src/cli/commands/update.ts` — result 메시지를 hooks.json → settings.json으로 변경

### Phase 4: reap.start.md backlog 스캔 (FR-005)
- [ ] T007 `src/templates/commands/reap.start.md` — Gate 이후, Step 1 이전에 backlog 스캔 단계 추가

### Phase 5: 테스트
- [ ] T008 기존 테스트 수정 + 새 테스트 추가 (hooks.ts migration 로직)
- [ ] T009 `bun test`, `bunx tsc --noEmit`, 빌드 검증

## Dependencies
- T001 → T002, T003, T004 (경로가 있어야 사용 가능)
- T004 → T005 (migration 함수가 있어야 호출 가능)
- T002, T003 → T006 (hooks.ts 수정 후 update.ts 메시지 변경)
- T007은 독립적 (템플릿 파일 수정)
- T008, T009는 모든 코드 변경 후
