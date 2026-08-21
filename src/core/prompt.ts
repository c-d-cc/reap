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
  generationType?: string,
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
    // Merge generations need git merge — bypass strict merge restriction
    if (generationType === "merge") {
      sections += `\n\n## Strict Mode — Merge (BYPASSED — Merge Generation)\nStrict merge mode is enabled but automatically bypassed for this merge generation.\nDirect \`git merge\` is ALLOWED because the purpose of a merge generation is to perform git merge.\n\`git pull\` and \`git push\` remain restricted — use \`/reap.pull\` and \`/reap.push\` instead.`;
    } else {
      sections += `\n\n## Strict Mode — Merge (ACTIVE)\n<HARD-GATE>\nDirect git pull, git push, and git merge commands are restricted.\nUse REAP slash commands instead: \`/reap.pull\`, \`/reap.push\`, \`/reap.merge\`.\nThis ensures genome-first conflict resolution and proper lineage tracking.\nIf the user explicitly requests to bypass (e.g., "override", "bypass strict"), you may proceed for that specific action only — but inform them that strict merge mode is being bypassed. The bypass does NOT persist; strict mode re-engages immediately after the requested action is complete.\n</HARD-GATE>`;
    }
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
      state?.type,
    );
    if (strictSection) {
      lines.push(strictSection.trimStart());
      lines.push("");
    }
  }

  // ── Code Intelligence ─────────────────────────────────────
  // The commands below are the ones the agent will type, so they are also the
  // ones the e2e suite runs verbatim.
  lines.push("## Code Intelligence");
  lines.push("");
  lines.push("REAP ships a code index. Prefer it over full-text search for symbol-shaped questions.");
  lines.push("");
  lines.push("- `reap index status` — symbol/edge counts, the import resolution rate, and the commit the index describes.");
  lines.push("- `reap index search <query>` — find a definition. Returns `file:line`; Read it directly.");
  lines.push("- `reap index impact <file>` — what breaks if you change this file. Ask BEFORE editing a shared module.");
  lines.push("- `reap index callers <symbolId>` — who calls this. A symbolId looks like `src/core/lifecycle.ts::nextStage`.");
  lines.push("- `reap index callees <symbolId>` — what this calls.");
  lines.push("");
  lines.push("Queries refresh the index themselves when HEAD has moved, so there is nothing to start and nothing to keep fresh.");
  lines.push("");
  lines.push("Two things it will not tell you. The index is keyed by **commit**, so symbols you have written but not committed are absent — use Grep for those. And a low `import resolution rate` in `status` means the graph is incomplete, so treat an empty `impact` result as unknown rather than as none.");
  lines.push("");

  // ── Project Path ──────────────────────────────────────────
  lines.push("## Project");
  lines.push(`Path: ${paths.root}`);

  return lines.join("\n");
}

// ── Evaluator Prompt ────────────────────────────────────────

export interface EvaluatorPromptOptions {
  /**
   * The lifecycle stage that is invoking the evaluator. The evaluator's
   * verification framing differs between stages:
   *  - `"validation"`: independent verification of the builder's validation
   *    work (build/typecheck/tests + completion criteria from 02-planning.md).
   *  - `"fitness"`: cross-generation fitness assessment using the 6 dimensions
   *    in reap-evaluate.md (goal achievement, code quality, regression safety,
   *    artifact quality, vision alignment, cross-generation coherence).
   *
   * gen-066 wires only the `"validation"` invocation. The `"fitness"` branch
   * is included so the same builder can be reused without re-design when the
   * follow-up backlog (`cruise-mode-evaluator-escalation-통합-validationfitness.md`)
   * lands. Until then, callers should pass `"validation"`.
   */
  stage: "validation" | "fitness";
}

/**
 * Build the dynamic context prompt for the `reap-evaluate` subagent.
 *
 * The evaluator is an independent reviewer (fresh context, read-only) that
 * surfaces concerns the builder cannot see. This prompt provides only the
 * dynamic context — the static role/behavior is in `~/.claude/agents/reap-evaluate.md`
 * (Claude Code) or `~/.config/opencode/agent/reap-evaluate.md` (OpenCode).
 *
 * Design (gen-051): produces a string consumable as a subagent prompt. Output
 * deliberately excludes strict mode, cruise loop, clarity guide, and maturity
 * guide — those are builder concerns, not evaluator concerns. The evaluator's
 * own behavior rules (no code modification, no git modification, no quantitative
 * metrics, advisor-not-verdict) live in the static agent definition.
 *
 * Advisor framing: the HARD-GATE section reminds the evaluator that its
 * assessment is a recommendation. The builder owns the final lifecycle verdict.
 */
