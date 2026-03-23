---
type: task
status: pending
priority: high
---

# Codex CLI Agent 지원 + Adapter 패턴 강화

## 목표

OpenAI Codex CLI를 새 AgentAdapter로 추가하고, 향후 agent 추가가 쉽도록 adapter 패턴을 완전하게 정비한다.

## 현재 상태 분석

### AgentAdapter 인터페이스 (src/types/index.ts)
- `AgentName` 타입이 `"claude-code" | "opencode"` 리터럴 유니온 — 확장 시 타입 수정 필요
- 인터페이스 메서드: detect, getCommandsDir, installCommands, removeStaleCommands, registerSessionHook, syncSessionHook, readLanguage + optional: migrate, cleanupLegacyCommands, setupClaudeMd

### Agent별 분기 포인트 (하드코딩 위험 지점)

| 파일 | 위치 | 문제 |
|------|------|------|
| `src/core/agents/index.ts` | ALL_ADAPTERS 배열 | 새 agent 추가 시 수동 등록 필요 |
| `src/cli/commands/destroy.ts` | L44-51 | `.claude/` 하드코딩, agent loop 없음 |
| `src/core/skills.ts` | L19 | `.claude/skills/` 하드코딩 |
| `src/core/paths.ts` | deprecated getters | Claude 전용 경로 getter 잔존 |
| `src/core/hooks.ts` | L68,78,88 | deprecated 함수에서 ClaudeCodeAdapter 직접 인스턴스화 |
| `scripts/postinstall.cjs` | L40-43 | agentDirs 하드코딩 |
| `src/templates/hooks/session-start.cjs` | L31-35, 76-81 | `.claude/skills/` 하드코딩 |

### 세션 훅 아키텍처 차이
- **Claude Code**: `~/.claude/settings.json` hooks.SessionStart → `node ~/.reap/hooks/session-start.cjs`
- **OpenCode**: `~/.config/opencode/plugins/reap-session-start.js` plugin API
- **Codex CLI**: 조사 필요 — session hook / plugin 메커니즘 확인

### OpenShell 연동
- OpenShell이 세 agent 모두 sandbox로 지원: `openshell sandbox create -- claude|opencode|codex`
- API key 자동 감지 (ANTHROPIC_API_KEY, OPENAI_API_KEY)
- E2E 테스트 시 OpenShell sandbox에서 Codex 동작 검증 가능

## 작업 범위

1. **Adapter 패턴 정비**: AgentName을 string union에서 확장 가능 구조로, destroy.ts/skills.ts/postinstall.cjs의 하드코딩 제거
2. **CodexAdapter 구현**: detect, hook 등록, commands 설치, language 읽기
3. **Codex용 세션 훅 템플릿**: `src/templates/hooks/codex-session-start.*`
4. **테스트**: 모든 지원 agent(Claude Code, OpenCode, Codex)를 대상으로 검증
   - **단위 테스트**: 각 adapter의 detect/install/hook/language 메서드, registry의 detectInstalled/getActiveAdapters
   - **E2E 테스트**: OpenShell sandbox에서 agent별로 init → start → evolve → completion 전체 흐름 검증 (`openshell sandbox create -- claude|opencode|codex`)
   - **새 agent 추가 시** 기존 agent 테스트가 깨지지 않는지 회귀 테스트 포함
5. **Environment docs 추가**: `.reap/environment/docs/ai-agents.md` — 지원 agent별 상세 정보 정리
   - 각 agent의 CLI 명령어, 설정 경로, hook 메커니즘, plugin 구조
   - session hook 아키텍처 비교 (settings.json vs plugin API vs Codex 방식)
   - agent별 프로젝트 레벨 설정 (CLAUDE.md, skills/ 등)
   - OpenShell sandbox 연동 방법 (`openshell sandbox create -- claude|opencode|codex`)
   - 새 agent 추가 시 참조할 수 있는 체크리스트
6. **Genome 업데이트**: constraints.md, source-map.md에 Codex 반영
