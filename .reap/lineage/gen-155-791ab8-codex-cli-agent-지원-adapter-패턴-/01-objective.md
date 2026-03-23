# Objective

## Goal

Codex CLI Agent 지원 + Adapter 패턴 강화. OpenAI Codex CLI를 새로운 AgentAdapter로 추가하고, 기존 하드코딩된 에이전트 경로들을 어댑터 패턴으로 정리한다.

## Completion Criteria

1. `CodexAdapter` 클래스가 `AgentAdapter` 인터페이스를 구현하며, detect/hook등록/commands설치/language읽기가 동작한다
2. `AgentName` 타입에 `"codex"` 추가, `ALL_ADAPTERS`에 등록
3. `destroy.ts`의 `.claude/` 하드코딩이 어댑터 기반으로 대체됨
4. `skills.ts`의 `.claude/skills/` 하드코딩이 어댑터 기반으로 대체됨 (또는 Claude-specific 로직임을 명시)
5. `postinstall.cjs`의 agentDirs 하드코딩이 어댑터 목록 기반으로 대체됨
6. `hooks.ts`의 deprecated 함수 3개 제거 또는 adapter 기반으로 전환
7. 단위 테스트: CodexAdapter의 주요 메서드 (detect, registerSessionHook, readLanguage)
8. `bun test` 전체 통과, `bunx tsc --noEmit` 통과

## Requirements

### Functional Requirements

1. **FR-01**: `CodexAdapter.detect()` — `which codex` 명령으로 Codex CLI 설치 여부 감지
2. **FR-02**: `CodexAdapter.registerSessionHook()` — `~/.codex/hooks.json`에 SessionStart hook 등록 (Claude Code의 hooks.json과 동일 형식)
3. **FR-03**: `CodexAdapter.syncSessionHook()` — 기존 hook이 있으면 업데이트, 없으면 등록
4. **FR-04**: `CodexAdapter.readLanguage()` — `~/.codex/config.toml`에서 language 설정 읽기 (또는 null)
5. **FR-05**: `CodexAdapter.installCommands()` — `~/.reap/commands/`에 원본 설치 (기존 패턴과 동일)
6. **FR-06**: `CodexAdapter.getCommandsDir()` — `~/.codex/commands/` 반환
7. **FR-07**: `CodexAdapter.setupAgentMd()` — `.codex/AGENTS.md`에 REAP 섹션 주입 (Claude Code의 setupClaudeMd 대응)
8. **FR-08**: `destroy.ts` — 어댑터별 cleanup 로직으로 리팩토링 (하드코딩 제거)
9. **FR-09**: `session-start.cjs` — Codex CLI에서도 동일한 출력 프로토콜 사용 (hookSpecificOutput.additionalContext). 기존 스크립트 재사용 가능
10. **FR-10**: `postinstall.cjs` — 어댑터 목록 기반 cleanup으로 리팩토링

### Non-Functional Requirements

1. **NFR-01**: 기존 Claude Code / OpenCode 어댑터 동작에 영향 없음 (회귀 방지)
2. **NFR-02**: Codex CLI 미설치 환경에서도 graceful failure (에러 없이 스킵)
3. **NFR-03**: Genome Immutability — constraints.md, source-map.md 변경은 backlog로 기록

## Design

### Approaches Considered

| Aspect | Approach A: Codex-only 추가 | Approach B: Adapter 패턴 강화 + Codex 추가 |
|--------|---------------------------|------------------------------------------|
| Summary | CodexAdapter만 새로 생성하고, 하드코딩은 그대로 | 하드코딩을 먼저 어댑터 패턴으로 정리한 후 Codex 추가 |
| Pros | 변경 범위 최소 | 향후 새 에이전트 추가 시 0-cost, 일관성 |
| Cons | 기술 부채 누적, destroy/skills/postinstall에 Codex 경로 또 하드코딩 | 변경 범위 넓음, 리팩토링 리스크 |
| Recommendation | - | **선택** |

### Selected Design

**Approach B: Adapter 패턴 강화 + Codex 추가**

#### 핵심 발견 사항: Codex CLI hooks 프로토콜

Codex CLI의 hooks engine 조사 결과, Claude Code와 **거의 동일한 프로토콜**을 사용한다:

- **Config 위치**: `~/.codex/hooks.json` (User 레벨), `.codex/hooks.json` (Project 레벨)
- **형식**: Claude Code의 hooks.json과 동일한 JSON 구조
  ```json
  {
    "hooks": {
      "SessionStart": [{
        "matcher": "",
        "hooks": [{ "type": "command", "command": "node /path/to/session-start.cjs" }]
      }]
    }
  }
  ```
- **출력 프로토콜**: Claude Code와 동일
  ```json
  { "hookSpecificOutput": { "hookEventName": "SessionStart", "additionalContext": "..." } }
  ```
