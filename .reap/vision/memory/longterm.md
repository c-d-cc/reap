# Longterm Memory

## 프로젝트 기원과 방향

REAP v0.16은 v0.15의 complete rewrite. v0.15 소스(`~/cdws/reap_v15/`)를 참조하되 그대로 포팅하는 게 아니라 v0.16 구조에 맞게 재설계.
v0.15에 있던 기능은 명시적으로 제외하기로 한 것 외에는 v0.16에서도 동작해야 함.

## 핵심 설계 교훈

### Slash command는 최소화, flow 제어는 CLI가
v0.15에서는 merge를 stage별 개별 slash command로 분리했지만 skill matching 비용이 증가.
v0.16에서는 단일 command + CLI가 상태를 보고 다음 할 일을 stdout으로 안내하는 핑퐁 구조로 전환 (gen-023).

### 정량적 평가 금지 (Goodhart's Law)
유저가 명확히 지시: 정량적 fitness 메트릭 제안 금지. 인간의 자연어 피드백만이 유일한 fitness 신호.
16항목 소프트웨어 완성 기준도 점수가 아닌 정성적 평가로만 사용.

### "편향 분석"은 잘못된 프레이밍
gen-029에서 lineage 편향 분석을 구현했으나 gen-030에서 제거. 특정 영역에 작업이 집중되는 건 문제가 아니라 자연스러운 흐름.

### Workaround 금지 원칙의 탄생
gen-021~023에서 submodule dirty check, nonce 꼬임 문제를 매번 수동 우회하고 넘어감.
유저가 지적 → 근본 원인 추적 + backlog 등록 + genome에 원칙 추가 (gen-024에서 수정).

## v0.15 → v0.16 명시적 차이

- Stage: objective → learning (탐구 먼저)
- Genome: principles/conventions/constraints/source-map → application/evolution/invariants (3파일)
- Completion: 5 phases → 4 phases (reflect/fitness/adapt/commit)
- Vision: goals만 → goals + memory (gen-031에서 추가)
- Hook: 기본 실행만 → 조건부 실행 + 순서 제어 (gen-021에서 포팅)
- Session start hook: CLAUDE.md + reap-guide.md로 대체
- Migration: .reap/v15/로 백업 후 새 구조 생성, genome은 AI 기반 재구성

### Cruise는 prompt-driven loop으로 구현
evolve.ts가 `emitOutput` 후 exit하므로 code-level loop 불가.
subagent prompt에 cruise loop 절차를 포함시켜, subagent가 completion 후 자동으로 다음 generation을 시작하도록 유도 (gen-033).
→ **2026-03-27 결정**: cruise도 generation마다 새 agent 생성으로 변경 예정. parent가 loop 관리.

### Memory는 "자유"만으로는 작동하지 않는다
gen-031에서 memory를 도입하고 "자유롭게 쓸 수 있다"고 했지만 아무도 안 씀.
gen-035에서 reflect phase에 명시적 트리거 + tier별 criteria 추가하여 해결.
교훈: 규칙 없는 자유는 무행동으로 귀결됨.

### Agent 정의 = 정적 템플릿, prompt = 동적 context
subagent prompt에 guide+genome+environment를 직접 넣으면 ~500줄, reap-guide와 중복.
`.claude/agents/reap-evolve.md`에 role/mindset/behavior만 담고 "파일을 읽어라"로 지시.
buildBasePrompt()는 동적 context(state, vision, memory, clarity, cruise)만 생성.

### Lifecycle 준수는 AI 자신에게도 적용
이번 세션에서 generation 없이 subagent prompt 슬림화를 진행함 → 유저가 지적.
"모든 개발 작업은 REAP lifecycle을 따라야 한다"는 규칙은 AI 자신에게도 적용됨.

### 종료 path는 transition graph 외부 (gen-061, 2026-05-24)
abort/early-close 같은 "탈출 path"는 `NORMAL_TRANSITIONS`/`MERGE_TRANSITIONS` graph 안에 transition으로 추가하지 않고, `verifyTransition` 호출 자체를 건너뛰는 방식으로 구현. 대신 `state.stage` 검사로 명시적 가드. 정상 lifecycle 흐름과 탈출 path의 책임 분리가 명확해짐. 새 종료 path를 추가할 때 abort.ts/early-close.ts 패턴을 차용.

