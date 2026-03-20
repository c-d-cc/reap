#!/usr/bin/env node
// REAP SessionStart hook — injects REAP guide + Genome + current generation context
// Single Node.js process (replaces session-start.sh for better performance)
const path = require('path');
const gl = require('./genome-loader.cjs');

const startTime = Date.now();
let step = 0;
const totalSteps = 7;

function log(msg) {
  step++;
  process.stderr.write(`[REAP ${step}/${totalSteps} +${Date.now() - startTime}ms] ${msg}\n`);
}

// Paths
const scriptDir = __dirname;
const projectRoot = process.cwd();
const reapDir = path.join(projectRoot, '.reap');
const genomeDir = path.join(reapDir, 'genome');
const configFile = path.join(reapDir, 'config.yml');
const currentYml = path.join(reapDir, 'life', 'current.yml');
const guideFile = path.join(scriptDir, 'reap-guide.md');

// Check REAP project
if (!gl.dirExists(reapDir)) {
  process.stderr.write('[REAP] Not a REAP project, skipping\n');
  process.exit(0);
}

// Step 0: Install project-level command files (copy, not symlink — Claude Code doesn't follow symlinks)
const fs = require('fs');
const os = require('os');
const userReapCommands = path.join(os.homedir(), '.reap', 'commands');
const projectClaudeCommands = path.join(projectRoot, '.claude', 'commands');

if (gl.dirExists(userReapCommands)) {
  try {
    fs.mkdirSync(projectClaudeCommands, { recursive: true });
    const cmdFiles = fs.readdirSync(userReapCommands).filter(f => f.startsWith('reap.') && f.endsWith('.md'));
    let installed = 0;
    for (const file of cmdFiles) {
      const src = path.join(userReapCommands, file);
      const dest = path.join(projectClaudeCommands, file);
      try {
        const stat = fs.lstatSync(dest);
        if (stat.isSymbolicLink()) {
          fs.unlinkSync(dest); // replace legacy symlink with real file
        } else {
          // Skip if content is identical
          const srcContent = fs.readFileSync(src);
          const destContent = fs.readFileSync(dest);
          if (srcContent.equals(destContent)) continue;
          fs.unlinkSync(dest);
        }
      } catch { /* dest doesn't exist */ }
      fs.copyFileSync(src, dest);
      installed++;
    }
    // Ensure .gitignore excludes these files
    const gitignorePath = path.join(projectRoot, '.gitignore');
    const gitignoreEntry = '.claude/commands/reap.*';
    try {
      const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : '';
      if (!gitignore.includes(gitignoreEntry)) {
        fs.appendFileSync(gitignorePath, `\n# REAP command files (managed by session-start hook)\n${gitignoreEntry}\n`);
      }
    } catch { /* best effort */ }
    process.stderr.write(`[REAP] Installed ${installed} commands to .claude/commands/ (${cmdFiles.length - installed} unchanged)\n`);
  } catch (err) {
    process.stderr.write(`[REAP] Warning: failed to install commands: ${err.message}\n`);
  }
}

// Step 1: Version check + Auto-update
log('Checking for updates...');
let autoUpdateMessage = '';
let updateAvailableMessage = '';
const { configContent } = gl.parseConfig(configFile);
const installed = gl.exec('reap --version');
const latest = gl.exec('npm view @c-d-cc/reap version');
if (installed && installed.includes('+dev')) {
  // Local dev build — skip version check entirely
} else if (installed && latest && installed !== latest) {
  const autoUpdate = configContent ? /^autoUpdate:\s*true/m.test(configContent) : false;
  if (autoUpdate) {
    const updated = gl.exec('npm update -g @c-d-cc/reap');
    if (updated !== null) {
      gl.exec('reap update');
      autoUpdateMessage = `REAP auto-updated: v${installed} → v${latest}`;
    }
  } else {
    updateAvailableMessage = `update available: v${installed} → v${latest}`;
  }
}

// Step 2: Load REAP guide
log('Loading REAP guide...');
const reapGuide = gl.readFile(guideFile) || '';

// Step 3: Load Genome (tiered)
log('Loading Genome...');
const { content: genomeContent, l1Lines } = gl.loadGenome(genomeDir);

