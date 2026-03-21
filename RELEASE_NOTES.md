## What's New

- **Stage Chain Token** — cryptographic nonce-based stage ordering enforcement
  - Each stage command generates a nonce and stores its hash in `current.yml`
  - `/reap.next` requires the nonce as argument to advance — prevents skipping stages
  - Nonce passed via `$ARGUMENTS` in slash commands (Claude Code + OpenCode compatible)
  - AI cannot forge tokens — only the actual stage command produces valid nonces
- **env var → argv migration** — all `REAP_*` env vars replaced with CLI arguments
  - `/reap.start my goal here` instead of `REAP_START_GOAL="my goal" reap run start`
  - `/reap.back planning --reason "missing edge case"` instead of env vars
  - `/reap.abort --reason "deprioritized" --save-backlog` with named flags
  - All slash commands use `$ARGUMENTS` for natural parameter passing
- **`/reap.help <topic>`** — topic passed as argument instead of env var

## Generations

- **gen-107-4556fe**: Stage Chain Token implementation
- **gen-108-000e84**: Stage Chain Token E2E tests (7 test cases + sandbox script)
- **gen-109-993f83**: env var → argv migration (6 commands + 6 templates + 9 test files)

## Internal

- Daemon PoC (gen-105, gen-106) implemented and removed — replaced by simpler token-based approach
- `REAP_HELP_TOPIC` env var removed — help uses argv
