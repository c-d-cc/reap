## What's New

- **Stage Chain Token** — cryptographic nonce-based stage ordering enforcement
  - Each stage command generates a nonce and stores its hash in `current.yml`
  - `/reap.next` requires the nonce as argument to advance — prevents skipping stages
  - Nonce passed via `$ARGUMENTS` in slash commands (Claude Code + OpenCode compatible)
  - AI cannot forge tokens — only the actual stage command produces valid nonces

## Generations

- **gen-107-4556fe**: Stage Chain Token implementation
- **gen-108-000e84**: Stage Chain Token E2E tests (7 test cases + sandbox script)

## Internal

- Daemon PoC (gen-105, gen-106) implemented and removed — replaced by simpler token-based approach
