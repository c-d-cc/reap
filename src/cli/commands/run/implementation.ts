import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { readTextFile } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyNonce, setNonce, performTransition, verifyArtifact } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("implementation", "No active generation.");
  if (state!.stage !== "implementation") emitError("implementation", `Current stage is '${state!.stage}', not 'implementation'.`);

  const s = state!;

  if (!phase || phase === "work") {
    verifyNonce("implementation", s, "implementation", "entry");
    await copyArtifactTemplate("implementation", paths.artifact);

    const planningContent = await readTextFile(paths.artifact("02-planning.md"));

    setNonce(s, "implementation", "complete");
    await gm.save(s);

    emitOutput({
      status: "prompt",
      command: "implementation",
      phase: "work",
      completed: ["gate", "context-collect"],
      context: {
        id: s.id,
        goal: s.goal,
        type: s.type,
        artifactPath: paths.artifact("03-implementation.md"),
        planningContent: planningContent?.slice(0, 5000),
      },
      prompt: [
        "## Implementation Stage",
        "",
        "HARD-GATE:",
        "- Do NOT write code without the task list from 02-planning.md.",
        "- Do NOT modify Genome or Environment directly — use backlog.",
        "",
        "### Steps:",
        "1. **Load Task List**: Read 02-planning.md, identify incomplete `[ ]` tasks.",
        "2. **Sequential Implementation**:",
        "   - Implement tasks in order.",
        "   - After EACH task, update 03-implementation.md (Completed Tasks table).",
        "3. **Genome/Environment Changes**:",
        "   - `reap make backlog --type <type> --title <title> [--body <body>] [--priority <priority>]` 명령으로 생성.",
        "   - Write 도구로 backlog 파일을 직접 생성하지 마라 (frontmatter 형식 오류 방지).",
        "   - 생성된 backlog 파일에 상세 내용을 추가해야 하면, 생성 후 해당 파일을 Edit 도구로 편집하라.",
        "   - Do NOT modify genome/ or environment/ directly.",
        "4. **Out-of-Scope Issues**: Record in backlog as type: task.",
        "",
        "### Escalation — STOP and ask the human:",
        "- Task requirements unclear",
        "- Architectural decision needed but not in plan",
        "- Scope significantly larger than expected",
        "",
        `### Artifact: Write \`.reap/life/03-implementation.md\` continuously (after each task).`,
        "",
        "When done: reap run implementation --phase complete",
      ].join("\n"),
      nextCommand: "reap run implementation --phase complete",
    });
  }

  if (phase === "complete") {
    verifyNonce("implementation", s, "implementation", "complete");
    await verifyArtifact("implementation", paths.artifact, "implementation");

    setNonce(s, "validation", "entry");
    await gm.save(s);

    const next = await performTransition(s, gm, paths);

    emitOutput({
      status: "ok",
      command: "implementation",
      phase: "complete",
      completed: ["gate", "implementation-work", "artifact-verify", "auto-transition"],
      context: { id: s.id, nextStage: next },
      message: `Implementation complete. Auto-advanced to ${next}. Run: reap run ${next}`,
      nextCommand: `reap run ${next}`,
    });
  }
}
