## What's New

- **Placeholder Genome detection** — `reap init` on existing projects now detects placeholder content and shows "needs customization" instead of falsely reporting "synced". Also displays a `/reap.sync` guidance message after init.
- **Skill-based command discovery** — Commands are now installed as `.claude/skills/{name}/SKILL.md` for Claude Code's current skill discovery mechanism, with legacy `.claude/commands/` cleanup.
- **`refreshKnowledge` command** — New `/reap.refreshKnowledge` command enables subagents to load full REAP context (Genome, Environment, Generation state) on demand.
- **Completion `feedKnowledge` phase** — Renamed from "genome" to better reflect its role handling both Genome and Environment changes. Includes automatic impact detection for Genome/Environment consistency.
- **`.md` hook execution in subagents** — Completion output now includes `.md` hook content in the prompt field, so evolve subagents properly execute hook prompts.
- **Subagent interrupt protection** — Evolve subagent prompt now includes protection against premature task termination from user messages during execution.
- **E2E skill installation tests** — New OpenShell-based E2E tests verify Claude Code `.claude/skills/` and OpenCode plugin installation across all supported agents.
- **Docs consistency gate for version bump** — Version bump now runs docs update as a pre-check, blocking bumps when docs are out of sync.
- **3-Layer Model updated** — reap-guide.md now uses "Knowledge Base (Genome + Environment)" matching README terminology.

## Generations

- **gen-110-59caf6**: Detect placeholder genome files instead of showing 'synced'
- **gen-111-845eb4**: reap init 완료 시 /reap.sync 실행 안내 메시지 출력
- **gen-112-bd3988**: Migrate .claude/commands/ to .claude/skills/ for Claude Code skill discovery
- **gen-113-42d502**: Update environment summary — AI agent env & test count
- **gen-114-ab49ad**: Add refreshKnowledge command for subagent REAP context loading
- **gen-115-dc9f09**: .md hook execution in evolve subagent completion output
- **gen-116-92c7d5**: E2E skill installation tests for Claude Code + OpenCode
- **gen-117-bfdcdb**: E2E skill loading tests verified in OpenShell sandbox
- **gen-118-110fde**: Rename completion phase genome to feedKnowledge
- **gen-119-afd037**: Subagent interrupt protection + orchestrator warning
- **gen-120-488e3e**: Extract docsUpdate skill from hook
- **gen-121-bec8d5**: Add version bump artifact validation
- **gen-122-519e18**: Add docsUpdate gate to versionBump
- **gen-123-98fe85**: Full scan update — 3-layer model, new commands, i18n sync
- **gen-124-ea5e55**: Remove reapdev commands from public docs
- **gen-125-aed658**: Remove reapdev from src and COMMAND_NAMES
