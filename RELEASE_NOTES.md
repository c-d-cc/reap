## What's New
- **File-Based Hooks** — Hooks are now fully file-based in `.reap/hooks/` with naming convention `{event}.{name}.{md|sh}`. Frontmatter declares `condition` and `order`. No more hooks in config.yml.
- **User-Definable Hook Conditions** — Conditions are executable scripts in `.reap/hooks/conditions/`. Default 3 provided (always, has-code-changes, version-bumped). Add custom conditions by dropping a `.sh` script.
- **Hook Suggestion** — Completion Phase 5 automatically detects repeated manual tasks across recent generations and suggests creating hooks with step-by-step user confirmation (event, condition, name, content preview).
- **Genome Source Map** — New `genome/source-map.md` with C4 Container/Component level Mermaid diagrams. Loaded at session start, drift auto-detected.
- **Session Init Display** — Session start shows Genome load/sync status and generation state with color indicators (🟢/🟡/🔴).
- **JS Session Hook** — `session-start.sh` replaced with `session-start.cjs` for 26% faster startup (single Node.js process).
- **Smarter Lineage Compression** — Threshold lowered to 5,000 lines. Most recent 3 generations protected from compression.
- **Auto Version Bump** — `onGenerationComplete` hook auto-judges version bump needs (patch=auto, minor/major=user confirmation).
- **Smarter Genome Staleness Detection** — Only counts code-related commits (src/, tests/, package.json, etc.).
- **Source-Map Drift Detection** — Session start compares documented components vs actual files, warns on mismatch.

## Generations
- **gen-029**: Genome staleness 감지 오탐 수정 + v0.2.2
- **gen-030**: onGenerationComplete hook에 자동 version bump 판단 추가
- **gen-031**: Compression 임계값 조정 + Hooks condition/execute 리팩토링 + source-map 추가
- **gen-032**: source-map 정식 genome 파일화 + hooks 파일 기반 전환
- **gen-033**: Hook suggestion + source-map drift 감지 + genome 문서 업데이트
- **gen-034**: v0.3.0 docs full scan (4개 언어 README + docs)
- **gen-035**: Hook conditions 스크립트 기반 전환
- **gen-036~038**: session-start JS 전환 + init 표시 개선
