# Midterm Memory

## 현재 진행 중인 큰 작업

### Agent 실행 구조 (확정)
- reap-evolve.md = 정적 템플릿 (role, mindset, behavior rules)
- buildBasePrompt() = 동적 context만 (state, vision, memory, clarity, cruise)
- generation마다 새 agent 생성, cruise 포함
- cruise loop: parent가 관리하도록 변경 예정 (미구현)

### v0.15 기능 패리티
v0.15에 있었지만 v0.16에 아직 없는 것들:
- Agent adapter 시스템 (AgentRegistry) — vision §6, 당장 불필요
- ~~SessionStart knowledge injection~~ — gen-053에서 구현 완료 (`reap load-context`)

### Self-evolving 강화
gen-028~031에서 gap-driven evolution + vision eval + memory 도입 완료.
다음: vision evaluation을 실제로 활용하여 adapt phase 품질 향상 관찰.

## Embryo → Normal 전환

31+ generation 경과, genome 안정, abort 거의 없음. 전환 조건 충족.
유저 판단 (2026-03-26): REAP 자체가 아직 완성 단계가 아니고 예상치 못한 genome 변경이 더 있을 수 있으므로 embryo 유지. 배포 후 사용자 프로젝트였다면 전환 시점이지만, self-evolving 중인 REAP 자체는 조금 더 관찰.

## Evaluator Agent (2026-03-28 합의 + 템플릿 완료)
설계 문서: `vision/design/evaluator-agent.md`
템플릿: `src/templates/agents/reap-evaluate.md`
- nonce transition graph 리팩토링 완료 (gen-050)
- evaluator agent 템플릿 정의 완료 (gen-051)
- 다음: 코드 통합 (prompt.ts에 evaluator context 빌더, completion.ts에 호출 로직)

## Daemon Indexer (2026-03-29 구현 완료)
- `daemon/` 별도 앱, localhost:17224 HTTP API
- Tree-sitter WASM 15개 언어, 인메모리 그래프 + SQLite write-through
- 조회: 심볼 검색, caller/callee, blast radius, 커뮤니티, 실행 플로우
- CLI/lifecycle 통합, worktree별 인덱스 fork
- E2E 테스트 보강 완료 (gen-060): incremental, error-cases, worktree-diverge, idle-timeout
- 남은 작업: API 레벨 incremental indexing 지원, Phase 4 이후 MCP server wrapper (향후 확장)

## Knowledge Loading 정/동 분리 (gen-062, 2026-05-25 완료)

Issue #17 해결. Claude Code의 native `@` import 메커니즘 활용.
- Static knowledge(genome×3 + env summary + vision goals + memory×3 + reap-guide 9개)는 CLAUDE.md `@` ref로 Claude Code가 직접 import.
- Dynamic context(Current State + Strict Mode + Language 3개)만 SessionStart hook이 inject.
- migration은 gen-054 marker-hash sync infra가 자동 처리(추가 코드 0).
- 다음 단계 (Gen-N+1): `opencode-adapter.md` backlog를 source로 OpenCode 지원. 본 generation의 dynamic-only `buildKnowledgeContext()` 가 `reap dump-state` 의 기반이 됨.
- gen-054 marker sync infra의 가치 재확인: "template = single source of truth" 패턴이 dog-fooding 자동화 영역으로 확대 가능.

## OpenCode adapter + dispatcher 패턴 (gen-063, 2026-05-25 완료)

Issue #19 해결. claude-code 단독에서 멀티-client 구조로 전환.
- `src/adapters/{index,types}.ts` dispatcher + AdapterModule interface 신설. agentClient 기준 분기. codex는 helpful Error throw, unknown은 claude-code fallback.
- OpenCode adapter: opencode.json instructions/plugin sync(상수 리스트 + dedupe, 사용자 필드 보존), AGENTS.md marker-hash sync(CLAUDE.md와 동일 패턴), .opencode/plugins/reap-plugin.ts 배치.
- Plugin signature: `async ({ $, directory }) => { session.created, tool.execute.before }`. inline 타입으로 `@opencode-ai/plugin` 의존성 강제 X.
- `reap dump-state` CLI 신규: `--stdout`/`--silent`. emitOutput이 lifecycle 명령 종료 시 sync 버전(`dump-state-sync.ts`)으로 자동 dump (DUMP_COMMANDS 화이트리스트). sync와 async builder는 byte-identical 출력(unit test 보장).
- AGENTS.md 위치 = 프로젝트 루트 (OpenCode docs 재확인, `.opencode/AGENTS.md`는 비공식). 사용자 영역 marker로 보존.

### Slash commands 누락 — follow-up 필요

- gen-063 fitness 단계에서 발견: Claude Code의 `~/.claude/commands/*.md` slash commands가 OpenCode 환경에 자동 복사 안 됨. 사용자가 `/reap.start` 같은 슬래시 트리거 불가.
- 사용자가 follow-up backlog `opencode-slash-commands.md` (priority: high, dependsOn: opencode-adapter) 등록.
- 사용자 명시 목표: "다음 업데이트(v0.16.6 또는 v0.17.0) 받았을 때 OpenCode에서도 reap 사용 가능".
- **교훈 → genome 반영**: 새 client adapter는 4-항목 verification 필수 — (1) static load, (2) dynamic refresh, (3) entry-point, (4) **slash trigger 등록**. application.md "Adapter Layer" + evolution.md "사용자 UX gap" 절에 명문화.
- 다음 generation에서 OpenCode 환경 slash commands 등록 메커니즘 구현 후, 사용자가 OpenCode 환경에서 실사용 테스트 가능 — `aresstokrat` 사용자 feedback도 그때 요청.

## Lifecycle Termination Paths (gen-061, 2026-05-24 완료)

Issue #16 해결. 종료 경로가 abort/completion에서 abort/early-close/completion 셋으로 확장됨.
- early-close: lightweight 종료 (implementation/validation 한정). lineage에 `status: partial` + closeMeta 기록. fitness/adapt skip. 미완 task 자동 backlog 승계.
- abort confirm prompt + start scan phase에 사용자 인지 흐름 통합.
- agent behavior 가이드: 사용자가 "그만/중단/포기/스코프 축소" 의도 표명 시 세 선택지 자동 제시 (reap-guide.md 반영).
- 다음 단계 관찰: 실사용 시 reflect interactive prompt 품질, 자동 task 추출 적중률, deferred backlog → next gen 의 자연스러운 흐름.

## submodule 관련 반복 문제

tests/ submodule에서 commit phase마다 dirty check 이슈 반복.
gen-024에서 순서 교정(submodule check → archive)했으나, subagent가 submodule ref를 원복시키는 문제도 간헐적 발생.
근본 원인: subagent가 git 작업 시 submodule 상태를 의식하지 못함.
