## What's New

- **Multi-Agent Support** — AgentAdapter abstraction layer enables support for multiple AI coding agents. Claude Code and OpenCode are now both supported out of the box.
- **OpenCode Integration** — Slash commands, session-start plugin, TUI configuration, and language injection for OpenCode.
- **`/reap.update` Command** — Check for REAP updates and upgrade directly from within your AI agent session.
- **Auto-Update** — Set `autoUpdate: true` in `.reap/config.yml` to automatically update REAP on every session start.
- **Project-Level Language** — `language` field in `config.yml` ensures consistent language across all agents.
- **Enhanced `/reap.help`** — REAP introduction, rich topic system with 24+ topics, anti-hallucination guards, and faster response.
- **Release Notes Automation** — `onGenerationComplete` hook auto-generates `RELEASE_NOTES.md` when a version bump is detected.
- **Init Progress** — `reap init` now shows step-by-step progress and a Getting Started guide upon completion.
- **OpenCode Auto-Update Fix** — Resolved PATH issue in OpenCode plugin for reliable auto-updates.
- **10x Faster Session Start** — Replaced bash string escaping with Node.js `JSON.stringify` in session-start hook (12s → ~1s).

## Generations

- **gen-025**: 멀티 CLI 에이전트 추상화 레이어 구축 + OpenCode 지원 추가
- **gen-026**: CLI UX 개선 (init progress) + help 성능 최적화 + OpenCode autoUpdate PATH
