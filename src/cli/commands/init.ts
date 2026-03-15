import { mkdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";
import { ConfigManager } from "../../core/config";
import type { ReapConfig } from "../../types";

export async function initProject(
  projectRoot: string,
  projectName: string,
  entryMode: "greenfield" | "migration" | "adoption",
): Promise<void> {
  const paths = new ReapPaths(projectRoot);

  if (await paths.isReapProject()) {
    throw new Error(".reap/ already exists. This is already a REAP project.");
  }

  // Create 4-axis directory structure
  await mkdir(paths.root, { recursive: true });
  await mkdir(join(paths.genome, "architecture"), { recursive: true });
  await mkdir(paths.environment, { recursive: true });
  await mkdir(paths.mutations, { recursive: true });
  await mkdir(paths.backlog, { recursive: true });
  await mkdir(paths.lineage, { recursive: true });

  // Write config
  const config: ReapConfig = {
    version: "0.1.0",
    project: projectName,
    entryMode,
  };
  await ConfigManager.write(paths, config);

  // Write initial genome files
  await Bun.write(
    paths.cheatsheet,
    "# Cheatsheet\n\n프로젝트 고유의 개발 규칙을 여기에 작성합니다.\nAI가 작업 시 수시로 참조합니다.\n\n## Rules\n\n- (여기에 규칙 추가)\n"
  );
}
