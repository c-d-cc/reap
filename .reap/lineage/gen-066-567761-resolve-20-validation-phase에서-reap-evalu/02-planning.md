# Planning

## Goal

Issue #20 해결: `config.evaluator: true` opt-in 시 validation work phase 가 `reap-evaluate` subagent 를 호출하여 **독립 검증(advisor 역할)** 을 수행하도록 lifecycle wiring 한다. 호출 결과는 builder 의 verdict 를 대체하지 않고 user 에게 surface 한다. Claude Code + OpenCode 양 adapter 모두 `reap-evaluate` agent 정의가 user-level 에 자동 배치되도록 install/update 플로우를 갱신한다. 기본값 `false` 로 회귀 위험 0.

## Background

- `src/templates/agents/reap-evaluate.md` 는 gen-051 에 정의되어 `~/.claude/agents/` 로 이미 배포 중. OpenCode 측 배포는 미구현.
- `.reap/vision/design/evaluator-agent.md` (gen-051~052) 가 opt-in flag, evaluator 호출 위치, advisor 관계, 코드 통합 plan 까지 결정해 둠. 단 fitness phase 가정. 본 generation 은 그 design 의 일부 (validation 위치) 만 실현.
- 사용자 답변 (Q1~Q5): validation 만, opt-in, advisor, OpenCode 도 함께, cruise 통합은 별도 backlog.
- 신규 backlog `cruise-mode-evaluator-escalation-통합-validationfitness.md` 생성 완료 — fitness 통합 + cruise escalation 자동 중단은 다음 generation 으로 분리.

## Completion Criteria

1. **Type**: `ReapConfig.evaluator?: boolean` 필드 추가, 기본 미설정 시 `false` 로 해석.
2. **Prompt builder**: `src/core/prompt.ts` 에 `buildEvaluatorPrompt(state, paths, knowledge, options)` 신설. 반환 string 은 evaluator subagent 가 받을 dynamic context. fitness 통합 시 재사용 가능하도록 `stage` 옵션 인자로 받음.
3. **Validation wiring**: `src/cli/commands/run/validation.ts` `phase: work` 에서 config 를 읽어 `config.evaluator === true` 일 때만 prompt 끝에 "Evaluator Subagent Invocation" 절을 추가하고 context 에 `evaluatorPrompt` 동봉. **`false` 일 때는 기존 prompt 와 byte-identical** (회귀 0 보장).
4. **Advisor 관계 명문화**: 그 절은 명시적으로 builder 가 verdict 결정, evaluator concern 을 user 에게 surface, evaluator 호출 실패 시 통상 validation 진행을 지시.
5. **OpenCode agent 배치**: `src/adapters/opencode/install.ts` 에 `installAgents()` 추가 — `~/.config/opencode/agent/reap-*.md` 로 `src/templates/agents/` 내용 cleanup-then-copy. `installSkills` 와 `registerSessionIntegration` 양쪽에서 silent helper 형태로 호출 (gen-064 패턴).
6. **Claude Code agent 양쪽 caller 보장**: `installAgents()` 가 `installSkills` 와 `registerSessionIntegration`(=registerSessionHooks 의 caller) 양쪽에서 호출되어 `reap update` 만으로도 agent 파일 sync 됨.
7. **Dog-fooding**: `.reap/config.yml` 에 `evaluator: true` 추가.
8. **테스트**: unit (`buildEvaluatorPrompt`), e2e (validation work prompt 옵션별 분기 + 양 adapter 의 agent install caller 검증).
9. **문서**: `README.md` 에 `reap-evaluate` 설정/동작 절, `vision/design/evaluator-agent.md` 진행 상태 갱신, `src/templates/reap-guide.md` 와 `.reap/reap-guide.md` 동기화 (필요 시).

## Approach

### Why this scope

- evaluator subagent 호출은 prompt 안의 instruction 만으로 충분. main agent (builder) 가 `Agent` tool 호출을 수행. 기존 `evolve.ts` 패턴 그대로 재사용.
- `validation.ts` complete phase 의 `verifyArtifact` 가 placeholder 검사를 이미 수행 — evaluator 호출 결과는 04-validation.md 에 builder 가 직접 기록하면 됨. 별도 강제 메커니즘 불필요.
- OpenCode 에 agent 배치 추가는 evolution.md "Echo Chamber Prevention" 원칙에 부합. 사용자 Q4 답변으로 명시 허용. Codex 추가까지 미루지 않고 본 generation 에 포함하는 게 자연스럽다 — 둘 다 처리하면 다음 generation 들이 platform 차이를 신경 안 써도 됨.

