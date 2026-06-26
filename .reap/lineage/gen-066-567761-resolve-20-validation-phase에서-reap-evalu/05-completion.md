# Completion

## Summary

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

## Lessons Learned

### 잘 된 점

1. **gen-051~052 의 design 문서가 본 generation 의 planning 비용을 거의 zero 로 줄였다.** 설계 결정 (opt-in flag / advisor 모델 / 수정 대상 파일 / subagent 패턴) 이 모두 보존되어 있어 planning 은 fitness↔validation 위치 차이 + Q1-Q5 의사결정 + cruise 분리 만 처리하면 됨. **2 generation 전의 abort 가 진짜 abort 가 아니었음 — design 만 살리고 abort 한 결정이 본 generation 까지 살아남음**. lineage 의 진짜 가치.

2. **planning 단계의 OpenCode agent dir 실증.** "추측 대신 실증" 패턴 (gen-065 longterm) 을 따라 OpenCode 1.3.16 바이너리 strings 출력으로 4 패턴 확인 → `~/.config/opencode/agent/` (singular) 확정. 사용자 TUI tip 의 인용도 보강. 추측이었다면 잘못된 path 로 install 했을 가능성.

3. **gen-064 의 caller 패턴이 본 generation 에 그대로 작동.** "`installSkills` + `registerSessionIntegration` 양쪽이 같은 silent helper 호출" 원칙을 처음부터 plan 에 포함 → 양 adapter 모두 `reap update` 한 번에 agent sync. T008 e2e (`update alone` 케이스) 가 그 caller mapping 을 직접 검증. **추상화된 교훈이 다음 generation 의 1대1 구현 가이드가 된 사례** (gen-063~064 의 self-evolving 패턴 재현).

4. **본 generation 의 self-dogfooding 성공.** `evaluator: true` 활성화 시점 (T009) 을 implementation 마지막에 놓아 본 generation 의 validation 자체가 변경의 첫 사용자가 됨. validation prompt 에 evaluator 절이 실제로 포함된 것을 직접 확인 (`npx reap run validation` 출력 검증). self-referential 파이프라인의 본질에 부합.

### 개선 영역

1. **Evaluator subagent 호출이 본 generation 에서 실제로 일어나지 못함.** 본 builder 의 invocation 권한 set 에 `Agent` (Task) tool 가 없어 `subagent_type: "reap-evaluate"` spawn 실패. 통상 `/reap.evolve` 흐름이면 2-level subagent (main agent → reap-evolve → reap-evaluate) 라 가능. 본 case 는 사용자가 builder role 을 매개 없이 직접 실행. **fallback path 가 정상 작동 (advisor / not gate) 하여 lifecycle 멈춤 없이 진행됨 — design 의 가치 입증**. 단, evaluator 의 실제 동작 검증은 다음 `/reap.evolve` 흐름에서 처음 발동될 예정.

2. **planning 단계 prompt depth 추측 → e2e 가 잡음.** validation work phase 가 config 를 새로 읽도록 변경. 처음에는 영향 미미라 추측했으나 e2e case 3 의 nonce race 가 의도치 않은 시나리오 (config 제거 후 재호출) 를 발견하게 만듦 → semantic 을 "field 가 처음부터 없는 경우" 로 수정. **e2e 가 잘못된 시나리오 가정도 잡아냄**.

3. **사용자 IDE 진단 의존.** 신규 e2e 두 파일의 unused imports (5+3) 가 typecheck 통과 (`noUnusedLocals` 비활성) 라 self-validation 에서 못 잡음. 사용자가 fitness 직전 IDE 진단으로 발견 → minor fix 로 정리. **TS strict 옵션 보강 검토 후보** (별도 backlog 화 가능).

## Next Generation Hints

### 가장 자연스러운 다음 트랙

1. **fitness + cruise + Vision/Goal 통합 (`cruise-mode-evaluator-escalation-통합-validationfitness.md` backlog)** — 본 generation 의 후속. design 문서 + 본 generation 의 `buildEvaluatorPrompt({ stage: "fitness" })` 분기를 그대로 사용. 작업 범위: completion.ts fitness phase 변경 + state 채널 (`GenerationState.evaluatorConcerns?` 또는 life/ 메타 파일) + cruise self-assessment 분기에 evaluator concern 자문 절 추가.

