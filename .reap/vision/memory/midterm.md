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

## Evaluator Agent — 점진 통합 트랙 (gen-051 ~ 진행 중)

설계 문서: `vision/design/evaluator-agent.md` (gen-066 에서 구현 상태 갱신)
템플릿: `src/templates/agents/reap-evaluate.md` (gen-051 정의)

진행 상태:
- ✅ nonce transition graph 리팩토링 (gen-050)
- ✅ evaluator agent 템플릿 정의 (gen-051)
- ✅ 설계 결정 확정 (gen-052: opt-in flag / advisor / 코드 통합 plan)
- ✅ **Validation 단계 코드 통합 (gen-066, Issue #20)** — `ReapConfig.evaluator?: boolean` + `buildEvaluatorPrompt({ stage })` + `validation.ts` 조건부 분기 + 양 adapter `installAgents` 양 caller. dog-fooding `.reap/config.yml: evaluator: true`.
- ⏳ Fitness 단계 통합 — backlog `cruise-mode-evaluator-escalation-통합-validationfitness.md` 신설 (gen-066). `buildEvaluatorPrompt({ stage: "fitness" })` 분기 이미 준비됨.
- ⏳ Cruise mode escalation 자동 중단 — 같은 backlog 에 묶임. state 채널 (`GenerationState.evaluatorConcerns?`) 설계 필요.
- ⏳ Vision/Goal 위임 — adapt phase evaluator 가 gap 분석 + goal 추천. 같은 backlog.

gen-066 의 메타 관찰: 본 트랙은 gen-051~052 의 abort 후 design 만 보존된 채로 14 generation 이 흐른 뒤 자연스럽게 이어졌음. **design 문서가 lineage 의 anchor 역할** — abort 가 진짜 abort 가 아니었음.

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

## OpenCode adapter — 멀티-client 트랙 (gen-063 + gen-064, 2026-05-25 완료)

Issue #19 해결. claude-code 단독에서 멀티-client 구조로 전환. **4-항목 verification (static load / dynamic refresh / entry-point / slash trigger) 전부 충족.**

### gen-063 — adapter 인프라
- `src/adapters/{index,types}.ts` dispatcher + AdapterModule interface 신설. agentClient 기준 분기. codex는 helpful Error throw, unknown은 claude-code fallback.
- OpenCode adapter: opencode.json instructions/plugin sync(상수 리스트 + dedupe, 사용자 필드 보존), AGENTS.md marker-hash sync(CLAUDE.md와 동일 패턴), .opencode/plugins/reap-plugin.ts 배치.
- Plugin signature: `async ({ $, directory }) => { session.created, tool.execute.before }`. inline 타입으로 `@opencode-ai/plugin` 의존성 강제 X.
- `reap dump-state` CLI 신규: `--stdout`/`--silent`. emitOutput이 lifecycle 명령 종료 시 sync 버전(`dump-state-sync.ts`)으로 자동 dump (DUMP_COMMANDS 화이트리스트). sync와 async builder는 byte-identical 출력(unit test 보장).
- AGENTS.md 위치 = 프로젝트 루트 (OpenCode docs 재확인, `.opencode/AGENTS.md`는 비공식). 사용자 영역 marker로 보존.

### gen-064 — slash commands 등록 (4-항목 verification 의 (4))
- `installSlashCommands(home?)` 함수 — cleanup-then-copy 파이프라인. target: `~/.config/opencode/commands/`. source: `src/adapters/claude-code/skills/` (재사용 — OpenCode 가 Claude Code skill 형식과 거의 100% 호환).
- prefix pattern `^reap\..+\.md$` — Claude Code adapter 의 검증된 `SKILL_PATTERN` 차용. `reap.` 접두사 reserved 정책 (README/AGENTS.md/reap-guide 명시). gen-061 reapdev 사고 와 동형 위험을 prefix anchor 로 정밀 회피.
- `integrity.ts` 의 `~/.config/opencode/commands/reap.*` legacy warning 절 제거. 그 위치가 이제 정상 install location.
- 단일 source 결정: Claude Code skills 19 파일을 OpenCode 도 그대로 사용. 향후 OpenCode 전용 frontmatter 필요 시 그 시점에 분리. dogfooding 부담 최소화.
- helper `claudeCodeSkillsDir()` — dist (`__dirname.includes("dist")`) 분기 필수: single-bundle 효과로 `dist/cli/__dirname/../adapters/claude-code/skills` 로 풀려야 함. 초기 작성 시 이 분기를 빠뜨려 e2e 가 0-install 로 잡아냄 → 같은 파일의 기존 `assetPath()` 패턴 참조하여 즉시 수정.

### 사용자 검증

gen-064 완료 후 사용자가 `agentClient: opencode` 전환 → `reap update` → `opencode` 실행 → `/reap.status` 호출. 그 결과가 fitness signal. agent 한계로 OpenCode 자체 실행 불가, 정적 산출물 검증만.

### `installSkills` vs `registerSessionIntegration` 책임 (gen-064 adapt 명문화)

application.md "Adapter Layer" 에 명문화된 새 원칙:
- `reap install-skills` (CLI + npm postinstall) → `installSkills` 호출 — 전체 install + emitOutput
- `reap update` (모든 project update) → `registerSessionIntegration` 호출 — silent 갱신
- **user-level assets (slash commands, agent definitions 등) 가 bundled REAP version 과 sync 되어야 한다면 양쪽 함수 모두 같은 silent helper 를 호출해야 함**
- 표준 패턴: helper 분리 (`installSlashCommands(home?)` for opencode, `installSlashCommandsOnly()` for claude-code) → `installSkills` 와 `registerSessionIntegration` 양쪽이 그 helper 호출

이 갭은 gen-061 reapdev 사고가 `reap update` 한 번에 자동 해소되지 못한 근본 원인이기도 했음. gen-064 fix 이후 양 adapter 모두 update 한 번에 stale `reap.*.md` 자동 cleanup.

향후 Codex adapter 추가 시 이 패턴 그대로 적용 — application.md 가 guide.

### 메타 교훈 — self-evolving 작동 사례

gen-063 fitness 직후 UX gap 발견 → backlog 화 → application.md 4-항목 verification 으로 추상화 (adapt phase) → gen-064 가 그 추상화로 1대1 매핑된 작업 수행. **backlog 가 사후-처치이지만, 그 처치의 결과가 다시 추상화 (4-항목 checklist) 가 되어 미래 재발을 방지**. 같은 패턴이 codex adapter 추가 시도 적용될 것.

gen-064 자체도 같은 패턴 — fitness 직전 사용자가 caller 갭 잡아냄 → back regression → fix + application.md 에 `installSkills` vs `registerSessionIntegration` 책임 표 추가. 두 단계 추상화 누적.

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
