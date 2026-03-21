---
id: gen-087-adc61f
type: normal
parents:
  - gen-086-bc3af7
goal: Script Orchestrator Architecture — reap run CLI primitives 도입 + 1줄 Markdown wrapper 전환
genomeHash: ace7ce34
startedAt: 2026-03-21T06:30:21Z
completedAt: 2026-03-21T07:08:33Z
---

# gen-087-adc61f
- **Goal**: Script Orchestrator Architecture — `reap run` CLI primitives 도입 + 1줄 Markdown wrapper 전환
- **Result**: PASS (203 pass / 0 fail)
- **Key Changes**:
  - `reap run <command> [--phase <phase>]` CLI entry point (Commander.js dispatch)
  - `next`, `back`, `start`, `completion` 4개 command script (`src/cli/commands/run/`)
  - `RunOutput` structured JSON output + `emitOutput()`/`emitError()`
  - Backlog CRUD 유틸 (`src/core/backlog.ts`)
  - 4개 slash command 1줄 wrapper 전환
- **Genome**: v1 → v2 (constraints: run subcommand, source-map: 새 파일, conventions: Script Orchestrator 패턴)

## Deferred
- Phase 3: Hook 실행 엔진 + commit 로직 통합
- Phase 4: Merge command script 전환
- 나머지 23개 command wrapper 전환
