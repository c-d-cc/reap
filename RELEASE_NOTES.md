## What's New

- `/reap.config` command — display current project configuration without AI interpretation
- Auto-report on uncaught errors — `autoIssueReport` setting triggers automatic GitHub issue creation
- Config backfill — `reap update` fills missing config fields with defaults
- AI migration agent — `detectMigrationGaps()` checks structural gaps during `reap update`
- REAP MANAGED header on `current.yml` and artifacts, stripped during archiving
- Help command i18n — descriptions in en/ko/ja/zh-CN, unsupported languages delegated to AI translation
- Help topic mode includes `reap-guide.md` as context for accurate REAP knowledge
- CLAUDE.md integration — REAP rules section auto-managed by `reap init`/`reap update`
- Version display in help/status output with latest version check
- `reap.report` decoupled from `autoIssueReport` — manual reports always available
- Execution flow clarified — `/reap.next` documented as transition command, not lifecycle stage
- Language alias support — `korean`→`ko`, `english`→`en`, `japanese`→`ja`, `chinese`→`zh-CN`

## Generations

- **gen-100-54bde0**: auto-report on error + /reap.config command
- **gen-101-c88beb**: AI migration agent + REAP MANAGED header strip on archiving
- **gen-102-95708b**: CLAUDE.md REAP rules + README/docs v0.11.x update
- **gen-103-15e966**: help command description i18n (en/ko/ja/zh-CN)
- **gen-104-e65f10**: help topic mode includes reap-guide.md context
