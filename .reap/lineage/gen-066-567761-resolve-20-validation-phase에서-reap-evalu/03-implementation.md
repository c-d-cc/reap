# Implementation Log

## Completed Tasks

| # | Task | Status | Notes |
|---|---|---|---|
| T001 | `src/types/index.ts` — `ReapConfig.evaluator?: boolean` | done | 옵셔널 필드 + 5줄 주석 (advisor mode, opt-in, default false). 기존 `cruiseCount?: string` 패턴과 동일 위치/스타일. |
| T002 | `src/core/prompt.ts` — `buildEvaluatorPrompt()` | done | `EvaluatorPromptOptions` interface (stage: validation/fitness) + 함수 export. 섹션: invocation header / Current Generation / Artifacts to Read (normal/merge 분기) / Vision Goals / Memory / Verification Tasks (stage별 분기) / Output Format (escalation matrix 표 인용) / HARD-GATE (no code/git/reap-run, no quantitative, advisor) / Fallback / Project Path. |
| T003 | `src/cli/commands/run/validation.ts` — config 분기 + evaluator 절 | done | YAML config 읽기 (`completion.ts` 와 동일 패턴). `basePromptLines` 추출 → byte-identical 회귀 보장. `evaluator: true` 일 때만 절 + `context.evaluator.prompt` 추가. `context.evaluator.enabled` 는 항상 emit. |
| T004 | `src/adapters/claude-code/install.ts` + index.ts — `installAgents` 양 caller | done | `AGENT_PATTERN = /^reap-.+\.md$/` prefix anchor 신설. silent helper `installAgents(home = homedir())` export. `agentsTemplateDir()` dist/dev 분기 helper. adapter index 의 `registerSessionIntegration` 에서도 호출. |
| T005 | `src/adapters/opencode/install.ts` — `installAgents(home?)` 신설 + 양 caller | done | target = `~/.config/opencode/agent/` (singular, OpenCode TUI tip 공식). `AGENT_PATTERN = /^reap-.+\.md$/` (slash-command 의 SLASH_COMMAND_PATTERN 과 별개, hyphen 사용). source = REAP `src/templates/agents/` (dist 분기). `installSkills` 의 emitOutput 에 agents 항목 추가 + `registerSessionIntegration` 에서도 호출. |
| T006 | `tests/unit/evaluator-prompt.test.ts` 신설 | done | 10 case (planned 6 → 추가 4): validation framing/current generation block/HARD-GATE/fallback/escalation matrix (5) + fitness stage/merge artifacts/empty memory/empty visionGoals/null state (5). all pass. |
| T007 | `tests/e2e/validation-evaluator.test.ts` 신설 | done | 3 case: evaluator:false → 절 absent + context.evaluator.enabled=false, evaluator:true → 절 + context.evaluator.prompt 존재, evaluator field absent → false 와 동일. test 3 의 첫 시도가 nonce 소비 후 config 제거 race 로 fail → "field absent" semantic 으로 수정. all pass. |
| T008 | `tests/e2e/install-agents.test.ts` 신설 | done | 6 case (planned 4 → 추가 2 prefix-anchor 보호): Claude Code install-skills/update + OpenCode install-skills/update + 양 adapter 사용자 agent 파일 보존 검증. fakeHome sandbox 패턴. all pass. |
| T009 | `.reap/config.yml` — `evaluator: true` 추가 | done | dog-fooding 시작. 본 generation 의 validation 단계가 self-test (T014). |
| T010 | `.reap/vision/design/evaluator-agent.md` 진행 상태 갱신 | done | 헤더 status 갱신, "구현 상태 — Validation 통합 완료 (gen-066)" 신설 + 4 결정 항목 + 구현 모듈 + 테스트 인용. "후속 작업 (미구현)" 절은 fitness/cruise/vision 위임 3 항목 + 모두 새 backlog (cruise-mode-evaluator-escalation-통합-validationfitness.md) 참조로 통합. |
| T011 | `README.md` — "Evaluator Agent (opt-in)" 절 + Configuration 보강 | done | Agent Integration 섹션 안에 sub-section 신설 (advisor 모델 / opt-in / 동작 / fallback / agent install 위치 / 후속 backlog 안내). Configuration 의 yaml 예시에 `# evaluator: true` 주석 + Key settings 의 마지막 항목 추가. |
| T012 | `src/templates/reap-guide.md` + `.reap/reap-guide.md` — Evaluator agent 1 줄 안내 | done | 두 파일 모두 "Evaluator agent (opt-in)" 절을 "AI Client Support" 표 직후에 동일 본문으로 추가 (단일 source of truth 유지, gen-065 dog-fooding 패턴). |