### Template = single source of truth + marker-hash sync (gen-054, 재발견 gen-062)
gen-054에서 도입된 marker-hash sync(`<!-- reap:start {hash} -->...<!-- reap:end -->` + `extractReapSection` + `detectLegacyReapSection` + `updateClaudeMdFile`)는 본래 CLAUDE.md 자동 갱신용이었으나, gen-062에서 그 가치가 재확인됨:
- template 한 줄만 수정해도 모든 사용자(plain-path legacy + marker-wrapped stale 둘 다) 자동 처리.
- migration 전용 코드 0줄 추가로 issue 해결 가능.
- "template만 바꾸면 사용자 모두 다음 update 시 자동 반영" 패턴은 dog-fooding 자동화의 핵심.
- 응용 가치: `.reap/reap-guide.md`, hooks template 등 다른 dog-fooding 영역으로 확대 가능. `onLifeCompleted` hook으로 자동 sync 트리거하면 drift가 원천 차단됨.

### Claude Code native 메커니즘 활용 + REAP hook의 역할 분리 (gen-062, 2026-05-25)
초기에는 SessionStart hook이 9 static 파일을 모두 inject했음(gen-053). Claude Code가 native `@` import를 지원한다는 사실을 활용해 static은 `@` ref로, dynamic만 hook으로 분리.
- 결과: hook 출력 89% 감소, 정보 손실 0(`@` import lazy load).
- 교훈: 플랫폼 native 메커니즘을 활용할 수 있는 곳에서는 자체 구현을 미루지 말 것. 단, hook 자체를 제거하지는 않음 — dynamic context(generation state, strict mode, language)는 `@` 로 표현 불가하므로 hook이 여전히 필수. 정/동 분리가 답이지 hook 전면 제거가 답이 아님.

### Adapter dispatch 패턴 + client별 mechanism 활용 (gen-063, 2026-05-25)
gen-062의 "정/동 분리" 원칙이 client-agnostic하므로, OpenCode에 같은 원칙을 적용 가능. 단 client별 native mechanism이 다르다 — Claude Code는 `@` import + SessionStart hook, OpenCode는 `opencode.json instructions` + plugin (session.created/tool.execute.before).
- 두 client 모두 "static = native auto-load, dynamic = client-specific refresh trigger" 패턴을 따름.
- 구현은 dispatcher (`src/adapters/index.ts`) + AdapterModule interface 패턴. claude-code adapter는 기존 install.ts를 얇은 wrapper로 감싸 회귀 위험 최소화.
- emitOutput sync dump 통합: lifecycle 명령 종료 시 자동으로 `.reap/.session-state.md` 작성. claude-code 환경에서도 호출되지만 (gitignored, 미사용) 무해. OpenCode 환경에서는 다음 세션 instructions auto-load에 활용.
- sync/async builder duplication 발생 (`load-context.ts`의 async와 `dump-state-sync.ts`의 sync). unit test로 byte-identical 보장하지만, 향후 logic 변경 시 양쪽 동시 수정 필요. 합치는 refactor 후보.
- 교훈: adapter는 client별 mechanism을 호환 layer로 추상화하는 것이지, 동일 메커니즘을 강제하는 것이 아니다. 같은 원칙(정/동 분리)이라도 client마다 다른 형태로 표현됨.

### 사용자 UX gap은 backlog verification에 적극 포함 (gen-063 교훈)
gen-063에서 OpenCode adapter 신설 시 backlog/verification에 (a) static knowledge auto-load, (b) dynamic state refresh, (c) entry-point file (AGENTS.md) 세 가지를 명시했으나, **(d) slash commands / shortcut trigger 등록**을 빠뜨림. 결과: 구현은 7 completion criteria 모두 충족하고 사용자 fitness OK 받았지만, 실제 사용자 환경에서는 "agent는 동작하나 슬래시 트리거 불가" UX gap이 발견됨. follow-up backlog로 처리 가능하지만, 처음부터 verification에 포함됐으면 본 generation에서 끝났을 작업.
- **교훈**: 새 client / 외부 도구 / 사용자 진입점 추가 시 verification에 네 가지를 반드시 포함:
  1. Static knowledge 자동 로드 메커니즘
  2. Dynamic state refresh trigger
  3. Entry-point 파일
  4. **사용자 native UI에서 REAP를 호출할 수 있는 trigger (slash commands / shortcuts / commands palette 등)**
