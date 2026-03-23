# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/types/index.ts` — AgentName에 "codex" 추가, setupAgentMd/cleanupProjectFiles 메서드 추가 | Yes |
| T002 | `src/core/agents/claude-code.ts` — setupAgentMd(delegate), cleanupProjectFiles 구현 | Yes |
| T003 | `src/core/agents/codex.ts` — CodexAdapter 신규 구현 (detect, hooks.json, config.toml, AGENTS.md) | Yes |
| T004 | `src/core/agents/index.ts` — ALL_ADAPTERS에 CodexAdapter 등록 | Yes |
| T005 | `src/cli/commands/destroy.ts` — 하드코딩 제거, adapter.cleanupProjectFiles() 기반으로 리팩토링 | Yes |
| T006 | `src/core/skills.ts` — Claude Code-specific 주석 추가 | Yes |
| T007 | `src/core/hooks.ts` — deprecated 함수 3개 제거, 미사용 import 정리 | Yes |
| T008 | `scripts/postinstall.cjs` — agentDirs에 ~/.codex/commands/ 추가 | Yes |
| T009 | `src/cli/commands/init.ts` — setupClaudeMd → setupAgentMd 전환 | Yes |
| T010 | `src/cli/commands/update.ts` — setupClaudeMd → setupAgentMd 전환 | Yes |
| T011 | `src/templates/hooks/session-start.cjs` — Claude Code-specific 주석 추가 | Yes |
| T012 | `src/core/paths.ts` — 확인 완료 (이미 @deprecated 적용됨) | Yes |
| T013 | `tests/core/agents/codex.test.ts` — CodexAdapter 단위 테스트 7개 | Yes |
| T014 | `tests/core/hooks.test.ts` — deprecated 함수 참조 없음, 변경 불필요 | Yes |
| T015 | 전체 검증 — `bunx tsc --noEmit` 통과, `bun test` 619/619 통과 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| (completion에서 적용) | constraints.md | L21에 Codex: ~/.codex/ 추가 |
| (completion에서 적용) | source-map.md | Agent Adapters 테이블에 Codex 행 추가 |

## Implementation Notes

### 핵심 설계 결정

1. **Codex hooks.json 형식 차이**: Claude Code의 settings.json은 `{ hooks: { SessionStart: [...] } }` 형태지만, Codex CLI의 hooks.json은 `{ hooks: { SessionStart: [...] } }` 형태로 상위에 `hooks` 키가 있음. CodexAdapter에서 이 구조를 올바르게 처리함.

2. **session-start.cjs 재사용**: Codex CLI의 SessionStart 출력 프로토콜이 Claude Code와 동일(`hookSpecificOutput.additionalContext`)하므로, 기존 session-start.cjs를 그대로 재사용. 새 템플릿 불필요.

3. **setupClaudeMd → setupAgentMd 일반화**: 기존 `setupClaudeMd`는 `@deprecated`로 유지하고, 새 `setupAgentMd`를 인터페이스에 추가. ClaudeCodeAdapter는 `setupAgentMd`가 `setupClaudeMd`를 delegate.

4. **destroy.ts 리팩토링**: `.claude/` 관련 3개 하드코딩된 cleanup 함수(`removeGlobFiles`, `removeGlobDirs`, `cleanClaudeMd`)를 삭제하고, `adapter.cleanupProjectFiles(projectRoot)`로 대체. 각 어댑터가 자신의 프로젝트 파일 cleanup을 담당.

5. **readLanguage**: Codex CLI는 TOML 기반 config (`~/.codex/config.toml`). TOML 라이브러리 의존성 추가 없이 regex 파싱으로 처리.
