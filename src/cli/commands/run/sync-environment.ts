import { readdir } from "fs/promises";
import { join } from "path";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { readTextFile } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  const hasActiveGen = !!(state && state.id);

  if (!phase || phase === "discover") {
    // Phase 1: environment 경로 + 프로젝트 구조 context → AI에게 environment discovery 지시

    // Read existing environment summary
    const envSummary = await readTextFile(paths.environmentSummary);

    // Read existing docs
    const envDocs: Record<string, string> = {};
    try {
      const docsEntries = await readdir(paths.environmentDocs);
      for (const entry of docsEntries) {
        if (entry.endsWith(".md")) {
          const content = await readTextFile(join(paths.environmentDocs, entry));
          if (content) envDocs[entry] = content.slice(0, 1000);
        }
      }
    } catch { /* no docs dir */ }

    // Read existing resources/links.md
    let linksContent: string | null = null;
    try {
      linksContent = await readTextFile(join(paths.environmentResources, "links.md"));
    } catch { /* no links */ }

    emitOutput({
      status: "prompt",
      command: "sync-environment",
      phase: "discover",
      completed: ["gate", "context-collect"],
      context: {
        hasActiveGeneration: hasActiveGen,
        generationId: state?.id,
        stage: state?.stage,
        environmentPath: paths.environment,
        environmentDocsPath: paths.environmentDocs,
        environmentResourcesPath: paths.environmentResources,
        existingSummary: envSummary?.slice(0, 2000),
        existingDocs: envDocs,
        existingLinks: linksContent?.slice(0, 1000),
        backlogPath: paths.backlog,
      },
      prompt: [
        "## Sync Environment Instructions",
        "",
        hasActiveGen
          ? "### BACKLOG MODE (active generation exists)"
          : "### SYNC MODE (no active generation)",
        "",
        hasActiveGen
          ? "Active Generation exists. Record discovered environment items as `type: environment-change` in `.reap/life/backlog/`."
          : "No active Generation. Modify environment directly after human confirmation.",
        "",
        "### Environment 3-Layer Structure",
        "```",
        ".reap/environment/",
        "  summary.md      — Session context (~100 lines max)",
        "  docs/            — Main reference docs (agent reads these)",
        "  resources/       — Raw materials (user-managed)",
        "    *.pdf, *.md    — Original documents",
        "    links.md       — External URLs + summaries",
        "```",
        "",
        "### Steps:",
        "1. **Source Code Scan**: Detect external dependencies from package.json, config files, API client code, infrastructure configs.",
        "2. **User Interview**: Confirm detected dependencies, ask about additional services, deployment/infra, organization rules, external docs.",
        "3. **Generate docs/**: Create one file per environment topic (~100 lines each).",
        "4. **Generate summary.md**: Aggregate all docs/ into concise summary (~100 lines max).",
        "5. **Verify**: List created/updated files, show summary to user, ask if anything is missing.",
        "",
        hasActiveGen
          ? "When done, inform: 'Environment changes recorded in backlog.'"
          : "When done, run: reap run sync-environment --phase complete",
      ].join("\n"),
      nextCommand: hasActiveGen ? undefined : "reap run sync-environment --phase complete",
    });
  }

  if (phase === "complete") {
    // Phase 2: 결과 확인
    emitOutput({
      status: "ok",
      command: "sync-environment",
      phase: "complete",
      completed: ["gate", "context-collect", "discover", "apply"],
      context: {
        hasActiveGeneration: hasActiveGen,
      },
      message: hasActiveGen
        ? "Environment changes recorded in backlog. Apply during Completion."
        : "Environment synced.",
    });
  }
}
