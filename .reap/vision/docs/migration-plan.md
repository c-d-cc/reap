# REAP v0.15 → v0.16 Migration Plan

## 개요

v0.15 사용자가 v0.16을 설치했을 때, 기존 `.reap/` 구조를 v0.16 구조로 안전하게 전환하는 마이그레이션 기능.

## 커맨드

- **CLI**: `reap init --migrate`
- **Slash command**: `/reap.migrate`
- 모든 v0.16 CLI 명령 진입 시 v0.15 감지 → `/reap.migrate` 안내

## v0.15 감지 기준

`.reap/genome/principles.md` 파일 존재 여부로 판단.
- 존재 → v0.15 프로젝트
- 부재 + `application.md` 존재 → v0.16 프로젝트
- 둘 다 부재 → reap 프로젝트 아님

---

## Phase 1: Pre-check (CLI → JSON 반환)

### 1.1 Git clean 확인
```bash
git status --porcelain
```
- dirty면 에러: "uncommitted changes가 있습니다. 먼저 커밋하세요."
- .reap/ 내부 변경도 포함 (genome 수정 등이 커밋 안 된 상태면 migration 중 손실 위험)

### 1.2 v0.15 구조 감지
- `.reap/config.yml` 존재 확인
- `.reap/genome/principles.md` 존재 → v0.15 확정
- 이미 v0.16이면 에러: "이미 v0.16 구조입니다"

### 1.3 Active generation 확인
- `.reap/life/current.yml` 존재 + 내용이 있으면
- 에러: "active generation이 있습니다. 먼저 `/reap.abort`로 중단하세요."
- migration 중에 active generation 변환은 복잡도가 너무 높음

