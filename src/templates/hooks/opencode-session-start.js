// REAP SessionStart plugin for OpenCode
// Injects REAP guide + Genome + current generation context into every OpenCode session
// Installed to ~/.config/opencode/plugins/reap-session-start.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = async (ctx) => {
  return {
    "session.start": async ({ trigger }) => {
      const projectRoot = process.cwd();
      const reapDir = path.join(projectRoot, ".reap");

      // Check if this is a REAP project
      if (!fs.existsSync(reapDir)) return;

      // Load shared genome-loader (try multiple locations)
      let gl;
      const loaderLocations = [
        path.join(__dirname, "genome-loader.cjs"),
        path.join(__dirname, "..", "hooks", "genome-loader.cjs"),
      ];
      for (const loc of loaderLocations) {
        if (fs.existsSync(loc)) {
          gl = require(loc);
          break;
        }
      }
      if (!gl) {
        try {
          const pkgPath = require.resolve("@c-d-cc/reap/package.json");
          const pkgLoader = path.join(pkgPath, "..", "dist", "templates", "hooks", "genome-loader.cjs");
          if (fs.existsSync(pkgLoader)) gl = require(pkgLoader);
        } catch { /* package not found */ }
      }
      if (!gl) return; // Cannot load shared module, skip

      // Auto-update check (with PATH resolution for non-shell environments)
      let autoUpdateMessage = "";
      try {
        const configPath = path.join(reapDir, "config.yml");
        if (fs.existsSync(configPath)) {
          const { configContent } = gl.parseConfig(configPath);
          if (configContent && /^autoUpdate:\s*true/m.test(configContent)) {
            try {
              const userShell = process.env.SHELL || "/bin/bash";
              const shellPath = execSync(`${userShell} -l -c 'echo $PATH' 2>/dev/null`, { encoding: "utf8" }).trim();
              const execOpts = { encoding: "utf8", env: { ...process.env, PATH: shellPath || process.env.PATH } };

              const installed = gl.exec("reap --version 2>/dev/null", execOpts);
              const latest = gl.exec("npm view @c-d-cc/reap version 2>/dev/null", execOpts);
              if (installed && latest && installed !== latest) {
                execSync("npm update -g @c-d-cc/reap >/dev/null 2>&1", { ...execOpts, stdio: "ignore" });
                execSync("reap update >/dev/null 2>&1", { ...execOpts, stdio: "ignore" });
                autoUpdateMessage = `REAP auto-updated: v${installed} → v${latest}`;
              }
            } catch { /* update check failed, skip */ }
          }
        }
      } catch { /* config read failed, skip */ }

      // Load REAP guide
      const scriptDir = __dirname;
      const guideLocations = [
        path.join(scriptDir, "..", "hooks", "reap-guide.md"),
        path.join(scriptDir, "reap-guide.md"),
      ];
      let reapGuide = "";
      for (const loc of guideLocations) {
        if (fs.existsSync(loc)) {
          reapGuide = fs.readFileSync(loc, "utf8");
          break;
        }
      }
      if (!reapGuide) {
        try {
          const pkgPath = require.resolve("@c-d-cc/reap/package.json");
          const guidePath = path.join(pkgPath, "..", "dist", "templates", "hooks", "reap-guide.md");
          if (fs.existsSync(guidePath)) reapGuide = fs.readFileSync(guidePath, "utf8");
        } catch { /* package not found */ }
      }

      // Load Genome via shared module
      const genomeDir = path.join(reapDir, "genome");
      const { content: genomeContent } = gl.loadGenome(genomeDir);

      // Parse config and generation state via shared module
      const configFile = path.join(reapDir, "config.yml");
      const currentYml = path.join(reapDir, "life", "current.yml");
      const { strictEdit, strictMerge, language } = gl.parseConfig(configFile);
      const { genStage, generationContext, nextCmd } = gl.parseCurrentYml(currentYml);

      // Build strict mode section via shared module
      const strictSection = gl.buildStrictSection(strictEdit, strictMerge, genStage);

      // Detect staleness via shared module
      let staleSection = "";
      const staleness = gl.detectStaleness(projectRoot);
      if (staleness.genomeStaleWarning) {
        staleSection = `\n\n## Genome Staleness\n${staleness.genomeStaleWarning}\nIf the user wants to proceed without syncing, ask: "The Genome may be stale. Would you like to run /reap.sync now, or do it later?" and respect their choice.`;
      }

      // Build language instruction
      let langSection = "";
      if (language) {
        langSection = `\n\n## Language\nAlways respond in ${language}. Use ${language} for all explanations, comments, and communications with the user. Technical terms and code identifiers should remain in their original form.`;
      }

      // Build auto-update section
      let updateSection = "";
      if (autoUpdateMessage) {
        updateSection = `\n\n## Auto-Update\n${autoUpdateMessage}. Tell the user: "${autoUpdateMessage}"`;
      }

      const context = `<REAP_WORKFLOW>\n${reapGuide}\n\n---\n\n## Genome (Project Knowledge)\n${genomeContent}\n\n---\n\n## Current State\n${generationContext}${staleSection}${strictSection}${updateSection}${langSection}\n\n## Rules\n1. ALL development work MUST follow the REAP lifecycle.\n2. Before writing any code, check if a Generation is active and what stage it is in.\n3. If a Generation is active, use \`${nextCmd}\` to proceed with the current stage.\n4. If no Generation is active, use \`/reap.start\` to start a new one.\n5. Do NOT implement features outside of the REAP lifecycle unless explicitly asked.\n6. Genome is the authoritative knowledge source.\n</REAP_WORKFLOW>`;

      return { systemPrompt: context };
    },
  };
};