- **Custom instructions**: `~/.codex/AGENTS.md` (글로벌), `.codex/AGENTS.md` (프로젝트)

이로 인해 기존 `session-start.cjs`를 **그대로 재사용**할 수 있다.

#### 구현 전략

1. **AgentAdapter 인터페이스 확장**
   - `setupClaudeMd?()` → `setupAgentMd?(projectRoot: string)` 로 일반화
   - `getProjectAgentDir?(projectRoot: string): string` 추가 (프로젝트 레벨 에이전트 디렉토리)
   - `cleanupProjectFiles?(projectRoot: string)` 추가 (destroy 시 사용)

2. **CodexAdapter 구현** (`src/core/agents/codex.ts`)
   - `~/.codex/` 기반 경로 체계
   - hooks.json 형식이 Claude Code와 동일하므로 공통 유틸 추출 가능
   - `setupAgentMd()`: `.codex/AGENTS.md`에 REAP 섹션 주입

3. **하드코딩 제거**
   - `destroy.ts`: `AgentRegistry.allAdapters()`로 각 어댑터의 `cleanupProjectFiles()` 호출
   - `skills.ts`: Claude-specific 로직임을 명시 (Codex는 AGENTS.md 방식)
   - `postinstall.cjs`: 어댑터 목록에서 commandsDir 동적 조회
   - `hooks.ts`: deprecated 함수 3개 제거 (이미 새 API로 전환 완료)
   - `session-start.cjs`: `.claude/skills/` 하드코딩 → 어댑터별 분기 (또는 Claude-specific 유지)

4. **session-start.cjs 전략**
   - Codex CLI도 동일한 hookSpecificOutput 프로토콜 → 기존 session-start.cjs를 그대로 사용
   - Codex의 hooks.json에서 같은 session-start.cjs를 가리키도록 등록
   - skills 설치 로직 (L31-L114)은 Claude Code 전용이므로, 어댑터 타입 감지로 분기하거나 별도 분리

### Design Approval History

- v1: 초기 설계 (brainstorming 결과 반영)

## Scope
- **Related Genome Areas**: constraints.md (에이전트 경로), source-map.md (Agent Adapters 테이블)
- **Expected Change Scope**:
  - 신규: `src/core/agents/codex.ts`
  - 수정: `src/types/index.ts`, `src/core/agents/index.ts`, `src/cli/commands/destroy.ts`, `src/core/skills.ts`, `src/core/hooks.ts`, `scripts/postinstall.cjs`, `src/templates/hooks/session-start.cjs`
  - 테스트: `tests/` 하위에 codex adapter 관련 테스트
- **Exclusions**:
  - Codex CLI E2E 테스트 (openshell 필요, 미설치 시 backlog로 연기)
  - session-start.cjs의 Codex 전용 skills 로직 (Codex는 AGENTS.md 방식이므로 불필요)

## Genome Reference

- `constraints.md` L21: "슬래시 커맨드, hook → AgentAdapter가 에이전트별 경로에 설치 (Claude Code: ~/.claude/, OpenCode: ~/.config/opencode/)"
- `source-map.md` L100-105: Agent Adapters 테이블
- `principles.md` ADR-004: "AgentAdapter 추상화 + 멀티 에이전트 지원"

## Backlog (Genome Modifications Discovered)

| Type | Target | Title | Description |
|------|--------|-------|-------------|
| genome-change | constraints.md | Codex CLI 경로 추가 | L21에 Codex: ~/.codex/ 추가 |
| genome-change | source-map.md | Codex adapter 추가 | Agent Adapters 테이블에 Codex 행 추가 |

## Background

### Codex CLI Hooks 조사 결과

- **GitHub PR #13276**: hooks engine 최초 구현 (2026-03-11, v0.114.0)
- **hooks.json 위치**: ConfigLayerStack에서 각 레이어의 config_folder에서 `hooks.json` 파일을 탐색
  - User 레벨: `~/.codex/hooks.json`
  - Project 레벨: `.codex/hooks.json`
- **SessionStart input**: `{ hook_event_name: "SessionStart", cwd, session_id, model, permission_mode, source, transcript_path }`
- **SessionStart output**: `{ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "..." }, continue: true }`
- **AGENTS.md**: `~/.codex/AGENTS.md` (글로벌), `.codex/AGENTS.md` (프로젝트). Codex가 세션 시작 시 자동 로드
- **config.toml**: `~/.codex/config.toml`에 모델/권한/MCP 서버 등 설정
- **slash commands**: Codex CLI에 별도 slash command 메커니즘이 있는지 불명확 → commands 경로는 `~/.codex/commands/`로 설정하되, 실제 Codex의 command 체계 확인 필요