### Tradeoff 노트

- **Builder 가 verdict 를 override 할 수 있나?** Advisor 모델 — Yes. evaluator 의 escalation 은 builder 의 verdict 와 별개로 user 에게 surface 됨. lifecycle 흐름 (validation 의 pass/partial/fail) 은 builder 가 결정. 이게 evaluator-agent.md 의 escalation matrix (line 76-84) 정신과 일치.
- **OpenCode agent 디렉토리 경로 확인** — OpenCode 바이너리 string 검색 결과 4 패턴 (`.opencode/agent/`, `.opencode/agents/`, `agent/`, `agents/`). global home 은 `~/.config/opencode/agent/` (singular, TUI 의 공식 tip 인용). `commands/` (plural) 와 다름 — 헷갈리지 않도록 주석에 명시.
- **prompt 의 분기 깊이** — `validation.ts` 가 config 를 읽도록 변경. 기존엔 `validation.ts` 가 config 무관. 의존성 추가 단가는 작음 (이미 `completion.ts` 에서 같은 패턴).

### 변경하지 않을 것

- `reap-evaluate.md` agent template 자체 (이미 충분히 정의됨).
- `validation.ts` `phase: complete` (그대로 둠).
- `completion.ts` (fitness 통합은 별도 backlog).
- evolve.ts, prompt.ts 의 `buildBasePrompt` (evaluator prompt 와 별개).
- cruise 관련 로직.

## Risk Assessment

- **R1: opt-in false 회귀** — config 추가만으로 기존 동작이 바뀌면 안 됨. 보장 방법: validation work prompt 의 evaluator 절은 `config.evaluator === true` 일 때만 append. e2e 에서 false case 의 prompt 가 기존 prompt 와 동일함을 검증.
- **R2: `buildEvaluatorPrompt` 가 너무 일반화되어 fitness 통합 시 재설계 필요** — 인자 시그니처에 `stage: "validation" | "fitness"` 옵션을 미리 받아 둠. fitness 통합 시 stage 만 바꾸면 됨.
- **R3: OpenCode agent dir 컨벤션 추측 실패** — OpenCode 바이너리 strings 출력으로 4 패턴 (`.opencode/agent/`, `.opencode/agents/`, `/agent/`, `/agents/`) 확인. 글로벌 home (`~/.config/opencode/`) 에서는 `agent/` (singular) 사용 (TUI tip 의 공식 안내). 실증으로 1 파일 배치 → opencode 가 인식하는지 e2e 또는 수동 검증.
- **R4: agent 정의 cleanup 시 사용자가 만든 다른 agent 파일 삭제** — prefix anchor pattern (`^reap-.*\.md$`) 으로 정밀 검색. gen-064 의 `installSlashCommands` 패턴 그대로 차용. unit 으로 cleanup pattern 검증.
- **R5: `reap update` 가 `installSkills` 가 아닌 `registerSessionIntegration` 만 호출하는 caller 불일치 (gen-064 longterm 교훈)** — agent install helper 를 양쪽에서 호출. test caller mapping 검증 (e2e: `reap update` 후 agent 파일 존재 확인).

## Scope

### 변경 파일

