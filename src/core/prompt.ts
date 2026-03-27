import type { ReapPaths } from "./paths.js";
import type { GenerationState, ReapConfig } from "../types/index.js";
import { readTextFile } from "./fs.js";
import {
  detectMaturity,
  getMaturityBehaviorGuide,
  formatCompletionCriteria,
} from "./maturity.js";
import type { ClarityResult } from "./clarity.js";
import { getClarityGuide } from "./clarity.js";

// ── Types ────────────────────────────────────────────────────

export interface ReapKnowledge {
  visionGoals: string;
  memoryShortterm: string;
  memoryMidterm: string;
}

// ── Load ─────────────────────────────────────────────────────

/**
 * Load minimal REAP knowledge for subagent prompt.
 * Guide, genome, environment are NOT loaded here — subagent reads them from files via CLAUDE.md.
 * Only vision goals and memory (small, session-critical) are included in the prompt.
 */
export async function loadReapKnowledge(paths: ReapPaths): Promise<ReapKnowledge> {
  const [visionGoals, memoryShortterm, memoryMidterm] = await Promise.all([
    readTextFile(paths.visionGoals),
    readTextFile(paths.memoryShortterm),
    readTextFile(paths.memoryMidterm),
  ]);

  return {
    visionGoals: visionGoals ?? "",
    memoryShortterm: memoryShortterm ?? "",
    memoryMidterm: memoryMidterm ?? "",
  };
}

// ── Strict Mode ─────────────────────────────────────────────

/**
 * Build strict mode HARD-GATE sections for the prompt.
 * Ported from v0.15 genome-loader.cjs:220-238.
 */
export function buildStrictSection(
  strictEdit: boolean,
  strictMerge: boolean,
  stage: string,
): string {
  let sections = "";

  if (strictEdit) {
    if (stage === "implementation") {
      sections += `\n\n## Strict Mode — Edit (ACTIVE — SCOPED MODIFICATION ALLOWED)\n<HARD-GATE>\nStrict mode is enabled. Code modification is ALLOWED only within the scope of the current Generation's plan.\n- You MUST read \`.reap/life/02-planning.md\` before writing any code.\n- You may ONLY modify files and modules listed in the plan's task list.\n- Changes outside the plan's scope are BLOCKED. If you discover out-of-scope work is needed, add it to the backlog instead of implementing it.\n- If the user explicitly requests to bypass strict mode (e.g., "override", "bypass strict"), you may proceed for that specific action only — but inform them that strict mode is being bypassed. The bypass does NOT persist; strict mode re-engages immediately after the requested action is complete.\n</HARD-GATE>`;
    } else if (stage === "none") {
      sections += `\n\n## Strict Mode — Edit (ACTIVE — CODE MODIFICATION BLOCKED)\n<HARD-GATE>\nStrict mode is enabled and there is NO active Generation.\nYou MUST NOT write, edit, or create any source code files.\nAllowed actions: reading files, analyzing code, answering questions, running commands.\nTo start coding, the user must first run \`/reap.start\` and advance to the implementation stage.\nIf the user explicitly requests to bypass strict mode (e.g., "override", "bypass strict", "just do it"), you may proceed for that specific action only — but inform them that strict mode is being bypassed. The bypass does NOT persist; strict mode re-engages immediately after the requested action is complete.\n</HARD-GATE>`;
    } else {
      sections += `\n\n## Strict Mode — Edit (ACTIVE — CODE MODIFICATION BLOCKED)\n<HARD-GATE>\nStrict mode is enabled. Current stage is '${stage}', which is NOT the implementation stage.\nYou MUST NOT write, edit, or create any source code files.\nAllowed actions: reading files, analyzing code, answering questions, running commands, writing REAP artifacts.\nAdvance to the implementation stage via the REAP lifecycle to unlock code modification.\nIf the user explicitly requests to bypass strict mode (e.g., "override", "bypass strict", "just do it"), you may proceed for that specific action only — but inform them that strict mode is being bypassed. The bypass does NOT persist; strict mode re-engages immediately after the requested action is complete.\n</HARD-GATE>`;
    }
  }

  if (strictMerge) {
    sections += `\n\n## Strict Mode — Merge (ACTIVE)\n<HARD-GATE>\nDirect git pull, git push, and git merge commands are restricted.\nUse REAP slash commands instead: \`/reap.pull\`, \`/reap.push\`, \`/reap.merge\`.\nThis ensures genome-first conflict resolution and proper lineage tracking.\nIf the user explicitly requests to bypass (e.g., "override", "bypass strict"), you may proceed for that specific action only — but inform them that strict merge mode is being bypassed. The bypass does NOT persist; strict mode re-engages immediately after the requested action is complete.\n</HARD-GATE>`;
  }

  return sections;
}

// ── Build ────────────────────────────────────────────────────

/**
 * Build the dynamic context prompt for the subagent.
 * Static rules are now in the reap-evolve agent definition (.claude/agents/reap-evolve.md).
 * This function only generates runtime-dependent context.
 */
