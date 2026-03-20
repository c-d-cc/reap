## What's New
- `/reap.sync` 분리 — `sync.genome` (기존) + `sync.environment` (신규) + `sync` (orchestrator)
- Environment 3-layer 구조 도입 — `summary.md` (context 로딩) + `docs/` (주요 문서) + `resources/` (원본 자료)
- `reap update`에서 프로젝트 `.claude/commands/` 즉시 동기화 (세션 재시작 불필요)
- 로컬 빌드 버전 구분 (`+dev.{commitHash}`) + dev 빌드 시 self-upgrade 스킵

## Generations
- **gen-076-092ca7**: reap update에서 프로젝트 commands 즉시 동기화
- **gen-077-e80520**: sync 분리 (genome/environment) + environment 3-layer 구조
