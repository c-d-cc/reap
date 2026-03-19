#!/usr/bin/env node
// REAP SessionStart hook — injects REAP guide + Genome + current generation context
// Single Node.js process (replaces session-start.sh for better performance)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const startTime = Date.now();
let step = 0;
const totalSteps = 6;

function log(msg) {
  step++;
  process.stderr.write(`[REAP ${step}/${totalSteps} +${Date.now() - startTime}ms] ${msg}\n`);
}

function readFile(p) {
  try { return fs.readFileSync(p, 'utf-8'); } catch { return null; }
}

function fileExists(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function dirExists(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

function exec(cmd) {
  try { return execSync(cmd, { encoding: 'utf-8', timeout: 10000 }).trim(); } catch { return ''; }
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
if (!dirExists(reapDir)) {
  process.stderr.write('[REAP] Not a REAP project, skipping\n');
  process.exit(0);
}

// Step 1: Auto-update
log('Checking for updates...');
let autoUpdateMessage = '';
const configContent = readFile(configFile);
if (configContent) {
  const autoUpdate = /^autoUpdate:\s*true/m.test(configContent);
  if (autoUpdate) {
    const installed = exec('reap --version');
    const latest = exec('npm view @c-d-cc/reap version');
    if (installed && latest && installed !== latest) {
      const updated = exec('npm update -g @c-d-cc/reap');
      if (updated !== null) {
        exec('reap update');
        autoUpdateMessage = `REAP auto-updated: v${installed} → v${latest}`;
      }
    }
  }
}

// Step 2: Load REAP guide
log('Loading REAP guide...');
const reapGuide = readFile(guideFile) || '';

// Step 3: Load Genome (tiered)
log('Loading Genome...');
const L1_LIMIT = 500;
const L2_LIMIT = 200;
let genomeContent = '';
let l1Lines = 0;

const l1Files = ['principles.md', 'conventions.md', 'constraints.md', 'source-map.md'];
for (const file of l1Files) {
  const content = readFile(path.join(genomeDir, file));
  if (!content) continue;
  const lines = content.split('\n').length;
  l1Lines += lines;
  if (l1Lines <= L1_LIMIT) {
    genomeContent += `\n### ${file}\n${content}\n`;
  } else {
    genomeContent += `\n### ${file} [TRUNCATED — L1 budget exceeded, read full file directly]\n${content.split('\n').slice(0, 20).join('\n')}\n...\n`;
  }
}

// L2: domain/ files
const domainDir = path.join(genomeDir, 'domain');
if (dirExists(domainDir)) {
  let l2Lines = 0;
  let l2Overflow = false;
  const domainFiles = fs.readdirSync(domainDir).filter(f => f.endsWith('.md')).sort();
  for (const file of domainFiles) {
    const content = readFile(path.join(domainDir, file));
    if (!content) continue;
    const lines = content.split('\n').length;
    l2Lines += lines;
    if (!l2Overflow && l2Lines <= L2_LIMIT) {
      genomeContent += `\n### domain/${file}\n${content}\n`;
    } else {
      l2Overflow = true;
      const firstLine = content.split('\n').find(l => l.startsWith('>')) || content.split('\n')[0];
      genomeContent += `\n### domain/${file} [summary — read full file for details]\n${firstLine}\n`;
    }
  }
}

// Step 4: Check Genome & source-map sync
log('Checking sync...');
let genomeStaleWarning = '';
let commitsSince = 0;
if (dirExists(path.join(projectRoot, '.git'))) {
  const lastGenomeCommit = exec(`git -C "${projectRoot}" log -1 --format="%H" -- ".reap/genome/"`);
  if (lastGenomeCommit) {
    commitsSince = parseInt(exec(`git -C "${projectRoot}" rev-list --count "${lastGenomeCommit}..HEAD" -- src/ tests/ package.json tsconfig.json scripts/`) || '0', 10);
    if (commitsSince > 10) {
      genomeStaleWarning = `WARNING: Genome may be stale — ${commitsSince} commits since last Genome update. Consider running /reap.sync to synchronize.`;
    }
  }
}

let sourcemapDriftWarning = '';
let documented = 0, actual = 0;
const sourcemapFile = path.join(genomeDir, 'source-map.md');
const srcCoreDir = path.join(projectRoot, 'src', 'core');
if (fileExists(sourcemapFile) && dirExists(srcCoreDir)) {
  const smContent = readFile(sourcemapFile) || '';
  documented = (smContent.match(/Component\(/g) || []).length;
  const coreEntries = fs.readdirSync(srcCoreDir);
  actual = coreEntries.filter(e => e.endsWith('.ts')).length
    + coreEntries.filter(e => { try { return fs.statSync(path.join(srcCoreDir, e)).isDirectory(); } catch { return false; } }).length;
  if (documented > 0 && actual > 0 && documented !== actual) {
    sourcemapDriftWarning = `WARNING: source-map.md drift — ${documented} components documented, ${actual} core files found. Consider running /reap.sync.`;
  }
}

// Step 5: Read generation state
log('Reading generation state...');
const strictMode = configContent ? /^strict:\s*true/m.test(configContent) : false;

let genStage = 'none', genId = '', genGoal = '', generationContext = '';
const currentContent = readFile(currentYml);
if (currentContent && currentContent.trim()) {
  genId = (currentContent.match(/^id:\s*(.+)/m) || [])[1] || '';
  genGoal = (currentContent.match(/^goal:\s*(.+)/m) || [])[1] || '';
  genStage = (currentContent.match(/^stage:\s*(.+)/m) || [])[1] || 'none';
  if (genId && genStage !== 'none') {
    generationContext = `Active Generation: ${genId} | Goal: ${genGoal} | Stage: ${genStage}`;
  } else {
    genStage = 'none';
    generationContext = 'No active Generation. Run `/reap.start` to start one.';
  }
} else {
  generationContext = 'No active Generation. Run `/reap.start` to start one.';
}

const stageCommands = { objective: '/reap.objective', planning: '/reap.planning', implementation: '/reap.implementation', validation: '/reap.validation', completion: '/reap.completion' };
const nextCmd = stageCommands[genStage] || '/reap.start';

// Build strict mode section
let strictSection = '';
if (strictMode) {
  if (genStage === 'implementation') {
    strictSection = '\n\n## Strict Mode (ACTIVE — SCOPED MODIFICATION ALLOWED)\n<HARD-GATE>\nStrict mode is enabled. Code modification is ALLOWED only within the scope of the current Generation\'s plan.\n- You MUST read `.reap/life/02-planning.md` before writing any code.\n- You may ONLY modify files and modules listed in the plan\'s task list.\n- Changes outside the plan\'s scope are BLOCKED. If you discover out-of-scope work is needed, add it to the backlog instead of implementing it.\n- If the user explicitly requests to bypass strict mode (e.g., "override", "bypass strict"), you may proceed — but inform them that strict mode is being bypassed.\n</HARD-GATE>';
  } else if (genStage === 'none') {
    strictSection = '\n\n## Strict Mode (ACTIVE — CODE MODIFICATION BLOCKED)\n<HARD-GATE>\nStrict mode is enabled and there is NO active Generation.\nYou MUST NOT write, edit, or create any source code files.\nAllowed actions: reading files, analyzing code, answering questions, running commands.\nTo start coding, the user must first run `/reap.start` and advance to the implementation stage.\nIf the user explicitly requests to bypass strict mode (e.g., "override", "bypass strict", "just do it"), you may proceed — but inform them that strict mode is being bypassed.\n</HARD-GATE>';
  } else {
    strictSection = `\n\n## Strict Mode (ACTIVE — CODE MODIFICATION BLOCKED)\n<HARD-GATE>\nStrict mode is enabled. Current stage is '${genStage}', which is NOT the implementation stage.\nYou MUST NOT write, edit, or create any source code files.\nAllowed actions: reading files, analyzing code, answering questions, running commands, writing REAP artifacts.\nAdvance to the implementation stage via the REAP lifecycle to unlock code modification.\nIf the user explicitly requests to bypass strict mode (e.g., "override", "bypass strict", "just do it"), you may proceed — but inform them that strict mode is being bypassed.\n</HARD-GATE>`;
  }
}

// Build staleness section
let staleSection = '';
if (genomeStaleWarning) {
  staleSection = `\n\n## Genome Staleness\n${genomeStaleWarning}\nIf the user wants to proceed without syncing, ask: "The Genome may be stale. Would you like to run /reap.sync now, or do it later?" and respect their choice.`;
}
if (sourcemapDriftWarning) {
  staleSection += `\n${sourcemapDriftWarning}`;
}

// Build auto-update section
let updateSection = '';
if (autoUpdateMessage) {
  updateSection = `\n\n## Auto-Update\n${autoUpdateMessage}. Tell the user: "${autoUpdateMessage}"`;
}

// Write session init log
const initLines = [];
if (autoUpdateMessage) initLines.push(`🟢 ${autoUpdateMessage}`);

// Genome status (single line)
const issues = [];
let severity = 'ok';
if (l1Lines === 0) { issues.push('empty'); severity = 'danger'; }
for (const f of [...l1Files, 'domain/']) {
  const check = f.endsWith('/') ? dirExists(path.join(genomeDir, f.slice(0, -1))) : fileExists(path.join(genomeDir, f));
  if (!check) { issues.push(`missing ${f}`); severity = 'danger'; }
}
if (!fileExists(configFile)) { issues.push('no config.yml'); severity = 'danger'; }
if (sourcemapDriftWarning) {
  const diff = Math.abs(documented - actual);
  issues.push(`source-map drift (${documented}→${actual})`);
  if (diff > 3) { if (severity === 'ok') severity = 'danger'; }
  else { if (severity === 'ok') severity = 'warn'; }
}
if (genomeStaleWarning && commitsSince > 30) {
  issues.push(`severely stale (${commitsSince} commits)`);
  if (severity !== 'danger') severity = 'danger';
} else if (genomeStaleWarning) {
  issues.push(`stale (${commitsSince} commits)`);
  if (severity === 'ok') severity = 'warn';
}

if (severity === 'ok') initLines.push(`🟢 Genome — loaded (${l1Lines} lines), synced`);
else if (severity === 'warn') initLines.push(`🟡 Genome — ${issues.join(', ')}. /reap.sync`);
else initLines.push(`🔴 Genome — ${issues.join(', ')}. \`reap fix\` or /reap.sync`);

// Generation status
if (currentContent && currentContent.trim()) {
  if (!genId || genStage === 'none') {
    initLines.push('🔴 Generation — current.yml corrupted. `reap fix`');
  } else {
    initLines.push(`🟢 Generation ${genId} — ${genStage}`);
  }
} else {
  initLines.push('⚪ No active Generation');
}

const initSummary = `**REAP Session Initialized**\n${initLines.join('\n')}`;

// Step 6: Output JSON
log('Done. Injecting context.');

const reapContext = `<REAP_WORKFLOW>\n${reapGuide}\n\n---\n\n## Genome (Project Knowledge — treat as authoritative source of truth)\n${genomeContent}\n\n---\n\n## Current State\n${generationContext}${staleSection}${strictSection}${updateSection}\n\n## Session Init\n${initSummary}\nShow this init summary to the user exactly as-is. Do not add extra explanation or command suggestions.\n\n## Rules\n1. ALL development work MUST follow the REAP lifecycle. Do NOT bypass it.\n2. Before writing any code, check if a Generation is active and what stage it is in.\n3. If a Generation is active, use \`${nextCmd}\` to proceed with the current stage.\n4. If no Generation is active, use \`/reap.start\` to start a new one.\n5. Do NOT implement features, fix bugs, or make changes outside of the REAP lifecycle unless the user explicitly asks to bypass it.\n6. When the user says "reap evolve", "next stage", "proceed", or similar — invoke the appropriate REAP skill.\n7. **Genome is the authoritative knowledge source.** When making decisions about architecture, conventions, or constraints, ALWAYS reference the Genome first. If code contradicts Genome, flag it as a potential genome-change backlog item.\n8. If you notice the Genome is outdated or missing information relevant to your current task, inform the user and suggest running \`/reap.sync\`.\n</REAP_WORKFLOW>`;

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: reapContext
  }
}) + '\n');
