## What's New
- **Shared Genome Loader** — `genome-loader.cjs` extracts common logic (Genome L1/L2 loading, config parsing, staleness detection, strict mode) shared between Claude Code and OpenCode session hooks. Eliminates ~120 lines of duplication.
- **OpenCode source-map.md Fix** — OpenCode session hook now includes `source-map.md` in L1 files, matching Claude Code behavior.
- **Remove Hardcoded Drift Detection** — Removed `src/core/` + `Component(` regex-based source-map drift detection from session hooks. Staleness detection covers the same use case in a project-agnostic way.

## Generations
- **gen-039**: session-start hooks Genome 로딩 로직 공통 모듈 추출 + opencode source-map.md 누락 수정
- **gen-040**: source-map drift 감지 제거 — 하드코딩 의존 삭제, staleness로 통합
