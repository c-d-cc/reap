import { join } from "path";
import { mkdir } from "fs/promises";
import { ReapPaths } from "../../core/paths";
import { MergeGenerationManager } from "../../core/merge-generation";
import { writeTextFile, readTextFile } from "../../core/fs";
import type { DivergenceReport } from "../../core/merge";

export async function mergeCommand(targetBranch: string): Promise<void> {
  const cwd = process.cwd();
  const paths = new ReapPaths(cwd);

  if (!(await paths.isReapProject())) {
    throw new Error("Not a REAP project. Run 'reap init' first.");
  }

  // Check no active generation
  const currentContent = await readTextFile(paths.currentYml);
  if (currentContent && currentContent.trim()) {
    throw new Error("A generation is already in progress. Complete it before starting a merge.");
  }

  console.log(`\nStarting merge with branch "${targetBranch}"...\n`);

  const mgr = new MergeGenerationManager(paths);
  const { state, report } = await mgr.createFromBranch(targetBranch, cwd);

  // Generate 01-detect.md artifact
  const detectArtifact = formatDetectArtifact(report, state.id);
  await writeTextFile(join(paths.life, "01-detect.md"), detectArtifact);

  console.log(`✓ Merge generation ${state.id} created (stage: detect)\n`);
  console.log(`  Parents: ${state.parents?.join(", ")}`);
  console.log(`  Common Ancestor: ${state.commonAncestor ?? "none"}`);
  console.log(`  Genome Conflicts: ${report.conflicts.length}`);
  console.log(`  Genome Changes (local): ${report.genomeDiffsA.length}`);
  console.log(`  Genome Changes (remote): ${report.genomeDiffsB.length}`);

  if (report.conflicts.length === 0 && report.genomeDiffsA.length === 0 && report.genomeDiffsB.length === 0) {
    console.log("\n  No genome conflicts detected. Merge may proceed automatically.");
  } else if (report.conflicts.length > 0) {
    console.log("\n  Genome conflicts require resolution. Use your AI agent to run /reap.merge.genome-resolve");
  }

  console.log(`\n  Next: Use your AI agent to proceed through the merge lifecycle.`);
}

function formatDetectArtifact(report: DivergenceReport, genId: string): string {
  let md = `# Detect\n\n`;
  md += `## Parents\n\n`;
  md += `- **Parent A (local)**: ${report.parentA}\n`;
  md += `- **Parent B (remote)**: ${report.parentB}\n\n`;

  md += `## Common Ancestor\n\n`;
  md += report.commonAncestor ? `${report.commonAncestor}\n` : `None found\n`;
  md += `\n`;

  md += `## Genome Changes (Parent A)\n\n`;
  if (report.genomeDiffsA.length === 0) {
    md += `No changes\n`;
  } else {
    for (const d of report.genomeDiffsA) {
      const type = d.added ? "added" : d.removed ? "removed" : "modified";
      md += `- \`${d.file}\` — ${type}\n`;
    }
  }
  md += `\n`;

  md += `## Genome Changes (Parent B)\n\n`;
  if (report.genomeDiffsB.length === 0) {
    md += `No changes\n`;
  } else {
    for (const d of report.genomeDiffsB) {
      const type = d.added ? "added" : d.removed ? "removed" : "modified";
      md += `- \`${d.file}\` — ${type}\n`;
    }
  }
  md += `\n`;

  md += `## Conflicts\n\n`;
  if (report.conflicts.length === 0) {
    md += `No conflicts detected\n`;
  } else {
    md += `| File | Type |\n`;
    md += `|------|------|\n`;
    for (const c of report.conflicts) {
      md += `| \`${c.file}\` | ${c.type} |\n`;
    }
  }
  md += `\n`;

  md += `## Source Changes Summary\n\n`;
  md += `Source changes will be analyzed in the Source Resolve stage after genome resolution.\n`;

  return md;
}
