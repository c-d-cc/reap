import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { readTextFile } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyNonce, setNonce, performTransition } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("planning", "No active generation.");
  if (state!.stage !== "planning") emitError("planning", `Current stage is '${state!.stage}', not 'planning'.`);

  const s = state!;

  if (!phase || phase === "work") {
    verifyNonce("planning", s, "planning", "entry");
    await copyArtifactTemplate("planning", paths.artifact);

    const learningContent = await readTextFile(paths.artifact("01-learning.md"));

    setNonce(s, "planning", "complete");
    await gm.save(s);

    emitOutput({
      status: "prompt",
      command: "planning",
      phase: "work",
      completed: ["gate", "context-collect"],
      context: {
        id: s.id,
        goal: s.goal,
        type: s.type,
        learningContent: learningContent?.slice(0, 5000),
      },
      prompt: [
        "## Planning Stage",
        "",
        "HARD-GATE: Do NOT write any code until 02-planning.md is confirmed by the human.",
        "If the goal is ambiguous, STOP and ask the human.",
        "",
        "### Clarity-driven Interaction:",
        "- Check the clarity level assessed in 01-learning.md.",
        "- **High clarity**: Proceed directly to spec and task decomposition with minimal questions.",
        "- **Medium clarity**: Present 2-3 approach options with tradeoffs. Ask targeted questions to resolve ambiguity.",
        "- **Low clarity**: Increase interaction significantly. Ask clarifying questions before committing to any plan. Provide examples of possible directions.",
        "",
        "### Steps:",
        "1. **Goal + Spec Definition**:",
        "   - Assess complexity: simple tasks skip brainstorming, complex tasks enter it.",
        "   - Brainstorming: (a) Clarifying questions ONE AT A TIME, (b) 2-3 approach exploration with comparison table, (c) Scope decomposition check.",
        "2. **Requirements**: Max 10 FR, max 7 completion criteria. Each must be verifiable.",
        "3. **Implementation Plan**:",
        "   - Task decomposition: checklist `- [ ] T001 description`, max 20 tasks.",
        "   - Each task = one logical unit. Specify target file/module.",
        "   - Dependencies and order.",
        "4. **Human Confirmation**: Finalize plan with human before proceeding.",
        "",
        "### Echo Chamber Prevention (must follow)",
        "- AI autonomous additions are only allowed within the direct cause/impact scope of the current goal",
        "- 'Nice to have' items must go to a separate backlog after human review",
        "- Mark any autonomous additions with '[autonomous]'",
        "",
        "### Artifact: Write .reap/life/02-planning.md incrementally (do NOT write it all at once at the end)",
        "",
        "When done: reap run planning --phase complete",
      ].join("\n"),
      nextCommand: "reap run planning --phase complete",
    });
  }

  if (phase === "complete") {
    verifyNonce("planning", s, "planning", "complete");

    setNonce(s, "implementation", "entry");
    await gm.save(s);

    const next = await performTransition(s, gm, paths);

    emitOutput({
      status: "ok",
      command: "planning",
      phase: "complete",
      completed: ["gate", "context-collect", "planning-work", "auto-transition"],
      context: { id: s.id, nextStage: next },
      message: `Planning complete. Auto-advanced to ${next}. Run: reap run ${next}`,
      nextCommand: `reap run ${next}`,
    });
  }
}