2. **사용자 직접 `/reap.evolve` 흐름에서 evaluator 실호출 검증** — 본 generation 의 fallback path 가 발동한 이유 (Agent tool 권한 부재) 를 확인하기 위해, 다음 generation 은 `/reap.evolve` 통상 흐름으로 시작 → main agent 가 reap-evolve spawn → 그 안에서 evaluator spawn. evaluator 의 실제 평가 결과 + 사용자 surface 흐름 검증.

3. **Release v0.16.6** — gen-061~066 묶음. evaluator validation 통합 (Issue #20 close), backlog robustness (gen-065), opencode adapter slash commands (gen-064), termination paths (gen-061) 등. 25+ commits ahead.

### 자율 추가 후보 (사용자 검토 필요)

- TS `noUnusedLocals` / `noUnusedParameters` 옵션 활성화 검토 — 신규 코드의 unused imports 를 typecheck 단계에서 자동 발견. 기존 코드 영향 광범위 가능성, 사용자 판단 필요.
- 사용자가 manual workflow 로 builder 실행한 시점에 evaluator 호출 시도를 try 한 후 fallback 인지하도록, validation prompt 의 fallback 절을 강화 (현재도 명시되어 있으나, "Agent tool 부재" 케이스를 명시 추가). 작은 docstring 보강.

### 메타 — 본 generation 의 self-evolving 작동 사례

gen-051 (template 정의) → gen-052 (learning + design 확정 후 abort) → gen-066 (validation 통합 구현). **3 generation 가 design 을 점진 진화시키며 한 항목씩 완성**. self-evolving 의 시간 차원 — 어느 한 generation 도 단독으로 다 처리 불가, lineage 가 누적되어야 자연스러운 진행이 가능. evaluator-agent.md design 문서가 그 누적의 anchor.

## Change Proposals

### 신규 backlog (planning 단계에서 생성)

- `cruise-mode-evaluator-escalation-통합-validationfitness.md` (type: task, priority: medium) — fitness 통합 + cruise escalation 자동 중단 + Vision/Goal 위임 묶음.

### Genome / Environment 변경 제안 (adapt 결정)

**Genome**: 본 generation 자체는 evolution.md / application.md 의 명시적 추가 변경 불필요 — 본 generation 의 4 가지 longterm 교훈 (design anchor / advisor 안전망 / dog-fooding 시점 / cross-adapter path) 모두 `memory/longterm.md` 에 reflect 단계에서 기록 완료. 그 중 evolution.md 로 승격할 가치가 있는 항목은 향후 패턴 반복 발생 시 검토 — 본 generation 만으로는 1 회 사례라 longterm 유지가 적절.

**Environment**: reflect 에서 `summary.md` 의 `prompt.ts`, `validation.ts`, `adapters/claude-code/install.ts`, `adapters/opencode/install.ts` 설명을 gen-066 변경 반영해 갱신 완료. Tests 섹션의 카운트도 422/207 로 갱신. 추가 변경 없음.

**Backlog 제안 (인간 검토 후 결정 — adapt 에서는 생성 안 함)**:
- `enable-ts-noUnusedLocals` (priority low) — TS `noUnusedLocals` / `noUnusedParameters` 옵션 활성화 검토. 본 generation 의 unused imports 가 typecheck 에서 안 잡힌 사례. 기존 코드 영향 광범위 가능성 평가 후 결정.
- `evaluator-fallback-explicit-tool-absence` (priority low) — validation prompt 의 fallback 절을 "Agent tool 부재" 케이스 명시 강화. 본 generation 의 manual workflow 사례가 그 명시의 가치 입증.

## Project Diagnosis (Software Completion Criteria 적용)

- **Core functionality**: lifecycle 5 stage + nonce + transition graph + backlog + lineage + archive + adapter dispatch 모두 안정 작동. 본 generation 의 evaluator validation 통합도 self-dogfooding 으로 확인.
- **Architecture stability**: 4 layer (adapters / cli / core / state) 명확. application.md 의 layered architecture + adapter pattern 이 본 generation 의 양 adapter 변경에서도 충돌 없이 매핑됨.
- **Modularity**: `buildEvaluatorPrompt` 가 stage 파라미터로 fitness 통합 시 재사용 가능하도록 설계. `installAgents` 가 양 adapter 에서 같은 패턴 — 차후 Codex adapter 도 같은 형태로 추가 가능. 모듈성 좋음.
- **Error handling**: emitError → JSON output 일관. 본 generation 의 evaluator 호출 실패 시 fallback path 명시. 단 `validation.ts` 가 새로 config 읽을 때 YAML parse 실패 case 는 null → false (사실상 catch) 로 처리 — 명시적 error message 없음. 우선순위 낮음.
- **Test coverage**: 422 unit + 207 e2e (1 pre-existing fail). 본 generation 신규 19 case 가 핵심 경로 cover. evaluator 의 실제 subagent 호출 path 는 lifecycle 외부에 있어 e2e 로 cover 불가 — manual 검증 의존.
- **Documentation**: README evaluator 절 + design 문서 + reap-guide 동기화 완료. 사용자 입장에서 evaluator 활성화 방법 / 동작 / fallback 명확. 단 fitness/cruise 통합 후속 작업이 backlog 만 만들고 design 본문에는 전체 흐름이 아직 미정 — 다음 generation 의 planning 에서 보강 예정.
- **Security**: 외부 호출 없음 (CLI + file-based). evaluator subagent 는 read-only + bash tools 제한 (template). 본 generation 영향 없음.
- **Performance**: build 0.56 MB 동일. 신규 코드 ~300 lines 추가했으나 bundle 영향 미미.
- **Deployment readiness**: npm publish ready. 본 generation 변경은 단일 bundle 안 정상 포함. release notes 만 가다듬으면 v0.16.6 후보.
- **Code quality**: 기존 패턴 (cruiseCount 같은 optional config, completion.ts 의 config 읽기) 일관. 신규 e2e 의 unused imports 가 사용자 IDE 진단으로 발견됐으나 minor fix 처리.
- **User experience**: opt-in 설계 (`evaluator: false` 기본) 로 기존 사용자 회귀 0. dog-fooding 시 즉시 validation prompt 에 evaluator 절 노출.
- **Visual verification**: N/A (CLI tool).
- **Integration layer**: adapter dispatch + subagent 호출 패턴 안정. evaluator 가 Claude Code 의 `Agent` tool 에 의존 — manual builder 호출 시 권한 부재 가능성을 fallback 으로 처리.
- **Domain maturity**: REAP 의 핵심 도메인 (lifecycle / genome / lineage / vision) 모두 environment 기록 + 코드 구현 일치. evaluator 트랙은 design 문서에 진척 명시.
- **Governance compliance**: REAP 자기 lifecycle 준수 — 본 generation 도 5 stage 정상 통과. evolution.md "Workaround 금지" / "Echo Chamber Prevention" 모두 준수.
- **Genome stability**: 14 generation 동안 application.md 변경 최소 (gen-063~064 의 adapter 4-항목 verification + `installSkills`/`registerSessionIntegration` 책임 표 정도). evolution.md 도 보강 위주. 안정성 좋음.

## Embryo → Normal Transition Check

- generation count 65, 최근 14 generation abort 0, genome 변경 최소, vision/goals.md 명확. **객관적으로 전환 조건 충족**.
- 단, 사용자 (2026-03-26) 가 "REAP 자체가 아직 완성 단계가 아니므로 embryo 유지" 결정. 본 generation 의 fitness 가 짧게 끝났고 사용자가 release/distribution 트랙으로 가려는 시점 — 별도 전환 논의 시점은 아님.
- **결정**: 다음 release (v0.16.6) 후 자연스러운 시점 (예: 외부 사용자 피드백 도착, 또는 cruise mode 실사용) 에 다시 제안. 본 generation 에서는 backlog 생성 안 함 — embryo 유지.

## Vision Goals Update — 보수적 적용

adapt 자동 매칭이 7 항목 → `[x]` 제안했으나 **본 generation 은 실제로 vision/goals.md 의 어느 단일 항목도 완료하지 않음**:

- "Codex CLI adapter" — 본 generation 무관 (false positive)
- "Validation에서 자기 CLI 검증 가능" — Self-Hosting 항목, 외부 프로젝트 의미 (false positive)
- "Vision/Goal/Memory 관리 위임" — 후속 backlog 로 분리 (false positive)
- "외부 프로젝트에서 core lifecycle 검증 (npm 배포 후)" — 본 generation 무관 (false positive)
- "Fitness 위임: evaluator 1차 평가 → 인간 에스컬레이션" — fitness 통합은 후속 backlog (false positive)
- "Update agent Phase 2/3" — 본 generation 무관 (false positive)

evaluator 트랙의 진척은 **vision/goals.md** 가 아닌 **`vision/design/evaluator-agent.md`** 의 "구현 상태" 절에 reflect 단계에서 이미 기록 완료. **vision/goals.md 변경 없음** — auto-matcher 제안 무시.
