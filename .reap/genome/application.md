# Application

## Identity

**REAP** — Recursive Evolutionary Autonomous Pipeline.
AI와 인간이 세대(generation)를 거치며 소프트웨어를 공동 진화시키는 자기진화형 개발 파이프라인.

- Package: `@c-d-cc/reap` (npm)
- Language: TypeScript (Bun runtime)
- Distribution: CLI tool (`reap` command)

## Architecture

### Core Metaphor — 생물학적 진화

| 생물학 | REAP | 역할 |
|--------|------|------|
| Genome | `.reap/genome/` | 프로젝트의 DNA — 원칙, 아키텍처, 제약 |
| Generation | `life/current.yml` | 하나의 진화 사이클 (goal → learning → completion) |
| Lineage | `.reap/lineage/` | 세대 기록 — DAG 구조, 압축 가능 |
| Mutation | adapt phase | completion에서 genome 변경 제안 |
| Crossover | merge lifecycle | 병렬 브랜치 간 genome 교차 (3-way diff) |
| Fitness | fitness phase | 인간 피드백 기반 적합도 평가 |
| Maturity | bootstrap → growth → cruise | 프로젝트 성숙도에 따른 AI 행동 조절 |

### System Layers

```
┌─────────────────────────────────────────┐
│  Adapter Layer (src/adapters/)          │  dispatcher + per-client modules
├─────────────────────────────────────────┤
│  CLI Layer (src/cli/)                   │  Command routing, phase dispatch
├─────────────────────────────────────────┤
│  Core Layer (src/core/)                 │  Lifecycle, nonce, archive, compression
├─────────────────────────────────────────┤
│  State Layer (.reap/)                   │  File-based state (YAML + Markdown)
└─────────────────────────────────────────┘
```

### Adapter Layer — Multi-Client Support

REAP supports multiple AI clients through an adapter dispatcher (`src/adapters/index.ts`). The `agentClient` config field selects the adapter at runtime; every install/update/init flow goes through `getAdapter(agentClient)` rather than calling client-specific code directly.

Currently registered adapters:

- **`claude-code`** — `src/adapters/claude-code/` — `~/.claude/commands/*.md` skill files, `~/.claude/settings.json` SessionStart hook, `CLAUDE.md` entry-point with `@` import references for static knowledge.
- **`opencode`** — `src/adapters/opencode/` — `.opencode/plugins/reap-plugin.ts` (session.created + tool.execute.before), `opencode.json` `instructions`/`plugin` arrays for static + dynamic loading, `AGENTS.md` entry-point with marker-hash sync. Plugin uses inline types to avoid forcing `@opencode-ai/plugin` dependency.
- **`codex`** — not yet implemented; dispatcher throws a helpful error.

All adapters fulfill the `AdapterModule` contract: `installSkills`, `ensureProjectIntegration` (CLAUDE.md vs AGENTS.md), `registerSessionIntegration` (settings.json hooks vs opencode.json plugin entry). Adding a new client = creating a new module + adding a case in the dispatcher. No changes to install-skills/update/init call sites.

**When adding a new AI client adapter, the verification checklist MUST include**: (a) static knowledge auto-loading mechanism, (b) dynamic state refresh trigger, (c) entry-point file (CLAUDE.md-equivalent), AND (d) **slash command / shortcut trigger registration** in the client's native location. Item (d) is the most easily-missed item — gen-063 shipped (a)/(b)/(c) but discovered (d) only after fitness, triggering a follow-up generation.

**`installSkills` vs `registerSessionIntegration` — user-level sync is required in both** (gen-064 교훈). `reap update` only calls `adapter.ensureProjectIntegration` + `adapter.registerSessionIntegration` — NOT `installSkills`. Therefore any **user-level asset that must stay in sync with the bundled REAP version** (slash command files, agent definitions, etc.) must be refreshed from inside `registerSessionIntegration` too, not only from `installSkills`. The two functions have overlapping responsibilities:

| Function | Caller(s) | Must refresh |
|---|---|---|
| `installSkills` | `reap install-skills` CLI + npm `postinstall` | full install — user-level assets + project-level wiring + emitOutput |
| `registerSessionIntegration` | `reap update` (every project update) | user-level assets that must stay current + project-level wiring. Silent (no emitOutput — caller handles output). |

Concretely: both adapters' `registerSessionIntegration` MUST call the same user-level slash command sync helper as `installSkills`. Skipping this leaves `reap update` users with stale (or absent) slash commands until they manually re-run `reap install-skills`. The standard pattern is to extract the slash-command sync into a silent helper (e.g. `installSlashCommands(home?)` for opencode, `installSlashCommandsOnly()` for claude-code) and have both callers invoke it. Same gap caused gen-061 reapdev incident's persistence — `reap update` couldn't auto-clean stale skills because user-level sync wasn't wired into that path.

### Generation Lifecycle