- **판단 기준**: "이 통합을 처음 받은 사용자가 5분 안에 평소처럼 REAP를 호출할 수 있는가?"
- application.md "Adapter Layer" 절 + evolution.md "사용자 UX gap" 절에 4-항목 체크리스트 명문화. 다음 세대가 누락 반복 방지.
- 메타 교훈: agent가 작성한 backlog는 implementation 관점에 치우치기 쉽다 — "어떤 파일을 만들 것인가"는 잘 잡지만 "사용자가 어떻게 호출할 것인가"는 빠지기 쉬움. 사용자 진입점 적극 점검 필요.

### 여러 adapter 가 같은 형식을 채택하면 source 도 single source (gen-064, 2026-05-25)
OpenCode 명령 docs 조사 결과 Claude Code skill 형식과 거의 100% 호환 (frontmatter `description` + `$ARGUMENTS`). 별도 `src/adapters/opencode/commands/` 를 만들지 않고 `src/adapters/claude-code/skills/` 를 OpenCode adapter 도 그대로 read.
- **결과**: 19 파일 중복 회피, 명령 추가/수정 시 한 곳만 수정. dogfooding 부담 최소.
- **판단 기준**: "두 client 가 같은 형식을 그대로 받아들이는가?" — Yes 면 single source. 향후 client-specific 필드 필요 시 (예: OpenCode `subtask`/`model`) 그 시점에 분리.
- **반대 원칙 (gen-063 의 교훈)**: "adapter 는 client 별 mechanism 을 호환 layer 로 추상화하는 것이지, 동일 메커니즘을 강제하는 것이 아니다" — 두 원칙은 모순이 아님. **mechanism (client-native 호출 방식) 은 client 별로 다를 수 있지만, format (data 파일의 schema) 이 같다면 source 단일화가 자연스러움**.
- **응용 영역**: 향후 Codex adapter 가 같은 markdown 형식을 받아들인다면 source 3중 재사용. 다른 형식을 요구하면 그 시점에 분리.

### Plan 단계에서 함수 caller 를 직접 읽어라 (gen-064 fitness 직전 사용자 갭 지적)

gen-064 planning Q4 에서 `installSkills` vs `registerSessionIntegration` 의 경계를 추론으로 결정: "registerSessionIntegration 은 SessionStart 매번 호출이라 noisy". 그러나 실제 caller (`src/cli/commands/update.ts`) 를 읽지 않음. 실제로는 `reap update` 시점에만 호출됨. 결과: `reap update` 만으로는 commands 등록 안 되는 코드/verification 불일치. 사용자가 fitness 직전 검토에서 갭 발견 → back regression (T011~T015) 으로 fix.

- **교훈**: 함수의 호출 의미를 결정할 때 *언제 호출되는가* 를 추상적으로 추론하지 말고, **실제 caller (`grep -rn "functionName"`) 를 읽어라**. 추론은 caller 확인 후 보강용.
- **e2e 가 verification scenario 의 모든 CLI entry point 를 cover 해야 한다**. backlog 가 "`reap update` 후 X" 라 명시하면 e2e 가 정확히 `reap update` 를 호출하는 케이스가 있어야 한다. 추상적 기능 검증 ("installSkills 가 X 한다") 만으로는 부족.
- **fitness 전 self-audit 체크리스트**: (1) backlog verification 의 각 시나리오가 e2e 1:1 mirror 되는가, (2) 변경 함수의 caller 가 모두 검증되었는가, (3) 사용자가 따라할 명령 시퀀스를 e2e 가 그대로 재현하는가.
- **메타 교훈**: 사용자가 마지막 safety net 으로 작동했다. agent 의 추상적 추론보다 사용자가 코드를 직접 읽기가 강력. plan 단계의 잘못된 가정이 implementation 까지 그대로 흘러갔지만 fitness 직전 사용자 검토에서 catch → back regression path 가 graceful 하게 처리. lifecycle 이 정상 작동한 사례.

