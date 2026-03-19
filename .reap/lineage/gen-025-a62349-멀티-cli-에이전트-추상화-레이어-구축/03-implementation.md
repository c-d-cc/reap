# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/types/index.ts` — `AgentAdapter` 인터페이스, `AgentName` 타입, `ReapConfig.agents/language/autoUpdate` 필드 추가 | ✅ |
| T002 | `src/core/agents/index.ts` — `AgentRegistry` 클래스 (감지, 목록, config 오버라이드) | ✅ |
| T003 | `src/core/agents/claude-code.ts` — `ClaudeCodeAdapter` (기존 hooks.ts 로직 이관) | ✅ |
| T004 | `src/core/agents/opencode.ts` — `OpenCodeAdapter` (커맨드, 플러그인 훅, TUI 설정, KV store 기본값) | ✅ |
| T005 | `src/templates/hooks/opencode-session-start.js` — OpenCode 플러그인 (session.start 훅, language, autoUpdate) | ✅ |
| T006 | `src/core/hooks.ts` — 어댑터 위임으로 리팩토링 + 하위 호환 함수 유지 | ✅ |
| T007 | `src/core/paths.ts` — Claude Code 전용 static 경로 deprecated 마킹 | ✅ |
| T008 | `src/cli/commands/init.ts` — `AgentRegistry.detectInstalled()`로 멀티 에이전트 설치, 13개 커맨드 | ✅ |
| T009 | `src/cli/commands/update.ts` — 멀티 에이전트 동기화 | ✅ |
| T010 | `src/cli/index.ts` — help language 감지를 어댑터 순회로 변경, init 결과 에이전트 표시 | ✅ |
| T011 | `scripts/build.js` — OpenCode 플러그인 dist 포함 확인 | ✅ |
| T012 | `package.json` — 버전 0.2.0 범프, author 실명 변경 | ✅ |
| T013 | `tests/core/agents/registry.test.ts` — AgentRegistry 테스트 | ✅ |
| T014 | `tests/core/agents/claude-code.test.ts` — ClaudeCodeAdapter 테스트 | ✅ |
| T015 | `tests/core/agents/opencode.test.ts` — OpenCodeAdapter 테스트 | ✅ |
| T016 | 기존 테스트 업데이트 (update.test.ts 라벨 형식 변경) | ✅ |

## Additional Tasks (테스트 중 추가)
| Task | Description | Completed |
|------|-------------|-----------|
| T017 | `.github/workflows/release.yml` — RELEASE_NOTES.md 지원 | ✅ |
| T018 | `.reap/config.yml` — onGenerationComplete hook에 릴리스 노트 자동생성 prompt 추가 | ✅ |
| T019 | OpenCode TUI 자동 설정 — `tui.json` 키바인드 + `kv.json` 기본 visibility | ✅ |
| T020 | config.yml `language` 필드 → OpenCode 플러그인에서 시스템 프롬프트에 주입 | ✅ |
| T021 | `reap.help.md` — topic 시스템 개선 (명시적 목록, anti-hallucination, author 토픽 등) | ✅ |
| T022 | `reap.status.md` — 버전 표시, config 설정 표시, anti-hallucination | ✅ |
| T023 | `reap.update.md` — 신규 슬래시 커맨드 (버전 확인 + npm 업그레이드) | ✅ |
| T024 | `session-start.sh` + `opencode-session-start.js` — autoUpdate 지원 + 알림 메시지 | ✅ |

## Deferred Tasks
없음

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| genome-adr004-multi-agent.md | genome/principles.md | ADR-004 멀티 에이전트 추상화로 변경 |
| genome-constraints-multi-agent.md | genome/constraints.md | Claude Code 하드코딩 제거 |
| genome-conventions-multi-agent.md | genome/conventions.md | Template Conventions 멀티 에이전트 반영 |
| genome-release-notes.md | genome/conventions.md | Release Conventions에 RELEASE_NOTES.md 워크플로우 추가 |
| genome-slash-commands-13.md | genome/constraints.md | Slash Commands 12개 → 13개 |

## Implementation Notes
- 계획 16개 태스크 + 테스트 중 추가 8개 = 총 24개 태스크 완료
- OpenCode 테스트 과정에서 다수 UX 개선 발견 및 반영 (language, TUI 설정, help topic, anti-hallucination 등)
- 검증: `bunx tsc --noEmit` 통과, `bun test` 77개 통과, `npm run build` 성공
