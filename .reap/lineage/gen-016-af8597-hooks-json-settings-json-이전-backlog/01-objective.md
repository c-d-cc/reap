# Objective

## Goal
SessionStart hook 등록을 hooks.json → settings.json으로 이전 + /reap.start에 backlog 스캔 단계 추가

## Completion Criteria
1. `registerClaudeHook()`가 `~/.claude/settings.json`의 `hooks` 섹션에 SessionStart hook을 등록한다
2. `syncHookRegistration()`도 동일하게 settings.json 대상으로 동작한다
3. hooks.json에 등록된 기존 REAP hook이 settings.json으로 migration 된다
4. settings.json의 기존 내용(permissions, plugins 등)이 보존된다
5. `reap.start.md` 슬래시 커맨드가 `.reap/life/backlog/` 스캔 후 항목을 제시한다
6. `bun test` 통과, `bunx tsc --noEmit` 통과, 빌드 성공

## Requirements

### Functional Requirements
- FR-001: `registerClaudeHook()` — settings.json의 hooks.SessionStart 배열에 hook 등록
- FR-002: `syncHookRegistration()` — settings.json 기반으로 hook 동기화
- FR-003: hooks.json → settings.json migration — 기존 REAP hook 항목을 settings.json으로 이전 후 hooks.json에서 제거
- FR-004: settings.json 보존 — 기존 permissions, plugins 등 다른 섹션 유지
- FR-005: `reap.start.md` — Step 1 이전에 backlog 스캔 단계 추가, 항목이 있으면 목록 제시

### Non-Functional Requirements
- settings.json 읽기/쓰기 시 파일이 없으면 빈 객체로 생성
- hooks.json이 없거나 REAP hook이 없으면 migration skip

## Scope
- **Related Genome Areas**: domain/hook-system.md, conventions.md (Template Conventions 섹션)
- **Expected Change Scope**: src/core/hooks.ts, src/cli/commands/update.ts, src/templates/commands/reap.start.md
- **Exclusions**: REAP config.yml의 lifecycle hook 시스템은 변경하지 않음 (이건 별개 시스템)

## Genome Reference
- domain/hook-system.md: SessionStart Hook은 Claude Code hooks.json에 등록 → settings.json으로 변경 필요
- conventions.md: "Hook 스크립트: ~/.claude/hooks.json에 등록" → settings.json으로 갱신 필요 (Completion에서)

## Backlog (Genome Modifications Discovered)
- conventions.md 36줄 "hooks.json에 등록" → "settings.json에 등록" 으로 변경 필요
- domain/hook-system.md의 SessionStart Hook 섹션 업데이트 필요

## Background
- hooks.json에 등록된 hook의 `additionalContext`가 전달되지 않는 알려진 버그 존재 (GitHub #16538, #9591)
- settings.json에 직접 등록하면 정상 동작
- /reap.start가 backlog를 확인하지 않아 기존 항목을 무시하는 문제 발견 (gen-016 시작 시 체감)
