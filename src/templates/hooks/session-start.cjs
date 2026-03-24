#!/usr/bin/env node
// REAP SessionStart hook — injects REAP guide + Genome + current generation context
// Single Node.js process (replaces session-start.sh for better performance)
const path = require('path');
const gl = require('./genome-loader.cjs');

const startTime = Date.now();
let step = 0;
const totalSteps = 8;

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

// Step 0: Install project-level skill files (.claude/skills/{name}/SKILL.md)
// NOTE: This section is Claude Code-specific. Claude Code uses .claude/skills/ for
// slash command discovery. Other agents (Codex CLI, OpenCode) use different mechanisms
// (AGENTS.md, plugins) and this section is safely skipped when the directory doesn't exist.
const fs = require('fs');
const os = require('os');
const userReapCommands = path.join(os.homedir(), '.reap', 'commands');
const projectClaudeSkills = path.join(projectRoot, '.claude', 'skills');

/**
 * Parse frontmatter from a command .md file.
 * Returns { description, body } where body is the content after frontmatter.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { description: '', body: content };
  const fm = match[1];
  const body = match[2];
  const descMatch = fm.match(/^description:\s*"?([^"\n]*)"?/m);
  return { description: descMatch ? descMatch[1].trim() : '', body };
}

if (gl.dirExists(userReapCommands)) {
  try {
    const cmdFiles = fs.readdirSync(userReapCommands).filter(f => f.startsWith('reap.') && f.endsWith('.md'));
    let installed = 0;
    for (const file of cmdFiles) {
      const src = path.join(userReapCommands, file);
      const name = file.replace(/\.md$/, ''); // e.g. reap.objective
      const skillDir = path.join(projectClaudeSkills, name);
      const skillFile = path.join(skillDir, 'SKILL.md');

      const srcContent = fs.readFileSync(src, 'utf-8');
      const { description, body } = parseFrontmatter(srcContent);
      const skillContent = `---\nname: ${name}\ndescription: "${description}"\n---\n${body}`;

      // Skip if content is identical
      try {
        const existing = fs.readFileSync(skillFile, 'utf-8');
        if (existing === skillContent) continue;
      } catch { /* dest doesn't exist */ }

      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(skillFile, skillContent, 'utf-8');
      installed++;
    }

    // Clean up legacy .claude/commands/reap.* files
    const projectClaudeCommands = path.join(projectRoot, '.claude', 'commands');
    try {
      if (fs.existsSync(projectClaudeCommands)) {
        const legacyFiles = fs.readdirSync(projectClaudeCommands).filter(f => f.startsWith('reap.') && f.endsWith('.md'));
        for (const file of legacyFiles) {
          fs.unlinkSync(path.join(projectClaudeCommands, file));
        }
        if (legacyFiles.length > 0) {
          process.stderr.write(`[REAP] Cleaned up ${legacyFiles.length} legacy .claude/commands/reap.* files\n`);
        }
      }
    } catch { /* best effort */ }

    // Ensure .gitignore excludes skill files (and migrate legacy entry)
    const gitignorePath = path.join(projectRoot, '.gitignore');
    const newEntry = '.claude/skills/reap.*';
    const legacyEntry = '.claude/commands/reap.*';
    try {
      let gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : '';
      let changed = false;
      // Replace legacy entry with new entry
      if (gitignore.includes(legacyEntry)) {
        gitignore = gitignore.replace(legacyEntry, newEntry);
        changed = true;
      }
      // Add new entry if not present
      if (!gitignore.includes(newEntry)) {
        gitignore += `\n# REAP skill files (managed by session-start hook)\n${newEntry}\n`;
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(gitignorePath, gitignore, 'utf-8');
      }
    } catch { /* best effort */ }

    process.stderr.write(`[REAP] Installed ${installed} skills to .claude/skills/ (${cmdFiles.length - installed} unchanged)\n`);
  } catch (err) {
    process.stderr.write(`[REAP] Warning: failed to install skills: ${err.message}\n`);
  }
}

