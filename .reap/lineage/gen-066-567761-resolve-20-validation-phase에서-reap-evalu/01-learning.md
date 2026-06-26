# Learning

> Explore the project and build context before starting this generation's work.

## Goal

**resolve #20: validation phase에서 reap-evaluate 독립 검증 호출**

Issue #20 (open): "Invoke reap-evaluate during validation phase for independent verification". `reap-evaluate` agent 템플릿은 이미 정의되어 있으나(`src/templates/agents/reap-evaluate.md`), 실제 코드 통합은 안 됨. 현재는 validation을 reap-evolve가 self-review로 수행 → self-review bias 위험. issue는 validation 단계에 evaluator subagent를 호출하여 fresh-context, read-only, adversarial 검증을 lifecycle에 통합할 것을 제안.

## Project Overview

REAP는 AI+인간이 generation을 거치며 소프트웨어를 공동 진화시키는 self-evolving 파이프라인. 5-stage lifecycle(learning → planning → implementation → validation → completion)을 nonce 기반 transition graph로 강제. 본 generation은 self-evolving의 핵심 메커니즘(self-review bias 제거)에 직접 영향. **embryo** 모드 — genome 자유 수정 가능.

직전 generation gen-065가 backlog 처리 견고화로 release v0.16.5 준비를 완료. 다음 자연스러운 트랙은 evaluator 코드 통합(vision goal "Evaluator Agent — Fitness 위임"의 첫 단계). Issue #20은 그 트랙 안에서 validation 단계 통합부터 시작하자는 사용자 제안.

## Key Findings

### 1. 기존 인프라 — 이미 준비된 자산

