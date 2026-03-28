import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { readTextFile } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyTransition, setTransitionNonces, prepareStageEntry, performTransition } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("planning", "No active generation.");
  if (state!.stage !== "planning") emitError("planning", `Current stage is '${state!.stage}', not 'planning'.`);

  const s = state!;

  if (!phase || phase === "work") {
    verifyTransition("planning", s, "planning:entry");
    await copyArtifactTemplate("planning", paths.artifact);

    const learningContent = await readTextFile(paths.artifact("01-learning.md"));

    setTransitionNonces(s, "planning:entry");
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
        "   - 각 task에 대한 테스트 방법 명시 (unit test, e2e test, 또는 수동 검증).",
        "   - 기존 테스트 중 이번 변경에 영향받는 것이 있으면 수정 계획에 포함.",
        "4. **Human Confirmation**: Finalize plan with human before proceeding.",
        "",
        "### Echo Chamber Prevention (must follow)",
        "- AI autonomous additions are only allowed within the direct cause/impact scope of the current goal",
        "- 'Nice to have' items must go to a separate backlog after human review",
        "- Mark any autonomous additions with '[autonomous]'",
        "",
        "### Backlog Rules (must follow)",
        "- backlog 생성 시 반드시 `reap make backlog --type <type> --title <title>` 명령을 사용하라.",
        "- Write 도구로 backlog 파일을 직접 생성하지 마라 (frontmatter 형식 오류 방지).",
        "- 생성된 backlog 파일에 상세 내용을 추가해야 하면, 생성 후 해당 파일을 Edit 도구로 편집하라.",
        "",
        "### Additional Exploration",
        "If you need to explore more code or context during planning, do so freely.",
        "Record any additional findings in 02-planning.md under a '## Additional Findings' section",
        "so the rationale behind decisions is traceable.",
        "",
        "### Artifact: Write .reap/life/02-planning.md incrementally (do NOT write it all at once at the end)",
        "",
        "When done: reap run planning --phase complete",
      ].join("\n"),
      nextCommand: "reap run planning --phase complete",
    });
  }

  if (phase === "complete") {
    verifyTransition("planning", s, "planning:complete");

    prepareStageEntry(s, "implementation:entry");
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
