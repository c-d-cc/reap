# Objective

## Goal
Codex CLI 커스텀 명령어 설치 경로를 `~/.codex/commands/`에서 `~/.codex/prompts/`로 수정한다. Codex CLI 공식 문서에 따르면 커스텀 프롬프트 경로는 `~/.codex/prompts/`이다.

## Completion Criteria
1. `CodexAdapter.commandsDir` getter가 `~/.codex/prompts/`를 반환한다
2. `CodexAdapter.removeStaleCommands()`가 `~/.codex/prompts/` 디렉토리에서 정리한다
3. `postinstall.cjs`의 cleanup 대상에서 `~/.codex/commands/`가 `~/.codex/prompts/`로 변경된다
4. 테스트가 변경된 경로를 검증한다
5. 기존 테스트가 모두 통과한다

## Requirements

### Functional Requirements
1. `src/core/agents/codex.ts`의 `commandsDir` getter: `commands` -> `prompts`
2. `scripts/postinstall.cjs`의 `~/.codex/commands/` -> `~/.codex/prompts/`
3. `tests/core/agents/codex.test.ts`의 경로 검증 업데이트

### Non-Functional Requirements
1. 기존 동작 호환성 유지 (경로만 변경, 로직 변경 없음)

## Design

### Approaches Considered

| Aspect | 단순 경로 변경 |
|--------|---------------|
| Summary | 3개 파일에서 `commands` -> `prompts` 문자열만 교체 |
| Pros | 최소 변경, 명확한 범위, 리스크 없음 |
| Cons | 없음 |
| Recommendation | 채택 |

### Selected Design
단순 경로 변경. `commandsDir` getter의 경로 세그먼트만 `commands`에서 `prompts`로 수정.

### Design Approval History
- 2026-03-23: backlog에서 범위 확정, 단순 경로 변경으로 진행

## Scope
- **Related Genome Areas**: ADR-004 (AgentAdapter 추상화)
- **Expected Change Scope**: `src/core/agents/codex.ts`, `scripts/postinstall.cjs`, `tests/core/agents/codex.test.ts`
- **Exclusions**: 다른 에이전트(Claude, OpenCode) 경로는 변경하지 않음

## Genome Reference
- `constraints.md`: AgentAdapter가 에이전트별 경로에 설치
- `source-map.md`: `src/core/agents/` — 에이전트별 어댑터

## Backlog (Genome Modifications Discovered)
None

## Background
Codex CLI 공식 문서(https://developers.openai.com/codex/custom-prompts)에 따르면 커스텀 명령어는 `~/.codex/prompts/`에 저장해야 한다. 현재 코드는 잘못된 경로인 `~/.codex/commands/`를 사용하고 있다.
