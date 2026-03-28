import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { readTextFile } from "../../../core/fs.js";
import { scanBacklog } from "../../../core/backlog.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyTransition, setTransitionNonces, prepareStageEntry, performTransition } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("learning", "No active generation. Run 'reap run start' first.");
  if (state!.stage !== "learning") emitError("learning", `Current stage is '${state!.stage}', not 'learning'.`);

  const s = state!;

  if (!phase || phase === "work") {
    verifyTransition("learning", s, "learning:entry");
    await copyArtifactTemplate("learning", paths.artifact);

    const application = await readTextFile(paths.application);
    const evolution = await readTextFile(paths.evolution);
    const invariants = await readTextFile(paths.invariants);
    const envSummary = await readTextFile(paths.environmentSummary);

    // Read source backlog content if this generation was started from a backlog item
    let sourceBacklogContent: string | null = null;
    if (s.sourceBacklog) {
      sourceBacklogContent = await readTextFile(join(paths.backlog, s.sourceBacklog))
        ?? await readTextFile(join(paths.life, "backlog", s.sourceBacklog));
    }

    // Read pending backlog
    const backlogItems = await scanBacklog(paths.backlog);
    const pendingBacklog = backlogItems.filter((b) => b.status === "pending");

    // Read previous generation's completion + fitness
    let prevCompletion: string | null = null;
    let prevFitness: string | null = null;
    try {
      const lineageEntries = await readdir(paths.lineage);
      const genDirs = lineageEntries.filter((e) => e.startsWith("gen-")).sort();
      if (genDirs.length > 0) {
        const lastGen = genDirs[genDirs.length - 1];
        prevCompletion = await readTextFile(join(paths.lineage, lastGen, "05-completion.md"));
        const metaContent = await readTextFile(join(paths.lineage, lastGen, "meta.yml"));
        if (metaContent) {
          const fitnessMatch = metaContent.match(/fitnessFeedback:\n\s+text:\s*([\s\S]*?)(?:\n\s+evaluatedAt:|\n[a-z])/);
          if (fitnessMatch) prevFitness = fitnessMatch[1].trim();
        }
      }
    } catch { /* no lineage */ }

    setTransitionNonces(s, "learning:entry");
    await gm.save(s);

    emitOutput({
      status: "prompt",
      command: "learning",
      phase: "work",
      completed: ["gate", "context-load"],
      context: {
        id: s.id,
        goal: s.goal,
        type: s.type,
        application: application?.slice(0, 2000),
        evolution: evolution?.slice(0, 2000),
        invariants: invariants?.slice(0, 1000),
        environmentSummary: envSummary?.slice(0, 2000),
        previousCompletion: prevCompletion?.slice(0, 2000),
        previousFitness: prevFitness,
        artifactPath: paths.artifact("01-learning.md"),
        sourceBacklog: s.sourceBacklog ? { filename: s.sourceBacklog, content: sourceBacklogContent?.slice(0, 2000) } : null,
        pendingBacklog: pendingBacklog.map((b) => ({ type: b.type, title: b.title, filename: b.filename })),
      },
      prompt: [
        "## Learning Stage — Explore and Build Context",
        "",
        "Explore the project and build context before working on this generation's goal.",
        "",
        "### Steps:",
        "1. **Genome Review**: Read application.md (project principles/architecture/conventions), evolution.md (AI behavior guide), invariants.md (absolute constraints) to understand behavioral rules",
        "2. **Environment Review**: Read environment/summary.md to understand project structure and tech stack",
        "3. **Previous Generation Reference**: Review the latest generation's completion artifact and fitness feedback",
        "4. **Backlog Review**: Check pending backlog items and assess relevance to this generation",
        "5. **Codebase Exploration**: Read code related to this generation's goal and understand current state",
        "6. **Clarity Assessment**: Assess project clarity level (high/medium/low) based on:",
        "   - Does vision/goals.md have specific, actionable goals?",
        "   - Are backlog items clear and well-defined?",
        "   - Is this an embryo generation (lower clarity expected)?",
        "   - How much lineage exists? (short lineage = less context)",
        "   - Record clarity level in 01-learning.md Context section",
        "7. **Write 01-learning.md**: Organize learning results (Project Overview, Key Findings, Backlog, Context, Clarity Level)",
        "",
        `### Artifact: Write \`.reap/life/01-learning.md\` progressively (do NOT wait until end).`,
        "",
        s.sourceBacklog
          ? `### Source Backlog (this generation's basis):\nThis generation was started from backlog item \`${s.sourceBacklog}\`. Read it and include its content as the basis/rationale in 01-learning.md under a "## Source Backlog" section.\n`
          : "",
        pendingBacklog.length > 0
          ? `### Pending Backlog (${pendingBacklog.length} items):\n${pendingBacklog.map((b) => `- [${b.type}] ${b.title} (\`${b.filename}\`)`).join("\n")}\n`
          : "",
        prevFitness ? `### Previous Generation Feedback:\n> ${prevFitness}\n` : "",
        "When done: reap run learning --phase complete",
      ].filter(Boolean).join("\n"),
      nextCommand: "reap run learning --phase complete",
    });
  }

  if (phase === "complete") {
    verifyTransition("learning", s, "learning:complete");

    prepareStageEntry(s, "planning:entry");
    await gm.save(s);

    const next = await performTransition(s, gm, paths);

    emitOutput({
      status: "ok",
      command: "learning",
      phase: "complete",
      completed: ["gate", "context-load", "learning-work", "auto-transition"],
      context: { id: s.id, nextStage: next },
      message: `Learning complete. Auto-advanced to ${next}. Run: reap run ${next}`,
      nextCommand: `reap run ${next}`,
    });
  }
}
