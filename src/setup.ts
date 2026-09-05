import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { t } from "./i18n.ts";

/** 설치 경로는 npm 하나다 — `npm i -g @c-d-cc/reap` 뒤 `reap setup`이 플러그인 쪽을 대신한다 (사람 결정, ms-025). */
export const MARKETPLACE_SOURCE = "c-d-cc/plugins";
export const MARKETPLACE_NAME = "ctod-plugins";
export const PLUGIN = `reap@${MARKETPLACE_NAME}`;

export type RunResult = { status: number | null; stdout: string; stderr: string };
/** 외부 명령 실행. 테스트가 바꿔 끼운다 — 실제 `claude`를 부르는 테스트는 없다. */
export type Runner = (cmd: string, args: string[]) => RunResult;

export const defaultRunner: Runner = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  return { status: r.error ? null : r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
};

export type SetupStep = {
  step: "claude" | "marketplace" | "plugin";
  state: "missing" | "present" | "added" | "installed" | "failed";
  detail?: string;
};
export type SetupResult = { ok: boolean; steps: SetupStep[] };

/**
 * 마켓플레이스 등록 → 플러그인 설치. 둘 다 이미 있으면 아무것도 실행하지 않는다 — 재실행 안전.
 * `claude`가 없으면 거기서 멈춘다: 설치는 Claude Code의 일이고, 대신 해 줄 수 있는 것이 없다.
 */
export function setup(runner: Runner = defaultRunner): SetupResult {
  const steps: SetupStep[] = [];
  const version = runner("claude", ["--version"]);
  if (version.status === null) {
    steps.push({ step: "claude", state: "missing" });
    return { ok: false, steps };
  }
  steps.push({ step: "claude", state: "present", detail: version.stdout.trim() });

  const markets = runner("claude", ["plugin", "marketplace", "list"]);
  if (markets.stdout.includes(MARKETPLACE_NAME)) {
    steps.push({ step: "marketplace", state: "present" });
  } else {
    const add = runner("claude", ["plugin", "marketplace", "add", MARKETPLACE_SOURCE]);
    if (add.status === 0) steps.push({ step: "marketplace", state: "added" });
    else {
      steps.push({ step: "marketplace", state: "failed", detail: (add.stderr || add.stdout).trim() });
      return { ok: false, steps };
    }
  }

  const plugins = runner("claude", ["plugin", "list"]);
  const installed = /reap@[\w.-]+/.exec(plugins.stdout)?.[0];
  if (installed) {
    steps.push({ step: "plugin", state: "present", detail: installed });
  } else {
    const install = runner("claude", ["plugin", "install", PLUGIN, "-y"]);
    if (install.status === 0) steps.push({ step: "plugin", state: "installed" });
    else {
      steps.push({ step: "plugin", state: "failed", detail: (install.stderr || install.stdout).trim() });
      return { ok: false, steps };
    }
  }
  return { ok: true, steps };
}

export function formatSetup(root: string | null, result: SetupResult): string {
  const lines: string[] = [];
  for (const s of result.steps) {
    if (s.step === "claude" && s.state === "missing") lines.push(t(root, "setup.claude_missing"));
    if (s.step === "marketplace" && s.state === "present") lines.push(t(root, "setup.marketplace_present"));
    if (s.step === "marketplace" && s.state === "added") lines.push(t(root, "setup.marketplace_added"));
    if (s.step === "marketplace" && s.state === "failed") lines.push(t(root, "setup.marketplace_failed", { detail: s.detail ?? "" }));
    if (s.step === "plugin" && s.state === "present") lines.push(t(root, "setup.plugin_present", { name: s.detail ?? PLUGIN }));
    if (s.step === "plugin" && s.state === "installed") lines.push(t(root, "setup.plugin_installed"));
    if (s.step === "plugin" && s.state === "failed") lines.push(t(root, "setup.plugin_failed", { detail: s.detail ?? "" }));
  }
  if (result.ok) lines.push(t(root, "setup.done"));
  return lines.join("\n");
}

/**
 * 플러그인이 깔려 있는가 — `~/.claude/settings.json`의 `enabledPlugins`에 `reap@…`가 있는지만 본다.
 * 서브프로세스 없이 답할 수 있는 유일한 흔적이라 `doctor`·`init`이 여기에 기댄다. 파일이 없거나 깨졌으면 "모른다"(null).
 * 홈은 `$HOME` 우선 — bun의 `os.homedir()`는 HOME을 무시해서(실측) 테스트가 격리할 길이 없다.
 */
export function pluginInstalled(home: string = process.env.HOME || homedir()): boolean | null {
  const path = join(home, ".claude", "settings.json");
  if (!existsSync(path)) return null;
  try {
    const settings = JSON.parse(readFileSync(path, "utf8")) as { enabledPlugins?: unknown };
    const enabled = settings.enabledPlugins;
    const names = Array.isArray(enabled) ? enabled.map(String) : enabled && typeof enabled === "object" ? Object.keys(enabled) : [];
    return names.some((n) => n.startsWith("reap@"));
  } catch {
    return null;
  }
}

/** v0.17에만 있던 명령. 0.18이 이름을 알아보고 다음 길을 말한다 — v0.17 훅이 부르는 둘의 stdout은 세션 문맥으로 들어간다. */
export const LEGACY_COMMANDS = [
  "check-version", "load-context", "update", "run", "status", "install-skills",
  "clean", "config", "cruise", "destroy", "dump-state", "fix", "migrate", "uninstall",
] as const;
export function isLegacyCommand(command: string): boolean {
  return (LEGACY_COMMANDS as readonly string[]).includes(command);
}