- `src/types/index.ts` — `ReapConfig.evaluator?: boolean`
- `src/core/prompt.ts` — `buildEvaluatorPrompt()` 신설
- `src/cli/commands/run/validation.ts` — config 읽기 + evaluator 절 조건부 append + context.evaluatorPrompt
- `src/adapters/claude-code/install.ts` — `installAgents()` 를 export, `registerSessionHooks` 의 caller (`registerSessionIntegration`) 흐름에서도 호출되도록 변경
- `src/adapters/opencode/install.ts` — `installAgents(home?)` 신설, `installSkills` + `registerSessionIntegration` 양쪽에서 호출
- `.reap/config.yml` — `evaluator: true` (dog-fooding)
- `.reap/vision/design/evaluator-agent.md` — validation 통합 완료 표기 + 남은 작업 명시
- `README.md` — evaluator 절 추가 (config, 활성화 방법, 동작 요약)
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` — evaluator 절 동기화 (필요 시)

### 신규 테스트 파일

- `tests/unit/prompt.test.ts` (또는 기존 파일에 추가) — `buildEvaluatorPrompt` 단위 테스트
- `tests/e2e/validation-evaluator.test.ts` — validation work 분기 검증
- `tests/e2e/install-agents.test.ts` — Claude Code + OpenCode 양 adapter agent 배치 + caller 검증

### Out of scope

- completion fitness phase evaluator 통합
- Vision/Goal 위임
- cruise mode escalation 자동 중단
- `reap-evaluate.md` template 본문 수정 (이미 충분)
- Codex adapter (현재 미지원)

## Tasks

- [ ] T001 `src/types/index.ts` — `ReapConfig.evaluator?: boolean` 필드 추가 (autoSubagent/strictEdit 같은 패턴, 주석으로 기본 false 명시).
- [ ] T002 `src/core/prompt.ts` — `buildEvaluatorPrompt(state, paths, knowledge, opts: { stage: "validation" | "fitness" })` 함수 신설. 포함 섹션: Goal, Generation State, Vision Goals, Memory (shortterm + midterm), Project Path, Stage 명시, Read These Artifacts (01~04 path), Verification Tasks, Output Format (escalation matrix 인용), HARD-GATE (no code modification, no git modification, no fitness self-assessment), Fallback (호출 실패 시 builder 통상 진행).
- [ ] T003 `src/cli/commands/run/validation.ts` — config 읽기 추가. `phase: work` 의 prompt 생성에 evaluator 절 조건부 append. config null/false 시 기존 prompt 와 동일 (byte-identical 검증을 e2e 로). context 에 `evaluator: { enabled: bool, prompt?: string }` 추가.
- [ ] T004 `src/adapters/claude-code/install.ts` — `installAgents()` 를 export 하고 silent helper 로 분리. `installSkills` 와 `registerSessionIntegration` (=registerSessionHooks 의 caller) 양쪽에서 호출. gen-064 의 `installSlashCommandsOnly` 와 동일 패턴.
- [ ] T005 `src/adapters/opencode/install.ts` — `installAgents(home?)` 신설. target: `~/.config/opencode/agent/`. source: `src/templates/agents/` (dist 분기). prefix `^reap-.*\.md$` cleanup-then-copy. helper export 후 `installSkills` + `registerSessionIntegration` 양쪽에서 호출. `claudeCodeSkillsDir()` 의 dist 분기 패턴 차용.
- [ ] T006 `tests/unit/prompt.test.ts` — `buildEvaluatorPrompt` 6 케이스: (a) validation stage 기본, (b) fitness stage 기본 (미래용), (c) memory 비어있을 때, (d) knowledge.visionGoals 비어있을 때, (e) state null 일 때 (방어), (f) HARD-GATE 포함 검증.
- [ ] T007 `tests/e2e/validation-evaluator.test.ts` — 3 케이스: (a) `evaluator: false` 시 prompt 가 기존과 동일 (회귀 검증), (b) `evaluator: true` 시 prompt 에 evaluator 절 + `context.evaluator.prompt` 존재, (c) config 파일 없을 때 false 와 동일 동작.
- [ ] T008 `tests/e2e/install-agents.test.ts` — 4 케이스: (a) Claude Code `installSkills` 후 `~/.claude/agents/reap-*.md` 존재, (b) Claude Code `registerSessionIntegration` 단독 호출 후에도 agent 파일 존재 (= `reap update` 시나리오), (c) OpenCode `installSkills` 후 `~/.config/opencode/agent/reap-*.md` 존재, (d) OpenCode `registerSessionIntegration` 단독 호출 후에도 존재. tmp home 으로 sandbox.
- [ ] T009 `.reap/config.yml` — `evaluator: true` 추가 (dog-fooding 시작). **implementation 단계 마지막에 수행** — 본 generation 의 validation 이 self-dogfooding 으로 evaluator 절을 받게 됨.
- [ ] T010 `.reap/vision/design/evaluator-agent.md` — "후속 작업 (미구현)" 절을 갱신. validation 통합은 완료 표기. fitness 통합 + cruise escalation 은 `cruise-mode-evaluator-escalation-통합-validationfitness.md` backlog 참조로 변경.
- [ ] T011 `README.md` — "Evaluator Agent" 절 추가 (또는 기존 절 보강). 내용: opt-in 활성화 방법 (`evaluator: true` in `.reap/config.yml`), 동작 요약 (validation 단계에서 reap-evaluate 호출, advisor 역할, builder 가 verdict 결정), 양 adapter 지원, 알려진 한계 (fitness/cruise 통합 별도 backlog).
- [ ] T012 `src/templates/reap-guide.md` + `.reap/reap-guide.md` — adapter 표 또는 별도 절에 evaluator opt-in 1~2 줄 안내 추가 (필요 시). 두 파일 동기화 (gen-065 의 dog-fooding 패턴).
- [ ] T013 typecheck / build / unit / e2e 전체 실행 + 결과 04-validation.md 에 기록.
- [ ] T014 (validation 단계에서) `evaluator: true` 가 활성화된 본 generation 의 self-dogfooding 검증 — `reap run validation` 호출 시 evaluator 절이 prompt 에 포함되는지 실제 stdout 확인.

## Dependencies

- T001 → T002 (type 정의 후 prompt builder 가 사용)
- T002 → T003 (prompt builder 후 validation 에서 호출)
- T003 → T007 (구현 후 e2e)
- T004 + T005 → T008 (양 adapter 변경 후 통합 e2e)
- T009 → T014 (dog-fooding 활성화 후 self-test)
- T010 + T011 + T012 는 T001~T009 이후 (사실 명세 변경 반영 차원)
- T013 은 가장 마지막 (모든 코드 변경 적용 후)

## Additional Findings

### OpenCode agent 디렉토리 확정 (planning 중 실증)

- OpenCode 1.3.16 바이너리 strings 출력에서 패턴 발견:
  ```
  const patterns = ["/.opencode/agent/", "/.opencode/agents/", "/agent/", "/agents/"];
  ```
- TUI tip 공식 인용: `Add {highlight}.md{/highlight} files to {highlight}.opencode/agent/{/highlight} for specialized AI personas` — singular `agent/`.
- 따라서 global 위치는 `~/.config/opencode/agent/`. (commands 는 plural `commands/` — 명명 비대칭 OpenCode 자체 결정).
- 결정: `installAgents` 의 target = `~/.config/opencode/agent/` (singular).

### Claude Code `installAgents` 의 silent helper 분리 (T004)

- 현재 `installAgents` (line 95-113) 는 이미 silent (no emitOutput). 단 `installSkills` 안에서만 호출되고 `registerSessionHooks` 의 caller 흐름에서는 호출 안 됨.
- 결과: 사용자가 `reap update` 만 실행 시 agent 파일 stale 가능 (gen-064 longterm 의 정확한 case).
- 변경: `installAgents` 를 export. `registerSessionIntegration` (claude-code adapter 의) 에서도 호출. e2e T008 (b) 케이스 필수.

### config 가 없는 시나리오 (T003 의 R1 보강)

`validation.ts` 가 config 를 읽을 때 파일 미존재 / 파싱 실패 가능. 기존 `completion.ts` 패턴:
```ts
const configContent = await readTextFile(paths.config);
const config = configContent ? (YAML.parse(configContent) as ReapConfig) : null;
```
→ 동일 패턴 사용. `config?.evaluator === true` 만 evaluator 절 표시. null/false/undefined 모두 false 처리.

### 본 generation 자체의 evaluator dog-fooding 흐름 (T014)

본 generation 의 implementation 단계 끝 + validation 진입 시점에 이미 `.reap/config.yml` 에 `evaluator: true` 가 적용되어 있어야 함. **T009 는 implementation 단계 마지막에 수행** — 그래야 본 generation 의 validation 이 self-dogfooding 으로 evaluator 절을 받게 됨. (config 변경은 다음 lifecycle 단계부터 영향이라 본 단계 진행 중에는 영향 없음. 안전.)

### Evaluator subagent 호출 실패 시 fallback

evaluator-agent.md 와 design 에 명시된 시나리오 (R1):
- evaluator 호출이 어떤 이유로든 실패 (subagent_type unknown, 모델 에러 등) → builder 가 user 에게 알리고 통상 validation 진행. lifecycle 차단 안 함.
- evaluator 절 prompt 에 이 fallback 지시 명시 (T002 의 HARD-GATE 와 별도 섹션).