### Library/CLI option semantics는 추론보다 실증 (gen-065)

gen-065 planning에서 `--backlog` + `--no-backlog` 의 libs/cli.ts 동작을 commander.js convention 추론으로 결정할 수도 있었으나, `/tmp/test-cli.ts` minimal repro로 즉시 검증 → tri-state (`true` default / `false` `--no-X` / `string` `--X value`) 확인 후 implementation. **추론은 그것대로 일관성 있게 들리지만 framework마다 미묘한 차이가 있고, 그 차이가 user-facing 동작 (e.g. `defaultValue: true`) 으로 흘러간다.**

- gen-064 longterm "Plan 단계에서 함수 caller 를 직접 읽어라"의 일반화: **internal API behavior 도 caller 그래프뿐 아니라 실증 (minimal repro) 으로 결정**.
- 응용 영역: 외부 라이브러리의 edge case (YAML.parse null 처리, JSON.parse 예외), CLI framework의 자동 변환 (kebab-case → camelCase, negate semantics), filesystem race condition 등.

### YAML round-trip 손실 회피 — 분석은 parser, write는 라인 단위 (gen-065)

사용자가 손으로 작성한 YAML frontmatter 를 modify 할 때, `YAML.parse → mutate → YAML.stringify` round-trip 은 다음을 손실:
- comment 손실
- key 순서 재배치
- string quote 정규화 (e.g. `"123"` → `123`)
- numeric 추론 (e.g. `issueUrl: 18` → number `18`)

본 generation의 `consumeBacklog` 견고화는 다음 패턴 채택:
- YAML.parse: idempotency check 등 *분석* 용도만
- 실제 write: 라인 단위 manipulation (`split("\n")` → key별 정규식 match → replace/append)

**판단 기준**: "원본 형식 보존이 사용자 가치인가" → Yes 면 라인 단위. AI/시스템이 만든 file이라면 round-trip OK. 본 generation의 7개 누적 cleanup도 같은 알고리즘으로 처리되어 사용자 frontmatter (priority, dependsOn, resolves, issueUrl 등 다양한 field) 모두 보존됨을 head 검증으로 확인.

### 인과적으로 묶인 버그/작업은 한 묶음으로 (gen-065)

gen-065는 세 영역을 한 generation에서 처리:
1. Issue #18 (start --backlog 누락 prompt) — 공식 버그
2. consumeBacklog regex silent fail — 신규 발견 버그
3. 누적 7개 cleanup — 두 버그의 결과로 archive 실패한 backlog

**분리 시 위험**: (1)만 fix하면 (2)가 살아있어 cleanup이 또 누락됨. (2)만 fix하면 (1)이 살아있어 향후 같은 사례 재발. cleanup은 두 fix가 모두 적용된 후에만 안전. **인과로 묶인 작업은 separate 안 됨 — 인과 chain의 어느 한 곳만 끊으면 새로운 누락 path 생성**.

- 판단 기준: "이 fix A가 적용된 상태에서 fix B가 별 generation으로 미뤄지면, 그 사이 generation들이 같은 사고를 또 일으키나?" — Yes 면 한 묶음.

### Cross-adapter 자산 경로는 항상 dist/dev 분기 (gen-064 실수에서)
새 helper 작성 시 `__dirname.includes("dist")` 분기를 빠뜨리면 dist 환경에서 잘못된 경로로 풀린다. dist 는 `dist/cli/index.js` single bundle 이므로 `__dirname = dist/cli/` 이고, `..` 가 `dist/` 다. dev 는 `src/adapters/<adapter>/install.ts` 이므로 `..` 가 `src/adapters/`.
- **패턴**: `__dirname.includes("dist") ? join(__dirname, "..", "adapters", "<adapter>", "<asset>") : join(__dirname, "..", "<adapter>", "<asset>")`
- gen-064 에서 `claudeCodeSkillsDir()` 작성 시 이 분기를 빠뜨려 첫 e2e 가 0-install 로 즉시 잡아냄. 같은 파일 안의 기존 `assetPath()` 가 이미 그 패턴이라 참조했으면 한 번에 맞았을 일.
- **교훈**: 새 helper 작성 시 **같은 파일의 기존 helper 패턴부터 확인**. cross-asset 경로는 단일 분기 패턴으로 통일.