// Step 3b: Load Environment summary
const envSummaryFile = path.join(reapDir, 'environment', 'summary.md');
const envSummary = gl.readFile(envSummaryFile) || '';

// Step 4: Check Genome staleness
log('Checking sync...');
const { genomeStaleWarning, commitsSince } = gl.detectStaleness(projectRoot);

// Step 5: Read generation state
log('Reading generation state...');
const { strictEdit, strictMerge } = gl.parseConfig(configFile);
const { genStage, genId, generationContext, nextCmd } = gl.parseCurrentYml(currentYml);

// Build strict mode section
const strictSection = gl.buildStrictSection(strictEdit, strictMerge, genStage);

// Build staleness section
let staleSection = '';
if (genomeStaleWarning) {
  staleSection = `\n\n## Genome Staleness\n${genomeStaleWarning}\nIf the user wants to proceed without syncing, ask: "The Genome may be stale. Would you like to run /reap.sync now, or do it later?" and respect their choice.`;
}

// Build auto-update section
let updateSection = '';
if (autoUpdateMessage) {
  updateSection = `\n\n## Auto-Update\n${autoUpdateMessage}. Tell the user: "${autoUpdateMessage}"`;
}

// Build session init display
const initLines = [];
if (autoUpdateMessage) initLines.push(`🟢 ${autoUpdateMessage}`);

// Genome health
const health = gl.buildGenomeHealth({ l1Lines, genomeDir, configFile, genomeStaleWarning, commitsSince });
initLines.push(...health.initLines);

// Generation status
const currentContent = gl.readFile(currentYml);
if (currentContent && currentContent.trim()) {
  if (!genId || genStage === 'none') {
    initLines.push('🔴 Generation — current.yml corrupted. `reap fix`');
  } else {
    initLines.push(`🟢 Generation ${genId} — ${genStage}`);
  }
} else {
  initLines.push('⚪ No active Generation');
}

const initSummary = initLines.join('\n');

// Load session-init format template and render
const initFormatFile = path.join(scriptDir, 'session-init-format.md');
const initFormat = gl.readFile(initFormatFile) || '{{SESSION_INIT_LINES}}';
const currentVersion = installed || gl.exec('reap --version') || '?';
const updateBadge = updateAvailableMessage ? ` — ${updateAvailableMessage}` : '';
const sessionInitDisplay = initFormat
  .replace('{{VERSION}}', currentVersion)
  .replace('{{UPDATE_AVAILABLE}}', updateBadge)
  .replace('{{SESSION_INIT_LINES}}', initSummary)
  .trim();

// Step 6: Output JSON
log('Done. Injecting context.');

const envSection = envSummary ? `\n\n---\n\n## Environment (External Context)\n${envSummary}` : '';

const reapContext = `<REAP_WORKFLOW>\n${reapGuide}\n\n---\n\n## Genome (Project Knowledge — treat as authoritative source of truth)\n${genomeContent}${envSection}\n\n---\n\n## Current State\n${generationContext}${staleSection}${strictSection}${updateSection}\n\n## Session Init (display to user on first message)\n${sessionInitDisplay}\n\n## Rules\n1. ALL development work MUST follow the REAP lifecycle. Do NOT bypass it.\n2. Before writing any code, check if a Generation is active and what stage it is in.\n3. If a Generation is active, use \`${nextCmd}\` to proceed with the current stage.\n4. If no Generation is active, use \`/reap.start\` to start a new one.\n5. Do NOT implement features, fix bugs, or make changes outside of the REAP lifecycle unless the user explicitly asks to bypass it.\n6. When the user says "reap evolve", "next stage", "proceed", or similar — invoke the appropriate REAP skill.\n7. **Genome is the authoritative knowledge source.** When making decisions about architecture, conventions, or constraints, ALWAYS reference the Genome first. If code contradicts Genome, flag it as a potential genome-change backlog item.\n8. If you notice the Genome is outdated or missing information relevant to your current task, inform the user and suggest running \`/reap.sync\`.\n</REAP_WORKFLOW>`;

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: reapContext
  }
}) + '\n');
