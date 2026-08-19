---
id: gen-066-567761
type: embryo
goal: "resolve #20: validation phase에서 reap-evaluate 독립 검증 호출"
parents: ["gen-065-b1b391"]
---
# gen-066-567761
Goal: Issue #20 (validation phase 에서 reap-evaluate 독립 검증 호출).

5 stage lifecycle 정상 완료. 14 task 전부 처리 (T001~T014). Issue #20 의 4 항목 verification (사용자 Q1-Q5 답변 기반):

- **Validation 통합** (Q1): `config.evaluator: true` opt-in 시 `validation work phase` 가 `reap-evaluate` subagent 호출 지시를 prompt 에 append. `evaluator: false` (또는 미설정) 시 prompt 기존과 byte-identical.
- **Opt-in 설계** (Q2): `ReapConfig.evaluator?: boolean` 기본 false. REAP 자체는 `.reap/config.yml` 에 `evaluator: true` 로 dog-fooding.
- **Advisor 모델** (Q3): builder 가 verdict 결정, evaluator concern 을 user 에게 surface. fallback (subagent 호출 실패 시 lifecycle 미차단).
- **양 adapter agent 배치** (Q4): Claude Code (`~/.claude/agents/`) + OpenCode (`~/.config/opencode/agent/`) 모두 `installSkills` + `registerSessionIntegration` 양 caller 에서 silent helper 로 호출. `reap update` 한 번에 sync. prefix anchor (`^reap-.+\.md$`) 로 사용자 agent 보존.
- **Cruise 통합은 분리** (Q5): `cruise-mode-evaluator-escalation-통합-validationfitness.md` backlog 신설 (planning 단계). fitness 통합 + cruise escalation 자동 중단 + Vision/Goal 위임 셋을 묶음.

핵심 변경 모듈:
- `src/types/index.ts` — `ReapConfig.evaluator?: boolean` 추가.
- `src/core/prompt.ts` — `buildEvaluatorPrompt(knowledge, paths, state, { stage })` 신설 (fitness 통합 시 재사용 가능, `stage: "validation" | "fitness"`).
- `src/cli/commands/run/validation.ts` — config 분기 + evaluator 절 + `context.evaluator.{enabled, prompt?}`.
- `src/adapters/claude-code/install.ts` + `index.ts` — `installAgents(home?)` export + `registerSessionIntegration` caller 추가 (gen-064 longterm 패턴 적용).
- `src/adapters/opencode/install.ts` — `installAgents(home?)` 신설 (target `~/.config/opencode/agent/` singular, OpenCode TUI tip 공식) + 양 caller.

테스트: unit 422 pass / 0 fail (+10 신규), e2e 207 pass / 1 fail (+9 신규, 1 pre-existing init-repair, 회귀 0). 본 generation 의 self-dogfooding: `npx reap run validation` 호출이 본인 변경의 evaluator 절을 자기 prompt 에 포함시킴 — self-referential 검증 성공 (T014).

문서: README.md 에 "Evaluator Agent (opt-in)" sub-section + Configuration 보강. `vision/design/evaluator-agent.md` 구현 상태 + 후속 작업 갱신. `src/templates/reap-guide.md` + `.reap/reap-guide.md` 양쪽 "Evaluator agent (opt-in)" 절 동기화.