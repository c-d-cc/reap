## What's New

- **Multi-Agent Support** — AgentAdapter abstraction layer enables support for multiple AI coding agents. Claude Code and OpenCode are now both supported out of the box.
- **OpenCode Integration** — Slash commands, session-start plugin, TUI configuration, and language injection for OpenCode.
- **`/reap.update` Command** — Check for REAP updates and upgrade directly from within your AI agent session.
- **Auto-Update** — Set `autoUpdate: true` in `.reap/config.yml` to automatically update REAP on every session start.
- **Project-Level Language** — `language` field in `config.yml` ensures consistent language across all agents.
- **Enhanced `/reap.help`** — Rich topic system with 24+ topics, anti-hallucination guards, version display, and source-based explanations.
- **Release Notes Automation** — `onGenerationComplete` hook auto-generates `RELEASE_NOTES.md` when a version bump is detected.

## Generations

- **gen-025**: 멀티 CLI 에이전트 추상화 레이어 구축 + OpenCode 지원 추가