export function buildBasePrompt(
  knowledge: ReapKnowledge,
  paths: ReapPaths,
  state: GenerationState | null,
  cruiseCount?: string,
  clarityResult?: ClarityResult,
  config?: ReapConfig | null,
): string {
  const lines: string[] = [];
  const isMerge = state?.type === "merge";

  // ── Vision Goals ──────────────────────────────────────────
  if (knowledge.visionGoals) {
    lines.push("## Vision Goals");
    lines.push(knowledge.visionGoals);
    lines.push("");
  }

  // ── Memory ────────────────────────────────────────────────
  if (knowledge.memoryShortterm || knowledge.memoryMidterm) {
    lines.push("## Memory");
    if (knowledge.memoryShortterm) {
      lines.push("### Shortterm (1-2 sessions)");
      lines.push(knowledge.memoryShortterm);
      lines.push("");
    }
    if (knowledge.memoryMidterm) {
      lines.push("### Midterm (multi-generation)");
      lines.push(knowledge.memoryMidterm);
      lines.push("");
    }
  }

  // ── Current State ─────────────────────────────────────────
  lines.push("## Current State");
  if (state) {
    lines.push(`- Generation: ${state.id}`);
    lines.push(`- Type: ${state.type}`);
    lines.push(`- Goal: ${state.goal}`);
    lines.push(`- Stage: ${state.stage}`);
    if (isMerge) {
      lines.push(`- Parents: ${state.parents.join(", ")}`);
      if (state.commonAncestor) lines.push(`- Common Ancestor: ${state.commonAncestor}`);
    }
  } else {
    lines.push("- No active generation. Run `reap run start --goal \"<goal>\"` first.");
  }
  lines.push("");

  // ── Generation Type ───────────────────────────────────────
  lines.push("## Generation Type");
  if (state?.type === "embryo") {
    lines.push("This is an **embryo** generation. Genome modifications are freely allowed during any stage.");
  } else if (isMerge) {
    lines.push("This is a **merge** generation. Genome is mutable only during the mate stage. Use backlog for other genome changes.");
  } else {
    lines.push("This is a **normal** generation. Genome is immutable during the generation. Use backlog for genome changes.");
  }
  lines.push("");

  // ── Maturity Behavior Guide ───────────────────────────────
  if (state && !isMerge) {
    const maturity = detectMaturity(state.type, cruiseCount);
    lines.push("## Maturity Behavior Guide");
    lines.push("");
    lines.push(getMaturityBehaviorGuide(maturity));
    lines.push("");

    if (maturity === "bootstrap") {
      lines.push("## Software Completion Criteria");
      lines.push("");
      lines.push("Use these criteria to assess and guide the project toward completeness:");
      lines.push(formatCompletionCriteria());
      lines.push("");
    }
  }

  // ── Clarity ───────────────────────────────────────────────
  if (clarityResult) {
    lines.push("## Clarity Assessment");
    lines.push("");
    lines.push(getClarityGuide(clarityResult));
    lines.push("");
  }

  // ── Cruise Loop ───────────────────────────────────────────
  if (cruiseCount) {
    lines.push("## Cruise Loop — Auto-Continuation");
    lines.push("");
    lines.push(`Current cruise: ${cruiseCount}`);
    lines.push("");
    lines.push("Cruise mode is active. After completing the current generation, automatically start the next one.");
    lines.push("");
    lines.push("### After Completion Commit:");
    lines.push("1. Check the `cruiseActive` field in the completion commit output context.");
    lines.push("2. If `cruiseActive: true`:");
    lines.push("   a. **Re-read knowledge**: genome/, environment/summary.md, vision/goals.md, memory/ — these may have changed during the previous generation.");
    lines.push("   b. Scan backlog to determine the next goal.");
    lines.push("   c. Pick the highest-priority unchecked vision goal (prefer goals with related backlog items).");
    lines.push("   d. If no candidate goal found, **stop cruise** and report to the human.");
    lines.push('   e. Run: `reap run start --phase create --goal "<selected goal>"`');
    lines.push("   f. Execute the full lifecycle again (learning → planning → implementation → validation → completion).");
    lines.push("   g. Repeat from step 1.");
    lines.push("3. If `cruiseActive: false`: cruise is complete. Report final summary.");
    lines.push("4. If any error occurs or self-assessment indicates uncertainty/risk: **stop cruise** immediately and report to the human.");
    lines.push("");
    lines.push("### Auto Goal Selection:");
    lines.push("- Use vision/goals.md unchecked items as candidates.");
    lines.push("- Cross-reference with pending backlog items for priority boost.");
    lines.push("- Select the top candidate. If multiple candidates have equal priority, pick the first one.");
    lines.push("- The selected goal should be concise and actionable.");
    lines.push("");
    lines.push("### Cruise Stop Conditions:");
    lines.push("- `cruiseActive: false` from completion commit (count exhausted)");
    lines.push("- No unchecked vision goals available");
    lines.push("- Error during any lifecycle stage");
    lines.push("- Self-assessment during fitness phase indicates uncertainty or risk");
    lines.push("- Critical architectural decision needed that wasn't planned");
    lines.push("");
  }

  // ── Strict Mode ─────────────────────────────────────────
  if (config) {
    const strictStage = state ? state.stage : "none";
    const strictSection = buildStrictSection(
      config.strictEdit ?? false,
      config.strictMerge ?? false,
      strictStage,
    );
    if (strictSection) {
      lines.push(strictSection.trimStart());
      lines.push("");
    }
  }

  // ── Project Path ──────────────────────────────────────────
  lines.push("## Project");
  lines.push(`Path: ${paths.root}`);

  return lines.join("\n");
}
