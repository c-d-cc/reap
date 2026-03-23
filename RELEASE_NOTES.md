## What's New

- `reap make backlog` — CLI command for creating properly-formatted backlog files
- Release notice on `reap update` — fetches from GitHub Discussions via UPDATE_NOTICE.md
- versionBump workflow now includes notice publishing step
- Subagent prompt now instructs reading backlog files directly

## Bug Fixes

- Lineage archiving now copies only consumed backlog items
- `reap back` generates proper entry nonce via `setNonce()` to maintain signature chain
- Codex CLI command path corrected: `commands/` → `prompts/`

## Improvements

- Compression protection count: 3 → 20 (preserves ~20 original generations)
- Artifact gate text shows explicit `reap run <stage> --phase <phase>` format
- Notice fetch uses direct URL (no `gh` CLI dependency)
- Removed legacy `mutations` backward-compat code
- Added `notes/` directory for design docs

## Generations

- **gen-156-b0102e**: Lineage backlog copy bug fix
- **gen-157-39e691**: back nonce reset bug fix
- **gen-158-6d5755**: Codex CLI commands path fix
- **gen-159-59e74a**: Compression protection count expansion
- **gen-160-74aee5**: Artifact gate text improvement
- **gen-161-b18c79**: back.ts setNonce chain maintenance
- **gen-162-616395**: reap make backlog command
- **gen-163-cf5086**: Recovery — make as top-level CLI command
- **gen-164-649f49**: GitHub Discussions notice fetch
- **gen-165-a260f3**: versionBump notice + backlog creation workflow
