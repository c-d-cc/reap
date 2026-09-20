import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { t } from "./i18n.ts";

/** 설치 경로는 npm 하나다 — `npm i -g @c-d-cc/reap` 뒤 `reap setup`이 플러그인 쪽을 대신한다 (사람 결정, ms-025). */
export const MARKETPLACE_SOURCE = "c-d-cc/plugins";
export const MARKETPLACE_NAME = "ctod-plugins";
export const PLUGIN = `reap@${MARKETPLACE_NAME}`;

/** 호스트 둘. 설치 동사만 갈리고 제거는 양쪽 다 `remove`다. */
export type Host = "claude" | "codex";
export const HOSTS: readonly Host[] = ["claude", "codex"];
const INSTALL: Record<Host, string[]> = { claude: ["plugin", "install", PLUGIN, "-y"], codex: ["plugin", "add", PLUGIN] };
const MANUAL: Record<Host, { marketplace: string; plugin: string }> = {
  claude: { marketplace: `claude plugin marketplace add ${MARKETPLACE_SOURCE}`, plugin: `claude plugin install ${PLUGIN} -y` },
  codex: { marketplace: `codex plugin marketplace add ${MARKETPLACE_SOURCE}`, plugin: `codex plugin add ${PLUGIN}` },
};

/** codex는 플러그인 훅을 실행하지 않으므로 사용자 훅 파일에 이 명령을 건다. `ctx --hook`은 어디서 불려도 exit 0이다. */
export const HOOK_COMMAND = "reap ctx --hook";
export const HOOK_TIMEOUT = 5;
/** codex의 홈은 `CODEX_HOME`이 있으면 그것, 없으면 `~/.codex`다. */
export function codexHome(home: string, override?: string): string {
  return override ?? process.env.CODEX_HOME ?? join(home, ".codex");
}
export function codexHooksPath(home: string, override?: string): string {
  return join(codexHome(home, override), "hooks.json");
}

export type RunResult = { status: number | null; stdout: string; stderr: string };
/** 외부 명령 실행. 테스트가 바꿔 끼운다 — 실제 `claude`를 부르는 테스트는 없다. */
export type Runner = (cmd: string, args: string[]) => RunResult;

export const defaultRunner: Runner = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  return { status: r.error ? null : r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
};

export type SetupStep = {
  host?: Host;
  step: "host" | "marketplace" | "plugin" | "hook";
  state: "missing" | "present" | "added" | "installed" | "failed" | "removed";
  detail?: string;
};
export type SetupResult = { ok: boolean; steps: SetupStep[] };

/** 훅 파일에 우리 항목이 있는가. */
function hasHook(data: unknown): boolean {
  const groups = (data as { hooks?: { SessionStart?: unknown } })?.hooks?.SessionStart;
  if (!Array.isArray(groups)) return false;
  return groups.some((g) => Array.isArray((g as { hooks?: unknown })?.hooks) && (g as { hooks: unknown[] }).hooks.some((h) => (h as { command?: string })?.command === HOOK_COMMAND));
}

/** 우리 항목만 걷어낸다. 빈 배열·빈 객체는 지우고, 남의 것은 그대로 둔다. */
function stripHook(data: Record<string, any>): Record<string, any> {
  const hooks = data.hooks as Record<string, any> | undefined;
  if (!hooks) return data;
  const groups = hooks.SessionStart;
  if (Array.isArray(groups)) {
    const kept = groups
      .map((g: any) => (Array.isArray(g?.hooks) ? { ...g, hooks: g.hooks.filter((h: any) => h?.command !== HOOK_COMMAND) } : g))
      .filter((g: any) => !Array.isArray(g?.hooks) || g.hooks.length > 0);
    if (kept.length > 0) hooks.SessionStart = kept;
    else delete hooks.SessionStart;
  }
  if (Object.keys(hooks).length === 0) delete data.hooks;
  return data;
}

type HookFile = { data: Record<string, any>; trailing: string } | null;
function readHookFile(path: string): HookFile | "broken" {
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf8");
  try {
    const data = JSON.parse(raw);
    const object = (v: unknown): v is Record<string, any> => v !== null && typeof v === "object" && !Array.isArray(v);
    if (!object(data) || (data.hooks !== undefined && !object(data.hooks)) ||
        (data.hooks?.SessionStart !== undefined && !Array.isArray(data.hooks.SessionStart))) return "broken";
    return { data, trailing: raw.endsWith("\n") ? "\n" : "" };
  } catch {
    return "broken";
  }
}

/**
 * 있는 호스트를 감지해 전부 건다. 이미 있으면 아무것도 실행하지 않는다 — 재실행 안전.
 * `remove`는 이 함수가 건 것만 되돌린다 (`.reap/genome/invariants.md`).
 */