**Normal** (5 stages):
```
learning → planning → implementation ⟷ validation → completion
                                                      ├─ reflect
                                                      ├─ fitness
                                                      ├─ adapt
                                                      └─ commit
```

**Merge** (6 stages):
```
detect → mate → merge → reconcile → validation → completion
```

각 stage 전환은 nonce token으로 암호학적 검증. Artifact(최소 50자)이 존재해야 다음 stage 진입 가능.

**Termination Paths** (3가지 종료 path):
- `completion` — 정식 완료. 5-phase(gate/reflect/fitness/adapt/commit)를 거쳐 lineage 에 `status: completed` 로 기록.
- `early-close` — 조기 종료(implementation/validation 단계에서만). 부분 가치를 lineage 에 `status: partial` 로 보존 + 미완 task 를 자동 추출해 다음 세대 deferred backlog 로 승계. 2-phase(confirm → execute).
- `abort` — 작업 폐기. archive/lineage 미기록, 현재 generation 정리만 수행.

### Nonce System — Transition Graph 기반

- **Transition graph**: `lifecycle.ts`에 NORMAL_TRANSITIONS, MERGE_TRANSITIONS로 각 `stage:phase`에서 허용된 전이를 선언적으로 정의
- **pendingTransitions**: 현재 허용된 모든 전이에 대한 `{ nonce, hash }` map. 한 시점에서 forward + back + self-loop이 동시에 존재 가능
- **verifyTransition**: 통합 전이 검증 — forward/back 구분 없이 pendingTransitions에서 target을 찾아 검증/소비
- **setTransitionNonces**: graph lookup → 다중 nonce 동시 발행 (work phase에서 사용)
- **prepareStageEntry**: entry ticket + back nonce 동시 발행 (complete phase, back command, generation create에서 사용)
- `SHA256(nonce + genId + stage:phase)` 기반 검증
- Stage skipping, replay attack, concurrent modification 방지

### State Management

모든 상태는 파일 기반 (DB 없음):
- `config.yml` — 프로젝트 설정 (YAML)
- `life/current.yml` — 활성 generation 상태 (REAP managed, 수동 편집 금지)
- `lineage/` — 세대 아카이브 (2-level compression)
- `genome/` — 처방적 지식 (prescriptive)
- `environment/` — 기술적 지식 (descriptive, 2-tier loading)
- `vision/` — 장기 목표
- `hooks/` — lifecycle event handlers (.sh, .md)

### Maturity System

| Level | Type | AI Tone | Clarity 연동 |
|-------|------|---------|-------------|
| Bootstrap | embryo | 질문 60%, 제안 40% | clarity 낮을 확률 높음 → 적극 interaction |
| Growth | normal | 질문 30%, 제안 70% | vision 기반 gap 분석 |
| Cruise | normal + cruise | 질문 10%, 제안 90% | clarity 높아야 진입 |

Embryo → Normal 전환: adapt phase에서 AI 제안, 인간 승인.

## Dog-fooding

본 프로젝트는 REAP을 정의함과 동시에 REAP으로 개발되는 자기참조적(dog-fooding) 프로젝트다.
따라서 REAP의 설계, 폴더 구조, CLAUDE.md 등 메타 파일에 변경이 생기면 반드시 `src/templates/` 내 대응하는 템플릿에도 동일한 변경을 반영해야 한다.

주요 대응 관계:
- `CLAUDE.md` ↔ `src/templates/claude-md-section.md`
- `.reap/reap-guide.md` ↔ `src/templates/reap-guide.md`
- `.reap/genome/evolution.md` ↔ `src/templates/evolution.md`
- `.reap/` 디렉토리 구조 ↔ `src/core/integrity.ts` (구조 검증), `src/cli/commands/init/` (초기화)
- **agent 행동 규칙 텍스트 ↔ `src/cli/commands/run/*.ts` 의 prompt 문자열**

### 규칙 변경 시 carrier 3중 확인 (gen-072 교훈, issue #21)

**규칙의 carrier 는 문서만이 아니다.** 같은 규칙이 guide / genome 템플릿 / phase prompt 세 곳에 각각 존재할 수 있고, 하나만 고치면 나머지가 구버전으로 남아 서로 모순되는 지시를 낸다.

판단 기준: **"이 규칙이 agent 행동을 좌우하는가?"** → Yes 면 다음 3곳을 **모두** 확인:

1. `src/templates/reap-guide.md` (+ `.reap/reap-guide.md`) — 세션 시작 시 로드되는 참조 문서
2. `src/templates/evolution.md` (+ `.reap/genome/evolution.md`) — 프로젝트 genome
3. `src/cli/commands/run/*.ts` 의 prompt 문자열 — **agent 가 행동하는 바로 그 순간 읽는 지시**

3번이 가장 놓치기 쉽다. grep 으로 코드 안의 규칙 텍스트까지 확인할 것 (예: `grep -rn "<규칙 키워드>" src/cli/`).

