# Shortterm Memory

## 세션 요약 (2026-06-26)

### gen-066: Issue #20 — validation phase 에서 reap-evaluate 독립 검증 호출 통합

세 영역을 한 generation 에서 처리:

- **Part 1 (validation wiring)**: `ReapConfig.evaluator?: boolean` (기본 false) opt-in. `validation work phase` 가 config 읽어 evaluator 절 + `context.evaluator.{enabled, prompt}` 조건부 append. `evaluator: false` 시 prompt byte-identical (회귀 보장).
- **Part 2 (양 adapter agent 배치)**: Claude Code (`~/.claude/agents/`) + OpenCode (`~/.config/opencode/agent/` singular) 모두 `installAgents(home?)` silent helper. `installSkills` + `registerSessionIntegration` 양 caller 에서 호출 (gen-064 longterm 패턴). prefix anchor `^reap-.+\.md$` 로 사용자 agent 보존.
- **Part 3 (dog-fooding + 문서)**: `.reap/config.yml` 에 `evaluator: true` 추가. README "Evaluator Agent (opt-in)" subsection + Configuration 보강. `vision/design/evaluator-agent.md` 구현 상태 갱신. `src/templates/reap-guide.md` + `.reap/reap-guide.md` 동기화.

**결과**: typecheck/build pass. unit 422/0 (+10 신규). e2e 207/1 (+9 신규, pre-existing init-repair 1, 회귀 0).

**Self-dogfooding 확인 (T014)**: 본 generation 의 `npx reap run validation` 호출이 자기 변경으로 인해 evaluator 절을 자기 prompt 에 포함 — self-referential 검증 성공.

**Evaluator 실호출 — fallback 발동 (의도)**: builder 의 권한 set 에 Agent (Task) tool 없음 → fallback path ("호출 실패 시 lifecycle 미차단, advisor / not gate") 정상 작동. 다음 `/reap.evolve` 통상 흐름에서 실제 호출 처음 발동.

### 다음 세션 / 다음 generation

- **fitness + cruise + Vision/Goal 통합 (`cruise-mode-evaluator-escalation-통합-validationfitness.md` backlog)** — 본 generation 의 후속. `buildEvaluatorPrompt({ stage: "fitness" })` 분기 그대로 활용. `completion.ts` fitness phase 변경 + state 채널 + cruise self-assessment 분기.
- **사용자 직접 `/reap.evolve` 흐름에서 evaluator 실호출 검증** — 본 generation 의 fallback 발동 이유 (Agent tool 권한 부재) 확인하고 통상 흐름의 2-level subagent spawn 동작 검증.
- **Release v0.16.6** — gen-061~066 묶음. evaluator validation 통합 (Issue #20 close), backlog robustness (gen-065), opencode adapter slash commands (gen-064), termination paths (gen-061). 25+ commits ahead.

### deferred 후보 (사용자 판단 후 backlog 화)

기존 11 (gen-065 shortterm) + 신규 2:

기존 (간단 list):
1. `opencode-init-agent-flag`
2. `unify-sync-async-knowledge-builder`
3. `init-repair-skipped-message-fix` (1 pre-existing e2e fail)
4. `tests/helpers/setup.ts fileExists` 디렉토리 버그 fix
5. `disable-model-invocation` variant 분리
6. prefix 충돌 marker 기반 cleanup 강화
7. OpenCode plugin `tool.execute.after` dump
8. Codex adapter (큰 트랙)
9. Evaluator agent 코드 통합 — **본 generation 부분 처리됨** (validation 단계 완료). 잔여 (fitness + cruise + vision 위임) 은 gen-066 의 `cruise-mode-evaluator-escalation-통합-validationfitness.md` backlog 로 분리됨.
10. `reap consume backlog <filename> --gen <id>` helper
11. `reap make backlog` 외 경로로 만든 backlog warn

**신규 (gen-066)**:
12. **TS `noUnusedLocals` / `noUnusedParameters` 옵션 활성화 검토** — 신규 e2e 의 unused imports 가 typecheck 에서 안 잡혔고 사용자 IDE 진단으로 발견. 본 generation 에서 minor fix 했으나 자동화 보강 가치.
13. **validation prompt 의 fallback 절 "Agent tool 부재" 케이스 명시 강화** — manual workflow (builder 가 매개 없이 실행) 에서 subagent spawn 권한이 없을 수 있음을 prompt 에 더 명확히. 본 generation 사례가 그 명시의 가치를 입증.

### 본 generation 의 self-evolving 작동 사례

gen-051 (template 정의) → gen-052 (learning + design 확정 후 abort) → gen-066 (validation 통합 구현). 3 generation 가 design 을 점진 진화시키며 한 항목씩 완성. **design 문서가 abort 후에도 보존되어 본 generation planning 비용을 zero 에 가깝게 줄임**. lineage 의 진짜 가치.

### 코드 변경 위치 (다음 세션 참조용)

- `src/types/index.ts:54-69` — `ReapConfig.evaluator?: boolean` 추가
- `src/core/prompt.ts:228-373` — `buildEvaluatorPrompt(knowledge, paths, state, { stage })` + `EvaluatorPromptOptions`
- `src/cli/commands/run/validation.ts:1-149` — config 분기 + evaluator 절 + context emit
- `src/adapters/claude-code/install.ts:92-156` + `index.ts:33` — `installAgents(home?)` 양 caller
- `src/adapters/opencode/install.ts:338-432` — `installAgents(home?)` + `opencodeAgentsDir(home?)` 양 caller
- `tests/unit/evaluator-prompt.test.ts` — 10 case
- `tests/e2e/validation-evaluator.test.ts` — 3 case (false/true/absent)
- `tests/e2e/install-agents.test.ts` — 6 case (양 adapter × install-skills/update × prefix anchor 보호)
- `README.md` — "Evaluator Agent (opt-in)" subsection + Configuration 보강
- `.reap/vision/design/evaluator-agent.md` — 구현 상태 + 후속 작업 갱신
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` — "Evaluator agent (opt-in)" 절
- `.reap/config.yml` — `evaluator: true` (dog-fooding)

### Backlog 상태 (commit 직후 예상)

- `cruise-mode-evaluator-escalation-통합-validationfitness.md` — pending 유지 (다음 generation source 후보).
- 본 generation 은 `sourceBacklog: null` (issue #20 직접 goal). `--no-backlog` 의도 (start 시 명시 안 됐지만 결과 동일).