**`src/templates/agents/reap-evaluate.md`** (200 lines, gen-051에 정의 완료):
- Tools: Read, Glob, Grep, Bash (Write/Edit 금지)
- 4 가지 역할: Independent Verification, Fitness Assessment, Vision/Goal Management, Cross-Generation Record Keeping
- 5-phase Evaluation Workflow (Context Loading → Independent Verification → Fitness Assessment → Escalation Decision → Output)
- 정량적 metrics 금지(Goodhart's Law), 코드 수정 금지, self-fitness 금지 명문화
- **결정적 인용 (line 198)**: "Currently, the evaluator is invoked during the completion phase. In the future, it may also be invoked during validation for independent verification." → 본 generation이 그 "in the future"를 실현.

**`.reap/vision/design/evaluator-agent.md`** (gen-051 + gen-052 잔여 plan):
- 승인된 설계 결정 (line 116-160) — gen-052 learning에서 합의됨:
  1. `ReapConfig`에 `evaluator?: boolean` (기본 `false`) opt-in 플래그. REAP 자체는 `evaluator: true`로 dog-fooding.
  2. **fitness phase**에서 호출하는 것을 design에 명시 (line 122) — 이번 issue는 **validation**으로 위치 변경 또는 양쪽 다 적용 요청. 본 generation이 그 차이를 어떻게 처리할지 결정해야 함.
  3. cruise mode: high confidence + low impact → 자동 진행, escalation → cruise 중단.
- **수정 대상 파일** (line 124-162):
  - `src/core/prompt.ts` → `buildEvaluatorPrompt()` 추가
  - `src/cli/commands/run/completion.ts` → fitness phase 변경 (본 design은 fitness 가정)
  - `src/types/index.ts` → `ReapConfig.evaluator?: boolean` 추가

**`~/.claude/agents/reap-evaluate.md`** (이미 설치됨, `installSkills`가 자동 배치). Claude Code에서 `subagent_type: "reap-evaluate"`로 즉시 호출 가능.

### 2. 현재 validation phase 흐름 (`src/cli/commands/run/validation.ts`)

- `phase: work` — 단순한 텍스트 prompt만 emit. Steps 1-6 (typecheck/build/tests/completion criteria/minor fix/verdict). HARD-GATE는 "do NOT declare pass without running validation commands"
- `phase: complete` — artifact 검증(`verifyArtifact`) + 자동으로 completion으로 전이.
- **gap**: 같은 agent(builder) 가 self-validation 수행. evaluator subagent 호출 지시 zero. issue #20 핵심 지적.

### 3. 패턴 참조 — 기존 subagent 호출 흐름 (`evolve.ts`)

`evolve.ts:75-126` — `autoSubagent` 모드 prompt는:
1. `subagent_type: "reap-evolve"` 지시
2. context에 `subagentPrompt`(buildBasePrompt 결과) 동봉
3. "Subagent Continuation Protocol" — agent 가 결과를 받아 user 에게 routing
4. cruise mode 시 추가 instructions

**활용 가능 패턴**: validation work phase 의 prompt 끝에 evaluator 호출 지시 절을 추가 + context에 `evaluatorPrompt` 동봉 → main agent 가 `Agent` tool 로 `reap-evaluate` 호출. `evolve.ts` 와 동일 메커니즘이라 학습 비용 0.

### 4. ReapConfig 가족과 opt-in 설계

`src/types/index.ts:54-64` — `ReapConfig` 인터페이스. 기존 필드: project, language, autoSubagent, strictEdit, strictMerge, agentClient, autoUpdate, autoIssueReport, cruiseCount. `evaluator?: boolean` 추가는 같은 패턴(`autoSubagent`, `strictEdit` 등)을 따르면 됨. **default `false`** — opt-in 으로 회귀 위험 zero.

REAP 자체 config (`.reap/config.yml`):
```yaml
project: reap-v016
language: korean
autoSubagent: true
agentClient: claude-code
autoUpdate: true
autoIssueReport: false
strictEdit: true
strictMerge: true
```
→ `evaluator: true` 추가하면 dog-fooding 시작.

### 5. OpenCode adapter 와의 정합성

`src/adapters/opencode/install.ts` — agent definition 을 user-level (`~/.config/opencode/agents/` 등) 으로 배치하는 코드 **없음**. 반면 Claude Code adapter 는 `installAgents()` (line 95-113) 로 `~/.claude/agents/reap-*.md` 자동 배치.

**판단 필요**: 
- (a) OpenCode 도 agent definition 배치 추가 → 본 generation 범위 확장
- (b) issue #20 직접 인과 범위(validation 호출 wiring)만 처리, OpenCode agent 배치는 별도 generation
- evolution.md Echo Chamber Prevention: "AI 자율 추가는 현재 goal의 직접 인과 범위 내에서만 허용"
- → **(b) 선택**. Claude Code 환경에서만 evaluator 활성화. OpenCode 는 별도 backlog. (실제로 사용자는 현재 Claude Code 사용 중이고 issue 도 Claude Code 환경에서 제기됨.)

### 6. completion fitness 와의 관계

evaluator-agent.md design 은 **fitness** phase 통합을 가정. issue #20 은 **validation** phase 통합 요청. 두 가지 옵션:

- **(α) validation 만 통합** (issue #20 직접 인과 범위) — fitness 는 후속 generation. design 문서의 "fitness 호출" 결정은 보존 + validation 추가.
- **(β) validation + fitness 둘 다 통합** — design 의 후속 작업까지 일괄 처리. scope 확장. 위험: 한 번에 너무 많이 바꿈.

**판단 (planning 으로 미룸)**: 본 generation 은 **validation 우선**. fitness 통합은 별도 backlog/generation. 단, `buildEvaluatorPrompt()` 같은 공통 모듈은 fitness 에서도 재사용 가능하도록 design.

### 7. Echo chamber / sycophancy 방지 — issue #20 의 본질

issue 본문 인용:
> "A text instruction in the genome ('self-check before finishing') does not reliably fix this — it is the same context/model that produced the issue."
> "Self-review in a single context is structurally weak; an independent agent context (or mechanical gates) is what actually catches the builder's own misses."

→ evaluator 는 **별도 context** subagent. fresh-context, read-only, "find violations" framing 이 핵심. 단순 prompt 변경(self-check 강화)으로는 해결 불가. evolution.md "Workaround 금지 — 근본 원인 추적 원칙" 과 정확히 같은 정신.

### 8. 테스트 패턴

- `tests/unit/` — `buildEvaluatorPrompt()` 단위 테스트 (context 포함 여부)
- `tests/e2e/` — validation work phase 가 evaluator opt-in 시 evaluator 호출 지시 절 포함하는지 확인
- `tests/scenario/` — 불필요 (lifecycle 흐름 자체 변경은 없음, prompt 강화만)
- 회귀: `evaluator: false`(default) 일 때 기존 prompt 와 동일해야 함 — opt-in 보장.

## Previous Generation Reference

**gen-065-b1b391** (직전): backlog 처리 견고화 (Issue #18 + consumeBacklog silent fail + 누적 cleanup). fitness "A로 진행 — 결과 만족". 본 generation 과 직접 의존성 없으나, **release v0.16.5 준비 완료** 상태이므로 본 generation 이 v0.16.6 의 새 feature 트랙 시작점.

**gen-051~052** (evaluator design history):
- gen-051: reap-evaluate template 정의 + 설계 결정 (tools, escalation matrix, memory 공유, 정량적 금지)
- gen-052: learning 단계까지 진행 후 abort. 단, design 결정 (config flag, fitness 위치, cruise behavior, 수정 대상 파일) 은 vision/design/evaluator-agent.md 에 보존 → 본 generation 이 그 design 을 이어받음.

## Backlog Review

`ls .reap/life/backlog/` → 비어 있음 (gen-065 가 자체 backlog 를 consumed 처리 후 archive). 본 generation 의 source backlog 는 **없음** — 사용자가 `--no-backlog` 로 시작했어야 정상이지만 issue #20 을 직접 goal 로 받은 것으로 보임 (current.yml `sourceBacklog` 미설정 확인).

**memory shortterm 의 deferred 후보 11개** 중 본 generation 과 연결되는 것:
- (#9) "Evaluator agent 코드 통합" — **본 generation 이 처리하는 작업의 부분집합**. issue #20 은 validation 호출까지. fitness 위임은 후속.

## Technical Deep-Dive

### 변경 대상 파일 (예측, planning 에서 확정)

1. **`src/types/index.ts`** — `ReapConfig.evaluator?: boolean` 추가
2. **`src/core/prompt.ts`** — `buildEvaluatorPrompt(state, paths, knowledge, artifacts)` 신설:
   - role: evaluator subagent 에게 줄 context.
   - 포함: generation state, goal, vision goals, memory, project path, validation 단계 명시, 읽어야 할 artifact 목록 (01-learning, 02-planning, 03-implementation, 04-validation), "do NOT modify code", "do NOT modify git state" 강조.
   - 제외: strict mode, cruise loop, clarity guide, maturity guide (evolve 와 다름).
3. **`src/cli/commands/run/validation.ts`** — `phase: work` prompt 에 evaluator 호출 절 추가:
   - config 읽기 → `config.evaluator === true` 일 때만 절 표시.
   - 절 내용: "Use the Agent tool: subagent_type=reap-evaluate, prompt=evaluatorPrompt" + "Wait for evaluator's qualitative assessment. Surface concerns to the human BEFORE declaring pass/partial."
   - context 에 `evaluatorPrompt` 동봉.
4. **`tests/unit/prompt.test.ts`** (또는 기존 test 파일) — `buildEvaluatorPrompt` 단위 테스트.
5. **`tests/e2e/`** — validation evaluator 옵션 시나리오 (구체적 위치는 planning 에서 결정).
6. **`.reap/config.yml`** — `evaluator: true` 추가 (dog-fooding).
7. **`vision/design/evaluator-agent.md`** — validation 통합 완료 표기 + 후속 (fitness 통합) 명확화.
8. **(선택)** application.md / evolution.md — "evaluator opt-in 시 validation 동작" 명문화.

### evaluator prompt 의 동작 보장

evaluator subagent 는 **read-only + Bash 만 허용** (template tools). validation 결과의 **검증** 만 수행. 결과는 다음 중 하나:
- "all dimensions clear" → 직접 판단 ("pass 추천")
- "high-impact concerns" → 판단 + escalation
- "low confidence" → 판단 유보 + 사실만 전달

main agent (builder) 가 evaluator 결과를 받아 **fitness 가 아닌 validation verdict** (pass/partial/fail) 에 반영. 단, evaluator 의 판단은 **추천** — builder 가 verdict 를 결정하되 evaluator 의 concern 을 user 에게 surface 해야 함. fitness 위임이 아님.

### `validation.ts` complete phase 는 변경 불필요

evaluator 호출 결과는 04-validation.md 에 builder 가 직접 기록. complete phase 의 `verifyArtifact` 가 placeholder 미작성 검출하므로 별도 강제 메커니즘 불필요.

### Risk 분석

- **Risk 1**: evaluator subagent 호출 실패 (tool 없음, 모델 오류 등) → builder 가 어떻게 처리? 
  - 권장: prompt 에 "evaluator 호출 실패 시 user 에게 알리고 통상 validation 진행". 강제 차단 아님.
- **Risk 2**: evaluator 가 false positive 로 reject → builder 가 모든 평가를 evaluator 에 위임하면 lifecycle 멈춤.
  - 권장: builder 는 evaluator 결과를 user 에게 surface, 최종 verdict 는 builder + user. evaluator 는 "advisor".
- **Risk 3**: opt-in 시 prompt 출력 길이 증가 → 토큰 비용. 
  - 영향 미미 (대형 evaluator prompt 1회). opt-in 이라 비활성화 가능.
- **Risk 4**: cruise mode 에서 evaluator escalation → cruise 중단? 
  - design 에 "escalation → cruise 중단" 결정 있음. **본 generation 미포함** — `cruise-mode-evaluator-escalation-통합-validationfitness.md` backlog 로 분리 (Q5 사용자 결정).
  - 간접 안전: cruise self-assessment 단계에서 builder 가 evaluator concern 을 자기 평가에 반영하면 cruise 가 "uncertain" 으로 자동 중단 가능 (강제 메커니즘 없이도).

## Context for This Generation

### Clarity Level: **HIGH**

이유:
- Issue #20 본문이 명확 + design 문서 (`vision/design/evaluator-agent.md`) 가 이미 결정사항 보존 + 직전 fitness 만족 + embryo (genome 자유 수정).
- 변경 대상 파일이 명확히 식별됨 (types, prompt, validation, tests, config, design doc).
- 기존 패턴 (evolve.ts subagent 호출) 재사용 → 새로운 메커니즘 발명 불필요.

### Scope 결정 (사용자 Q1-Q5 답변 반영)

**포함**:
- validation work phase 에 evaluator 호출 지시 추가 (opt-in `config.evaluator: true`, 기본 `false`) — Q1, Q2
- `buildEvaluatorPrompt()` 모듈 신설
- `ReapConfig.evaluator?: boolean` 타입 추가
- Claude Code 환경 dog-fooding (`.reap/config.yml` 에 `evaluator: true`)
- **OpenCode adapter agent 배치 추가** — Claude Code 의 `installAgents()` 대응 OpenCode 측 메커니즘 신설 — Q4
- 테스트 (unit + e2e)
- design 문서 (`vision/design/evaluator-agent.md`) 진행 상태 갱신
- **docs/README 갱신** — `reap-evaluate` 설정 방법, 동작, 권장 사용법 — Q2 추가 요구사항
- Verdict 관계: **Advisor** — builder 가 verdict 결정, evaluator concern 을 user 에게 surface — Q3

**제외 (향후 generation/backlog)**:
- completion fitness phase 통합 (vision goal "Fitness 위임" — 별도 트랙)
- Vision/Goal 관리 위임 (vision goal — 별도 트랙)
- cruise mode evaluator escalation 자동 중단 메커니즘 — Q5, `cruise-mode-evaluator-escalation-통합-validationfitness.md` backlog 로 분리

### 가정

- evaluator subagent 의 결과는 **builder 의 verdict 를 대체하지 않음**. builder 가 validation verdict 를 결정하되 evaluator concern 을 surface. user 가 최종 fitness 평가자. (Q3 Advisor 확정)
- `config.evaluator` 기본 `false` → 회귀 위험 zero.
- 본 generation 의 evaluator 호출은 **validation 단계만**. fitness 는 미래 generation.
- Claude Code + OpenCode 양 adapter 모두 agent 배치 처리. user-level 영역에 위치. (Q4 확정)
- cruise + evaluator escalation 의 자동 중단은 본 generation 미포함. 별도 backlog 로 승계. (Q5 확정)

### 다음 단계

planning 에서:
1. 정확한 코드 변경 set 확정 (Q&A 후)
2. completion criteria 명시 (예: "validation work phase prompt 에 config.evaluator true 시 evaluator 절 포함", "기본 false 시 기존 prompt 그대로", 등)
3. 테스트 시나리오 명시
4. `buildEvaluatorPrompt()` 인터페이스 결정 (인자/반환)
5. validation verdict 와 evaluator concern 의 관계 명시 (override? advise?)
