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
<td align="center"><strong>Knowledge Base</strong><br><sub>Genome + Environment</sub></td>
<td align="center">→</td>
<td align="center"><strong>Evolution</strong><br><sub>세대를 거친 진화</sub></td>
<td align="center">→</td>
<td align="center"><strong>Civilization</strong><br><sub>Source Code</sub></td>
</tr>
</table>

REAP은 Application의 설계 지식 — Genome(아키텍처, 컨벤션, 제약사항)과 Environment(외부 API, 인프라) — 을 기록하고, 각 세대에서 목표를 설정하여 구현합니다. 그 과정에서 발견한 결함은 Knowledge Base에 반영됩니다. 세대를 거듭하며 지식이 진화하고, Source Code(Civilization)가 성장합니다.

## 목차

- [Why REAP?](#why-reap)
- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [생애주기 (Life Cycle)](#생애주기-life-cycle)
- [핵심 개념](#핵심-개념-)
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

> **글로벌 설치 필수.** REAP은 CLI 도구이며 반드시 글로벌로 설치해야 합니다. 로컬 프로젝트 레벨 설치(`npm i @c-d-cc/reap`)는 차단됩니다.

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

# 2. Claude Code에서 지식 동기화 후 한 Generation 전체 실행
claude
> /reap.sync
> /reap.evolve "사용자 인증 구현"
```

`/reap.evolve`는 한 세대의 전체 lifecycle을 — Objective부터 Completion까지 — 사용자와 대화하며 자동으로 실행합니다. Generation 생성, 각 stage 실행, stage 간 전진을 모두 처리합니다. 일상적인 개발에서 가장 많이 사용하는 핵심 명령어입니다.

더 세밀한 제어가 필요하면 각 stage를 수동으로 진행할 수도 있습니다:

```bash
> /reap.start            # 새 Generation 시작
> /reap.objective        # 목표 + 명세 정의 (--phase complete에서 자동 전환)
> /reap.planning         # 구현 계획 (--phase complete에서 자동 전환)
> /reap.implementation   # AI+Human 협업 코드 구현
> /reap.validation       # 테스트 실행, 완료 조건 점검
> /reap.completion       # 회고 + 마무리
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
| **Completion** | 회고 + Genome 변경 반영 + Hook 제안 + 자동 아카이빙 (consume + archive + commit) | `05-completion.md` |

## 핵심 개념 [↗](https://reap.cc/docs/core-concepts)

### Genome [↗](https://reap.cc/docs/genome)

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

### Backlog [↗](https://reap.cc/docs/backlog)

`.reap/life/backlog/`에 다음에 반영할 모든 항목을 저장합니다. 각 항목은 markdown + frontmatter 형식:

- `type: genome-change` — Completion에서 Genome에 반영
- `type: environment-change` — Completion에서 Environment에 반영
- `type: task` — 다음 Objective에서 goal 후보 (deferred 태스크, 기술 부채 등)

각 항목은 `status` 필드도 가집니다:

- `status: pending` — 미처리 항목 (기본값)
- `status: consumed` — 현재 세대에서 처리 완료 (`consumedBy: gen-XXX-{hash}` 필수)

아카이빙 시점(Completion 중)에 `consumed` 항목은 lineage로 이동하고, `pending` 항목은 다음 세대 backlog로 이월됩니다.

**부분 완료는 정상** — Genome 변경에 의존하는 태스크는 `[deferred]`로 마킹하고 다음 세대로 인계합니다.

### 4축 구조 [↗](https://reap.cc/docs/core-concepts)

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
| `reap fix` | `.reap/` 구조 진단 및 복구 (`--check`로 읽기 전용 모드) |
| `reap clean` | 대화형 옵션으로 REAP 프로젝트 초기화 |
| `reap destroy` | 프로젝트에서 모든 REAP 파일 제거 ("yes destroy" 입력으로 확인) |
| `reap help` | CLI 명령어 + 슬래시 커맨드 + 워크플로우 요약 출력 (버전 + 최신 여부 표시) |
| `reap run <cmd>` | 슬래시 커맨드의 스크립트를 직접 실행 (1줄 `.md` wrapper가 내부적으로 사용) |

### 옵션

```bash
reap init my-project --mode adoption    # 기존 프로젝트에 REAP 적용
reap init my-project --preset bun-hono-react  # 프리셋으로 Genome 초기화
reap update --dry-run                   # 변경사항 미리보기
```

## 에이전트 연동

REAP은 슬래시 커맨드와 세션 훅을 통해 AI 에이전트와 통합됩니다. 현재 지원 에이전트: **Claude Code**, **OpenCode**.

### Script Orchestrator 아키텍처

v0.11.0부터 31개 슬래시 커맨드가 **1줄 `.md` wrapper + TypeScript 스크립트** 구조로 전환되었습니다. 각 `.md` 파일은 `reap run <cmd>`를 호출하고, TS 스크립트(`src/cli/commands/run/`)가 모든 결정적 로직을 처리하여 AI에게 structured JSON으로 지시합니다. 일관성과 테스트 용이성이 크게 향상되었습니다.

### 서명 기반 잠금 (Signature-Based Locking) [↗](https://reap.cc/docs/advanced)

REAP은 암호학적 nonce 체인을 사용하여 stage 순서를 강제합니다. `--phase complete`가 실행되면 일회용 nonce를 생성하여 해시를 `current.yml`에 저장하고, 자동으로 다음 stage로 전환합니다. 다음 stage 커맨드는 진입 시 nonce를 검증하며, 유효하지 않으면 진입이 거부됩니다.

```
--phase complete       current.yml              다음 Stage 진입
────────────────       ───────────              ────────────────
nonce 생성 ──────────→ hash(nonce) 저장
자동 전환 ───────────→ stage 전진
AI에게 nonce 반환                          ←── AI가 nonce 전달
                                               hash(nonce) 검증
                                               ✓ stage 전진
```

이를 통해 방지하는 것:
- **Stage 건너뛰기** — 실행되지 않은 stage에는 유효한 nonce가 존재하지 않음
- **토큰 위조** — 해시는 단방향이므로 해시에서 nonce를 추측할 수 없음
- **이전 nonce 재사용** — 각 nonce는 일회용이며 현재 stage에 바인딩됨

### autoSubagent 모드

`/reap.evolve` 실행 시 자동으로 subagent에게 Generation lifecycle 전체를 위임할 수 있습니다:

```yaml
# .reap/config.yml
autoSubagent: true    # 기본값: true
```

Subagent는 전체 컨텍스트를 받아 모든 stage를 자율적으로 실행하며, 정말로 막혔을 때만 사용자에게 확인을 요청합니다.

### 에러 시 자동 이슈 리포트

`reap run` 실행 중 예상치 못한 에러가 발생하면, `gh issue create`를 통해 GitHub Issue를 자동으로 생성할 수 있습니다:

```yaml
# .reap/config.yml
autoIssueReport: true    # 기본값: true (gh CLI가 있을 때)
```

### AI Migration Agent

`reap update` 실행 시 프로젝트와 최신 REAP 버전 사이의 구조적 차이(누락된 config 필드, 오래된 템플릿 등)가 감지되면, AI 기반 마이그레이션 프롬프트를 제공합니다. 에이전트가 차이를 분석하고 대화형으로 변경을 적용하므로 수동 마이그레이션이 필요 없습니다.

`reap init`도 모든 config 필드를 명시적으로 선언하며, `reap update` 시 누락된 필드는 자동으로 채워집니다.

### CLAUDE.md 연동

`reap init`과 `reap update` 시 `.claude/CLAUDE.md`에 REAP 관리 섹션을 추가하여 Claude Code 세션에 필요한 프로젝트 컨텍스트를 제공합니다.

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
| `/reap.next` | 자동 전환 확인 (폴백) |
| `/reap.back` | 이전 stage로 복귀 (micro loop) |
| `/reap.abort` | 현재 Generation 중단 (rollback/stash/hold + backlog 저장) |
| `/reap.status` | 현재 Generation 상태 및 프로젝트 건강 상태 표시 |
| `/reap.sync` | Genome + Environment 동시 동기화 |
| `/reap.sync.genome` | 소스 코드 기반 Genome 최신화 |
| `/reap.sync.environment` | 외부 환경 의존성 탐색 및 문서화 |
| `/reap.config` | 현재 프로젝트 설정 표시 |
| `/reap.report` | REAP 프로젝트에 버그/피드백 보고 (개인정보 보호) |
| `/reap.help` | 24+ 주제의 contextual AI 도움말 |
| `/reap.update` | REAP 패키지 업그레이드 + 커맨드/템플릿/훅 동기화 |
| `/reap.update-genome` | Generation 없이 대기 중인 genome-change backlog 적용 |
| **`/reap.evolve`** | **한 Generation 전체를 처음부터 끝까지 실행 (권장)** |
| **`/reap.evolve.recovery`** | **실패/중단된 Generation에서 복구** |
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
| `/reap.refreshKnowledge` | REAP 컨텍스트 재로드 (Genome, Environment, 상태). context compaction 후 또는 서브에이전트에서 사용 |

### SessionStart Hook [↗](https://reap.cc/docs/hooks)

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
| Escape hatch | 사용자가 "override", "bypass strict" 등 명시적 요청 시 해당 작업에 한해 허용, 완료 후 strict 모드 재적용 |

**`strict.merge`** — Git 명령 제어: 활성화 시 `git pull`/`push`/`merge` 직접 사용이 제한됩니다. 에이전트가 `/reap.pull`, `/reap.push`, `/reap.merge` 사용을 안내합니다.

두 옵션 모두 기본 비활성화. `strict: true`는 둘 다 활성화합니다.

Strict 모드는 기본적으로 비활성화되어 있습니다 (`strict: false`).

### REAP Hooks [↗](https://reap.cc/docs/hooks)

Hook은 파일 기반이며 `.reap/hooks/`에 저장됩니다. 각 Hook은 `{event}.{name}.{md|sh}` 형식의 파일입니다:

- `.md` 파일은 AI 프롬프트를 담고 있습니다 (AI 에이전트가 실행)
- `.sh` 파일은 셸 스크립트를 담고 있습니다 (직접 실행)

```
.reap/hooks/
├── onLifeStarted.context-load.md
├── onLifeCompleted.version-bump.md
├── onLifeCompleted.readme-update.md
├── onLifeTransited.notify.sh
└── onLifeRegretted.alert.sh
```

각 Hook 파일은 다음 필드를 가진 frontmatter를 지원합니다:

```yaml
---
condition: has-code-changes   # .reap/hooks/conditions/ 내 스크립트 이름
order: 10                     # 실행 순서 (낮을수록 먼저 실행)
---
```

**Normal Lifecycle Events:**

| 이벤트 | 트리거 |
|--------|--------|
| `onLifeStarted` | `/reap.start`로 새 Generation 생성 후 |
| `onLifeObjected` | objective 단계 완료 후 |
| `onLifePlanned` | planning 단계 완료 후 |
| `onLifeImplemented` | implementation 단계 완료 후 |
| `onLifeValidated` | validation 단계 완료 후 |
| `onLifeCompleted` | completion + archiving 후 (git commit 이후 실행) |
| `onLifeTransited` | 모든 stage 전환 시 (범용) |
| `onLifeRegretted` | `/reap.back` regression 시 |

**Merge Lifecycle Events:**

| 이벤트 | 트리거 |
|--------|--------|
| `onMergeStarted` | `/reap.merge.start`로 머지 Generation 생성 후 |
| `onMergeDetected` | detect 단계 완료 후 |
| `onMergeMated` | mate 단계 완료 후 (genome 확정) |
| `onMergeMerged` | merge 단계 완료 후 (소스 병합) |
| `onMergeSynced` | sync 단계 완료 후 |
| `onMergeValidated` | merge validation 완료 후 |
| `onMergeCompleted` | merge completion + archiving 후 |
| `onMergeTransited` | 모든 merge stage 전환 시 (범용) |

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

~/.reap/                          # 사용자 레벨 (reap init 시 설치)
├── commands/                     # Slash command 원본 (1줄 .md wrapper)
└── templates/                    # Artifact 템플릿

~/.claude/
└── settings.json                 # SessionStart hook 등록

.claude/commands/                 # 프로젝트 레벨 슬래시 커맨드
└── reap.*.md                     # 활성 슬래시 커맨드 (`reap run <cmd>` 호출)
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
