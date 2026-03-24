import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyNonce, setNonce, verifyArtifact, performMergeTransition } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";
import { findCommonAncestor, extractGenomeDiff, gitShow } from "../../../core/lineage.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("detect", "No active generation. Run 'reap run start --type merge' first.");
  if (state!.type !== "merge") emitError("detect", `Generation type is '${state!.type}', not 'merge'.`);
  if (state!.stage !== "detect") emitError("detect", `Current stage is '${state!.stage}', not 'detect'.`);

  const s = state!;

  if (!phase || phase === "work") {
    verifyNonce("detect", s, "detect", "entry");
    await copyArtifactTemplate("detect", paths.artifact, true);

    const [branchA, branchB] = s.parents;

    // Find common ancestor via git merge-base
    const ancestor = findCommonAncestor(paths.root, branchA, branchB);
    s.commonAncestor = ancestor ?? undefined;

    // Extract genome diff using git show
    const diff = extractGenomeDiff(paths.root, branchA, branchB, ancestor);

    // Load genome previews from branches
    const genomeA = gitShow(paths.root, branchA, ".reap/genome/application.md");
    const genomeB = gitShow(paths.root, branchB, ".reap/genome/application.md");

    setNonce(s, "detect", "complete");
    await gm.save(s);

    emitOutput({
      status: "prompt",
      command: "detect",
      phase: "work",
      completed: ["gate", "ancestor-search", "genome-diff"],
      context: {
        id: s.id,
        branchA,
        branchB,
        commonAncestor: ancestor,
        genomeDiff: {
          conflicts: diff.conflicts.map((c) => ({ file: c.file })),
          aOnly: diff.aOnly,
          bOnly: diff.bOnly,
        },
        genomeAPreview: genomeA?.slice(0, 1500),
        genomeBPreview: genomeB?.slice(0, 1500),
      },
      prompt: [
        "## Detect Stage — Merge Lineage Analysis",
        "",
        `Branch A: ${branchA}`,
        `Branch B: ${branchB}`,
        `Common Ancestor: ${ancestor ?? "none found"}`,
        "",
        "### Genome Diff Summary",
        diff.conflicts.length > 0
          ? `**Conflicts (${diff.conflicts.length}):** ${diff.conflicts.map((c) => c.file).join(", ")}`
          : "No genome conflicts detected.",
        diff.aOnly.length > 0 ? `**A-only changes:** ${diff.aOnly.join(", ")}` : "",
        diff.bOnly.length > 0 ? `**B-only changes:** ${diff.bOnly.join(", ")}` : "",
        "",
        "### Instructions",
        "1. Review the genome diff above",
        "2. Analyze the scope of genome divergence between branches",
        "3. Identify potential merge conflicts and resolution strategies",
        "4. Write 01-detect.md with: branch info, common ancestor, genome changes summary, conflict list",
        "",
        "When done: reap run detect --phase complete",
      ].filter(Boolean).join("\n"),
      nextCommand: "reap run detect --phase complete",
    });
  }

  if (phase === "complete") {
    verifyNonce("detect", s, "detect", "complete");
    await verifyArtifact("detect", paths.artifact, "detect", true);

    setNonce(s, "mate", "entry");
    await gm.save(s);

    const next = await performMergeTransition(s, gm, paths);

    emitOutput({
      status: "ok",
      command: "detect",
      phase: "complete",
      completed: ["gate", "artifact-verify", "auto-transition"],
      context: { id: s.id, nextStage: next },
      message: `Detect complete. Advanced to ${next}. Run: reap run ${next}`,
      nextCommand: `reap run ${next}`,
    });
  }
}
