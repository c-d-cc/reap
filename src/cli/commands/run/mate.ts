import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyNonce, setNonce, verifyArtifact, performMergeTransition } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";
import { gitShow } from "../../../core/lineage.js";
import { readTextFile } from "../../../core/fs.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("mate", "No active generation.");
  if (state!.type !== "merge") emitError("mate", `Generation type is '${state!.type}', not 'merge'.`);
  if (state!.stage !== "mate") emitError("mate", `Current stage is '${state!.stage}', not 'mate'.`);

  const s = state!;

  if (!phase || phase === "work") {
    verifyNonce("mate", s, "mate", "entry");
    await copyArtifactTemplate("mate", paths.artifact, true);

    // Read detect artifact for conflict info
    const detectArtifact = await readTextFile(paths.artifact("01-detect.md"));

    // Load genome files from both branches via git show
    const [branchA, branchB] = s.parents;
    const genomeFiles = ["application.md", "evolution.md", "invariants.md"];
    const genomes: Record<string, { a: string | null; b: string | null }> = {};
    for (const file of genomeFiles) {
      genomes[file] = {
        a: gitShow(paths.root, branchA, `.reap/genome/${file}`),
        b: gitShow(paths.root, branchB, `.reap/genome/${file}`),
      };
    }

    // Load vision/goals.md from both branches
    const visionA = gitShow(paths.root, branchA, ".reap/vision/goals.md");
    const visionB = gitShow(paths.root, branchB, ".reap/vision/goals.md");

    setNonce(s, "mate", "complete");
    await gm.save(s);

    emitOutput({
      status: "prompt",
      command: "mate",
      phase: "work",
      completed: ["gate", "context-load"],
      context: {
        id: s.id,
        branchA,
        branchB,
        commonAncestor: s.commonAncestor,
        detectArtifactPreview: detectArtifact?.slice(0, 2000),
        genomes: Object.fromEntries(
          Object.entries(genomes).map(([file, { a, b }]) => [
            file,
            { a: a?.slice(0, 1500), b: b?.slice(0, 1500) },
          ]),
        ),
        visionA: visionA?.slice(0, 1000),
        visionB: visionB?.slice(0, 1000),
      },
      prompt: [
        "## Mate Stage — Genome & Vision Merge",
        "",
        `Merging: ${branchA} + ${branchB}`,
        s.commonAncestor ? `Common Ancestor: ${s.commonAncestor}` : "",
        "",
        "### Instructions",
        "1. Review 01-detect.md for conflict summary",
        "2. For each genome file (application.md, evolution.md, invariants.md):",
        "   - Compare both branches' versions",
        "   - Resolve WRITE-WRITE conflicts (both changed same section)",
        "   - Resolve CROSS-FILE conflicts (changes in one file affect another)",
        "   - invariants.md: human-only edits, conflicts should be rare",
        "3. Merge vision/goals.md:",
        "   - Take union of checked items",
        "   - For same goal with different approaches, flag for human judgment",
        "4. Write the merged genome files to .reap/genome/",
        "5. Write 02-mate.md with: conflict-by-conflict resolution record, confirmed genome summary",
        "",
        "**Human judgment required for:**",
        "- Architecture/convention conflicts in application.md",
        "- AI behavior rule conflicts in evolution.md",
        "- Any invariants.md changes",
        "",
        "When done: reap run mate --phase complete",
      ].filter(Boolean).join("\n"),
      nextCommand: "reap run mate --phase complete",
    });
  }

  if (phase === "complete") {
    verifyNonce("mate", s, "mate", "complete");
    await verifyArtifact("mate", paths.artifact, "mate", true);

    setNonce(s, "merge", "entry");
    await gm.save(s);

    const next = await performMergeTransition(s, gm, paths);

    emitOutput({
      status: "ok",
      command: "mate",
      phase: "complete",
      completed: ["gate", "artifact-verify", "auto-transition"],
      context: { id: s.id, nextStage: next },
      message: `Mate complete. Advanced to ${next}. Run: reap run ${next}`,
      nextCommand: `reap run ${next}`,
    });
  }
}