**텍스트는 창작하지 말고 한 곳을 기준으로 복제한다.** 세 carrier 가 같은 규칙을 각자 다르게 표현하면 다음 변경 때 또 drift 가 생긴다.

### 규칙 변경이 기존 프로젝트에 도달하는가 (gen-072 교훈)

템플릿 수정은 **`reap init` 하는 신규 프로젝트에만 반영**된다. `src/templates/evolution.md` 의 소비 지점은 `initCommon` (`src/cli/commands/init/common.ts`) 단 1곳이며, `reap update` 와 `reap init --repair` 는 genome 을 건드리지 않는다 — user-owned 자산이므로 덮어쓰지 않는 것이 올바른 설계다.

따라서 **이미 존재하는 프로젝트에 규칙 변경을 전달하는 유일한 채널은 `src/templates/migration/vX.Y.Z.md`** 다. 이것 없이 템플릿만 고치면 기존 사용자는 "genome=구버전 규칙 vs prompt=신버전 규칙" 모순 상태에 놓이며, 어느 쪽이 이길지 예측할 수 없다.

규칙을 바꿀 때 반드시 자문할 것: **"이미 존재하는 프로젝트에는 무엇이 도달하는가?"**

migration note 로 사용자 genome 수정을 지시할 때는 **3분기 판정**을 명시한다 (2분기로 하면 이미 올바른 프로젝트가 불필요한 확인을 받는다):
- 배포 원본과 정확 일치 → silent edit (note 안에 **대조용 원본 전문**을 실어야 판정 가능)
- 이미 신규 형식 → no-op, 확인 없음
- 그 외 (사용자가 수정/번역) → diff 제시 후 확인, 거절 시 skip + `--mark-migrated` 미실행

## Knowledge Loading — Static / Dynamic 분리

Claude Code 어댑터의 knowledge 전달은 두 layer로 명확히 분리된다 (gen-062부터 채택).

| Layer | 메커니즘 | 대상 | 위치 |
|---|---|---|---|
| **Static** | Claude Code `@` import (CLAUDE.md 본문) | genome×3 + environment summary + vision goals + memory×3 + reap-guide (총 9) | `src/templates/claude-md-section.md` 의 "Static Knowledge (auto-imported)" 블록 |
| **Dynamic** | SessionStart hook (`reap load-context`) | Current State (current.yml 가공) + Strict Mode + Language 지시 | `src/cli/commands/load-context.ts` 의 `buildKnowledgeContext()` |

원칙:
- static knowledge는 코드가 직접 read/inject 하지 않는다. Claude Code의 native `@` import를 신뢰한다.
- 새 static 파일을 추가하려면 (a) `claude-md-section.md` 의 `@` ref 블록에 한 줄 추가, (b) integrity.ts 의 검증 대상 추가만으로 충분.
- 새 dynamic context를 추가하려면 `buildKnowledgeContext()` 에 섹션을 추가하되, 반드시 dynamic 자격이 있어야 한다(파일로 표현 불가능한 generation state 의존성). 그렇지 않은 정보는 static으로 분류.
- migration: template 변경 시 `ensureClaudeMd` (`src/cli/commands/init/common.ts`) 의 marker-hash sync 로직(gen-054)이 모든 사용자(plain-path legacy + marker-stale 둘 다) 자동 처리.

## Conventions

### Code Style
- ESM modules (`"type": "module"`)
- Async/await 기반 (Promise 직접 사용 최소화)
- JSON stdout output (`ReapOutput` 인터페이스) — 모든 CLI 출력은 machine-parseable
- Error도 JSON으로 출력 (`emitError`)
- `process.exit(0)` — error 포함 모든 exit은 code 0 (JSON status로 구분)

### Enforced Conventions
- CLI entry point (`src/cli/index.ts`)는 라우팅만 — command 로직은 `src/cli/commands/` 아래 별도 파일의 `execute()` 함수로 분리.

### File Naming
- Core modules: kebab-case (`stage-transition.ts`, `genome-suggest.ts`)
- Commands: stage 이름 그대로 (`learning.ts`, `completion.ts`)
- Skills: `reap.{command}.md`
- Artifacts: `{NN}-{stage}.md` (01-learning.md ~ 05-completion.md)

### Test Structure
- tests/ 폴더는 git submodule (https://github.com/c-d-cc/reap-test, branch: self-evolve)
- Unit tests: `tests/unit/` — core 함수별 테스트
- E2E tests: `tests/e2e/` 또는 `scripts/e2e-*.sh` — CLI 전체 흐름 테스트
- Scenario tests: `tests/scenario/` — sandbox 환경에서 실제 사용 시나리오 재현
- 기존 `scripts/e2e-*.sh`는 점진적으로 `tests/` 구조로 이전

### Genome Rules
- Embryo: genome 자유 수정 가능
- Normal: genome immutable — 변경은 backlog에 등록, adapt에서 적용
- Merge: mate stage에서만 genome 수정
- Invariants: 인간만 수정 가능 (어떤 상황에서도)
