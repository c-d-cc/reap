## What's New
- **File-Based Hooks** — Hooks are now fully file-based in `.reap/hooks/` with naming convention `{event}.{name}.{md|sh}`. Frontmatter declares `condition` and `order`. No more hooks in config.yml.
- **Genome Source Map** — New `genome/source-map.md` with C4 Container/Component level Mermaid diagrams for quick codebase navigation.
- **Smarter Lineage Compression** — Compression threshold lowered to 5,000 lines (from 10,000). Most recent 3 generations are now protected from compression.
- **Auto Version Bump** — `onGenerationComplete` hook now auto-judges version bump needs (patch=auto, minor/major=user confirmation).
- **Smarter Genome Staleness Detection** — Staleness warning now only counts code-related commits.

## Generations
- **gen-029**: Genome staleness 감지 오탐 수정 + v0.2.2
- **gen-030**: onGenerationComplete hook에 자동 version bump 판단 추가
- **gen-031**: Compression 임계값 조정 + Hooks condition/execute 리팩토링 + source-map 추가
- **gen-032**: source-map 정식 genome 파일화 + hooks 파일 기반 전환 + templates 용어 수정
