<p align="center">
  <img src="media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  AI와 인간이 세대(Generation)를 거듭하며 소프트웨어를 진화시키는 개발 파이프라인.
</p>

> [English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md)

<table align="center">
<tr>
<td align="center"><strong>Genome</strong><br><sub>설계와 지식</sub></td>
<td align="center">→</td>
<td align="center"><strong>Evolution</strong><br><sub>세대를 거친 진화</sub></td>
<td align="center">→</td>
<td align="center"><strong>Civilization</strong><br><sub>Source Code</sub></td>
</tr>
</table>

REAP은 Application의 유전 정보(Genome)를 정의하고, 각 세대에서 목표를 설정하여 구현하고, 그 과정에서 발견한 Genome 결함을 다음 단계에서 반영합니다. 세대를 거듭하며 Genome이 진화하고, Source Code(Civilization)가 성장합니다.

## Why REAP?

AI 에이전트와 함께 개발할 때 이런 문제를 겪어본 적 있나요?

- **컨텍스트 유실** — 새 세션을 열면 에이전트가 프로젝트 맥락을 잊어버림
- **산발적 개발** — 명확한 목표 없이 여기저기 코드를 수정
- **설계와 코드의 괴리** — 문서는 따로, 코드는 따로 놀면서 점점 벌어짐
- **교훈의 망각** — 삽질한 경험이 다음 작업에 반영되지 않음

REAP은 **세대 기반 진화 모델**로 이 문제들을 해결합니다:

- 매 세대마다 하나의 목표에 집중 (Objective → Completion)
- AI 에이전트가 매 세션 시작 시 현재 맥락을 자동으로 인식 (SessionStart Hook)
- 구현 중 발견한 설계 문제는 backlog에 기록, Completion에서 반영
- 회고(Completion)에서 도출한 교훈이 Genome에 축적

## 설치

```bash
# npm
npm install -g @c-d-cc/reap

# 또는 Bun
bun install -g @c-d-cc/reap
```