export function setup(runner: Runner = defaultRunner, opts: { home?: string; codexHome?: string; remove?: boolean } = {}): SetupResult {
  const home = opts.home ?? process.env.HOME ?? homedir();
  const steps: SetupStep[] = [];
  const present = HOSTS.filter((h) => runner(h, ["--version"]).status !== null);
  if (present.length === 0) {
    steps.push({ step: "host", state: "missing" });
    return { ok: false, steps };
  }
  steps.push({ step: "host", state: "present", detail: present.join(", ") });
  let ok = true;
  for (const host of present) {
    const cx = codexHome(home, opts.codexHome);
    if (!(opts.remove ? removeFrom(host, runner, cx, steps) : installTo(host, runner, cx, steps))) ok = false;
  }
  return { ok, steps };
}

/** Codex's text list includes available, uninstalled plugins. Only its JSON installed array is evidence. */
function installedPlugins(host: Host, runner: Runner): { id: string; enabled: boolean }[] {
  const result = runner(host, host === "codex" ? ["plugin", "list", "--json"] : ["plugin", "list"]);
  if (result.status !== 0) return [];
  if (host === "claude") return [...result.stdout.matchAll(/\breap@[\w.-]+|[\w.-]+@ctod-plugins/g)].map((m) => ({ id: m[0], enabled: true }));
  try {
    const data = JSON.parse(result.stdout);
    if (!Array.isArray(data.installed)) return [];
    return data.installed.filter((p: any) => p.installed === true && typeof p.pluginId === "string")
      .map((p: any) => ({ id: p.pluginId, enabled: p.enabled === true }));
  } catch { return []; }
}

function installPlugin(host: Host, runner: Runner, steps: SetupStep[]): boolean {
  const installed = installedPlugins(host, runner).find((p) => p.enabled && p.id.startsWith("reap@"))?.id;
  if (installed) {
    steps.push({ host, step: "plugin", state: "present", detail: installed });
    return true;
  }
  const markets = runner(host, ["plugin", "marketplace", "list"]);
  if (markets.status === 0 && markets.stdout.includes(MARKETPLACE_NAME)) {
    steps.push({ host, step: "marketplace", state: "present" });
  } else {
    const add = runner(host, ["plugin", "marketplace", "add", MARKETPLACE_SOURCE]);
    if (add.status !== 0) {
      steps.push({ host, step: "marketplace", state: "failed", detail: (add.stderr || add.stdout).trim() });
      return false;
    }
    steps.push({ host, step: "marketplace", state: "added" });
  }
  const install = runner(host, INSTALL[host]);
  if (install.status === 0) {
    steps.push({ host, step: "plugin", state: "installed" });
    return true;
  }
  steps.push({ host, step: "plugin", state: "failed", detail: (install.stderr || install.stdout).trim() });
  return false;
}

function installTo(host: Host, runner: Runner, cx: string, steps: SetupStep[]): boolean {
  const ok = installPlugin(host, runner, steps);
  if (host !== "codex") return ok;
  const path = join(cx, "hooks.json");
  const file = readHookFile(path);
  if (file === "broken") {
    steps.push({ host, step: "hook", state: "failed", detail: path });
    return false;
  }
  if (file && hasHook(file.data)) {
    steps.push({ host, step: "hook", state: "present", detail: path });
    return ok;
  }
  const data = file?.data ?? {};
  data.hooks ??= {};
  data.hooks.SessionStart ??= [];
  data.hooks.SessionStart.push({ hooks: [{ type: "command", command: HOOK_COMMAND, timeout: HOOK_TIMEOUT }] });
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + (file?.trailing ?? "\n"));
  steps.push({ host, step: "hook", state: "added", detail: path });
  return ok;
}

function removeFrom(host: Host, runner: Runner, cx: string, steps: SetupStep[]): boolean {
  const listed = installedPlugins(host, runner);
  const mine = listed.some((p) => p.id === PLUGIN);
  if (mine) {
    const gone = runner(host, ["plugin", "remove", PLUGIN]);
    if (gone.status !== 0) {
      steps.push({ host, step: "plugin", state: "failed", detail: (gone.stderr || gone.stdout).trim() });
      return false;
    }
    steps.push({ host, step: "plugin", state: "removed" });
  }

  if (host === "codex") {
    const path = join(cx, "hooks.json");
    const file = readHookFile(path);
    if (file === "broken") {
      steps.push({ host, step: "hook", state: "failed", detail: path });
      return false;
    }
    if (file && hasHook(file.data)) {
      const left = stripHook(file.data);
      if (Object.keys(left).length === 0) rmSync(path);
      else writeFileSync(path, JSON.stringify(left, null, 2) + file.trailing);
      steps.push({ host, step: "hook", state: "removed", detail: path });
    }
  }

  const others = listed.some((p) => p.id.endsWith(`@${MARKETPLACE_NAME}`) && p.id !== PLUGIN);
  if (mine && !others && runner(host, ["plugin", "marketplace", "list"]).stdout.includes(MARKETPLACE_NAME)) {
    const gone = runner(host, ["plugin", "marketplace", "remove", MARKETPLACE_NAME]);
    if (gone.status !== 0) {
      steps.push({ host, step: "marketplace", state: "failed", detail: (gone.stderr || gone.stdout).trim() });
      return false;
    }
    steps.push({ host, step: "marketplace", state: "removed" });
  }
  return true;
}

