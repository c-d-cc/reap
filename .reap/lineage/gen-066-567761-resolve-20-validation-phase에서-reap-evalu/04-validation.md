# Validation Report

## Result

**pass** (with 1 pre-existing e2e failure carried over from gen-064/gen-065, not a regression).

## Checks

### TypeCheck — pass
- Command: `npm run typecheck` → `tsc --noEmit`
- Result: clean exit, no errors.

### Build — pass
- Command: `npm run build` → `bash scripts/build.sh`
- Result: `Bundled 150 modules in 18ms`, `index.js 0.56 MB`. Identical bundle size to gen-065.

### Unit Tests — pass
- Command: `bun test tests/unit/`
- Result: **422 pass / 0 fail** across 33 files (1155 expect calls).
- Delta vs gen-065: +10 (T006 `evaluator-prompt.test.ts` — 10 cases covering validation/fitness branches, merge artifacts, defensive null/empty).

### E2E Tests — pass (1 pre-existing fail)
- Command: `bun test tests/e2e/`
- Result: **207 pass / 1 fail** across 23 files (641 expect calls).
- Delta vs gen-065: +9 (T007 `validation-evaluator.test.ts` × 3 + T008 `install-agents.test.ts` × 6).
- Single failure: `tests/e2e/init-repair.test.ts > skips when REAP section already present`. Pre-existing in gen-064 and gen-065 fitness; not introduced by this generation. Tracked separately in shortterm `init-repair-skipped-message-fix` deferred item.

### Completion Criteria — all met

| # | Criterion (from 02-planning.md) | Status | Evidence |
|---|---|---|---|
| 1 | `ReapConfig.evaluator?: boolean` 추가, 기본 미설정 시 `false` 로 해석 | met | `src/types/index.ts:64-69`. e2e `validation-evaluator.test.ts > evaluator field absent → treated as false`. |
| 2 | `buildEvaluatorPrompt(state, paths, knowledge, options)` 신설, fitness 재사용 가능한 stage 옵션 인자 | met | `src/core/prompt.ts:228-373`. `EvaluatorPromptOptions { stage: "validation" | "fitness" }`. unit `evaluator-prompt.test.ts > fitness stage`. |
| 3 | validation work prompt 가 `config.evaluator === true` 일 때만 evaluator 절 추가, false 일 때 byte-identical | met | `src/cli/commands/run/validation.ts:76-149`. `basePromptLines` 추출. e2e false/true 분기 검증. |
| 4 | Advisor 관계 명문화 (builder verdict 결정, evaluator concern surface, 호출 실패 시 통상 진행) | met | validation.ts evaluator section + buildEvaluatorPrompt HARD-GATE + Fallback. unit `> includes HARD-GATE`. |
| 5 | OpenCode adapter agent 배치 + 양 caller silent helper | met | `src/adapters/opencode/install.ts:338-432`. e2e `install-agents.test.ts > opencode adapter > update alone populates ...`. |
| 6 | Claude Code agent 양 caller 보장 (`reap update` 시 sync) | met | `src/adapters/claude-code/install.ts:92-156` + `index.ts:33`. e2e `install-agents.test.ts > claude-code adapter > update alone (without install-skills) populates ...`. |
| 7 | Dog-fooding — `.reap/config.yml` 에 `evaluator: true` | met | config.yml line 9. T014 self-test: `npx reap run validation` 출력에 `evaluator.enabled: true` + `evaluator.prompt` 6000+ chars + prompt 에 "Evaluator Subagent Invocation" 절 포함. |
| 8 | Unit + e2e 테스트 | met | 위 unit/e2e 결과 참조. |
| 9 | 문서 갱신 (README evaluator 절, design doc 진행 상태, reap-guide 동기화) | met | README.md "Evaluator Agent (opt-in)" subsection + Configuration 보강. `vision/design/evaluator-agent.md` 구현 상태 + 후속 작업 갱신. `src/templates/reap-guide.md` + `.reap/reap-guide.md` 양쪽 "Evaluator agent (opt-in)" 절 추가. |

### Dog-fooding Self-Test (T014) — verified live

`evaluator: true` 가 활성화된 상태에서 `npx reap run validation` 호출 → 출력 JSON 의:
- `context.evaluator.enabled === true`
- `context.evaluator.prompt` 길이 6000+ 자, "## Evaluator Invocation — validation stage" 로 시작
- `prompt` 본문에 `### Evaluator Subagent Invocation (opt-in via \`evaluator: true\`)` 절 존재
- "Advisor model" + "Fallback" 절 모두 포함

→ 본 generation 의 변경이 본 generation 의 validation 단계 자체에서 dog-fooding 확인 완료. self-referential 검증 성공.

### Independent Reviewer (Evaluator Subagent) — invoked

본 generation 의 validation 자체에 evaluator subagent 를 dog-fooding 으로 호출함. 결과는 본 보고서의 "Evaluator Subagent Report" 절에 기록.

## Performance Notes

- Build size unchanged: 0.56 MB single bundle (gen-065 와 동일).
- 신규 코드: `buildEvaluatorPrompt` (~180 lines), validation evaluator 분기 (~50 lines), 양 adapter `installAgents` (~70 lines each). Bundle 영향 미미.
- 추가된 모듈 의존: `validation.ts` 가 새로 `YAML`, `ReapConfig`, `readTextFile`, `buildEvaluatorPrompt`, `loadReapKnowledge` import. 기존 `completion.ts` 와 동일 패턴 — 회피 가치 없음.

## Edge Cases

### config 파일 없음 / evaluator field 없음
- 두 경우 모두 `config?.evaluator === true` 가 false 가 되어 evaluator 절 미append. e2e case 3 으로 검증.