> **요구사항**: [Node.js](https://nodejs.org) v18+, [Claude Code](https://claude.ai/claude-code) CLI. [Bun](https://bun.sh)은 선택사항.

## 빠른 시작

```bash
# 1. 프로젝트 초기화

# 새 프로젝트
reap init my-project

# 기존 프로젝트
cd my-project
reap init

# 2. Claude Code에서 한 Generation 전체 실행
claude
> /reap.evolve "사용자 인증 구현"
```

`/reap.evolve`는 한 세대의 전체 lifecycle을 — Objective부터 Completion까지 — 사용자와 대화하며 자동으로 실행합니다. Generation 생성, 각 stage 실행, stage 간 전진을 모두 처리합니다. 일상적인 개발에서 가장 많이 사용하는 핵심 명령어입니다.

더 세밀한 제어가 필요하면 각 stage를 수동으로 진행할 수도 있습니다:

```bash
> /reap.start            # 새 Generation 시작
> /reap.objective        # 목표 + 명세 정의
> /reap.next             # 다음 단계로 전진
> /reap.planning         # 구현 계획
> /reap.next
> /reap.implementation   # AI+Human 협업 코드 구현
> ...
```

## 생애주기 (Life Cycle)

한 세대(Generation)는 5단계의 생애주기를 거칩니다:

```
Objective → Planning → Implementation ⟷ Validation → Completion
(목표 정의)   (계획)      (구현)              (검증)      (완성)
```

| 단계 | 하는 일 | 산출물 |
|------|---------|--------|
| **Objective** | 목표 + 요구사항 + 수용기준 정의 | `01-objective.md` |
| **Planning** | 태스크 분해, 구현 접근법, 의존관계 | `02-planning.md` |
| **Implementation** | AI+Human 협업으로 코드 구현 | `03-implementation.md` |
| **Validation** | 테스트 실행, 완료 조건 점검 | `04-validation.md` |
| **Completion** | 회고 + Genome 변경 반영 + 아카이빙 | `05-completion.md` |

## 핵심 개념

### Genome

Application의 유전 정보 — 아키텍처 원칙, 비즈니스 규칙, 개발 컨벤션, 기술 제약의 집합.

```
.reap/genome/
├── principles.md      # 아키텍처 원칙/결정
├── domain/            # 비즈니스 규칙 (모듈별)
├── conventions.md     # 개발 규칙/컨벤션
└── constraints.md     # 기술 제약/선택
```

**Genome 불변 원칙**: 현재 세대에서는 Genome을 직접 수정하지 않습니다. 문제를 발견하면 backlog에 기록하고, Completion 단계에서만 반영합니다.

**Environment 불변 원칙**: 현재 세대에서는 Environment를 직접 수정하지 않습니다. 외부 환경 변화를 발견하면 backlog에 기록하고, Completion 단계에서 반영합니다.

### Backlog

`.reap/life/backlog/`에 다음에 반영할 모든 항목을 저장합니다. 각 항목은 markdown + frontmatter 형식:

- `type: genome-change` — Completion에서 Genome에 반영
- `type: environment-change` — Completion에서 Environment에 반영
- `type: task` — 다음 Objective에서 goal 후보 (deferred 태스크, 기술 부채 등)

각 항목은 `status` 필드도 가집니다:

- `status: pending` — 미처리 항목 (기본값)
- `status: consumed` — 현재 세대에서 처리 완료 (`consumedBy: gen-XXX` 필수)

아카이빙 시점(`/reap.next` from Completion)에 `consumed` 항목은 lineage로 이동하고, `pending` 항목은 다음 세대 backlog로 이월됩니다.

**부분 완료는 정상** — Genome 변경에 의존하는 태스크는 `[deferred]`로 마킹하고 다음 세대로 인계합니다.

### 4축 구조

```
.reap/
├── genome/        # 유전 정보 (세대를 거치며 진화)
├── environment/   # 외부 환경 (API 문서, 인프라, 비즈니스 제약)
├── life/          # 현재 세대의 상태와 산출물
└── lineage/       # 완료된 세대들의 아카이브
```

## CLI 명령어

| 명령어 | 설명 |
|--------|------|
| `reap init <name>` | 프로젝트 초기화. `.reap/` 구조 생성 |
| `reap status` | 현재 Generation 상태 확인 |
| `reap update` | 커맨드/템플릿/훅을 최신 버전으로 동기화 |
| `reap fix` | `.reap/` 구조 진단 및 복구 |
| `reap help` | CLI 명령어 + 슬래시 커맨드 + 워크플로우 요약 출력 |

### 옵션

```bash
reap init my-project --mode adoption    # 기존 프로젝트에 REAP 적용
reap init my-project --preset bun-hono-react  # 프리셋으로 Genome 초기화
reap update --dry-run                   # 변경사항 미리보기
```

## Claude Code 연동

REAP은 Claude Code의 두 가지 메커니즘으로 AI 에이전트와 통합됩니다:

### Slash Commands

Slash command가 `.claude/commands/`에 설치되어 전체 워크플로우를 구동합니다:

| 명령어 | 설명 |
|--------|------|
| `/reap.start` | 새 Generation 시작 |
| `/reap.objective` | 목표 + 요구사항 정의 |
| `/reap.planning` | 태스크 분해 + 구현 계획 |
| `/reap.implementation` | AI+Human 협업 코드 구현 |
| `/reap.validation` | 테스트 실행, 완료 조건 점검 |
| `/reap.completion` | 회고 + Genome 변경 반영 |
| `/reap.next` | 다음 Life Cycle stage로 전진 |
| `/reap.back` | 이전 stage로 복귀 (micro loop) |
| `/reap.status` | 현재 Generation 상태 및 프로젝트 건강 상태 표시 |
| `/reap.sync` | 소스 코드 기반 Genome 최신화 |
| `/reap.help` | 현재 상태에 따른 contextual AI 도움말 (topic: workflow, commands, strict, genome, backlog) |
| **`/reap.evolve`** | **한 Generation 전체를 처음부터 끝까지 실행 (권장)** |

### SessionStart Hook

매 세션 시작 시 자동으로 실행되어 AI 에이전트에게 다음을 주입합니다:

- REAP 워크플로우 전체 가이드 (Genome, Life Cycle, 4축 구조 등)
- 현재 Generation 상태 (어떤 stage인지, 다음에 뭘 해야 하는지)
- REAP lifecycle을 따르라는 규칙

이를 통해 새 세션을 열어도 에이전트가 프로젝트 맥락을 즉시 파악합니다.

### Strict 모드

`.reap/config.yml`에 `strict: true`를 설정하면 AI 에이전트가 REAP 워크플로우 외부에서 코드를 수정하는 것을 제한합니다:

```yaml
# .reap/config.yml
strict: true   # 기본값: false
```

| 상황 | 동작 |
|------|------|
| 활성 Generation 없음 / 구현 단계 외 | 코드 수정 완전 차단 |
| Implementation 단계 | `02-planning.md` 범위 내에서만 수정 허용 |
| Escape hatch | 사용자가 "override", "bypass strict" 등 명시적 요청 시 허용 |

Strict 모드는 기본적으로 비활성화되어 있습니다 (`strict: false`).

### REAP Hooks

`.reap/config.yml`에 hook을 정의하여 lifecycle 이벤트에 명령 또는 AI 프롬프트를 실행할 수 있습니다:

```yaml
hooks:
  onGenerationStart:
    - command: "echo 'Generation started'"
  onStageTransition:
    - command: "echo 'Stage changed'"
  onGenerationComplete:
    - command: "reap update"
    - prompt: "이번 Generation 변경사항을 README에 반영하라."
  onRegression:
    - command: "echo 'Regressed'"
```

각 hook은 `command` (shell 명령) 또는 `prompt` (AI 에이전트 지시) 중 하나를 사용합니다.

| 이벤트 | 트리거 |
|--------|--------|
| `onGenerationStart` | `/reap.start`로 새 Generation 생성 후 |
| `onStageTransition` | `/reap.next`로 다음 stage 전진 후 |
| `onGenerationComplete` | `/reap.next`로 완료된 Generation 아카이빙 후 |
| `onRegression` | `/reap.back`으로 이전 stage 복귀 후 |

Hook은 AI 에이전트가 프로젝트 루트 디렉토리에서 실행합니다.

## `reap init` 후 프로젝트 구조

```
my-project/
├── src/                          # Civilization (소스 코드)
└── .reap/
    ├── config.yml                # 프로젝트 설정
    ├── genome/                   # 유전 정보
    │   ├── principles.md
    │   ├── domain/
    │   ├── conventions.md
    │   └── constraints.md
    ├── environment/              # 외부 환경
    ├── life/                     # 현재 세대
    │   ├── current.yml
    │   └── backlog/
    └── lineage/                  # 완료된 세대 아카이브

~/.claude/                        # 사용자 레벨 (reap init 시 설치)
├── commands/                     # Slash commands (/reap.*)
└── settings.json                 # SessionStart hook 등록
```

## 계보 압축 (Lineage Compression)

세대가 쌓이면 lineage 디렉토리가 커집니다. REAP은 자동 2단계 압축으로 이를 관리합니다:

| 레벨 | 입력 | 출력 | 최대 줄 수 | 트리거 |
|------|------|------|-----------|--------|
| **Level 1** | 세대 폴더 (5개 산출물) | `gen-XXX.md` | 40줄 | lineage > 10,000줄 + 5세대 이상 |
| **Level 2** | Level 1 파일 5개 | `epoch-XXX.md` | 60줄 | Level 1이 5개 이상 |

압축은 세대 완료 시 자동 실행됩니다. 압축된 파일은 목표(Objective)와 결과(Completion)를 중심으로 보존하고, 중간 과정은 특이사항만 남깁니다.

## 진화 흐름 (Evolution Flow)

```
Generation #1 (Genome v1)
  → Objective: "사용자 인증 구현"
  → Planning → Implementation
  → Implementation 중 OAuth2 필요 발견 → backlog에 genome-change 기록
  → Validation (partial)
  → Completion → 회고 + genome 반영 → Genome v2 → 아카이빙

Generation #2 (Genome v2)
  → Objective: "OAuth2 연동 + 권한 관리"
  → 이전 세대의 deferred 태스크 + 새 목표
  → ...
```

## 프리셋 (Presets)

`reap init --preset`으로 기술 스택에 맞는 Genome 초기 설정을 적용할 수 있습니다.

| 프리셋 | 스택 |
|--------|------|
| `bun-hono-react` | Bun + Hono + React |

```bash
reap init my-project --preset bun-hono-react
```

## 진입 모드 (Entry Modes)

| 모드 | 설명 |
|------|------|
| `greenfield` | 새 프로젝트를 처음부터 구축 (기본값) |
| `migration` | 기존 시스템을 참조하여 새로 구축 |
| `adoption` | 기존 코드베이스에 REAP을 적용 |

## 라이선스

MIT