## Discovered Issues

### Pre-existing e2e fail confirmed not regression
- `tests/e2e/init-repair.test.ts > skips when REAP section already present` — gen-064 + gen-065 fitness 에서 이미 인지된 pre-existing fail. gen-065: 198 pass / 1 fail. gen-066: 207 pass / 1 fail (= +9 신규 — 3 validation-evaluator + 6 install-agents). 회귀 아님.

### `setEvaluator` 의 nonce 소비 race (planning 추측 → 실증)
- T007 의 처음 작성한 case 3 ("config 파일 없을 때 false 와 동일 동작") 이 fail. 원인: advanceToValidation 후 config 제거 → validation work 재호출 시 entry nonce 이미 소비됨 → "Invalid transition" error.
- 수정: case 3 semantic 을 "evaluator field 가 처음부터 없을 때" 로 변경. init 직후 config 에 evaluator field 없는 상태로 validation 진입 → byte-identical 회귀 검증. 더 자연스러운 시나리오.

## Deferred Items

(none — backlog `cruise-mode-evaluator-escalation-통합-validationfitness.md` 가 fitness/cruise/vision 위임 모두 묶음)

## Architecture Decisions

### Why `loadReapKnowledge` 재사용 (not duplicate file reads in validation.ts)

`validation.ts` 가 evaluator 옵트인 분기에서 `loadReapKnowledge(paths)` 를 호출 — 이는 vision/goals.md + memory shortterm/midterm 만 읽는 작은 helper. 새 helper 만들지 않음. `buildEvaluatorPrompt` 가 `ReapKnowledge` 를 받는 시그니처라서 자연스럽게 매칭.

### Prefix anchor pattern 의 hyphen vs dot 비대칭

- 슬래시 커맨드: `reap.<name>.md` (dot)
- 에이전트 정의: `reap-<name>.md` (hyphen)

각 frontmatter 의 `name` 필드를 그대로 따랐기 때문 — `reap-evaluate.md` 의 `name: reap-evaluate`, `reap.evolve.md` 의 slash command name `/reap.evolve`. 비대칭이지만 의도된 명명. AGENT_PATTERN 과 SLASH_COMMAND_PATTERN 둘 다 prefix-anchored 이므로 cleanup 시 사용자 파일 안전.

### `installAgents` 의 caller 양쪽 보장 (gen-064 longterm 적용)

gen-064 의 핵심 교훈: "user-level 자산은 `installSkills` (full install) + `registerSessionIntegration` (silent update) 양쪽에서 호출되어야 `reap update` 만으로도 sync". 본 generation 의 agent 정의 install 은 같은 패턴 1:1 적용. e2e T008 의 (b)(d) 케이스가 이를 verification.

### Claude Code 의 `agents/` (plural) vs OpenCode 의 `agent/` (singular)

upstream tool 의 컨벤션을 따랐다. Claude Code → `~/.claude/agents/` (plural), OpenCode → `~/.config/opencode/agent/` (singular). REAP 가 통일하려고 시도하지 않음 — 두 tool 의 자체 docs/source 가 그렇게 정의함.
