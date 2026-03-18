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

      // Auto-update check
      let autoUpdateMessage = "";
      try {
        const autoConfigPath = path.join(reapDir, "config.yml");
        if (fs.existsSync(autoConfigPath)) {
          const configRaw = fs.readFileSync(autoConfigPath, "utf8");
          const autoUpdateMatch = configRaw.match(/^autoUpdate:\s*(.+)$/m);
          if (autoUpdateMatch && autoUpdateMatch[1].trim() === "true") {
            try {
              const installed = execSync("reap --version 2>/dev/null", { encoding: "utf8" }).trim();
              const latest = execSync("npm view @c-d-cc/reap version 2>/dev/null", { encoding: "utf8" }).trim();
              if (installed && latest && installed !== latest) {
                execSync("npm update -g @c-d-cc/reap >/dev/null 2>&1", { stdio: "ignore" });
                execSync("reap update >/dev/null 2>&1", { stdio: "ignore" });
                autoUpdateMessage = `REAP auto-updated: v${installed} → v${latest}`;
              }
            } catch { /* update check failed, skip */ }
          }
        }
      } catch { /* config read failed, skip */ }

      const scriptDir = __dirname;
      // Look for reap-guide.md relative to the package hooks dir
      // The guide is installed alongside this plugin's source package
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

      // If guide not found from package, try to get it via the reap CLI
      if (!reapGuide) {
        try {
          // Find the package hooks dir by looking up from the plugin location
          const possiblePaths = [
            path.join(require.resolve("@c-d-cc/reap/package.json"), "..", "dist", "templates", "hooks", "reap-guide.md"),
          ];
          for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
              reapGuide = fs.readFileSync(p, "utf8");
              break;
            }
          }
        } catch { /* package not found */ }
      }

      // Read Genome files
      const genomeDir = path.join(reapDir, "genome");
      let genomeContent = "";
      const L1_LIMIT = 500;
      const L2_LIMIT = 200;
      let l1Lines = 0;

      if (fs.existsSync(genomeDir)) {
        for (const file of ["principles.md", "conventions.md", "constraints.md"]) {
          const filePath = path.join(genomeDir, file);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf8");
            const lines = content.split("\n").length;
            l1Lines += lines;
            if (l1Lines <= L1_LIMIT) {
              genomeContent += `\n### ${file}\n${content}\n`;
            } else {
              genomeContent += `\n### ${file} [TRUNCATED]\n${content.split("\n").slice(0, 20).join("\n")}\n...\n`;
            }
          }
        }

        // L2: domain/ files
        const domainDir = path.join(genomeDir, "domain");
        if (fs.existsSync(domainDir)) {
          let l2Lines = 0;
          let l2Overflow = false;
          const domainFiles = fs.readdirSync(domainDir).filter(f => f.endsWith(".md"));
          for (const file of domainFiles) {
            const filePath = path.join(domainDir, file);
            const content = fs.readFileSync(filePath, "utf8");
            const lines = content.split("\n").length;
            l2Lines += lines;
            if (!l2Overflow && l2Lines <= L2_LIMIT) {
              genomeContent += `\n### domain/${file}\n${content}\n`;
            } else {
              l2Overflow = true;
              const firstLine = content.split("\n").find(l => l.startsWith(">")) || content.split("\n")[0];
              genomeContent += `\n### domain/${file} [summary]\n${firstLine}\n`;
            }
          }
        }
      }

      // Read config (strict mode + language)
      let strictMode = false;
      let language = "";
      const configPath = path.join(reapDir, "config.yml");
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, "utf8");
        const strictMatch = configContent.match(/^strict:\s*(.+)$/m);
        if (strictMatch && strictMatch[1].trim() === "true") {
          strictMode = true;
        }
        const langMatch = configContent.match(/^language:\s*(.+)$/m);
        if (langMatch) {
          language = langMatch[1].trim();
        }
      }

      // Read current.yml
      const currentPath = path.join(reapDir, "life", "current.yml");
      let genStage = "none";
      let generationContext = "No active Generation. Run `/reap.start` to start one.";

      if (fs.existsSync(currentPath)) {
        const content = fs.readFileSync(currentPath, "utf8").trim();
        if (content) {
          const idMatch = content.match(/^id:\s*(.+)$/m);
          const goalMatch = content.match(/^goal:\s*(.+)$/m);
          const stageMatch = content.match(/^stage:\s*(.+)$/m);
          if (idMatch && goalMatch && stageMatch) {
            genStage = stageMatch[1].trim();
            generationContext = `Active Generation: ${idMatch[1].trim()} | Goal: ${goalMatch[1].trim()} | Stage: ${genStage}`;
          }
        }
      }

      // Map stage to command
      const stageCommandMap = {
        objective: "/reap.objective",
        planning: "/reap.planning",
        implementation: "/reap.implementation",
        validation: "/reap.validation",
        completion: "/reap.completion",
      };
      const nextCmd = stageCommandMap[genStage] || "/reap.start";

      // Build strict mode section
      let strictSection = "";
      if (strictMode) {
        if (genStage === "implementation") {
          strictSection = "\n\n## Strict Mode (ACTIVE — SCOPED MODIFICATION ALLOWED)\n<HARD-GATE>\nStrict mode is enabled. Code modification is ALLOWED only within the scope of the current Generation's plan.\n- You MUST read `.reap/life/02-planning.md` before writing any code.\n- You may ONLY modify files and modules listed in the plan's task list.\n- Changes outside the plan's scope are BLOCKED.\n</HARD-GATE>";
        } else if (genStage === "none") {
          strictSection = "\n\n## Strict Mode (ACTIVE — CODE MODIFICATION BLOCKED)\n<HARD-GATE>\nStrict mode is enabled and there is NO active Generation.\nYou MUST NOT write, edit, or create any source code files.\nAllowed actions: reading files, analyzing code, answering questions, running commands.\nTo start coding, the user must first run `/reap.start` and advance to the implementation stage.\n</HARD-GATE>";
        } else {
          strictSection = `\n\n## Strict Mode (ACTIVE — CODE MODIFICATION BLOCKED)\n<HARD-GATE>\nStrict mode is enabled. Current stage is '${genStage}', which is NOT the implementation stage.\nYou MUST NOT write, edit, or create any source code files.\n</HARD-GATE>`;
        }
      }

      // Detect genome staleness
      let staleSection = "";
      try {
        const lastCommit = execSync(`git -C "${projectRoot}" log -1 --format="%H" -- ".reap/genome/" 2>/dev/null`, { encoding: "utf8" }).trim();
        if (lastCommit) {
          const commitsSince = parseInt(execSync(`git -C "${projectRoot}" rev-list --count "${lastCommit}..HEAD" 2>/dev/null`, { encoding: "utf8" }).trim(), 10);
          if (commitsSince > 10) {
            staleSection = `\n\n## Genome Staleness\nWARNING: Genome may be stale — ${commitsSince} commits since last Genome update. Consider running /reap.sync.`;
          }
        }
      } catch { /* git not available or not a repo */ }

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

      // Inject context into session via return value
      return { systemPrompt: context };
    },
  };
};
