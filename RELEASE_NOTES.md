## Improvements

- Removed `version` field from config.yml — no more uncommitted changes after `reap update`
- Migrations now use check()-based idempotent execution instead of version comparison

## Generations

- **gen-167-b369f4**: config.yml version 필드 제거 및 migration 로직 변경