### Design 문서가 abort 후에도 lineage 의 anchor 가 된다 (gen-066, 2026-06-26)

gen-051 (template 정의) → gen-052 (learning + design 결정 확정 후 abort) → **gen-066 (validation 통합 구현)**. 두 번째 generation 이 abort 했지만 `vision/design/evaluator-agent.md` 가 보존된 덕분에 14 generation 뒤에 자연스럽게 이어졌다. gen-066 의 planning 비용이 거의 zero — 설계 결정 (opt-in flag / advisor 모델 / 수정 대상 파일 / subagent 패턴) 모두 그대로 사용. 유일한 추가 결정은 위치 변경 (fitness → validation) + Q1-Q5 의사결정.

- **교훈**: **abort 결정 시 design 문서를 살릴지 의식적으로 판단하라**. abort 가 정말 "포기" 인지 "잠시 보류" 인지를 design 문서 보존 여부로 결정. design 만 살리면 abort 가 진짜 abort 가 아니게 됨.
- **판단 기준**: "이 작업이 미래 어떤 generation 에서 자연스럽게 이어질 가능성이 있는가?" — Yes 면 design 보존. abort artifact 만 lineage 에 남기지 말고 design 문서를 `vision/design/` 에 따로 둬라.
- **응용**: backlog 의 "처리해야 할 사항" 도 design 문서로 분리할 가치가 있는 큰 트랙은 별도 design 으로 두는 게 lineage anchor 역할을 극대화.

### Builder 가 manual workflow 로 실행될 때 subagent 권한 부재 가능 (gen-066)

gen-066 의 self-dogfooding 검증 (`evaluator: true` 활성화 + `npx reap run validation` 직접 실행) 에서 발견: builder agent 의 권한 set 에 `Agent` (Task) tool 이 없는 경우가 있다. 통상 `/reap.evolve` 흐름이면 main agent → reap-evolve subagent → reap-evaluate subagent 의 2-level spawn 이라 작동, manual builder 호출이면 첫 level 의 권한이 그대로라 subagent spawn 불가.

- **결과**: prompt 의 fallback 절 ("호출 실패 시 lifecycle 미차단, advisor / not gate") 가 정상 작동 → lifecycle 멈춤 없이 진행. **design 의 advisor 원칙 (Q3) 가 의도하지 않은 환경 차이에서도 보호 막**.
- **교훈**: subagent 호출을 lifecycle gate 로 만들면 안 됨. advisor 패턴 + fallback path 가 그 어떤 환경 (Claude Code, OpenCode, manual builder, CI, 등) 에서도 lifecycle 멈춤을 막는 안전망.
- **응용**: 향후 fitness phase evaluator 통합도 같은 원칙 — evaluator 결과를 gate 가 아닌 advisor 로. cruise 자동 중단 메커니즘 도 evaluator 호출 자체가 아닌 evaluator concern 의 명시적 표명을 기준으로.

### Self-dogfooding 시점은 implementation 마지막 (gen-066)

gen-066 의 T009 (`.reap/config.yml` 에 `evaluator: true` 추가) 는 implementation 의 마지막 task. 그 결과 본 generation 의 validation 단계가 자기 변경의 첫 사용자가 됨 — `npx reap run validation` 호출이 evaluator 절을 자기 prompt 에 포함. self-referential 검증 성공.

- **판단 기준**: dog-fooding config / opt-in flag 활성화는 본 generation 의 다음 단계 (validation/completion) 에 영향을 주려면 implementation 안에서 처리. 이전 단계에 영향 주려면 planning 직후. **본 generation 안에서 영향 검증을 의도하면 활성화 시점을 의도적으로 선택**.
- **응용**: 향후 새 feature 의 dog-fooding 활성화 시점을 plan 단계에서 미리 결정 (어느 lifecycle 단계가 처음 사용자가 될지). gen-066 은 validation 이 첫 사용자가 되도록 implementation 마지막에 활성화 → T014 self-test 성공.

