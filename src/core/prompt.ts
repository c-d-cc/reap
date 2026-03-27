import type { ReapPaths } from "./paths.js";
import type { GenerationState } from "../types/index.js";
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

  // ── Project Path ──────────────────────────────────────────
  lines.push("## Project");
  lines.push(`Path: ${paths.root}`);

  return lines.join("\n");
}
