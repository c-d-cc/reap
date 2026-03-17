# Planning

## Summary
프로젝트별로 복사하던 commands, templates, hooks를 user-level(`~/.claude/`)로 이전. session-start.sh는 패키지 내부 경로에서 직접 실행하되, cwd 기준으로 `.reap/`를 탐색하도록 변경. init/update에서 프로젝트 내 복사 로직 제거, 기존 잔여 파일 정리 로직 추가.

## Technical Context
- **Tech Stack**: TypeScript, Bun, Commander.js
- **Constraints**: `import.meta.dir` 기반 패키지 내부 경로 참조, `.reap/` 디렉토리는 init이 보장

## Tasks

### Phase 1: 경로 시스템 변경

- [ ] T001 `paths.ts` — 프로젝트 레벨 경로 제거 + user-level 경로 추가
  - 제거: `commands`, `templates`, `hooks`, `claudeCommands`, `claudeHooksJson`
  - 추가: `static userClaudeCommands` → `~/.claude/commands/`
  - 추가: `static userClaudeHooksJson` → `~/.claude/hooks.json`
  - 추가: `static packageTemplates()` → `import.meta.dir` 기반 패키지 내부 templates 경로

### Phase 2: init/update 변경

- [ ] T002 `init.ts` — 프로젝트 복사 제거 + user-level 설치
  - 제거: `.reap/commands/`, `.reap/templates/` mkdir 및 복사
  - 제거: `.claude/commands/` 복사
  - 추가: `~/.claude/commands/`에 slash commands 설치
  - 유지: genome 복사 (`.reap/genome/`), config 생성, 4-axis 디렉토리 생성
  - `.reap/hooks/` mkdir 제거

- [ ] T003 `update.ts` — 동기화 대상을 user-level로 변경
  - 제거: `.reap/commands/`, `.claude/commands/`, `.reap/templates/` 동기화
  - 추가: `~/.claude/commands/` 동기화
  - 유지: domain guide 동기화
  - 제거: `.reap/hooks/` 동기화
  - 추가: `~/.claude/hooks.json` 동기화
  - 추가: 기존 프로젝트 잔여 파일 정리 (`.reap/commands/`, `.reap/templates/`, `.reap/hooks/`, `.claude/commands/reap.*`)

### Phase 3: hooks 변경

- [ ] T004 `hooks.ts` — user-level hook 등록 + 패키지 경로 직접 실행
  - `REAP_HOOK_ENTRY.command`: `bash .reap/hooks/session-start.sh` → 패키지 내부 경로 `session-start.sh`
  - `installHookScripts()`: 프로젝트 `.reap/hooks/`에 복사 → 불필요, 제거 또는 no-op
  - `syncHookScripts()`: 프로젝트 `.reap/hooks/` 동기화 → 불필요, 제거 또는 no-op
  - `registerClaudeHook()`: 프로젝트 `.claude/hooks.json` → `~/.claude/hooks.json` 대상
  - hook 중복 검사 로직: `.reap/hooks/session-start` → 새 패키지 경로 기준

- [ ] T005 `session-start.sh` — cwd 기준 `.reap/` 탐색으로 변경
  - `PROJECT_ROOT` 결정: `BASH_SOURCE` 기반 → `pwd` (cwd) 기반
  - `GUIDE_FILE`: `.reap/hooks/reap-guide.md` → 패키지 내부 `reap-guide.md` (같은 디렉토리)
  - `CURRENT_YML`: cwd 기준 `.reap/life/current.yml`
  - `REAP_DIR` 체크: cwd 기준 `.reap/` 존재 확인

### Phase 4: 잔여 파일 정리

- [ ] T006 `update.ts`에 migration 로직 추가
  - 기존 프로젝트에서 `reap update` 실행 시:
    - `.reap/commands/` 디렉토리 삭제
    - `.reap/templates/` 디렉토리 삭제
    - `.reap/hooks/` 디렉토리 삭제
    - `.claude/commands/reap.*` 파일 삭제
    - `.claude/hooks.json` 내 `.reap/hooks/` 참조 hook 엔트리 제거
  - 삭제된 항목을 result.removed에 보고

### Phase 5: 타입/테스트 검증

- [ ] T007 타입체크 + 테스트
  - `~/.bun/bin/bunx tsc --noEmit` 통과 확인
  - `~/.bun/bin/bun test` 통과 확인 (테스트 파일 없으면 skip)
  - 수동 검증: `reap init` + `reap update` + `reap status` 동작 확인

## Dependencies
- T001: 독립
- T002, T003, T004: T001 완료 후 (경로 변경 의존)
- T005: T004와 병렬 가능
- T006: T003에 통합 또는 T003 완료 후
- T007: 전체 완료 후