// Inline semver comparison (no external deps): returns true if a >= b
function semverGte(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return true;
    if ((pa[i] || 0) < (pb[i] || 0)) return false;
  }
  return true;
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
    // Auto-update guard: check autoUpdateMinVersion before upgrading
    const minVersion = gl.exec('npm view @c-d-cc/reap reap.autoUpdateMinVersion');
    if (minVersion && !semverGte(installed, minVersion)) {
      // Breaking change detected — block auto-update
      autoUpdateMessage = `[BREAKING] Auto-update blocked: v${installed} → v${latest} contains breaking changes. Inform the user about this breaking change and ask if they want to update manually: npm install -g @c-d-cc/reap@${latest}. Release notes: https://reap.cc/docs/release-notes`;
    } else {
      const updated = gl.exec('npm update -g @c-d-cc/reap');
      if (updated !== null) {
        gl.exec('reap update');
        autoUpdateMessage = `REAP auto-updated: v${installed} → v${latest}`;
      }
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

// Step 5: Read generation state
log('Reading generation state...');
const { strictEdit, strictMerge, language, lastSyncedGeneration, lastSyncedCommit } = gl.parseConfig(configFile);

// Step 4: Check Genome staleness
log('Checking sync...');
const { genomeStaleWarning, commitsSince, neverSynced } = gl.detectStaleness(projectRoot, lastSyncedGeneration, lastSyncedCommit);
const { genStage, genId, generationContext, nextCmd } = gl.parseCurrentYml(currentYml);

// Build strict mode section
const strictSection = gl.buildStrictSection(strictEdit, strictMerge, genStage);

// Build language instruction
let langSection = '';
if (language) {
  langSection = `\n\n## Language\nAlways respond in ${language}. Use ${language} for all explanations, comments, and communications with the user. Technical terms and code identifiers should remain in their original form.`;
}

// Build staleness section
let staleSection = '';
if (genomeStaleWarning) {
  staleSection = `\n\n## Genome Staleness\n${genomeStaleWarning}\nIf the user wants to proceed without syncing, ask: "The Genome may be stale. Would you like to run /reap.sync now, or do it later?" and respect their choice.`;
}

// Build auto-update section
let updateSection = '';
if (autoUpdateMessage) {
  if (autoUpdateMessage.startsWith('[BREAKING]')) {
    updateSection = `\n\n## Auto-Update (Breaking Change Detected)\n${autoUpdateMessage}\n\nIMPORTANT: On your first response, explain to the user that a new REAP version is available but contains breaking changes. Show them the release notes link and ask for explicit confirmation before they run the manual update command. Do NOT silently skip this.`;
  } else {
    updateSection = `\n\n## Auto-Update\n${autoUpdateMessage}. Tell the user: "${autoUpdateMessage}"`;
  }
}

// Build session init display
const initLines = [];
if (autoUpdateMessage) initLines.push(`🟢 ${autoUpdateMessage}`);

// Genome health
const health = gl.buildGenomeHealth({ l1Lines, genomeDir, configFile, genomeStaleWarning, commitsSince, neverSynced });
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

// Integrity check via reap fix --check subprocess
log('Checking integrity...');
try {
  require('child_process').execSync('reap fix --check', { encoding: 'utf-8', timeout: 5000, stdio: 'pipe' });
  initLines.push('🟢 Integrity — OK');
} catch (integrityErr) {
  const output = (integrityErr.stdout || '').trim();
  const errorCount = (output.match(/✗/g) || []).length;
  const warnCount = (output.match(/⚠/g) || []).length;
  if (errorCount > 0 || warnCount > 0) {
    const parts = [];
    if (errorCount > 0) parts.push(`${errorCount} error${errorCount > 1 ? 's' : ''}`);
    if (warnCount > 0) parts.push(`${warnCount} warning${warnCount > 1 ? 's' : ''}`);
    initLines.push(`🔴 Integrity — ${parts.join(', ')}`);
  } else {
    initLines.push('🟡 Integrity — check failed');
  }
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

const reapContext = `<REAP_WORKFLOW>\n${reapGuide}\n\n---\n\n## Genome (Project Knowledge — treat as authoritative source of truth)\n${genomeContent}${envSection}\n\n---\n\n## Current State\n${generationContext}${staleSection}${strictSection}${updateSection}${langSection}\n\n## Session Init (display to user on first message)\n${sessionInitDisplay}\n\n## Rules\n1. ALL development work MUST follow the REAP lifecycle. Do NOT bypass it.\n2. Before writing any code, check if a Generation is active and what stage it is in.\n3. If a Generation is active, use \`${nextCmd}\` to proceed with the current stage.\n4. If no Generation is active, use \`/reap.start\` to start a new one.\n5. Do NOT implement features, fix bugs, or make changes outside of the REAP lifecycle unless the user explicitly asks to bypass it.\n6. When the user says "reap evolve", "next stage", "proceed", or similar — invoke the appropriate REAP skill.\n7. **Genome is the authoritative knowledge source.** When making decisions about architecture, conventions, or constraints, ALWAYS reference the Genome first. If code contradicts Genome, flag it as a potential genome-change backlog item.\n8. If you notice the Genome is outdated or missing information relevant to your current task, inform the user and suggest running \`/reap.sync\`.\n</REAP_WORKFLOW>`;

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: reapContext
  }
}) + '\n');