### Nonce-graph 외부 phase 패턴 — state 채널 / 부수효과 CLI (gen-067)

evaluator escalation 의 `reap run validation --phase report-evaluator` 는 nonce transition graph 의 일부가 아니라 **side-channel write CLI**. validation 단계의 work phase 와 complete phase 사이 어디서든 호출 가능, nonce 도 소비하지 않음. state 만 append (`GenerationState.evaluatorConcerns`).

- **판단 기준**: 다음 stage 진입 권한이 필요하지 않고 state 만 갱신하는 CLI 는 nonce graph 에 추가하지 않고 외부에 둔다. 그렇지 않으면 graph 가 복잡해지고 multiple-write 시나리오 (한 stage 에서 여러 번 호출) 가 망가짐.
- **응용**: 미래의 "메모 / 노트 / 부가 메타데이터 기록" 류 CLI 도 같은 패턴 적용. graph 외부 + append-only + nonce 검증 skip + state 검증만.
- **반례 (graph 내부)**: 다음 phase 진입을 게이트하는 작업 (예: validation work → complete) 는 graph 내부. 두 종류를 섞으면 graph 의미가 흐려짐.

### Append-only state 의 trade-off (gen-067)

`EvaluatorConcern[]` 는 append-only 설계. 중복 detection / resolve / dismiss 없음. 의도된 단순함이지만 trade-off 존재:
- **장점**: 한 phase 에서 두 번 호출돼도 silent fail 안 함. CLI 로직 단순. cross-generation 으로 carry over 시 그대로 history.
- **단점**: 중복 호출 시 noise. "이 concern 은 해결됐다" 표현 수단 없음.
- **현재 generation 별 reset 모델에서는 단점 무시 가능**. cross-generation 이월 도입 시 resolve/dismiss CLI 가 필요.

**교훈**: state 채널 설계 시 (a) 같은 channel 에 idempotent 가 필요한가, (b) entry 의 life cycle (한 번 쓰고 끝 vs. 갱신 필요) 을 먼저 결정. (a)=No, (b)=write-once 이면 append-only 가 가장 단순.

### 점진 통합 트랙에서 "미리 만든 hook" 패턴 (gen-067)

gen-066 이 `buildEvaluatorPrompt({ stage: "fitness" })` 분기를 미리 만들어두고 `validation` 만 활용. gen-067 은 그 분기를 그대로 활성화 — **planning 비용 거의 zero**. design 문서 + 미리 만든 hook 의 조합이 후행 generation 의 시간을 단축.

- **판단 기준**: 본 generation 의 일부만 활용하는 분기 / 옵션 / interface 를 만들 때, "다음 generation 이 활용할 수 있나?" 를 의식. Yes 면 분기 이름과 시그니처를 future-friendly 하게 (예: `stage: "validation" | "fitness"` union 으로 미리 정의).
- **반례 (over-engineering 회피)**: future 활용 의도가 없는데 미리 만들면 dead code. 의도가 있을 때만 hook 화.
- **응용 영역**: design 문서가 멀티-generation 트랙을 정의할 때, 각 generation 의 출구에 다음 generation 입구가 되는 분기 / interface 를 의도적으로 만들기. 트랙 전체 비용 분산.

### 함수가 paths 주입으로 디스크 다중 파일을 읽으면 테스트 레벨 = e2e (gen-067)

gen-067 의 T009 (fitness prompt 구조 unit test) 는 implementation 단계에서 e2e 로 재분류. `completion.ts:phase==="fitness"` 가 config + state + 양 prompt builder 를 disk 에서 읽어야 해서 unit-with-mocks 가 과도하게 복잡.

