# Planning

## Summary

Codex CLI를 새 AgentAdapter로 추가하고, 기존 하드코딩된 에이전트 경로들을 어댑터 패턴으로 정리한다. Codex CLI의 hooks.json 프로토콜이 Claude Code와 동일하므로, session-start.cjs를 그대로 재사용한다.

## Technical Context
- **Tech Stack**: TypeScript 5.x, Node.js >=18, Commander.js, YAML
- **Constraints**: fs.ts 유틸 경유, 외부 서비스 의존 없음, AgentAdapter 패턴 준수
- **핵심 발견**: Codex CLI hooks.json 형식 = Claude Code hooks.json 형식 (동일 프로토콜)

## Tasks

### Phase 1: AgentAdapter 인터페이스 확장 + 타입

- [x] T001 `src/types/index.ts` -- AgentName에 "codex" 추가. setupClaudeMd를 setupAgentMd로 일반화. cleanupProjectFiles 메서드 추가
- [x] T002 `src/core/agents/claude-code.ts` -- setupClaudeMd → setupAgentMd 메서드명 변경. cleanupProjectFiles 구현 (destroy에서 쓸 로직)

### Phase 2: CodexAdapter 구현

- [x] T003 `src/core/agents/codex.ts` -- CodexAdapter 클래스 신규 생성. detect (which codex), getCommandsDir (~/.codex/commands/), installCommands, removeStaleCommands, registerSessionHook (~/.codex/hooks.json), syncSessionHook, readLanguage (~/.codex/config.toml), setupAgentMd (.codex/AGENTS.md)
- [x] T004 `src/core/agents/index.ts` -- ALL_ADAPTERS에 CodexAdapter 등록

### Phase 3: 하드코딩 제거 (어댑터 패턴 강화)

- [x] T005 `src/cli/commands/destroy.ts` -- .claude/ 하드코딩 제거. AgentRegistry.allAdapters()로 각 어댑터의 cleanupProjectFiles() 호출로 대체
- [x] T006 `src/core/skills.ts` -- .claude/skills/ 하드코딩에 주석으로 Claude-specific 로직임을 명시 (Codex는 AGENTS.md 방식이므로 skills 불필요)
- [x] T007 `src/core/hooks.ts` -- deprecated 함수 3개 (registerClaudeHook, syncHookRegistration, migrateHooksJsonToSettings) 제거
- [x] T008 `scripts/postinstall.cjs` -- agentDirs 하드코딩을 agent config 배열로 대체 (Codex ~/.codex/commands/ 추가)
- [x] T009 `src/cli/commands/init.ts` -- setupClaudeMd → setupAgentMd 호출 변경
- [x] T010 `src/cli/commands/update.ts` -- setupClaudeMd → setupAgentMd 호출 변경

### Phase 4: session-start.cjs 정리

- [x] T011 `src/templates/hooks/session-start.cjs` -- .claude/skills/ 하드코딩에 주석 추가 (Claude Code 전용 로직). Codex는 동일 session-start.cjs를 사용하므로 출력 프로토콜 변경 불필요

### Phase 5: deprecated 경로 정리

- [x] T012 `src/core/paths.ts` -- deprecated 경로 getter에 @deprecated JSDoc 유지 확인 (이미 적용됨). 추가 정리 불필요

### Phase 6: 테스트

- [x] T013 `tests/core/agents/codex.test.ts` -- CodexAdapter 단위 테스트 (detect, registerSessionHook, syncSessionHook, readLanguage, setupAgentMd, cleanupProjectFiles)
- [x] T014 `tests/core/hooks.test.ts` -- deprecated 함수 제거 후 기존 테스트 업데이트
- [x] T015 전체 검증 -- `bunx tsc --noEmit` + `bun test` 통과 확인

## Dependencies

```
T001 → T002, T003
T003 → T004
T001, T002 → T005, T006, T007, T008, T009, T010
T004 → T005, T008
T011 독립
T012 독립
T013 → T003, T004
T014 → T007
T015 → all
```

## 구현 세부사항

### T001: AgentAdapter 인터페이스 변경

```typescript
// AgentName 확장
export type AgentName = "claude-code" | "opencode" | "codex";

// setupClaudeMd → setupAgentMd로 일반화
setupAgentMd?(projectRoot: string): Promise<{ action: "created" | "updated" | "skipped" }>;

// destroy용 cleanup 메서드 추가
cleanupProjectFiles?(projectRoot: string): Promise<{ removed: string[]; skipped: string[] }>;
```

### T003: CodexAdapter 핵심 설계

- **경로 체계**: `~/.codex/` (userDir), `~/.codex/commands/` (commandsDir), `~/.codex/hooks.json` (hooksJsonPath), `~/.codex/config.toml` (configPath)
- **hooks.json 형식**: Claude Code와 동일 (`{ hooks: { SessionStart: [{ matcher: "", hooks: [{ type: "command", command: "..." }] }] } }`)
  - 주의: Claude Code의 hooks.json은 `{ SessionStart: [...] }` 형식이고, Codex의 hooks.json은 `{ hooks: { SessionStart: [...] } }` 형식으로 상위 `hooks` 키가 추가됨
- **readLanguage**: `~/.codex/config.toml` 파싱 (TOML에서 language 필드 읽기). TOML 라이브러리 없이 간단한 regex 파싱 (`/^language\s*=\s*"([^"]+)"/m`)
- **setupAgentMd**: `.codex/AGENTS.md`에 REAP 섹션 주입 (Claude Code의 CLAUDE.md 패턴과 동일)

### T005: destroy.ts 리팩토링

기존: `.claude/commands/`, `.claude/skills/`, `.claude/CLAUDE.md` 하드코딩
변경: `AgentRegistry.allAdapters()`를 순회하며 각 어댑터의 `cleanupProjectFiles(projectRoot)` 호출

### T008: postinstall.cjs 리팩토링

기존: `agentDirs = [~/.claude/commands/, ~/.config/opencode/commands/]` 하드코딩
변경: 에이전트 config 배열에 `{ name, commandsDir }` 형태로 정의. Codex 경로 추가
(postinstall은 CJS이므로 AgentAdapter 클래스 직접 사용 불가 → 경로 목록을 config 상수로 유지)

## E2E 테스트 시나리오

E2E 테스트는 openshell 필요. 미설치 시 backlog로 연기.

| 시나리오 | Setup | Action | Assertion |
|---------|-------|--------|-----------|
| Codex adapter detection | Codex CLI 설치된 환경 | `reap init myproject` | Codex adapter 감지됨 |
| Session hook registration | init 후 | `~/.codex/hooks.json` 확인 | SessionStart hook 등록됨 |
| Regression: Claude Code | Claude Code 설치된 환경 | `reap init myproject` | 기존 Claude Code 어댑터 정상 동작 |
