#!/usr/bin/env node
// v0.17 home-asset cleanup — run by migrate skill's 8/8, after the migration is
// verified and only after the human has seen the list.
//
// Usage: cleanup-home.mjs [--apply] [--home <dir>]
//   default   list what would be removed. Changes nothing.
//   --apply   remove exactly the listed entries.
//
// Allowlist only — inherited verbatim from v0.17's `reap uninstall` (gen-088):
//   ~/.claude/commands/reap.*.md     the old slash commands (reapdev.* untouched)
//   ~/.claude/agents/reap-*.md       the old agents, reap-upgrade.md included
//   ~/.claude/settings.json          only SessionStart entries whose command
//                                    contains `reap check-version` or
//                                    `reap load-context`. Nothing else in the
//                                    file — enabledPlugins/extraKnownMarketplaces
//                                    are the v0.18 plugin's registration
//   ~/.reap/{reap-guide.md,.install-stamp,version-check.json,daemon/}
// Anything not named above survives. `~/.reap/` itself is never removed — the
// machine this was written on kept a private key there.
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, renameSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const homeIdx = args.indexOf("--home");
const home = homeIdx >= 0 ? args[homeIdx + 1] : homedir();
if (!home) { console.error("usage: cleanup-home.mjs [--apply] [--home <dir>]"); process.exit(2); }

const HOOK_MARKERS = ["reap check-version", "reap load-context"];
const REAP_HOME_ENTRIES = ["reap-guide.md", ".install-stamp", "version-check.json", "daemon"];

const files = [];   // absolute paths to remove
const hooks = [];   // SessionStart entries to drop (index + command)
const kept = [];    // things seen and deliberately left

function listDir(dir, pattern) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir).sort()) {
    if (pattern.test(name)) files.push(join(dir, name));
  }
}
listDir(join(home, ".claude", "commands"), /^reap\.[^/]+\.md$/);
listDir(join(home, ".claude", "agents"), /^reap-[^/]+\.md$/);

const reapHome = join(home, ".reap");
if (existsSync(reapHome)) {
  for (const name of readdirSync(reapHome).sort()) {
    if (REAP_HOME_ENTRIES.includes(name)) files.push(join(reapHome, name));
    else kept.push(`${join(reapHome, name)} (user-owned — not REAP's)`);
  }
}

const settingsPath = join(home, ".claude", "settings.json");
let settings = null;
let settingsError = null;
if (existsSync(settingsPath)) {
  try {
    settings = JSON.parse(readFileSync(settingsPath, "utf8"));
    const ss = settings?.hooks?.SessionStart;
    if (Array.isArray(ss)) {
      ss.forEach((entry, i) => {
        const cmds = Array.isArray(entry?.hooks) ? entry.hooks.map((h) => h?.command).filter((c) => typeof c === "string") : [];
        const hit = cmds.find((c) => HOOK_MARKERS.some((m) => c.includes(m)));
        if (hit) hooks.push({ index: i, command: hit });
      });
    }
  } catch (e) {
    settingsError = `settings.json is not valid JSON — left untouched (${e.message})`;
  }
}

console.log(apply ? "applying — removing exactly the entries below" : "listing — nothing is removed without --apply");
console.log(`home: ${home}`);
console.log(`files (${files.length}):`);
for (const f of files) console.log(`  - ${f}`);
console.log(`settings.json SessionStart entries (${hooks.length}):`);
for (const h of hooks) console.log(`  - [${h.index}] ${h.command}`);
if (settingsError) console.log(`  ! ${settingsError}`);
if (kept.length) {
  console.log(`kept (${kept.length}):`);
  for (const k of kept) console.log(`  - ${k}`);
}

if (!apply) process.exit(0);

let removed = 0;
for (const f of files) {
  const isDir = statSync(f).isDirectory();
  rmSync(f, { recursive: isDir, force: true });
  removed++;
}
if (hooks.length && settings) {
  const drop = new Set(hooks.map((h) => h.index));
  settings.hooks.SessionStart = settings.hooks.SessionStart.filter((_, i) => !drop.has(i));
  const text = JSON.stringify(settings, null, 2) + "\n";
  JSON.parse(text); // validate before it touches the real file
  const tmp = `${settingsPath}.reap-cleanup.tmp`;
  writeFileSync(tmp, text);
  renameSync(tmp, settingsPath);
}
console.log(`removed: ${removed} file(s)/dir(s), ${settings ? hooks.length : 0} SessionStart entr${hooks.length === 1 ? "y" : "ies"}`);