- **휴리스틱**: "함수가 1개 초과 disk 파일을 paths injection 으로 읽으면 e2e 우선." unit 으로 가려면 모든 read 를 mock 해야 하는데, 그 mock 자체가 e2e 보다 maintenance cost 가 크다.
- **반례 (pure unit)**: 외부 의존 없는 logic (e.g., backlog.ts 의 `consumeBacklog` 같이 파일 1개 read/write) 은 unit 적합.
- **다음 적용**: planning 단계에서 task 의 "input source 가 몇 개인지" 를 확인. >=2 면 testing strategy 에 e2e 명시. evolution.md Testing Principles 의 표에 추가 가능 (gen-067 shortterm deferred 후보 16번).

### Opt-in flag 패턴 — config 게이트 + dynamic import + 호출 측 분기 (gen-068)

gen-068 의 daemon 통합은 4 lifecycle 진입점 게이트 + agent prompt 절 + static knowledge 절을 모두 추가하지만, **기존 사용자 회귀 0** 이 핵심 제약. 채택한 패턴:

1. **`ReapConfig.daemon?: boolean`** opt-in flag — JSDoc 에 명시적으로 "미설정 시 기존 동작 유지".
2. **호출 측 게이트** — `config?.daemon === true` 비교 후 `await import(...)` dynamic import. 미사용 사용자는 모듈 코드 자체가 로드되지 않음 (cold path).
3. **함수 내부 silent fail 도 그대로 존속** — 게이트가 추가 안전망. daemon 미설정인데 잘못 호출되어도 daemon down 시 silent skip.
4. **agent prompt + static knowledge 절도 동일 게이트** — `config?.daemon === true` 시에만 emit. opt-out 사용자의 prompt / hook 출력은 byte-identical.

**판단 기준**: 외부 도구 / 데이터 통합 / 자동 인덱싱 시 (a) opt-in flag 필수 (b) 호출 측 게이트 + (c) silent fail 의 2단 안전망 (d) 모든 emit (prompt / hook) 의 회귀 안전 확인. 적용 영역: 향후 daemon MCP wrapper, 외부 API 통합, telemetry 등.

**메타 교훈**: 이번 패턴이 evaluator 트랙 (gen-066) 의 `evaluator?: boolean` 와 동형. **opt-in 통합은 "config flag → 호출 측 게이트 → 양 prompt/hook builder 동시 갱신" 으로 표준화 가능**. application.md 의 verification checklist 에 추가 후보 (deferred 후보 21번).

### Debug 목적의 stash 시도 전 — 인과 매칭 먼저 (gen-068 실수)

gen-068 validation 단계에서 scenario 5건 fail 의 원인 확인을 위해 `git stash` 를 시도 → 시스템 리마인더가 즉시 알려준 덕분에 `stash pop` 으로 복원. 비효율적 시도였음.