export function formatSetup(root: string | null, result: SetupResult): string {
  const lines: string[] = [];
  for (const s of result.steps) {
    const host = s.host ?? "";
    const manual = s.host ? MANUAL[s.host] : null;
    if (s.step === "host" && s.state === "missing") lines.push(t(root, "setup.host_missing"));
    if (s.step === "marketplace" && s.state === "present") lines.push(t(root, "setup.marketplace_present", { host }));
    if (s.step === "marketplace" && s.state === "added") lines.push(t(root, "setup.marketplace_added", { host }));
    if (s.step === "marketplace" && s.state === "removed") lines.push(t(root, "setup.marketplace_removed", { host }));
    if (s.step === "marketplace" && s.state === "failed") lines.push(t(root, "setup.marketplace_failed", { host, detail: s.detail ?? "", manual: manual?.marketplace ?? "" }));
    if (s.step === "plugin" && s.state === "present") lines.push(t(root, "setup.plugin_present", { host, name: s.detail ?? PLUGIN }));
    if (s.step === "plugin" && s.state === "installed") lines.push(t(root, "setup.plugin_installed", { host }));
    if (s.step === "plugin" && s.state === "removed") lines.push(t(root, "setup.plugin_removed", { host }));
    if (s.step === "plugin" && s.state === "failed") lines.push(t(root, "setup.plugin_failed", { host, detail: s.detail ?? "", manual: manual?.plugin ?? "" }));
    if (s.step === "hook" && s.state === "present") lines.push(t(root, "setup.hook_present", { path: s.detail ?? "" }));
    if (s.step === "hook" && s.state === "added") lines.push(t(root, "setup.hook_added", { path: s.detail ?? "" }));
    if (s.step === "hook" && s.state === "removed") lines.push(t(root, "setup.hook_removed", { path: s.detail ?? "" }));
    if (s.step === "hook" && s.state === "failed") lines.push(t(root, "setup.hook_failed", { detail: s.detail ?? "" }));
  }
  const removing = result.steps.some((s) => s.state === "removed");
  if (result.ok) lines.push(t(root, removing ? "setup.remove_done" : "setup.done"));
  if (!removing && result.steps.some((s) => s.host === "codex" && s.step === "hook")) lines.push(t(root, "setup.done_codex"));
  return lines.join("\n");
}

/**
 * 플러그인이 깔려 있는가 — 두 호스트 중 한쪽에라도 흔적이 있으면 참이다.
 * Claude Code는 `~/.claude/settings.json`의 `enabledPlugins`, codex는 `~/.codex/config.toml`의 `[plugins."reap@…"]`.
 * 서브프로세스 없이 답할 수 있는 유일한 흔적이라 `doctor`·`init`이 여기에 기댄다. 양쪽 다 읽을 수 없으면 "모른다"(null).
 * 홈은 `$HOME` 우선 — bun의 `os.homedir()`는 HOME을 무시해서(실측) 테스트가 격리할 길이 없다.
 */
export function pluginInstalled(home: string = process.env.HOME || homedir(), codexOverride?: string): boolean | null {
  const found = [claudePlugin(home), codexPlugin(codexHome(home, codexOverride))];
  if (found.some((f) => f === true)) return true;
  if (found.every((f) => f === null)) return null;
  return false;
}

/** A plugin in the other host cannot supply this session's skills. */
export function sessionPluginInstalled(): boolean | null {
  const home = process.env.HOME || homedir();
  if (process.env.CODEX_THREAD_ID) return codexPlugin(codexHome(home)) ?? false;
  if (process.env.CLAUDECODE) return claudePlugin(home) ?? false;
  return pluginInstalled(home);
}

function claudePlugin(home: string): boolean | null {
  const path = join(home, ".claude", "settings.json");
  if (!existsSync(path)) return null;
  try {
    const settings = JSON.parse(readFileSync(path, "utf8")) as { enabledPlugins?: unknown };
    const enabled = settings.enabledPlugins;
    const names = Array.isArray(enabled) ? enabled.map(String) : enabled && typeof enabled === "object" ? Object.entries(enabled).filter(([, value]) => value === true).map(([name]) => name) : [];
    return names.some((n) => n.startsWith("reap@"));
  } catch {
    return null;
  }
}

function codexPlugin(cx: string): boolean | null {
  const path = join(cx, "config.toml");
  if (!existsSync(path)) return null;
  try {
    const sections = readFileSync(path, "utf8").split(/(?=^\s*\[)/m);
    return sections.some((section) => /^\s*\[plugins\."reap@[\w.-]+"\]/.test(section) && /^\s*enabled\s*=\s*true\s*(?:#.*)?$/m.test(section));
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
