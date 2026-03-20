> [English](README.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md)

<p align="center">
  <img src="media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  AI와 인간이 세대(Generation)를 거듭하며 소프트웨어를 진화시키는 개발 파이프라인.
</p>

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

## 목차

- [Why REAP?](#why-reap)
- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [생애주기 (Life Cycle)](#생애주기-life-cycle)
- [핵심 개념](#핵심-개념)
- [분산 워크플로우 — 병렬 개발](#분산-워크플로우--병렬-개발)
- [CLI 명령어](#cli-명령어)
- [에이전트 연동](#에이전트-연동)
- [`reap init` 후 프로젝트 구조](#reap-init-후-프로젝트-구조)
- [계보 압축 (Lineage Compression)](#계보-압축-lineage-compression)
- [진화 흐름 (Evolution Flow)](#진화-흐름-evolution-flow)
- [프리셋 (Presets)](#프리셋-presets)
- [진입 모드 (Entry Modes)](#진입-모드-entry-modes)

## Why REAP?

AI 에이전트와 함께 개발할 때 이런 문제를 겪어본 적 있나요?

- **컨텍스트 유실** — 새 세션을 열면 에이전트가 프로젝트 맥락을 잊어버림
- **산발적 개발** — 명확한 목표 없이 여기저기 코드를 수정
- **설계와 코드의 괴리** — 문서는 따로, 코드는 따로 놀면서 점점 벌어짐
- **교훈의 망각** — 삽질한 경험이 다음 작업에 반영되지 않음
- **협업의 혼란** — 여러 개발자나 에이전트가 병렬로 작업하면 충돌이 빈발하고 머지가 악몽이 됨

REAP은 **세대 기반 진화 모델**로 이 문제들을 해결합니다:

- 매 세대마다 하나의 목표에 집중 (Objective → Completion)
- AI 에이전트가 매 세션 시작 시 현재 맥락을 자동으로 인식 (SessionStart Hook)
- 구현 중 발견한 설계 문제는 backlog에 기록, Completion에서 반영
- 회고(Completion)에서 도출한 교훈이 Genome에 축적
- 세대를 거듭하며 반복되는 수작업을 자동 감지하고, 사용자 확인 후 Hook으로 생성
- 브랜치 간 병렬 작업은 genome-first 머지 워크플로우로 조율 — 코드 충돌 전에 설계 충돌부터 해결

## 설치

```bash
# npm
npm install -g @c-d-cc/reap

# 또는 Bun
bun install -g @c-d-cc/reap
```

> **요구사항**: [Node.js](https://nodejs.org) v18+, [Claude Code](https://claude.ai/claude-code) 또는 [OpenCode](https://opencode.ai) CLI. [Bun](https://bun.sh)은 선택사항.

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
| **Objective** | 구조화된 브레인스토밍으로 목표 및 설계 정의: 명확화 질문, 접근법 대안, 섹션별 설계, 비주얼 컴패니언, Spec 리뷰 | `01-objective.md` |
| **Planning** | 태스크 분해, 구현 접근법, 의존관계 | `02-planning.md` |
| **Implementation** | AI+Human 협업으로 코드 구현 | `03-implementation.md` |
| **Validation** | 테스트 실행, 완료 조건 점검 | `04-validation.md` |
| **Completion** | 회고 + Genome 변경 반영 + Hook 제안 + 아카이빙 | `05-completion.md` |

## 핵심 개념

### Genome

Application의 유전 정보 — 아키텍처 원칙, 비즈니스 규칙, 개발 컨벤션, 기술 제약의 집합.

```
.reap/genome/
├── principles.md      # 아키텍처 원칙/결정
├── domain/            # 비즈니스 규칙 (모듈별)
├── conventions.md     # 개발 규칙/컨벤션
├── constraints.md     # 기술 제약/선택
└── source-map.md      # C4 Container/Component 다이어그램 (Mermaid)
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
- `status: consumed` — 현재 세대에서 처리 완료 (`consumedBy: gen-XXX-{hash}` 필수)

아카이빙 시점(`/reap.next` from Completion)에 `consumed` 항목은 lineage로 이동하고, `pending` 항목은 다음 세대 backlog로 이월됩니다.

**부분 완료는 정상** — Genome 변경에 의존하는 태스크는 `[deferred]`로 마킹하고 다음 세대로 인계합니다.

### 4축 구조

```
.reap/
├── genome/        # 유전 정보 (세대를 거치며 진화)
├── environment/   # 외부 환경 (API 문서, 인프라, 비즈니스 제약)
├── life/          # 라이프사이클 — 현재 세대의 상태와 산출물
└── lineage/       # 완료된 세대들의 아카이브
```

## 분산 워크플로우 — 병렬 개발

> **⚠ 초기 단계** — 분산 워크플로우는 추가 테스트가 필요합니다. 프로덕션 환경에서는 주의하여 사용하세요. 피드백을 수집하고 있습니다 — [이슈 등록](https://github.com/c-d-cc/reap/issues).

REAP은 여러 개발자 또는 AI 에이전트가 동일 프로젝트에서 병렬로 작업하는 분산 협업을 지원합니다. 별도 서버 없이 Git만으로 동작합니다.

### 동작 방식

```
Machine A: branch-a — gen-046-a (authentication)    → /reap.push
Machine B: branch-b — gen-046-b (search)            → /reap.push

Machine A:
  /reap.pull branch-b   → Fetch + 전체 머지 Generation 라이프사이클 실행
```

각 머신은 자신의 브랜치와 Generation에서 독립적으로 작업합니다. 합칠 때가 되면 REAP이 **genome-first** 전략으로 머지를 조율합니다 ([자세히 보기](https://reap.cc/docs/merge-generation)):

1. **Detect** — 원격 브랜치의 genome과 lineage를 git ref로 스캔하여 분기점을 파악
2. **Mate** — Genome 충돌부터 해결 (사람이 판단)
3. **Merge** — 확정된 Genome을 기준으로 소스 코드 머지 (`git merge --no-commit`)
4. **Sync** — AI가 Genome과 소스를 비교하여 일관성 확인; 불일치 발견 시 사용자 확인
5. **Validation** — 기계적 테스트 실행 (bun test, tsc, build) — 일반 Generation과 동일
6. **Completion** — 머지 결과를 커밋하고 아카이빙

### 분산 워크플로우 슬래시 커맨드

모든 분산 작업은 AI 에이전트를 통해 실행합니다:

```bash
/reap.pull <branch>        # Fetch + 전체 머지 Generation 실행 (분산 /reap.evolve)
/reap.merge <branch>       # 로컬 브랜치 전체 머지 Generation 실행 (fetch 없음)
/reap.push                 # REAP 상태 검증 + 현재 브랜치 push
/reap.merge.start          # 머지 Generation 시작 (단계별 제어용)
/reap.merge.detect         # 분기 분석
/reap.merge.mate           # Genome 충돌 해결
/reap.merge.merge          # 소스 코드 머지
/reap.merge.sync           # Genome-소스 일관성 검증
/reap.merge.validation     # 기계적 테스트 실행 (bun test, tsc, build)
/reap.merge.evolve         # 현재 stage부터 머지 라이프사이클 실행
```

### 핵심 원칙

- **Opt-in** — `git pull`/`push`는 항상 그대로 동작합니다. REAP 커맨드는 부가적입니다.
- **Genome-first** — 소스 머지 전에 Genome 충돌을 먼저 해결합니다. 헌법을 개정한 뒤 법률을 수정하는 것과 같습니다.
- **서버 불필요** — 모든 것이 로컬 + Git. 외부 서비스가 필요 없습니다.
- **DAG lineage** — 각 세대는 해시 기반 ID(`gen-046-a3f8c2`)로 부모를 참조하여 방향 비순환 그래프를 형성하므로, 병렬 작업을 자연스럽게 지원합니다.

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

## 에이전트 연동

REAP은 슬래시 커맨드와 세션 훅을 통해 AI 에이전트와 통합됩니다. 현재 지원 에이전트: **Claude Code**, **OpenCode**.

### Slash Commands

Slash command가 `.claude/commands/`에 설치되어 전체 워크플로우를 구동합니다:

| 명령어 | 설명 |
|--------|------|
| `/reap.start` | 새 Generation 시작 |
| `/reap.objective` | 목표 + 요구사항 정의 |
| `/reap.planning` | 태스크 분해 + 구현 계획 |
| `/reap.implementation` | AI+Human 협업 코드 구현 |
| `/reap.validation` | 테스트 실행, 완료 조건 점검 |
| `/reap.completion` | 회고 + Genome 변경 반영 + lineage 압축 |
| `/reap.next` | 다음 Life Cycle stage로 전진 |
| `/reap.back` | 이전 stage로 복귀 (micro loop) |
| `/reap.abort` | 현재 Generation 중단 (rollback/stash/hold + backlog 저장) |
| `/reap.status` | 현재 Generation 상태 및 프로젝트 건강 상태 표시 |
| `/reap.sync` | Genome + Environment 동시 동기화 |
| `/reap.sync.genome` | 소스 코드 기반 Genome 최신화 |
| `/reap.sync.environment` | 외부 환경 의존성 탐색 및 문서화 |
| `/reap.report` | REAP 프로젝트에 버그/피드백 보고 (개인정보 보호) |
| `/reap.help` | 24+ 주제의 contextual AI 도움말 |
| `/reap.update` | REAP 패키지 업그레이드 + 커맨드/템플릿/훅 동기화 |
| **`/reap.evolve`** | **한 Generation 전체를 처음부터 끝까지 실행 (권장)** |
| **`/reap.pull <branch>`** | **Fetch + 전체 머지 Generation 실행 (분산 `/reap.evolve`)** |
| **`/reap.merge <branch>`** | **로컬 브랜치 전체 머지 Generation 실행 (fetch 없음)** |
| `/reap.push` | REAP 상태 검증 후 현재 브랜치 push |
| `/reap.merge.start` | 분기 브랜치를 결합하는 머지 Generation 시작 |
| `/reap.merge.detect` | 브랜치 간 분기 분석 |
| `/reap.merge.mate` | 소스 머지 전 Genome 충돌 해결 |
| `/reap.merge.merge` | 해결된 Genome을 기준으로 소스 코드 머지 |
| `/reap.merge.sync` | Genome-소스 간 일관성 검증 (AI 비교, 사용자 확인) |
| `/reap.merge.validation` | 기계적 테스트 실행 (bun test, tsc, build) |
| **`/reap.merge.evolve`** | **전체 머지 라이프사이클 자동 실행** |

### SessionStart Hook

매 세션 시작 시 자동으로 실행되어 AI 에이전트에게 다음을 주입합니다:

- REAP 워크플로우 전체 가이드 (Genome, Life Cycle, 4축 구조 등)
- 현재 Generation 상태 (어떤 stage인지, 다음에 뭘 해야 하는지)
- REAP lifecycle을 따르라는 규칙
- Genome 최신성 감지 — 마지막 Genome 업데이트 이후 코드 관련 커밋(`src/`, `tests/`, `package.json`, `tsconfig.json`, `scripts/`)이 있었는지 확인 (문서 전용 변경은 제외)
- Source-map 드리프트 감지 — `source-map.md`에 기록된 컴포넌트와 프로젝트의 실제 파일을 비교

이를 통해 새 세션을 열어도 에이전트가 프로젝트 맥락을 즉시 파악합니다.

### Strict 모드

Strict 모드는 AI 에이전트가 할 수 있는 것을 제어합니다. 두 가지 세분화 옵션을 지원합니다:

```yaml
# .reap/config.yml
strict: true              # 단축형: edit과 merge 모두 활성화

# 또는 세분화 제어:
strict:
  edit: true              # 코드 수정을 REAP lifecycle으로 제한
  merge: false            # raw git pull/push/merge 제한
```

**`strict.edit`** — 코드 수정 제어:

| 상황 | 동작 |
|------|------|
| 활성 Generation 없음 / 구현 단계 외 | 코드 수정 완전 차단 |
| Implementation 단계 | `02-planning.md` 범위 내에서만 수정 허용 |
| Escape hatch | 사용자가 "override", "bypass strict" 등 명시적 요청 시 허용 |

**`strict.merge`** — Git 명령 제어: 활성화 시 `git pull`/`push`/`merge` 직접 사용이 제한됩니다. 에이전트가 `/reap.pull`, `/reap.push`, `/reap.merge` 사용을 안내합니다.

두 옵션 모두 기본 비활성화. `strict: true`는 둘 다 활성화합니다.

Strict 모드는 기본적으로 비활성화되어 있습니다 (`strict: false`).

### REAP Hooks

Hook은 파일 기반이며 `.reap/hooks/`에 저장됩니다. 각 Hook은 `{event}.{name}.{md|sh}` 형식의 파일입니다:

- `.md` 파일은 AI 프롬프트를 담고 있습니다 (AI 에이전트가 실행)
- `.sh` 파일은 셸 스크립트를 담고 있습니다 (직접 실행)

```
.reap/hooks/
├── onGenerationStart.context-load.md
├── onGenerationComplete.version-bump.md
├── onGenerationComplete.readme-update.md
├── onStageTransition.notify.sh
└── onRegression.alert.sh
```

각 Hook 파일은 다음 필드를 가진 frontmatter를 지원합니다:

```yaml
---
condition: has-code-changes   # always | has-code-changes | version-bumped
order: 10                     # 실행 순서 (낮을수록 먼저 실행)
---
```

| 이벤트 | 트리거 |
|--------|--------|
| `onGenerationStart` | `/reap.start`로 새 Generation 생성 후 |
| `onStageTransition` | `/reap.next`로 다음 stage 전진 후 |
| `onGenerationComplete` | `/reap.next`로 완료된 Generation 아카이빙 후 |
| `onRegression` | `/reap.back`으로 이전 stage 복귀 후 |
| `onMergeStart` | `/reap.merge.start`로 머지 Generation 생성 후 |
| `onGenomeMated` | 머지 중 Genome 충돌 해결 완료 후 (mate 단계) |
| `onSourceMerged` | 소스 코드 머지 완료 후 |
| `onMergeComplete` | 머지 Generation 아카이빙 후 |

Hook은 AI 에이전트가 프로젝트 루트 디렉토리에서 실행합니다. `onGenerationComplete` Hook에는 자동 버전 범프 판단이 포함되어 있습니다 — patch 수준은 자동으로 적용되고, minor/major 범프는 사용자 확인을 거칩니다.

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
    │   ├── constraints.md
    │   └── source-map.md
    ├── hooks/                    # Lifecycle hooks (.md/.sh)
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
| **Level 1** | 세대 폴더 (5개 산출물) | `gen-XXX-{hash}.md` | 40줄 | lineage > 5,000줄 + 5세대 이상 |
| **Level 2** | Level 1 파일 5개 | `epoch-XXX.md` | 60줄 | Level 1이 5개 이상 |

압축은 세대 완료 시 자동 실행됩니다. 가장 최근 3개 세대는 항상 압축에서 보호됩니다. 압축된 파일은 목표(Objective)와 결과(Completion)를 중심으로 보존하고, 중간 과정은 특이사항만 남깁니다.

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

## 저자

**HyeonIL Choi** — [hichoi@c-d.cc](mailto:hichoi@c-d.cc) | [c-d.cc](https://c-d.cc) | [LinkedIn](https://www.linkedin.com/in/hichoi-dev) | [GitHub](https://github.com/casamia918)

## 라이선스

MIT
