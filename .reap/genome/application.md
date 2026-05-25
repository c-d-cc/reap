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
- `.reap/` 디렉토리 구조 ↔ `src/core/integrity.ts` (구조 검증), `src/cli/commands/init/` (초기화)

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
