import { ReapPaths } from "../../core/paths";
import { ConfigManager } from "../../core/config";
import { GenerationManager } from "../../core/generation";
import { scanBacklog, markBacklogConsumed, type BacklogFile } from "../../core/backlog";
import { emitOutput, emitError } from "../../core/run-output";

const COMMAND = "update-genome";

export async function updateGenome(cwd: string, apply: boolean): Promise<void> {
  const paths = new ReapPaths(cwd);

  if (!(await paths.isReapProject())) {
    emitError(COMMAND, "Not a REAP project (.reap/ not found).");
  }

  // Gate: no active generation allowed
  const gm = new GenerationManager(paths);
  const current = await gm.current();
  if (current !== null) {
    emitError(COMMAND, `Active generation exists (${current.id}). Cannot run update-genome during a generation.`);
  }

  const backlogItems = await scanBacklog(paths.backlog);
  const pending = backlogItems.filter(
    (b) => b.type === "genome-change" && b.status === "pending",
  );

  if (apply) {
    await applyPhase(paths, pending);
  } else {
    await scanPhase(pending);
  }
}

function scanPhase(pending: BacklogFile[]): never {
  if (pending.length === 0) {
    emitOutput({
      status: "ok",
      command: COMMAND,
      phase: "scan",
      completed: ["gate", "scan"],
      message: "No pending genome changes.",
    });
  }

  emitOutput({
    status: "prompt",
    command: COMMAND,
    phase: "scan",
    completed: ["gate", "scan"],
    context: {
      pendingCount: pending.length,
      items: pending.map((b) => ({
        filename: b.filename,
        title: b.title,
        body: b.body,
      })),
    },
    prompt: [
      "Pending genome-change backlog items are listed in context.items.",
      "For each item, apply the described changes to the corresponding .reap/genome/ files.",
      "Only modify files under .reap/genome/. Do NOT modify source code.",
      "After all changes are applied, run: reap update-genome --apply",
    ].join("\n"),
    nextCommand: "reap update-genome --apply",
  });
}

async function applyPhase(paths: ReapPaths, pending: BacklogFile[]): Promise<never> {
  if (pending.length === 0) {
    emitOutput({
      status: "ok",
      command: COMMAND,
      phase: "apply",
      completed: ["gate", "scan", "apply"],
      message: "No pending genome changes to apply.",
    });
  }

  // Mark all pending genome-change backlog as consumed
  for (const item of pending) {
    await markBacklogConsumed(paths.backlog, item.filename, "update-genome");
  }

  // Bump genomeVersion in config.yml
  const config = await ConfigManager.read(paths);
  config.genomeVersion = (config.genomeVersion ?? 0) + 1;
  await ConfigManager.write(paths, config);

  emitOutput({
    status: "ok",
    command: COMMAND,
    phase: "apply",
    completed: ["gate", "scan", "apply", "version-bump"],
    context: {
      consumedCount: pending.length,
      consumedFiles: pending.map((b) => b.filename),
      genomeVersion: config.genomeVersion,
    },
    message: `Applied ${pending.length} genome-change(s). genomeVersion → v${config.genomeVersion}. Please commit the changes.`,
    prompt: [
      `${pending.length} genome-change backlog item(s) consumed. genomeVersion bumped to v${config.genomeVersion}.`,
      "Commit the genome changes with message:",
      `  chore: update-genome v${config.genomeVersion} — ${pending.map((b) => b.title).join(", ")}`,
    ].join("\n"),
  });
}