export function buildEvaluatorPrompt(
  knowledge: ReapKnowledge,
  paths: ReapPaths,
  state: GenerationState | null,
  opts: EvaluatorPromptOptions,
): string {
  const lines: string[] = [];
  const isMerge = state?.type === "merge";

  // ── Stage context ─────────────────────────────────────────
  lines.push(`## Evaluator Invocation — ${opts.stage} stage`);
  lines.push("");
  if (opts.stage === "validation") {
    lines.push(
      "You are being invoked during the **validation** stage of a REAP generation. " +
        "The builder (reap-evolve) has completed implementation and run validation checks. " +
        "Your role is independent verification: confirm the build is sound, tests pass, " +
        "completion criteria from 02-planning.md are met, and the code changes follow " +
        "genome conventions. Surface any concern the builder may have missed.",
    );
  } else {
    lines.push(
      "You are being invoked during the **fitness** phase of completion. " +
        "Assess the generation against the 6 fitness dimensions in your agent definition " +
        "(goal achievement, code quality, regression safety, artifact quality, vision alignment, " +
        "cross-generation coherence). Cross-reference with vision goals and recent lineage.",
    );
  }
  lines.push("");

  // ── Current State ─────────────────────────────────────────
  lines.push("## Current Generation");
  if (state) {
    lines.push(`- ID: ${state.id}`);
    lines.push(`- Type: ${state.type}`);
    lines.push(`- Goal: ${state.goal}`);
    lines.push(`- Stage: ${state.stage}`);
    if (isMerge) {
      lines.push(`- Parents: ${state.parents.join(", ")}`);
      if (state.commonAncestor) lines.push(`- Common Ancestor: ${state.commonAncestor}`);
    }
  } else {
    lines.push("- (no active generation — abort and report to the user)");
  }
  lines.push("");

  // ── Artifacts to read ─────────────────────────────────────
  lines.push("## Artifacts to Read");
  lines.push("");
  if (isMerge) {
    lines.push(`- ${paths.artifact("01-detect.md")}`);
    lines.push(`- ${paths.artifact("02-mate.md")}`);
    lines.push(`- ${paths.artifact("03-merge.md")}`);
    lines.push(`- ${paths.artifact("04-reconcile.md")}`);
    lines.push(`- ${paths.artifact("05-validation.md")}`);
  } else {
    lines.push(`- ${paths.artifact("01-learning.md")}`);
    lines.push(`- ${paths.artifact("02-planning.md")}`);
    lines.push(`- ${paths.artifact("03-implementation.md")}`);
    lines.push(`- ${paths.artifact("04-validation.md")}`);
  }
  lines.push("");

  // ── Vision Goals ──────────────────────────────────────────
  if (knowledge.visionGoals) {
    lines.push("## Vision Goals (current)");
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

  // ── Verification tasks ────────────────────────────────────
  lines.push("## Verification Tasks");
  lines.push("");
  if (opts.stage === "validation") {
    lines.push("1. Run `npm run typecheck` (or the project's typecheck command) and record the result.");
    lines.push("2. Run `npm run build` (or the project's build command) and record the result.");
    lines.push("3. Run the full test suite (unit/e2e/scenario as defined by the project) and record each.");
    lines.push("4. Read 02-planning.md and verify each completion criterion against the implementation + validation artifacts.");
    lines.push("5. Read `git diff` against the parent commit and check for genome convention compliance.");
    lines.push("6. Check 04-validation.md for sycophancy red flags (\"it will probably pass\", \"it passed before\").");
    lines.push("");
  } else {
    lines.push("1. Read all completed artifacts and validate goal achievement.");
    lines.push("2. Cross-reference the implementation against genome conventions (application.md, evolution.md).");
    lines.push("3. Run the test suite and confirm no regression.");
    lines.push("4. Compare this generation's contribution against vision/goals.md and recent lineage.");
    lines.push("5. Assess each of the 6 fitness dimensions qualitatively (no scores).");
    lines.push("");
  }

  // ── Output format ─────────────────────────────────────────
  lines.push("## Output Format");
  lines.push("");
  lines.push("Apply the escalation matrix from your agent definition:");
  lines.push("");
  lines.push("| Confidence | Impact | Action |");
  lines.push("| --- | --- | --- |");
  lines.push("| High | Low | Direct judgment |");
  lines.push("| High | High | Escalate with judgment |");
  lines.push("| Low | Any | Escalate without judgment (facts only) |");
  lines.push("");
  lines.push("Structure your reply as:");
  lines.push("- **Summary** (1-2 sentences)");
  lines.push("- **Verification results** (typecheck / build / tests / criteria)");
  lines.push("- **Concerns** (if any — call out the severity)");
  lines.push("- **Recommendation** (per the matrix)");
  lines.push("");

  // ── HARD-GATE ─────────────────────────────────────────────
  lines.push("## HARD-GATE — Evaluator Constraints");
  lines.push("");
  lines.push("- You MUST NOT write, edit, or create any source files. Use Read/Grep/Glob/Bash only.");
  lines.push("- You MUST NOT run git commands that modify state (`git commit`, `git push`, `git checkout`, `git reset`).");
  lines.push("- You MUST NOT run `reap run` commands — the lifecycle is the builder's responsibility.");
  lines.push("- You MUST NOT produce numerical scores, ratings, or percentages (Goodhart's Law).");
  lines.push("- Your verdict is an **advisor recommendation**, not a binding judgment. The builder owns the lifecycle verdict; the human owns final fitness.");
  lines.push("");

  // ── Fallback ──────────────────────────────────────────────
  lines.push("## If You Cannot Proceed");
  lines.push("");
  lines.push(
    "If you cannot complete verification (missing tools, broken state, ambiguous artifacts), " +
      "report the obstacle in your reply with enough context for the human to act. Do not block " +
      "the builder's lifecycle — the builder will continue validation if you cannot.",
  );
  lines.push("");

  // ── Project Path ──────────────────────────────────────────
  lines.push("## Project");
  lines.push(`Path: ${paths.root}`);

  return lines.join("\n");
}
