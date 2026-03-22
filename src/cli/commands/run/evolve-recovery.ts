import { join } from "path";
import { readdir } from "fs/promises";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager, generateToken } from "../../../core/generation";
import { readTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import * as lineageUtils from "../../../core/lineage";

function getFlag(args: string[], name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
}

/** Extract positionals, skipping flag names and their values */
function getPositionals(args: string[], valueFlags: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const flagName = args[i].slice(2);
      if (valueFlags.includes(flagName) && i + 1 < args.length) i++; // skip value
      continue;
    }
    result.push(args[i]);
  }
  return result;
}

/** Load lineage artifacts for a given generation ID */
async function loadLineageArtifacts(
  paths: ReapPaths,
  genId: string,
): Promise<{ objective: string; planning: string; implementation: string; completion: string } | null> {
  // Find lineage directory matching genId
  const completed = await lineageUtils.listCompleted(paths);
  const genDir = completed.find(d => d.startsWith(genId));

  if (genDir) {
    // Uncompressed directory format
    const dirPath = join(paths.lineage, genDir);
    const [objective, planning, implementation, completion] = await Promise.all([
      readTextFile(join(dirPath, "01-objective.md")),
      readTextFile(join(dirPath, "02-planning.md")),
      readTextFile(join(dirPath, "03-implementation.md")),
      readTextFile(join(dirPath, "05-completion.md")),
    ]);
    return {
      objective: objective ?? "(not found)",
      planning: planning ?? "(not found)",
      implementation: implementation ?? "(not found)",
      completion: completion ?? "(not found)",
    };
  }

  // Try compressed format: lineage/{genId}*.md
  try {
    const entries = await readdir(paths.lineage);
    const compressedFile = entries.find(e => e.startsWith(genId) && e.endsWith(".md"));
    if (compressedFile) {
      const content = await readTextFile(join(paths.lineage, compressedFile));
      if (content) {
        return {
          objective: content,
          planning: "(compressed - see above)",
          implementation: "(compressed - see above)",
          completion: "(compressed - see above)",
        };
      }
    }
  } catch { /* no lineage dir */ }

  return null;
}

export async function execute(paths: ReapPaths, phase?: string, argv: string[] = []): Promise<void> {
  const positionals = getPositionals(argv, ["reason"]);
  const targetGenIds = positionals;
  const reason = getFlag(argv, "reason");
  const gm = new GenerationManager(paths);

  if (!phase || phase === "review") {
    // Phase 1: Review target generations' lineage artifacts
    if (targetGenIds.length === 0) {
      emitError("evolve-recovery", "Target generation ID(s) required. Usage: reap run evolve-recovery <gen-id> [<gen-id>...] [--reason \"...\"]");
    }

    // Gate: no active generation
    const state = await gm.current();
    if (state && state.id) {
      emitError("evolve-recovery", `Generation ${state.id} is in progress (stage: ${state.stage}). Complete it before starting a recovery.`);
    }

    // Load artifacts for each target generation
    const artifactsByGen: Record<string, { objective: string; planning: string; implementation: string; completion: string }> = {};
    const notFound: string[] = [];

    for (const genId of targetGenIds) {
      const artifacts = await loadLineageArtifacts(paths, genId);
      if (artifacts) {
        artifactsByGen[genId] = artifacts;
      } else {
        notFound.push(genId);
      }
    }

    if (notFound.length > 0) {
      emitError("evolve-recovery", `Generation(s) not found in lineage: ${notFound.join(", ")}`);
    }

    // Build review prompt for AI
    const artifactSections: string[] = [];
    for (const [genId, artifacts] of Object.entries(artifactsByGen)) {
      artifactSections.push(
        `### Generation: ${genId}`,
        "",
        "#### 01-objective.md",
        artifacts.objective.slice(0, 2000),
        "",
        "#### 02-planning.md",
        artifacts.planning.slice(0, 2000),
        "",
        "#### 03-implementation.md",
        artifacts.implementation.slice(0, 2000),
        "",
        "#### 05-completion.md",
        artifacts.completion.slice(0, 2000),
        "",
      );
    }

    emitOutput({
      status: "prompt",
      command: "evolve-recovery",
      phase: "review",
      completed: ["gate", "artifact-load"],
      context: {
        targetGenIds,
        reason: reason ?? null,
        artifactsByGen,
      },
      prompt: [
        "## Recovery Review",
        "",
        "Review the following generation artifacts and determine if a recovery generation is needed.",
        "",
        "### Review Criteria",
        "(a) **Artifact Inconsistency**: Are there contradictions or misalignments between objective, planning, implementation, and completion artifacts?",
        "(b) **Structural Defects**: Are there architectural issues, missing edge cases, or technical debt introduced?",
        "(c) **Human-Specified Corrections**: " + (reason ? `The human specified: "${reason}"` : "No specific corrections requested."),
        "",
        "### Target Generation Artifacts",
        "",
        ...artifactSections,
        "",
        "### Decision",
        "If recovery is needed, run: `reap run evolve-recovery --phase create " + targetGenIds.join(" ") + (reason ? ` --reason "${reason}"` : "") + "`",
        "If no recovery is needed, report: \"No recovery needed\" with your reasoning.",
      ].join("\n"),
    });
  }

  if (phase === "create") {
    // Phase 2: Create recovery generation
    if (targetGenIds.length === 0) {
      emitError("evolve-recovery", "Target generation ID(s) required for create phase.");
    }

    // Double-check gate
    const existing = await gm.current();
    if (existing && existing.id) {
      emitError("evolve-recovery", `Generation ${existing.id} is already in progress.`);
    }

    // Count lineage for genomeVersion
    let genomeVersion = 1;
    try {
      const lineageEntries = await readdir(paths.lineage);
      genomeVersion = lineageEntries.filter(e => e.startsWith("gen-")).length + 1;
    } catch { /* no lineage yet */ }

    // Build goal
    const goal = reason
      ? `Recovery: ${reason} (corrects ${targetGenIds.join(", ")})`
      : `Recovery for ${targetGenIds.join(", ")}`;

    // Create recovery generation
    const state = await gm.createRecoveryGeneration(goal, genomeVersion, targetGenIds);

    // Generate stage chain token
    const { nonce, hash } = generateToken(state.id, state.stage);
    state.expectedHash = hash;
    await gm.save(state);

    emitOutput({
      status: "prompt",
      command: "evolve-recovery",
      phase: "created",
      completed: ["gate", "create-generation"],
      context: {
        generationId: state.id,
        goal: state.goal,
        type: state.type,
        recovers: state.recovers,
        parents: state.parents,
        genomeHash: state.genomeHash,
      },
      prompt: `Recovery generation ${state.id} created (corrects: ${targetGenIds.join(", ")}). Proceed with /reap.objective or /reap.evolve.`,
      message: `Recovery generation ${state.id} started.`,
    });
  }
}
