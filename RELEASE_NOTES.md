## What's New
- **Shared Genome Loader** — `genome-loader.cjs` extracts common logic (Genome L1/L2 loading, config parsing, staleness/drift detection, strict mode) shared between Claude Code and OpenCode session hooks. Eliminates ~120 lines of duplication.
- **OpenCode source-map.md Fix** — OpenCode session hook now includes `source-map.md` in L1 files and detects source-map drift, matching Claude Code behavior.

## Generations
- **gen-039**: session-start hooks Genome 로딩 로직 공통 모듈 추출 + opencode source-map.md 누락 수정
