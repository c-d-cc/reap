#!/usr/bin/env node
/**
 * postinstall — install REAP slash commands to detected AI agents.
 * Runs after `npm install -g @c-d-cc/reap`.
 * Graceful: never fails npm install (always exits 0).
 */
const { execSync } = require("child_process");
const { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } = require("fs");
const { join, dirname } = require("path");
const { homedir } = require("os");

const AGENTS = [
  { name: "Claude Code", bin: "claude", commandsDir: join(homedir(), ".claude", "commands") },
  { name: "OpenCode", bin: "opencode", commandsDir: join(homedir(), ".config", "opencode", "commands") },
];

function isInstalled(bin) {
  try {
    execSync(`which ${bin}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

try {
  // Resolve commands source: dist/templates/commands/ relative to this script
  const commandsSource = join(dirname(__dirname), "dist", "templates", "commands");
  if (!existsSync(commandsSource)) {
    // During development or if dist not built yet, skip silently
    process.exit(0);
  }

  const commandFiles = readdirSync(commandsSource).filter(f => f.endsWith(".md"));
  if (commandFiles.length === 0) process.exit(0);

  let installed = 0;
  for (const agent of AGENTS) {
    if (!isInstalled(agent.bin)) continue;

    mkdirSync(agent.commandsDir, { recursive: true });
    for (const file of commandFiles) {
      const src = readFileSync(join(commandsSource, file), "utf-8");
      writeFileSync(join(agent.commandsDir, file), src);
    }
    installed++;
    console.log(`  reap: ${agent.name} — ${commandFiles.length} slash commands installed`);
  }

  if (installed === 0) {
    console.log("  reap: no supported AI agents detected (claude, opencode). Run 'reap update' after installing one.");
  }
} catch (err) {
  // Graceful failure — never break npm install
  console.warn("  reap: postinstall warning —", err.message);
}