### 1.4 v0.15 구조 스캔
기존 .reap/ 내용을 스캔하여 변경 사항 목록 생성:
- genome 파일 목록 (principles.md, conventions.md, constraints.md, source-map.md, domain/*)
- config.yml 필드 목록
- lineage 수
- backlog 수
- hooks 파일 목록 (특히 onLifeObjected 존재 여부)
- environment 파일 목록

### 1.5 변경 사항 설명 JSON prompt 반환
```json
{
  "status": "prompt",
  "command": "migrate",
  "phase": "confirm",
  "context": {
    "version": "0.15",
    "genomeFiles": ["principles.md", "conventions.md", "constraints.md", "source-map.md"],
    "lineageCount": 42,
    "backlogCount": 3,
    "hooks": ["onLifeCompleted.docs-update.md", "onLifeObjected.custom.sh"],
    "hooksMappingNeeded": ["onLifeObjected.custom.sh"]
  },
  "prompt": "변경 사항 설명 + 유저 확인 요청"
}
```

---

## Phase 2: 유저 확인 (AI → 유저)

AI가 prompt를 읽고 유저에게 설명:

```
REAP v0.15 → v0.16 마이그레이션을 시작합니다.

### 변경되는 것:
1. **Genome 재구성**
   - principles.md + conventions.md + constraints.md → application.md로 통합
   - evolution.md 신규 생성 (AI 행동 가이드)
   - invariants.md 신규 생성 (절대 제약)
   - source-map.md → environment/source-map.md로 이동

2. **Config 마이그레이션**
   - 제거: entryMode, autoIssueReport, genomeVersion, lastSyncedGeneration, preset
   - 추가: agentClient (기본값: claude-code)
   - 유지: project, language, strict, autoUpdate, autoSubagent

3. **Vision 신규 생성**
   - goals.md — 프로젝트 장기 목표 (이후 설정)
   - memory/ — AI 자유 기록 공간 (longterm/midterm/shortterm)

4. **Hooks 이벤트명 변경**
   - onLifeObjected → (선택 필요: onLifeLearned 또는 onLifePlanned)
   - onMergeSynced → onMergeReconciled

5. **백업**
   - 기존 .reap/ → .reap-v0_15/ 로 보존
   - 마이그레이션 완료 후에도 백업은 유지됨

### 변경되지 않는 것:
- lineage (그대로 복사, 읽기 호환)
- backlog (경로 동일: .reap/life/backlog/)
- environment/summary.md (그대로 복사)
- environment/domain/ (그대로 복사)

계속하시겠습니까?
```

유저 확인 후 Phase 3 실행.

---

## Phase 3: 백업 + 구조 변환 (CLI)

### 3.1 백업
```bash
mv .reap .reap-v0_15
```

### 3.2 새 .reap 디렉토리 구조 생성
```
mkdir -p .reap/genome
mkdir -p .reap/environment/domain
mkdir -p .reap/life/backlog
mkdir -p .reap/lineage
mkdir -p .reap/vision/docs
mkdir -p .reap/vision/memory
mkdir -p .reap/hooks/conditions
```

### 3.3 Config 마이그레이션
v0.15 config.yml을 읽고 v0.16 형식으로 변환:

```yaml
# v0.15
project: "my-project"
entryMode: "adoption"        # 제거
strict: false
language: "korean"
autoUpdate: true
autoSubagent: true
autoIssueReport: false        # 제거
lastSyncedGeneration: "..."   # 제거
genomeVersion: 3              # 제거

# v0.16
project: "my-project"
language: "korean"
autoSubagent: true
strict: false
agentClient: "claude-code"    # 추가 (기본값)
autoUpdate: true
```

### 3.4 Genome 변환

**단순 concat이 아닌 AI 기반 재구성.**

CLI가 v0.15 genome 원본 4개 파일 내용을 읽어서 prompt에 포함:
```json
{
  "status": "prompt",
  "command": "migrate",
  "phase": "genome-convert",
  "context": {
    "principles": "(원본 내용)",
    "conventions": "(원본 내용)",
    "constraints": "(원본 내용)",
    "sourceMap": "(원본 내용)",
    "domain": ["file1.md", "file2.md"],
    "evolutionTemplate": "(src/templates/evolution.md 내용)",
    "targetPaths": {
      "application": ".reap/genome/application.md",
      "evolution": ".reap/genome/evolution.md",
      "invariants": ".reap/genome/invariants.md"
    }
  },
  "prompt": "아래 v0.15 genome 내용을 v0.16 구조로 재구성하세요..."
}
```

AI가 해야 할 것:
1. **application.md 생성** — principles + conventions + constraints 내용을 v0.16 섹션 구조로 재구성:
   - `## Identity` — 프로젝트 설명 (principles에서 추출)
   - `## Architecture` — 아키텍처 결정 (principles에서 추출)
   - `## Conventions` — 코딩 규칙 (conventions에서 추출)
   - `## Constraints` 제거 → Architecture에 통합 또는 invariants로 이동
2. **evolution.md 생성** — 템플릿 기반으로 생성 (이미 src/templates/evolution.md 있음)
3. **invariants.md 생성** — constraints.md에서 "절대 제약" 항목 추출 + 기본 invariants (3개)

### 3.5 Environment 복사
```bash
cp .reap-v0_15/environment/summary.md .reap/environment/summary.md
cp -r .reap-v0_15/environment/domain/* .reap/environment/domain/ 2>/dev/null
cp .reap-v0_15/genome/source-map.md .reap/environment/source-map.md 2>/dev/null
```

### 3.6 Lineage 복사
```bash
cp -r .reap-v0_15/lineage/* .reap/lineage/ 2>/dev/null
```
- v0.16이 읽을 때 meta.yml의 `startedAt`/`completedAt` 필드는 무시 (timeline으로 대체)
- `type: recovery`는 `type: normal`로 취급

### 3.7 Backlog 복사
```bash
cp -r .reap-v0_15/life/backlog/* .reap/life/backlog/ 2>/dev/null
```
- 경로 동일 (.reap/life/backlog/)
- frontmatter 형식 호환됨

### 3.8 Hooks 복사 + 이벤트명 매핑

자동 매핑:
| v0.15 이벤트 | v0.16 이벤트 |
|-------------|-------------|
| onLifeObjected | **(유저 선택 필요)** |
| onLifePlanned | onLifePlanned |
| onLifeImplemented | onLifeImplemented |
| onLifeValidated | onLifeValidated |
| onLifeCompleted | onLifeCompleted |
| onLifeTransited | onLifeTransited |
| onLifeRegretted | onLifeRegretted |
| onMergeSynced | onMergeReconciled |

`onLifeObjected` hook이 발견되면 AI가 내용을 분석하여 자동 매핑:
- .sh: lint/typecheck/test 실행 → `onLifePlanned`. context 로딩/탐색 → `onLifeLearned`
- .md: goal 검토/요구사항 확인 → `onLifeLearned`. 계획 검증/task 확인 → `onLifePlanned`
- 판단 불가 시 기본값: `onLifeLearned` (v0.15의 objective에 가장 가까운 시점)

### 3.9 Vision 생성
- `goals.md` — 빈 템플릿 생성 (Phase 4에서 유저와 함께 채움)
- `memory/longterm.md`, `midterm.md`, `shortterm.md` — 빈 파일 생성
- `docs/` — 빈 디렉토리

### 3.10 CLAUDE.md 생성
- `init --repair`와 동일한 로직으로 CLAUDE.md 생성 또는 REAP 섹션 추가

---

## Phase 4: Vision interaction (AI → 유저)

adoption 수준의 interaction으로 vision/goals.md를 채움.

### 4.1 프로젝트 분석
AI가 수행:
1. 새로 생성된 genome (application.md) 읽기
2. 기존 backlog의 pending items 분석
3. 기존 lineage에서 최근 generation goals 추출
4. environment/summary.md 읽기

### 4.2 Goal 후보 제안
분석 결과를 바탕으로:
```
프로젝트를 분석한 결과, 다음 목표들을 제안합니다:

### 제안된 Goals
1. [기존 backlog에서 추출한 task]
2. [lineage 패턴에서 감지한 미완료 작업]
3. [genome에서 감지한 개선 영역]

이 목표들을 goals.md에 추가할까요? 수정하거나 추가할 것이 있으면 알려주세요.
```

### 4.3 유저 확인 + goals.md 작성
유저가 수정/확인 → goals.md에 체크리스트 형태로 작성.

---

## Phase 5: 결과 보고 (CLI → JSON)

```json
{
  "status": "ok",
  "command": "migrate",
  "phase": "complete",
  "context": {
    "backup": ".reap-v0_15",
    "migrated": [
      "config.yml (5 fields removed, 1 added)",
      "genome (4 files → 3 files)",
      "environment (copied + source-map moved)",
      "lineage (42 entries copied)",
      "backlog (3 items copied)",
      "hooks (2 files mapped, 1 user-selected)",
      "vision (goals.md created)",
      "memory (3 files created)",
      "CLAUDE.md (created)"
    ]
  },
  "message": "Migration complete. Backup at .reap-v0_15/"
}
```

---

## v0.15 감지 gate (모든 CLI 명령에서)

`src/cli/commands/run/index.ts` 등에서 `.reap/config.yml`을 읽은 후:
```typescript
// v0.15 detection gate
if (await fileExists(join(paths.genome, "principles.md"))) {
  emitError("run",
    "This project uses REAP v0.15 structure. " +
    "Run '/reap.migrate' to upgrade to v0.16."
  );
}
```

적용 위치:
- `src/cli/commands/run/index.ts` — 모든 `reap run` 명령
- `src/cli/commands/status.ts` — `reap status`
- `src/cli/commands/fix.ts` — `reap fix`
- `src/cli/commands/make.ts` — `reap make`
- `src/cli/commands/cruise.ts` — `reap cruise`

또는 공통 gate 함수로 추출하여 한 곳에서 관리.

---

## postinstall 확장

현재:
```bash
node dist/cli/index.js install-skills 2>/dev/null || true
```

확장:
```bash
node dist/cli/index.js install-skills 2>/dev/null || true
node dist/cli/index.js check-version 2>/dev/null || true
```

`check-version` 명령:
- `.reap/genome/principles.md` 존재 → stdout에 안내 메시지:
  ```
  ⚠ REAP v0.15 project detected. Run '/reap.migrate' in your AI agent to upgrade.
  ```
- v0.16이거나 .reap/ 없으면 silent exit

postinstall에서는 **안내만** — interactive migration은 AI agent 세션에서 `/reap.migrate`로.

---

## 파일 변경 목록

### 신규 파일
- `src/cli/commands/migrate.ts` — migration 핵심 로직
- `src/cli/commands/check-version.ts` — postinstall용 버전 체크
- `src/adapters/claude-code/skills/reap.migrate.md` — slash command 스킬
- `tests/e2e/migrate.test.ts` — migration e2e 테스트
- `tests/scenario/migrate.test.ts` — 전체 시나리오 테스트

### 수정 파일
- `src/cli/index.ts` — `reap init --migrate`, `reap check-version` 등록
- `src/cli/commands/run/index.ts` — v0.15 감지 gate 추가
- `src/cli/commands/status.ts` — v0.15 감지 gate 추가
- `src/cli/commands/fix.ts` — v0.15 감지 gate 추가
- `src/cli/commands/make.ts` — v0.15 감지 gate 추가
- `src/cli/commands/cruise.ts` — v0.15 감지 gate 추가
- `package.json` — postinstall 확장

---

## Edge Cases

### 1. v0.15 genome에 domain/ 파일이 많은 경우
- domain/ 파일은 그대로 environment/domain/으로 복사
- AI가 application.md 재구성 시 domain 파일 참조는 하지만 내용을 병합하지는 않음

### 2. v0.15 lineage에 type: recovery generation이 있는 경우
- v0.16에서 읽을 때 type: normal로 취급
- 경고 메시지 출력: "recovery type은 v0.16에서 지원되지 않습니다"

### 3. .reap-v0_15가 이미 존재하는 경우
- 에러: "이전 마이그레이션 백업이 이미 존재합니다. 먼저 .reap-v0_15를 제거하세요."

### 4. v0.14 이하 구조인 경우
- v0.15 이전 버전은 지원하지 않음
- "v0.15 이전 버전은 지원되지 않습니다. 먼저 v0.15로 업그레이드하세요."

### 5. git이 없는 프로젝트
- git clean 확인 건너뜀 (경고만 출력)
- 백업은 수행

### 6. genome 파일이 비어있거나 누락된 경우
- 누락된 파일은 기본 템플릿으로 생성
- 비어있는 파일은 그대로 (AI가 재구성 시 빈 내용으로 처리)
