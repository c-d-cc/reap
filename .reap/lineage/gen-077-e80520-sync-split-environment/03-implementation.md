# Implementation

## Changes

### 커맨드 템플릿
- `reap.sync.md` → orchestrator (sync.genome + sync.environment 순차 호출)
- `reap.sync.genome.md` — 기존 sync 로직 이동
- `reap.sync.environment.md` — 신규 (소스 스캔 + 유저 인터뷰 + 3-layer 생성)

### init/paths
- `init.ts`: COMMAND_NAMES에 sync.genome, sync.environment 추가 + environment/docs/, resources/ 디렉토리 생성
- `paths.ts`: environmentSummary, environmentDocs, environmentResources getter 추가

### session-start
- `session-start.cjs`: environment/summary.md 로딩 → context에 "## Environment" 섹션 추가

### objective 간소화
- `reap.objective.md` Step 1: interactive environment setup 제거 → summary 확인 + sync.environment 안내
