---
type: task
status: pending
priority: high
---

# Codex CLI 커맨드 설치 경로 수정

## 현황
- 현재: `~/.codex/commands/`에 설치 (잘못된 경로)
- 정확한 경로: `~/.codex/prompts/` (Codex CLI 공식 커스텀 명령어 경로)
- Codex CLI는 프로젝트 레벨 커맨드 디렉토리가 없음 — user-level only

## 수정 범위
- `src/core/agents/codex.ts` — `commandsDir` getter: `commands` → `prompts`
- `scripts/postinstall.cjs` — `~/.codex/commands/` → `~/.codex/prompts/`
- `tests/core/agents/codex.test.ts` — 경로 관련 테스트 업데이트

## 참고
- Codex CLI 공식 문서: https://developers.openai.com/codex/custom-prompts
- 프로젝트 레벨 지시는 `AGENTS.md`를 통해 처리 (이미 `setupAgentMd`에서 구현됨)
