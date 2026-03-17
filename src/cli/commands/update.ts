import { readdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";

interface UpdateResult {
  updated: string[];
  skipped: string[];
}

export async function updateProject(projectRoot: string, dryRun: boolean = false): Promise<UpdateResult> {
  const paths = new ReapPaths(projectRoot);

  if (!(await paths.isReapProject())) {
    throw new Error("Not a REAP project. Run 'reap init' first.");
  }

  const result: UpdateResult = { updated: [], skipped: [] };
  const templateBase = join(import.meta.dir, "../../templates");

  // 1. Sync slash commands (.reap/commands/ and .claude/commands/)
  const commandsDir = join(templateBase, "commands");
  const commandFiles = await readdir(commandsDir);
  for (const file of commandFiles) {
    if (!file.endsWith(".md")) continue;
    const src = await Bun.file(join(commandsDir, file)).text();

    // .reap/commands/
    const reapDest = join(paths.commands, file);
    const reapExisting = Bun.file(reapDest);
    if (await reapExisting.exists() && await reapExisting.text() === src) {
      result.skipped.push(`.reap/commands/${file}`);
    } else {
      if (!dryRun) await Bun.write(reapDest, src);
      result.updated.push(`.reap/commands/${file}`);
    }

    // .claude/commands/
    const claudeDest = join(paths.claudeCommands, file);
    const claudeExisting = Bun.file(claudeDest);
    if (await claudeExisting.exists() && await claudeExisting.text() === src) {
      result.skipped.push(`.claude/commands/${file}`);
    } else {
      if (!dryRun) await Bun.write(claudeDest, src);
      result.updated.push(`.claude/commands/${file}`);
    }
  }

  // 2. Sync artifact templates (.reap/templates/)
  const artifactsDir = join(templateBase, "artifacts");
  const artifactFiles = await readdir(artifactsDir);
  for (const file of artifactFiles) {
    if (!file.endsWith(".md")) continue;
    const src = await Bun.file(join(artifactsDir, file)).text();
    const dest = join(paths.templates, file);
    const existing = Bun.file(dest);
    if (await existing.exists() && await existing.text() === src) {
      result.skipped.push(`.reap/templates/${file}`);
    } else {
      if (!dryRun) await Bun.write(dest, src);
      result.updated.push(`.reap/templates/${file}`);
    }
  }

  // 3. Sync domain guide (.reap/genome/domain/README.md)
  const domainReadmeSrc = join(templateBase, "genome/domain/README.md");
  const domainReadmeDest = join(paths.domain, "README.md");
  const domainSrc = await Bun.file(domainReadmeSrc).text();
  const domainExisting = Bun.file(domainReadmeDest);
  if (await domainExisting.exists() && await domainExisting.text() === domainSrc) {
    result.skipped.push(`.reap/genome/domain/README.md`);
  } else {
    if (!dryRun) await Bun.write(domainReadmeDest, domainSrc);
    result.updated.push(`.reap/genome/domain/README.md`);
  }

  return result;
}
