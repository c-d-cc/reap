#!/usr/bin/env node
/**
 * postinstall — install REAP slash commands to ~/.reap/commands/.
 * Runs after `npm install -g @c-d-cc/reap`.
 * Project-level symlinks are created by session-start.cjs at session time.
 * Graceful: never fails npm install (always exits 0).
 */
const { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } = require("fs");
const { join, dirname } = require("path");
const { homedir } = require("os");

try {
  // Warn if installed locally instead of globally
  const isGlobal = process.env.npm_config_global === "true"
    || (process.env.npm_config_prefix && !process.env.npm_config_prefix.includes("node_modules"));
  if (!isGlobal) {
    console.warn("\n  ⚠ @c-d-cc/reap is a CLI tool and should be installed globally:");
    console.warn("    npm install -g @c-d-cc/reap\n");
  }

  // Resolve commands source: dist/templates/commands/ relative to this script
  const commandsSource = join(dirname(__dirname), "dist", "templates", "commands");
  if (!existsSync(commandsSource)) {
    process.exit(0);
  }

  const commandFiles = readdirSync(commandsSource).filter(f => f.endsWith(".md"));
  if (commandFiles.length === 0) process.exit(0);

  // Install originals to ~/.reap/commands/
  const reapCommandsDir = join(homedir(), ".reap", "commands");
  mkdirSync(reapCommandsDir, { recursive: true });
  for (const file of commandFiles) {
    const src = readFileSync(join(commandsSource, file), "utf-8");
    writeFileSync(join(reapCommandsDir, file), src);
  }
  console.log(`  reap: ${commandFiles.length} slash commands installed to ~/.reap/commands/`);

  // Phase 2 cleanup: remove redirect stubs from agent user-level dirs
  const agentDirs = [
    join(homedir(), ".claude", "commands"),
    join(homedir(), ".config", "opencode", "commands"),
    join(homedir(), ".codex", "commands"),
  ];
  for (const agentDir of agentDirs) {
    if (!existsSync(agentDir)) continue;
    try {
      const files = readdirSync(agentDir).filter(f => f.startsWith("reap.") && f.endsWith(".md"));
      for (const file of files) {
        const filePath = join(agentDir, file);
        const content = readFileSync(filePath, "utf-8");
        if (content.includes("redirected to ~/.reap/commands/")) {
          unlinkSync(filePath);
        }
      }
    } catch { /* best effort */ }
  }
} catch (err) {
  console.warn("  reap: postinstall warning —", err.message);
}
