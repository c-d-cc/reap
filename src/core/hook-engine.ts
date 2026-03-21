import { readdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import YAML from "yaml";
import { readTextFile, fileExists } from "./fs";
import type { HookResult, ReapHookEvent } from "../types";

interface HookMeta {
  filename: string;
  name: string;
  event: string;
  ext: "sh" | "md";
  condition: string;
  order: number;
}

export async function executeHooks(
  hooksDir: string,
  event: ReapHookEvent | string,
  projectRoot: string,
): Promise<HookResult[]> {
  const hooks = await scanHooks(hooksDir, event);
  if (hooks.length === 0) return [];

  const conditionsDir = join(hooksDir, "conditions");
  const results: HookResult[] = [];

  for (const hook of hooks) {
    const conditionMet = await evaluateCondition(conditionsDir, hook.condition, projectRoot);
    if (!conditionMet.met) {
      results.push({
        name: hook.name,
        event,
        type: hook.ext,
        status: "skipped",
        skipReason: conditionMet.reason,
      });
      continue;
    }

    if (hook.ext === "sh") {
      results.push(await executeShHook(hook, event, projectRoot, hooksDir));
    } else {
      results.push(await executeMdHook(hook, event, hooksDir));
    }
  }

  return results;
}

async function scanHooks(hooksDir: string, event: string): Promise<HookMeta[]> {
  let entries: string[];
  try {
    entries = await readdir(hooksDir);
  } catch {
    return [];
  }

  const pattern = new RegExp(`^${event}\\.(.+)\\.(md|sh)$`);
  const hooks: HookMeta[] = [];

  for (const filename of entries) {
    const match = filename.match(pattern);
    if (!match) continue;

    const meta = await parseHookMeta(join(hooksDir, filename), match[2] as "sh" | "md");
    hooks.push({
      filename,
      name: match[1],
      event,
      ext: match[2] as "sh" | "md",
      condition: meta.condition,
      order: meta.order,
    });
  }

  hooks.sort((a, b) => a.order - b.order || a.filename.localeCompare(b.filename));
  return hooks;
}

async function parseHookMeta(
  filePath: string,
  ext: "sh" | "md",
): Promise<{ condition: string; order: number }> {
  const content = await readTextFile(filePath);
  if (!content) return { condition: "always", order: 50 };

  if (ext === "md") {
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      try {
        const fm = YAML.parse(fmMatch[1]) ?? {};
        return {
          condition: String(fm.condition ?? "always"),
          order: Number(fm.order ?? 50),
        };
      } catch { /* fall through */ }
    }
  } else {
    let condition = "always";
    let order = 50;
    for (const line of content.split("\n").slice(0, 10)) {
      const condMatch = line.match(/^#\s*condition:\s*(.+)/i);
      if (condMatch) condition = condMatch[1].trim();
      const orderMatch = line.match(/^#\s*order:\s*(\d+)/i);
      if (orderMatch) order = parseInt(orderMatch[1], 10);
    }
    return { condition, order };
  }

  return { condition: "always", order: 50 };
}

async function evaluateCondition(
  conditionsDir: string,
  conditionName: string,
  projectRoot: string,
): Promise<{ met: boolean; reason?: string }> {
  if (conditionName === "always") return { met: true };

  const scriptPath = join(conditionsDir, `${conditionName}.sh`);
  if (!(await fileExists(scriptPath))) {
    return { met: false, reason: `condition script not found: ${conditionName}.sh` };
  }

  try {
    execSync(`bash "${scriptPath}"`, { cwd: projectRoot, timeout: 10_000, stdio: "pipe" });
    return { met: true };
  } catch {
    return { met: false, reason: `condition '${conditionName}' returned non-zero` };
  }
}

async function executeShHook(
  hook: HookMeta,
  event: string,
  projectRoot: string,
  hooksDir: string,
): Promise<HookResult> {
  try {
    const stdout = execSync(`bash "${join(hooksDir, hook.filename)}"`, {
      cwd: projectRoot,
      timeout: 60_000,
      stdio: "pipe",
    }).toString();

    return {
      name: hook.name,
      event,
      type: "sh",
      status: "executed",
      exitCode: 0,
      stdout: stdout.trim(),
    };
  } catch (err: any) {
    return {
      name: hook.name,
      event,
      type: "sh",
      status: "executed",
      exitCode: err.status ?? 1,
      stdout: err.stdout?.toString().trim() ?? "",
      stderr: err.stderr?.toString().trim() ?? "",
    };
  }
}

async function executeMdHook(
  hook: HookMeta,
  event: string,
  hooksDir: string,
): Promise<HookResult> {
  const content = await readTextFile(join(hooksDir, hook.filename));
  // Strip frontmatter
  const body = content?.replace(/^---\n[\s\S]*?\n---\n?/, "").trim() ?? "";

  return {
    name: hook.name,
    event,
    type: "md",
    status: "executed",
    content: body,
  };
}
