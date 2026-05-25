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