- **올바른 순서**: (a) 변경된 파일 list 확인 (b) fail 의 원인 출력 확인 (c) **변경 파일과 fail 원인의 인과 매칭 — git log 로 보존된 히스토리에서 즉시 결정 가능한 경우 stash 불필요** (d) 매칭 결과 모호하면 stash.
- **gen-068 의 경우**: scenario fail 은 `reap run start --goal "..."` 가 `prompt` 를 반환하기 때문이고, 이는 gen-065 (Issue #18) 의 변경. git log 로 즉시 확인 가능. stash 불필요했음.
- **응용**: debug 의 첫 단계는 항상 "원인이 본 branch 의 변경인지, base branch 의 기존 동작인지" 를 git history (log / blame) 로 확인. stash 는 그 다음.

### 검증 인프라 generation 의 "discovered fix" 범위 판단 (gen-069)

검증 인프라 (e2e fixture + helper + tests) 구축 generation 은 검증 대상 (production code) 의 fix 와 본질적으로 다르다. 그러나 검증 대상이 정상 작동하지 않으면 검증이 의미가 없다. 따라서:

- **판단 기준**: "이 fix 없이 본 generation 의 검증 인프라가 의도한 검증을 수행할 수 있는가?" → No 면 본 generation 에서 fix.
- **gen-069 적용 사례**: daemon 의 typescript-tags.scm 에 `call_expression` 캡처가 없어 모든 .ts callers/callees 가 empty. backlog 의 case 2, 3 이 이 동작을 검증. fix 안 하면 cases pass 불가 → workaround (case 정의 변경) 는 검증의 의미를 잃음. 1-line fix 라 본 generation 에서 처리. evolution.md "Workaround 금지" + gen-065 longterm "인과로 묶인 fix" 의 응용.
- **반례 (deferred 가 적절한 case)**: daemon dist 의 queries path resolution bug — 검증 인프라가 `bun src/index.ts` 로 회피 가능. dist 사용자 영향이 있지만 본 generation 검증은 영향 없음. **별도 generation 으로 deferred**.
- **메타**: 검증 인프라 generation 도 "본 generation 의 직접 인과 범위 = 검증이 의미 있게 작동하기 위한 모든 fix" 로 해석. echo chamber 방지 원칙의 응용.

### 검증 인프라 자동화의 자기-진화 패턴 (gen-068 → gen-069)

gen-068 은 daemon 통합을 manual self-dogfooding (config.daemon: true) 으로 검증. gen-069 는 그 manual 검증을 21 e2e 로 자동화. **이 두 단계가 self-evolving 의 자연스러운 progression**:

1. **gen-068 패턴**: 기능 구현 + dog-fooding 활성화 → "본 generation 이 자기 자신의 첫 사용자" → manual verification only.
2. **gen-069 패턴**: 같은 기능을 e2e 로 자동화 → "모든 미래 generation 이 자동 사용자" → regression suite.

- **판단 기준**: 새 기능을 dog-fooding 한 generation 이 완료된 후, 그 dog-fooding 패턴이 자동화 가능한가? Yes 면 다음 generation 으로 자동화. 분리는 의도적 — fitness 단계가 fresh design 의 valid signal 을 잡고, 이후 generation 이 자동화 layer 를 쌓음.
- **응용**: gen-066 (validation evaluator wiring) → gen-067 (fitness + cruise abort) 도 유사 progression. 미래의 새 통합 (예: codex adapter, MCP wrapper) 도 같은 2단계 적용 가능 — N: dog-fooding, N+1: 자동화.

### Test isolation의 두 축 — port + path (gen-069)

외부 도구 (daemon, subprocess HTTP 서버 등) 를 e2e 로 검증할 때 사용자 영역 오염 위험. **port + path 두 축의 격리** 가 표준 패턴:

- **port 격리**: `REAP_DAEMON_PORT=17225` (사용자 17224 와 충돌 X). 환경 변수로 모든 호출 site (binary spawn + CLI client fetch) 가 인식.
- **path 격리**: `HOME` override (`/var/tmp/fakeHome`). 도구가 `homedir()` 만 의존하면 자동 격리.

판단 기준: 외부 도구가 (a) port 사용, (b) 파일 시스템 사용 — 둘 다 있으면 양 격리 모두 필요. port 만 격리하고 path 격리 안 하면 사용자 `~/.reap/daemon/` 오염. path 만 하고 port 안 하면 다중 인스턴스 동시 실행 불가능 + 사용자 daemon 과 race.

응용: 미래의 외부 도구 통합 (MCP server, telemetry, 등) 도 같은 2축 격리. test infrastructure 첫 단계에서 두 축 모두 확보.

### Macro tip — `realpath()` 가 macOS symlink 갭을 메운다 (gen-069)

`mkdtemp(tmpdir())` 가 macOS 에서 `/var/folders/...` 반환. CLI 자식 프로세스의 `process.cwd()` 는 `/private/var/folders/...` (symlink resolve). 두 path 를 직접 비교하면 always mismatch.

- **현상**: daemon registry 에 등록된 path (자식 cwd) 와 테스트의 fixtureDir mismatch → registry lookup fail → 모든 후속 검증 fail.
- **대응**: 테스트의 fixtureDir 를 `realpath(await copyFixture(...))` 로 normalize. 자식의 cwd 가 풀어주는 동일 path 와 일치.
- **응용**: 향후 path 매칭이 필요한 모든 e2e 에서 `realpath()` 미리 적용. `tests/helpers/setup.ts` 의 `setupGitProject` 같은 헬퍼가 자동 normalize 하면 모든 호출 site 에서 일관 처리 (gen-069 deferred 후보 19번).
