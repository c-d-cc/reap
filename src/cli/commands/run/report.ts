import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { emitOutput } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!phase || phase === "collect") {
    // Phase 1: Gate + 시스템 정보 수집 → AI에게 issue report 작성 지시

    emitOutput({
      status: "prompt",
      command: "report",
      phase: "collect",
      completed: ["gate"],
      context: {
        hasActiveGeneration: !!(state && state.id),
        generationId: state?.id,
        stage: state?.stage,
        goal: state?.goal,
        projectRoot: paths.projectRoot,
        configPath: paths.config,
      },
      prompt: [
        "## Report — Bug/Issue Report to REAP",
        "",
        "### Gate Checks (execute these first):",
        "1. Check if `gh` CLI is available: `which gh`. If not: inform user to install GitHub CLI. STOP.",
        "2. Check if authenticated: `gh auth status`. If not: inform user to run `gh auth login`. STOP.",
        "",
        "### Mode Detection:",
        "- If error context was provided as arguments: Auto mode (skip to Step 2 with pre-filled context).",
        "- Otherwise: Manual mode. Ask user what to report (bug/feature/feedback).",
        "",
        "### Steps:",
        "1. **Collect Context** (automatically, do NOT ask user):",
        "   - REAP version: `reap --version`",
        "   - Node version: `node --version`",
        "   - OS: `uname -sr`",
        "   - Agent: detect from environment",
        "   - Generation state from context provided",
        "",
        "2. **Draft Issue**: Use the REAP report template (English for public repo).",
        "",
        "3. **PRIVACY GATE**: Do NOT include file contents, source code, env vars, API keys, tokens, passwords, emails, IPs, domains, DB URLs, or proprietary info. ONLY include REAP version, Node version, OS, generation ID, stage name, command name, genome hash, generic error messages.",
        "",
        "4. **Post-format Sanitization**: Mask emails, API keys, URLs with credentials, env var values, user paths, IP addresses, source code blocks.",
        "",
        "5. **User Confirmation**: Show sanitized issue to user. Ask: yes/no/edit.",
        "",
        "6. **Submit**: `gh issue create --repo c-d-cc/reap --title \"{title}\" --label \"{labels}\" --body \"{sanitized body}\"`.",
        "   Labels: bug/enhancement/feedback + auto-reported.",
        "",
        "Show the issue URL to the user when done.",
      ].join("\n"),
    });
  }
}
