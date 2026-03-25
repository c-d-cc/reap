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
│  Adapter Layer (Claude Code skills)     │  18 skill files (.md)
├─────────────────────────────────────────┤
│  CLI Layer (src/cli/)                   │  Command routing, phase dispatch
├─────────────────────────────────────────┤
│  Core Layer (src/core/)                 │  Lifecycle, nonce, archive, compression
├─────────────────────────────────────────┤
│  State Layer (.reap/)                   │  File-based state (YAML + Markdown)
└─────────────────────────────────────────┘
```

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

### Nonce System

- Forward nonce: 다음 phase 진입 게이트
- Back nonce: 이전 stage 회귀 허용
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
