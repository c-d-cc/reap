// REAP Genome Loader — shared logic for session-start hooks
// Used by session-start.cjs (Claude Code) and opencode-session-start.js (OpenCode)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const L1_LIMIT = 500;
const L2_LIMIT = 200;
const L1_FILES = ['principles.md', 'conventions.md', 'constraints.md', 'source-map.md'];
const STAGE_COMMANDS = {
  objective: '/reap.objective',
  planning: '/reap.planning',
  implementation: '/reap.implementation',
  validation: '/reap.validation',
  completion: '/reap.completion',
};

function readFile(p) {
  try { return fs.readFileSync(p, 'utf-8'); } catch { return null; }
}

function fileExists(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function dirExists(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

function exec(cmd, opts) {
  try { return execSync(cmd, { encoding: 'utf-8', timeout: 10000, ...opts }).trim(); } catch { return ''; }
}

/**
 * Load Genome content (L1 core files + L2 domain files) with line budget.
 * @param {string} genomeDir - path to .reap/genome/
 * @returns {{ content: string, l1Lines: number }}
 */
function loadGenome(genomeDir) {
  let content = '';
  let l1Lines = 0;

  // Check source-map.md header for custom line limit
  const smPath = path.join(genomeDir, 'source-map.md');
  let smLimit = null;
  const smContent = readFile(smPath);
  if (smContent) {
    const limitMatch = smContent.match(/줄 수 한도:\s*~?(\d+)줄/);
    if (limitMatch) smLimit = parseInt(limitMatch[1], 10);
  }

  for (const file of L1_FILES) {
    const fileContent = readFile(path.join(genomeDir, file));
    if (!fileContent) continue;
    const lines = fileContent.split('\n').length;
    const limit = (file === 'source-map.md' && smLimit) ? smLimit : L1_LIMIT;
    l1Lines += lines;
    if (l1Lines <= limit) {
      content += `\n### ${file}\n${fileContent}\n`;
    } else {
      content += `\n### ${file} [TRUNCATED — L1 budget exceeded, read full file directly]\n${fileContent.split('\n').slice(0, 20).join('\n')}\n...\n`;
    }
  }

  // L2: domain/ files
  const domainDir = path.join(genomeDir, 'domain');
  if (dirExists(domainDir)) {
    let l2Lines = 0;
    let l2Overflow = false;
    const domainFiles = fs.readdirSync(domainDir).filter(f => f.endsWith('.md')).sort();
    for (const file of domainFiles) {
      const fileContent = readFile(path.join(domainDir, file));
      if (!fileContent) continue;
      const lines = fileContent.split('\n').length;
      l2Lines += lines;
      if (!l2Overflow && l2Lines <= L2_LIMIT) {
        content += `\n### domain/${file}\n${fileContent}\n`;
      } else {
        l2Overflow = true;
        const firstLine = fileContent.split('\n').find(l => l.startsWith('>')) || fileContent.split('\n')[0];
        content += `\n### domain/${file} [summary — read full file for details]\n${firstLine}\n`;
      }
    }
  }

  return { content, l1Lines };
}

/**
 * Parse config.yml for strict mode and other settings.
 * strict supports: boolean (true/false) or object ({ edit: true, merge: false })
 * @param {string} configFile - path to .reap/config.yml
 * @returns {{ strictEdit: boolean, strictMerge: boolean, language: string, configContent: string|null }}
 */
function parseConfig(configFile) {
  const configContent = readFile(configFile);
  let strictEdit = false;
  let strictMerge = false;
  let language = '';
  if (configContent) {
    // Check for boolean shorthand: strict: true
    if (/^strict:\s*true$/m.test(configContent)) {
      strictEdit = true;
      strictMerge = true;
    }
    // Check for object form: strict:\n  edit: true\n  merge: true
    const editMatch = configContent.match(/^\s+edit:\s*(true|false)/m);
    const mergeMatch = configContent.match(/^\s+merge:\s*(true|false)/m);
    if (editMatch) strictEdit = editMatch[1] === 'true';
    if (mergeMatch) strictMerge = mergeMatch[1] === 'true';

    const langMatch = configContent.match(/^language:\s*(.+)$/m);
    if (langMatch) language = langMatch[1].trim();
  }
  return { strictEdit, strictMerge, language, configContent };
}

/**
 * Parse current.yml for generation state.
 * @param {string} currentYml - path to .reap/life/current.yml
 * @returns {{ genStage: string, genId: string, genGoal: string, generationContext: string, nextCmd: string }}
 */
function parseCurrentYml(currentYml) {
  let genStage = 'none', genId = '', genGoal = '', generationContext = '';
  const content = readFile(currentYml);
  if (content && content.trim()) {
    genId = (content.match(/^id:\s*(.+)/m) || [])[1] || '';
    genGoal = (content.match(/^goal:\s*(.+)/m) || [])[1] || '';
    genStage = (content.match(/^stage:\s*(.+)/m) || [])[1] || 'none';
    if (genId && genStage !== 'none') {
      generationContext = `Active Generation: ${genId} | Goal: ${genGoal} | Stage: ${genStage}`;
    } else {
      genStage = 'none';
      generationContext = 'No active Generation. Run `/reap.start` to start one.';
    }
  } else {
    generationContext = 'No active Generation. Run `/reap.start` to start one.';
  }
  const nextCmd = STAGE_COMMANDS[genStage] || '/reap.start';
  return { genStage, genId, genGoal, generationContext, nextCmd };
}

/**
 * Detect Genome staleness.
 * @param {string} projectRoot
 * @returns {{ genomeStaleWarning: string, commitsSince: number }}
 */
function detectStaleness(projectRoot) {
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

  return { genomeStaleWarning, commitsSince };
}

/**
 * Build strict mode section for context injection.
 * @param {boolean} strictEdit
 * @param {boolean} strictMerge
 * @param {string} genStage
 * @returns {string}
 */
function buildStrictSection(strictEdit, strictMerge, genStage) {
  let sections = '';

  if (strictEdit) {
    if (genStage === 'implementation') {
      sections += "\n\n## Strict Mode — Edit (ACTIVE — SCOPED MODIFICATION ALLOWED)\n<HARD-GATE>\nStrict mode is enabled. Code modification is ALLOWED only within the scope of the current Generation's plan.\n- You MUST read `.reap/life/02-planning.md` before writing any code.\n- You may ONLY modify files and modules listed in the plan's task list.\n- Changes outside the plan's scope are BLOCKED. If you discover out-of-scope work is needed, add it to the backlog instead of implementing it.\n- If the user explicitly requests to bypass strict mode (e.g., \"override\", \"bypass strict\"), you may proceed — but inform them that strict mode is being bypassed.\n</HARD-GATE>";
    } else if (genStage === 'none') {
      sections += "\n\n## Strict Mode — Edit (ACTIVE — CODE MODIFICATION BLOCKED)\n<HARD-GATE>\nStrict mode is enabled and there is NO active Generation.\nYou MUST NOT write, edit, or create any source code files.\nAllowed actions: reading files, analyzing code, answering questions, running commands.\nTo start coding, the user must first run `/reap.start` and advance to the implementation stage.\nIf the user explicitly requests to bypass strict mode (e.g., \"override\", \"bypass strict\", \"just do it\"), you may proceed — but inform them that strict mode is being bypassed.\n</HARD-GATE>";
    } else {
      sections += `\n\n## Strict Mode — Edit (ACTIVE — CODE MODIFICATION BLOCKED)\n<HARD-GATE>\nStrict mode is enabled. Current stage is '${genStage}', which is NOT the implementation stage.\nYou MUST NOT write, edit, or create any source code files.\nAllowed actions: reading files, analyzing code, answering questions, running commands, writing REAP artifacts.\nAdvance to the implementation stage via the REAP lifecycle to unlock code modification.\nIf the user explicitly requests to bypass strict mode (e.g., \"override\", \"bypass strict\", \"just do it\"), you may proceed — but inform them that strict mode is being bypassed.\n</HARD-GATE>`;
    }
  }

  if (strictMerge) {
    sections += "\n\n## Strict Mode — Merge (ACTIVE)\nDirect git pull, git push, and git merge commands are restricted.\nUse REAP slash commands instead: `/reap.pull`, `/reap.push`, `/reap.merge.start`.\nThis ensures genome-first conflict resolution and proper lineage tracking.\nIf the user explicitly requests to bypass (e.g., \"override\", \"bypass strict\"), you may proceed — but inform them that strict merge mode is being bypassed.";
  }

  return sections;
}

/**
 * Build Genome health status for session init display.
 * @param {object} params
 * @returns {{ initLines: string[], severity: string }}
 */
function buildGenomeHealth({ l1Lines, genomeDir, configFile, genomeStaleWarning, commitsSince }) {
  const issues = [];
  let severity = 'ok';
  if (l1Lines === 0) { issues.push('empty'); severity = 'danger'; }
  for (const f of [...L1_FILES, 'domain/']) {
    const check = f.endsWith('/') ? dirExists(path.join(genomeDir, f.slice(0, -1))) : fileExists(path.join(genomeDir, f));
    if (!check) { issues.push(`missing ${f}`); severity = 'danger'; }
  }
  if (!fileExists(configFile)) { issues.push('no config.yml'); severity = 'danger'; }
  if (genomeStaleWarning && commitsSince > 30) {
    issues.push(`severely stale (${commitsSince} commits)`);
    if (severity !== 'danger') severity = 'danger';
  } else if (genomeStaleWarning) {
    issues.push(`stale (${commitsSince} commits)`);
    if (severity === 'ok') severity = 'warn';
  }

  const initLines = [];
  if (severity === 'ok') initLines.push(`🟢 Genome — loaded (${l1Lines} lines), synced`);
  else if (severity === 'warn') initLines.push(`🟡 Genome — ${issues.join(', ')}. /reap.sync`);
  else initLines.push(`🔴 Genome — ${issues.join(', ')}. \`reap fix\` or /reap.sync`);

  return { initLines, severity };
}

module.exports = {
  L1_LIMIT,
  L2_LIMIT,
  L1_FILES,
  STAGE_COMMANDS,
  readFile,
  fileExists,
  dirExists,
  exec,
  loadGenome,
  parseConfig,
  parseCurrentYml,
  detectStaleness,
  buildStrictSection,
  buildGenomeHealth,
};
