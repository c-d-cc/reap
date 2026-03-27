<p align="center">
  <img src="https://raw.githubusercontent.com/c-d-cc/reap/main/media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  AI와 인간이 세대를 거치며 소프트웨어를 공동 진화시키는 자기 진화형 개발 파이프라인.
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/c-d-cc/reap/main/media/architecture.png" alt="REAP Architecture" width="600" />
</p>

REAP는 AI와 인간이 협력하여 소프트웨어를 구축하고 진화시키는 세대 기반 개발 파이프라인입니다. 인간은 비전을 제공하고 핵심 의사결정을 내립니다. AI는 프로젝트의 지식 — Genome(아키텍처, 컨벤션, 제약 조건)과 Environment(코드베이스, 의존성, 도메인) — 을 학습한 뒤, 구조화된 세대를 거치며 구현, 검증, 적응합니다. 각 세대가 완료될 때마다 교훈이 지식 기반에 반영됩니다. 시간이 지남에 따라 지식과 소스 코드(Civilization) 모두가 자기 진화합니다.

## 목차

- [REAP란 무엇인가?](#reap란-무엇인가)
- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [생명 주기](#생명-주기-)
- [핵심 개념](#핵심-개념-)
- [병합 생명 주기](#병합-생명-주기-)
- [자기 진화 기능](#자기-진화-기능-)
- [슬래시 명령어](#슬래시-명령어)
- [에이전트 통합](#에이전트-통합-)
- [프로젝트 구조](#프로젝트-구조)
- [설정](#설정-)
- [v0.15에서 업그레이드](#v015에서-업그레이드)

## REAP란 무엇인가?

AI 에이전트와 개발할 때 이런 문제를 겪어 본 적 있으신가요?

- **컨텍스트 유실** — 새 세션을 시작하면 에이전트가 모든 것을 잊어버림
- **산발적 개발** — 명확한 방향이나 목표 없이 코드가 수정됨
- **설계-코드 괴리** — 문서가 실제 구현과 동떨어짐
- **교훈 망각** — 어렵게 얻은 인사이트가 다음으로 전달되지 않음
- **협업 혼란** — 여러 에이전트나 개발자가 충돌하는 변경을 만들어냄

REAP는 이러한 문제를 **자기 진화 세대 모델**로 해결합니다:

- 각 세대는 구조화된 생명 주기를 따릅니다: 현재 상태 학습, 목표 수립, 구현, 검증, 회고
- AI 에이전트가 매 세션 시작 시 전체 프로젝트 컨텍스트를 자동 복원합니다
- 규범적 지식(Genome)은 각 세대 완료 시 인간이 승인한 적응을 통해 진화합니다
- AI가 비전과 현재 상태 사이의 간극을 분석하여 자동으로 목표를 선택합니다
- 명확성 기반 상호작용으로 AI가 구조, 예시, 솔직한 의견을 갖추어 소통합니다
- 브랜치 간 병렬 작업은 genome 우선 병합 워크플로우를 통해 조정됩니다

## 설치

> **전역 설치가 필요합니다.**

```bash
npm install -g @c-d-cc/reap
```

> **요구 사항**: [Node.js](https://nodejs.org) v18+, [Claude Code](https://claude.ai/claude-code) CLI.

## 빠른 시작

AI 에이전트(Claude Code)를 열고 슬래시 명령어를 사용하세요:

```bash
# 프로젝트에 REAP 초기화 (신규 프로젝트 vs 기존 코드베이스 자동 감지)
/reap.init

# 전체 세대 실행
/reap.evolve
```

`/reap.evolve`는 학습부터 완료까지 전체 세대 생명 주기를 주도합니다. AI가 프로젝트를 탐색하고, 작업을 계획하고, 구현하고, 검증하고, 회고합니다. 일상적인 개발에서 사용하는 주요 명령어입니다.

> **참고:** 사용자는 AI 에이전트에서 `/reap.*` 슬래시 명령어를 통해 REAP와 상호작용합니다. CLI는 이러한 명령어를 구동하는 내부 엔진입니다.

## 생명 주기 [↗](https://reap.cc/docs/lifecycle)

각 세대는 다섯 단계의 생명 주기를 따릅니다.

```
learning → planning → implementation ⟷ validation → completion
```

| 단계 | 수행 내용 | 산출물 |
|------|----------|--------|
| **Learning** | 프로젝트 탐색, 컨텍스트 구축, genome과 environment 검토 | `01-learning.md` |
| **Planning** | 목표 정의, 작업 분해, 의존성 매핑 | `02-planning.md` |
| **Implementation** | AI-인간 협업으로 구현 | `03-implementation.md` |
| **Validation** | 테스트 실행, 완료 기준 검증 | `04-validation.md` |
| **Completion** | 회고, 적합도 피드백 수집, genome 적응, 아카이브 | `05-completion.md` |

## 핵심 개념 [↗](https://reap.cc/docs/core-concepts)

### Genome — 구축 방법 [↗](https://reap.cc/docs/genome)

프로젝트의 규범적 지식입니다. 세 개의 파일로 구성되며 항상 전체 로딩됩니다:

```
.reap/genome/
  application.md    # 프로젝트 정체성, 아키텍처, 컨벤션, 제약 조건
  evolution.md      # AI 행동 가이드, 진화 방향, 소프트 생명 주기 규칙
  invariants.md     # 절대 제약 (인간만 편집 가능)
```

### Environment — 현재 존재하는 것 [↗](https://reap.cc/docs/environment)

프로젝트의 서술적 지식입니다. 2단계 로딩 전략을 사용합니다:

```
.reap/environment/
  summary.md        # 세션 시작 시 항상 로딩 (~100줄)
  domain/           # 도메인 지식 (필요 시 로딩)
  resources/        # 외부 참조 문서 — API 문서, SDK 스펙 (필요 시 로딩)
  docs/             # 프로젝트 참조 문서 — 설계 문서, 스펙 (필요 시 로딩)
  source-map.md     # 현재 코드 구조 + 의존성 (필요 시 로딩)
```

### Vision — 향해 가는 곳 [↗](https://reap.cc/docs/vision)

장기 목표와 방향입니다. AI는 적응 단계에서 다음에 가장 가치 있는 작업을 결정하기 위해 vision을 참조합니다.

```
.reap/vision/
  goals.md          # 북극성 목표
  docs/             # 기획 문서
  memory/           # AI 메모리 (3계층: longterm, midterm, shortterm)
```

### Backlog [↗](https://reap.cc/docs/backlog)

세대 진행 중 발견된 이슈는 즉시 수정하지 않습니다. `.reap/life/backlog/`에 backlog 항목으로 기록됩니다:

- `type: genome-change` — 적응 단계에서 적용할 genome 변경
- `type: environment-change` — environment 업데이트
- `type: task` — 향후 세대를 위한 작업 항목

Backlog 항목은 세대 간 자동으로 이월됩니다. 소비된 항목은 해당 세대의 lineage와 함께 아카이브됩니다.

### Lineage — 우리가 배운 것 [↗](https://reap.cc/docs/lineage)

완료된 세대의 아카이브로, 2단계 자동 압축을 제공합니다:

- **Level 1**: 세대 폴더 (5개 산출물) → 단일 요약 파일
- **Level 2**: 100개 이상의 Level 1 파일 → 단일 `epoch.md`

브랜치 인식 lineage 탐색을 위한 DAG 메타데이터가 보존됩니다.

### Hooks [↗](https://reap.cc/docs/hooks)

`.reap/hooks/`에 위치한 파일 기반 생명 주기 이벤트 훅:
- `.md` 파일: 에이전트가 실행하는 AI 프롬프트
- `.sh` 파일: 직접 실행되는 셸 스크립트

### 원칙

- **Genome 불변성**: Genome은 세대 진행 중 절대 수정되지 않습니다. 이슈는 backlog에 기록되고 completion의 적응 단계에서 적용됩니다.
- **Environment 불변성**: Environment는 세대 진행 중 직접 수정되지 않습니다. 변경 사항은 backlog에 기록되고 completion의 회고 단계에서 적용됩니다.
- **인간이 적합도를 판단**: 정량적 메트릭 없음. 인간의 자연어 피드백만이 유일한 적합도 신호입니다.
- **자기 적합도 평가 금지**: AI는 자신의 성공을 절대 평가하지 않습니다. 자기 성찰(메타인지)만 허용됩니다.

## 병합 생명 주기 [↗](https://reap.cc/docs/merge-lifecycle)

여러 개발자나 에이전트가 병렬로 작업할 때, REAP는 genome 우선 병합 워크플로우를 제공합니다.

```
detect → mate → merge → reconcile → validation → completion
```

| 단계 | 목적 |
|------|------|
| **Detect** | 브랜치 간 분기 식별 |
| **Mate** | genome 충돌을 먼저 해결 (인간이 결정) |
| **Merge** | 확정된 genome을 기반으로 소스 코드 병합 |
| **Reconcile** | genome-소스 일관성 검증 |
| **Validation** | 테스트 실행 |
| **Completion** | 병합 결과 커밋 및 아카이브 |

## 자기 진화 기능 [↗](https://reap.cc/docs/self-evolving)

### 간극 기반 목표 선택

AI는 비전과 현재 상태 사이의 간극을 분석하여 다음 세대의 목표를 자동으로 선택합니다. `vision/goals.md`의 미완료 목표와 대기 중인 backlog 항목을 교차 참조하고, 영향력 순으로 우선순위를 매기며, 가장 가치 있는 다음 단계를 제안합니다. 인간이 승인하거나 조정합니다.

### 인간이 적합도를 판단

정량적 메트릭 없음. 적합도 단계에서의 인간의 자연어 피드백만이 유일한 적합도 신호입니다. AI는 자신의 성공을 절대 평가하지 않습니다 — 자기 성찰(메타인지)만 허용됩니다.

### 명확성 기반 상호작용

AI는 현재 컨텍스트의 명확도에 따라 소통 방식을 조정합니다:

- **높은 명확도** (명확한 목표, 정의된 작업) → 최소한의 질문으로 실행
- **중간 명확도** (방향은 있으나 세부 사항이 불분명) → 트레이드오프와 함께 2-3개 선택지 제시
- **낮은 명확도** (모호한 목표) → 공유된 이해를 구축하기 위한 예시와 함께 적극적 대화

### Cruise 모드

N개 세대를 사전 승인하여 자율 실행:
- AI가 비전 간극에서 목표를 선택하고 전체 생명 주기를 자율적으로 실행
- 불확실성이나 위험이 감지되면 cruise가 일시 정지하고 인간 피드백을 요청
- N개 세대 모두 완료 후 인간이 일괄 검토

## 슬래시 명령어

| 명령어 | 설명 |
|--------|------|
| `/reap.evolve` | 전체 세대 실행 (권장) |
| `/reap.start` | 새 세대 시작 |
| `/reap.next` | 다음 단계로 진행 |
| `/reap.back` | 이전 단계로 돌아감 |
| `/reap.abort` | 현재 세대 중단 |
| `/reap.knowledge` | genome/environment 검토 및 관리 |
| `/reap.merge` | 병합 생명 주기 작업 |
| `/reap.pull` | Fetch + 병합 생명 주기 |
| `/reap.push` | 검증 + push |
| `/reap.status` | 현재 상태 확인 |
| `/reap.help` | 사용 가능한 명령어 표시 |
| `/reap.init` | 프로젝트에 REAP 초기화 |
| `/reap.run` | 생명 주기 명령어 직접 실행 |
| `/reap.config` | 프로젝트 설정 조회/편집 |

## 에이전트 통합 [↗](https://reap.cc/docs/agent-integration)

REAP는 슬래시 명령어와 생명 주기 훅을 통해 AI 에이전트와 통합됩니다. 현재 지원: **Claude Code**. 향후 에이전트 지원을 위해 어댑터 패턴 아키텍처를 사용합니다.

### 동작 방식

1. **CLAUDE.md**가 세션 시작 시 genome, environment, reap-guide를 로딩하도록 AI에 지시
2. **슬래시 명령어**가 `reap run <cmd>`를 호출하고, AI에게 구조화된 JSON 지시를 반환
3. **서명 기반 잠금** (nonce 체인)이 코드 수준에서 단계 순서를 강제 — 건너뛰기, 위조, 재생 불가

### 서브에이전트 모드

`/reap.evolve`는 전체 세대를 서브에이전트에 위임하여 모든 단계를 자율적으로 수행하게 할 수 있으며, 진정으로 막혔을 때만 사용자에게 알립니다.

## 프로젝트 구조

```
my-project/
  src/                        # 여러분의 코드
  .reap/
    config.yml                # 프로젝트 설정
    genome/                   # 규범적 지식 (3개 파일)
      application.md
      evolution.md
      invariants.md
    environment/              # 서술적 지식 (2단계)
      summary.md
      domain/
      resources/              # 외부 참조 문서 (API, SDK)
      docs/                   # 프로젝트 참조 문서 (설계, 스펙)
      source-map.md
    vision/                   # 장기 목표
      goals.md
      docs/
      memory/                 # AI 메모리 (longterm/midterm/shortterm)
    life/                     # 현재 세대
      current.yml
      backlog/
    lineage/                  # 완료된 세대 아카이브
    hooks/                    # 생명 주기 훅 (.md/.sh)
```

## 설정 [↗](https://reap.cc/docs/configuration)

`.reap/config.yml`의 프로젝트 설정:

```yaml
project: my-project           # 프로젝트 이름
language: english              # 산출물/프롬프트 언어
autoSubagent: true             # evolve에서 서브에이전트 자동 위임
strictEdit: false               # 코드 변경을 REAP 생명 주기로 제한
strictMerge: false              # 직접 git pull/push/merge 제한
agentClient: claude-code       # AI 에이전트 클라이언트
# cruiseCount: 1/5             # 존재 시 = cruise 모드 (현재/전체)
```

주요 설정:
- **`cruiseCount`**: 존재하면 cruise 모드를 활성화합니다. 형식은 `현재/전체`. cruise 완료 후 제거됩니다.
- **`strictEdit`**: 코드 변경을 계획된 범위 내 구현 단계로 제한합니다.
- **`strictMerge`**: 직접 git pull/push/merge를 제한합니다 — 대신 `/reap.pull`, `/reap.push`, `/reap.merge`를 사용하세요.
- **`agentClient`**: 스킬 배포에 사용할 어댑터를 결정합니다.

## v0.15에서 업그레이드

REAP v0.16은 [Self-Evolving Pipeline](https://reap.cc/docs/self-evolving) 아키텍처를 기반으로 완전히 재작성되었습니다.

### 마이그레이션 단계

1. **v0.16 설치:**
   ```bash
   npm install -g @c-d-cc/reap
   ```
   v0.16 스킬이 `~/.claude/commands/`에 자동 설치되고, 레거시 v0.15 프로젝트 레벨 스킬이 제거됩니다.

2. **프로젝트에서 Claude Code를 열고** 실행:
   ```
   /reap.update
   ```

3. **다단계 마이그레이션을 따르세요:**

   | 단계 | 수행 내용 | 여러분의 역할 |
   |------|----------|--------------|
   | **Confirm** | 변경 사항 표시, `.reap/v15/`에 백업 생성 | 검토 및 확인 |
   | **Execute** | 디렉토리 재구성, config/hooks/lineage/backlog 마이그레이션 | 자동 |
   | **Genome Convert** | AI가 v0.15 파일에서 새로운 3파일 구조로 genome 재구성 | AI 작업 검토 |
   | **Vision** | vision/goals.md 및 memory 설정 | 프로젝트 방향 제시 |
   | **Complete** | 마이그레이션 결과 요약 | 확인 |

4. **프로젝트 동작 확인:**
   ```
   /reap.status
   /reap.evolve
   ```

### 중단된 마이그레이션

마이그레이션이 중단되면 (API 오류, 세션 연결 끊김 등), 진행 상황이 `.reap/migration-state.yml`에 저장됩니다. `/reap.update`를 다시 실행하면 이미 완료된 단계를 건너뛰고 중단된 지점부터 재개합니다.

처음부터 다시 시작하려면 `.reap/migration-state.yml`을 삭제하고 `/reap.update`를 다시 실행하세요.

### 백업

모든 v0.15 파일은 `.reap/v15/`에 보존됩니다. 마이그레이션 검증 후 이 디렉토리를 안전하게 삭제할 수 있습니다.

### 변경 사항

**생명 주기 재설계:**
- 첫 번째 단계가 이제 `learning`입니다 (이전에는 `objective`). AI가 목표를 설정하기 전에 프로젝트를 탐색합니다.
- Completion이 이제 4단계입니다: `reflect` → `fitness` → `adapt` → `commit` (이전에는 5단계).
- 새로운 개념: embryo 세대, cruise 모드, 비전 기반 기획.

**Vision 레이어 추가:**
- `vision/goals.md` — 장기 목표, 적응 단계에서 간극 기반 목표 선택
- `vision/memory/` — 3계층 메모리 (longterm, midterm, shortterm), 세대 간 컨텍스트 유지
- `vision/docs/` — 기획 문서 및 스펙

**Genome 재구성 (3파일):**
- `application.md` — 프로젝트 정체성, 아키텍처, 컨벤션, 제약 조건
- `evolution.md` — AI 행동 가이드, 진화 방향, 소프트 생명 주기 규칙
- `invariants.md` — 절대 제약 (인간만 편집 가능)

**새로운 기능:**
- 명확성 기반 상호작용: AI가 컨텍스트 명확도에 따라 소통 깊이를 조정
- Cruise 모드: N개 세대를 사전 승인하면 AI가 자기 성찰과 함께 자율 실행
- 조정(reconcile) 단계를 포함한 병합 생명 주기로 genome-소스 일관성 검증
- 세대 간 컨텍스트를 위한 3계층 메모리를 갖춘 vision 시스템

**폐기된 명령어:**
- `/reap.sync` → `/reap.knowledge`
- `/reap.refreshKnowledge` → `/reap.knowledge`

## 저자

**최현일** — [hichoi@c-d.cc](mailto:hichoi@c-d.cc) | [c-d.cc](https://c-d.cc) | [LinkedIn](https://www.linkedin.com/in/hichoi-dev) | [GitHub](https://github.com/casamia918)

## 라이선스

MIT