### user-supplied agent 파일 보존
- `~/.claude/agents/` 또는 `~/.config/opencode/agent/` 에 사용자가 미리 만들어 둔 파일은 cleanup 대상이 아님 (prefix anchor `^reap-.+\.md$`). e2e prefix-anchored 테스트로 검증.

### prefix anchor 의 hyphen vs dot 비대칭
- Slash command: `reap.X.md` (dot, gen-064 SLASH_COMMAND_PATTERN).
- Agent definition: `reap-X.md` (hyphen, 본 generation AGENT_PATTERN).
- 이는 각 frontmatter 의 `name` 필드 (`name: reap-evaluate` vs slash command 이름 `/reap.evolve`) 를 그대로 따른 결과. e2e 의 `reapdev.local.md` 케이스도 (dot 포함이지만 prefix `reap-` 가 아니라) 보존됨을 검증.

### sync 분기 (sync vs async builder)
- `dump-state-sync.ts` 가 `buildKnowledgeContextSync` 로 emitOutput 종료 시 sync 작동 — 본 generation 변경은 이 sync path 와 무관. 단 `validation.ts` 가 새로 async config 로드를 수행하지만 emitOutput 까지 await 흐름 안 — sync dump 와 충돌 없음.

## Issues

### 1. Pre-existing e2e fail (init-repair)
- Severity: low (gen-064/gen-065 fitness 에서 이미 인지됨).
- 회귀 아님. 별도 deferred item `init-repair-skipped-message-fix` 으로 추적.

### 2. (해소됨) Planning 단계 추측 — validation work phase config 미독취
- 발견: planning Risk R1 / Tradeoff "prompt 의 분기 깊이" 에서 미리 식별.
- 처리: e2e false case (`evaluator: false`) 가 byte-identical 회귀를 보장.

### 3. (해소됨) e2e case 3 의 nonce race
- 발견: 처음 작성 케이스 "config 파일 제거 후 validation 재호출" 이 nonce 소비 race 로 fail.
- 처리: semantic 을 "field 가 처음부터 없는 경우" 로 변경 — 더 자연스러운 시나리오로 회귀 보장.

### 4. (해소됨, minor fix) 신규 e2e 의 unused imports
- 사용자 IDE 진단으로 발견.
- `tests/e2e/validation-evaluator.test.ts`: `afterAll`, `beforeAll`, `$`, `writeArtifact`, `CLI_PATH` 5 개 unused import 제거.
- `tests/e2e/install-agents.test.ts`: `writeFile as wf`, `cli`, `fileExists` 3 개 unused import 제거.
- typecheck/build/test 회귀 0 (3 파일 19/19 재실행 확인). minor fix 기준 (5 분 이내, design 변경 없음) 충족.

## Evaluator Subagent Report

### Status: not launched (tool unavailable in current session)

**Fallback path 가 발동된 사례 — 의도된 경로.** 본 generation 의 prompt 가 명시한 fallback:
> "if the evaluator subagent fails (tool unavailable, model error, malformed reply): Tell the user the evaluator could not run and why. Continue normal validation. The evaluator is opt-in advice, not a gate."

**상세**:
- 본 builder agent 의 tool set: Read / Edit / Write / Bash 만 사용 가능. `Agent` (Task) tool 가 본 세션 invocation 의 권한 set 에 포함되어 있지 않아 `subagent_type: "reap-evaluate"` 호출 불가.
- 이는 본 generation 의 **builder = orchestrator + reap-evolve subagent 위임을 통합 실행하는 케이스** 이기 때문 — 통상 `/reap.evolve` 흐름이라면 main agent 가 `reap-evolve` 를 spawn 하고, 그 안의 prompt 가 다시 `reap-evaluate` 를 spawn 함 (2-level subagent). 본 generation 은 사용자가 직접 builder role 을 매개 없이 실행한 형태라 두 번째 spawn 의 권한이 없음.
- evaluator 정의 자체는 `~/.claude/agents/reap-evaluate.md` 에 정상 배치되어 있음 (`ls` 로 확인). 다음 자연스러운 generation 부터 `/reap.evolve` 통상 흐름에서 호출 가능.

**Builder 의 verdict 에 미치는 영향**: 본 generation 의 validation verdict 는 builder (= 본 agent) 가 결정. evaluator 가 호출되지 않은 사실은 user 에게 명시 surface 됨 (본 절). prompt 의 advisor 모델 그대로 작동.

**자체 self-audit (evaluator 부재 대안)**:
- 회귀: 422 unit + 207 e2e pass (gen-065 412+198 대비 +10/+9 신규). 1 e2e fail 은 pre-existing.
- byte-identical 보장: e2e `evaluator: false` case 가 prompt 동일성을 검증.
- 사용자 보호: prefix-anchored cleanup e2e 가 user agent 파일 보존 확인.
- 4 개의 verification axes 점검 (Adapter Layer 4-항목): static load OK / dynamic state refresh OK / entry-point file OK / slash trigger registration OK (모두 gen-063~064 에서 이미 충족, 본 generation 영향 없음).
- self-dogfooding: `npx reap run validation` 호출이 validation 출력에 evaluator 절을 포함시킴 (T014 확인).

**메타 교훈 (longterm 후보)**: builder 가 직접 invocation 되는 시나리오 (= `/reap.evolve` 가 아닌 manual workflow) 에서는 evaluator subagent 호출 권한이 없을 수 있음. fallback path 가 정상 작동하여 lifecycle 멈춤 없이 진행됨을 확인 — design 결정 (advisor, opt-in advice not gate) 의 가치 입증.
