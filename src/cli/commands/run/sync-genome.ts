import { readdir } from "fs/promises";
import { join } from "path";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { ConfigManager } from "../../../core/config";
import { readTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  const hasActiveGen = !!(state && state.id);

  if (!phase || phase === "analyze") {
    // Phase 1: Gate + genome/source context 수집 → AI에게 sync 작업 지시

    // Read current genome files
    const principlesContent = await readTextFile(paths.principles);
    const conventionsContent = await readTextFile(paths.conventions);
    const constraintsContent = await readTextFile(paths.constraints);
    const sourceMapContent = await readTextFile(paths.sourceMap);

    // Read domain files
    const domainFiles: Record<string, string> = {};
    try {
      const entries = await readdir(paths.domain);
      for (const entry of entries) {
        if (entry.endsWith(".md")) {
          const content = await readTextFile(join(paths.domain, entry));
          if (content) domainFiles[entry] = content.slice(0, 1000);
        }
      }
    } catch { /* no domain dir */ }

    // Get genomeVersion from lineage
    let genomeVersion = 0;
    try {
      const lineageEntries = await readdir(paths.lineage);
      genomeVersion = lineageEntries.filter(e => e.startsWith("gen-")).length;
    } catch { /* no lineage */ }

    emitOutput({
      status: "prompt",
      command: "sync-genome",
      phase: "analyze",
      completed: ["gate", "context-collect"],
      context: {
        hasActiveGeneration: hasActiveGen,
        generationId: state?.id,
        stage: state?.stage,
        genomeVersion,
        genomePath: paths.genome,
        domainPath: paths.domain,
        backlogPath: paths.backlog,
        genome: {
          principles: principlesContent?.slice(0, 2000),
          conventions: conventionsContent?.slice(0, 2000),
          constraints: constraintsContent?.slice(0, 2000),
          sourceMap: sourceMapContent?.slice(0, 3000),
          domainFiles,
        },
      },
      prompt: [
        "## Sync Genome Instructions",
        "",
        hasActiveGen
          ? "### BACKLOG MODE (active generation exists)"
          : "### SYNC MODE (no active generation)",
        "",
        "### HARD-GATE",
        hasActiveGen
          ? "Active Generation exists. Do NOT modify Genome directly. Record discovered differences as `type: genome-change` items in `.reap/life/backlog/` and inform the human."
          : "No active Generation. Proceed with direct Genome modification after human confirmation.",
        "",
        "### Steps:",
        "1. **Read Current Genome**: Review the genome files provided in context.",
        "2. **Analyze Source Code**:",
        "   - Tech Stack & Dependencies (package.json, tsconfig.json, etc.)",
        "   - Architecture & Structure (directory patterns, entry points)",
        "   - Conventions (linter/formatter configs, test setup)",
        "   - Constraints (build/test/validation commands)",
        "   - Domain Knowledge (business rules, state machines, policy rules)",
        "3. **Diff Analysis**: Compare source with genome — additions, changes, removals, gaps.",
        "4. **Report**: Present structured diff report to the human.",
        hasActiveGen
          ? "5. **Record**: Record each difference as `type: genome-change` backlog item in `.reap/life/backlog/`."
          : "5. **Apply**: For each difference, ask the human 'Apply? (yes/no/modify)'. Apply confirmed changes.",
        "",
        hasActiveGen
          ? "When done, inform: 'Genome differences recorded as backlog items.'"
          : "When done, run: reap run sync-genome --phase complete",
      ].join("\n"),
      nextCommand: hasActiveGen ? undefined : "reap run sync-genome --phase complete",
    });
  }

  if (phase === "complete") {
    // Phase 2: 결과 확인 + lastSyncedGeneration 업데이트
    const genId = state?.id || "manual";
    const config = await ConfigManager.read(paths);
    config.lastSyncedGeneration = genId;
    await ConfigManager.write(paths, config);

    emitOutput({
      status: "ok",
      command: "sync-genome",
      phase: "complete",
      completed: ["gate", "context-collect", "analyze", "apply", "update-sync-state"],
      context: {
        hasActiveGeneration: hasActiveGen,
        lastSyncedGeneration: genId,
      },
      message: hasActiveGen
        ? "Genome differences recorded as backlog items. Apply during Completion."
        : `Genome synchronized. lastSyncedGeneration: ${genId}`,
    });
  }
}
