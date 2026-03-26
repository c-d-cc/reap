import type { BacklogItem } from "./backlog.js";
import type { LineageGoal } from "./lineage.js";
import { SOFTWARE_COMPLETION_CRITERIA } from "./maturity.js";

// ── Types ────────────────────────────────────────────────────

export interface VisionGoal {
  title: string;
  checked: boolean;
  section: string;
  raw: string;
}

export interface NextGoalCandidate {
  title: string;
  section: string;
  reason: string;
  relatedBacklog?: string;
}

// ── Stop words for keyword matching ──────────────────────────

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been",
  "do", "does", "did", "will", "would", "could", "should",
  "in", "on", "at", "to", "for", "of", "with", "by", "from",
  "and", "or", "not", "but", "if", "then", "so", "as",
  "this", "that", "it", "its", "they", "them",
  "—", "-", "+", "/", "\\", "(", ")", "[", "]",
  "등", "및", "의", "에", "에서", "를", "을", "가", "이", "는", "은", "로", "으로",
  "한", "할", "하는", "된", "되는", "위한",
]);

// ── Parse ────────────────────────────────────────────────────

/**
 * Parse goals.md content into structured VisionGoal array.
 * Expects markdown with ### sections containing `- [x]` or `- [ ]` checkboxes.
 */
export function parseGoals(content: string): VisionGoal[] {
  const goals: VisionGoal[] = [];
  let currentSection = "";

  for (const line of content.split("\n")) {
    // Track section headers (### level)
    const sectionMatch = line.match(/^###\s+(.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    // Match checkbox items
    const checkboxMatch = line.match(/^-\s+\[([ x])\]\s+(.+)/);
    if (checkboxMatch) {
      goals.push({
        title: checkboxMatch[2].trim(),
        checked: checkboxMatch[1] === "x",
        section: currentSection,
        raw: line,
      });
    }
  }

  return goals;
}

// ── Find Completed Goals ─────────────────────────────────────

/**
 * Find unchecked vision goals that match the current generation's work.
 * Uses keyword overlap scoring between generation goal/result and vision goal titles.
 */
export function findCompletedGoals(
  goals: VisionGoal[],
  genGoal: string,
  genResult?: string,
): VisionGoal[] {
  const unchecked = goals.filter((g) => !g.checked);
  if (unchecked.length === 0) return [];

  const sourceText = genResult ? `${genGoal} ${genResult}` : genGoal;
  const sourceTokens = tokenize(sourceText);
  if (sourceTokens.length === 0) return [];

  const matches: Array<{ goal: VisionGoal; score: number }> = [];

  for (const goal of unchecked) {
    const goalTokens = tokenize(goal.title);
    if (goalTokens.length === 0) continue;

    const overlap = goalTokens.filter((t) => sourceTokens.includes(t));
    const score = overlap.length / goalTokens.length;

    if (score >= 0.3) {
      matches.push({ goal, score });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  return matches.map((m) => m.goal);
}

// ── Suggest Next Goals ───────────────────────────────────────

/**
 * Suggest next generation candidates from unchecked vision goals + pending backlog.
 * Prioritizes goals with related backlog items and earlier sections.
 */
export function suggestNextGoals(
  goals: VisionGoal[],
  pendingBacklog: BacklogItem[],
): NextGoalCandidate[] {
  const unchecked = goals.filter((g) => !g.checked);
  if (unchecked.length === 0) return [];

  const candidates: Array<{ candidate: NextGoalCandidate; priority: number }> = [];

  for (const goal of unchecked) {
    const goalTokens = tokenize(goal.title);
    let priority = 0;
    let relatedBacklog: string | undefined;
    let reason = `Vision gap: unchecked in "${goal.section}"`;

    // Check backlog cross-reference
    for (const item of pendingBacklog) {
      if (item.status !== "pending") continue;
      const backlogTokens = tokenize(item.title);
      const overlap = goalTokens.filter((t) => backlogTokens.includes(t));
      const score = backlogTokens.length > 0 ? overlap.length / backlogTokens.length : 0;

      if (score >= 0.2) {
        relatedBacklog = item.filename;
        priority += 10;
        reason = `Vision gap with backlog match: "${item.title}"`;

        // Boost by backlog priority
        if (item.priority === "high") priority += 5;
        else if (item.priority === "medium") priority += 2;
        break;
      }
    }

    candidates.push({
      candidate: {
        title: goal.title,
        section: goal.section,
        reason,
        relatedBacklog,
      },
      priority,
    });
  }

  // Sort by priority descending, return top 3
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates.slice(0, 3).map((c) => c.candidate);
}

// ── Build Vision Gap Analysis ────────────────────────────────

/**
 * Build a structured text block for the adapt phase prompt.
 * Includes: completed goal suggestions, unchecked summary, next candidates.
 */
export function buildVisionGapAnalysis(
  goals: VisionGoal[],
  pendingBacklog: BacklogItem[],
  genGoal: string,
  genResult?: string,
): string {
  const lines: string[] = [];

  // ── Section 1: Completed goal check suggestions ──
  const completed = findCompletedGoals(goals, genGoal, genResult);
  if (completed.length > 0) {
    lines.push("### Vision Goals — Completed in This Generation");
    lines.push("");
    lines.push("The following unchecked vision goals appear to match this generation's work.");
    lines.push("**Mark them as `[x]` in vision/goals.md** if confirmed:");
    lines.push("");
    for (const g of completed) {
      lines.push(`- [ → x ] ${g.title} (section: ${g.section})`);
    }
    lines.push("");
  }

  // ── Section 2: Unchecked goals summary ──
  const unchecked = goals.filter((g) => !g.checked);
  const checked = goals.filter((g) => g.checked);
  lines.push("### Vision Goals — Progress Summary");
  lines.push("");
  lines.push(`- Completed: ${checked.length}/${goals.length}`);
  lines.push(`- Remaining: ${unchecked.length}/${goals.length}`);
  lines.push("");

  if (unchecked.length > 0) {
    // Group by section
    const bySection = new Map<string, VisionGoal[]>();
    for (const g of unchecked) {
      const section = g.section || "(no section)";
      if (!bySection.has(section)) bySection.set(section, []);
      bySection.get(section)!.push(g);
    }

    lines.push("**Remaining by section:**");
    for (const [section, items] of bySection) {
      lines.push(`- **${section}** (${items.length}):`);
      for (const item of items) {
        lines.push(`  - ${item.title}`);
      }
    }
    lines.push("");
  }

  // ── Section 3: Next generation candidates ──
  const candidates = suggestNextGoals(goals, pendingBacklog);
  if (candidates.length > 0) {
    lines.push("### Next Generation Candidates (auto-suggested)");
    lines.push("");
    lines.push("Based on vision gaps and pending backlog:");
    lines.push("");
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      lines.push(`${i + 1}. **${c.title}** (${c.section})`);
      lines.push(`   - Reason: ${c.reason}`);
      if (c.relatedBacklog) {
        lines.push(`   - Related backlog: \`${c.relatedBacklog}\``);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ── Project Diagnosis Prompt ─────────────────────────────────

/**
 * Build a structured diagnosis prompt for the adapt phase.
 * Asks AI to qualitatively assess each of the 16 completion criteria.
 * No numeric scores — qualitative descriptions only (Goodhart's Law).
 */
export function buildDiagnosisPrompt(): string {
  const lines: string[] = [];

  lines.push("### Project Diagnosis — Software Completion Criteria");
  lines.push("");
  lines.push("Assess the project's current state against each criterion below.");
  lines.push("Write a brief qualitative evaluation (1-2 sentences) for each applicable criterion.");
  lines.push("Skip criteria that are not applicable to this project (e.g., Visual verification for CLI tools).");
  lines.push("**Do NOT use numeric scores** — describe the current state in words.");
  lines.push("");
  lines.push("Record your assessment in the completion artifact under a `## Project Diagnosis` section:");
  lines.push("");

  for (const c of SOFTWARE_COMPLETION_CRITERIA) {
    lines.push(`${c.id}. **${c.name}** — ${c.description}`);
  }

  lines.push("");
  lines.push("Format: `- **{name}**: {qualitative assessment}`");
  lines.push("");

  return lines.join("\n");
}

// ── Lineage Bias Analysis ────────────────────────────────────

/**
 * Analyze recent generation goals against vision sections to detect bias.
 * Maps each generation's goal to vision sections using keyword overlap,
 * then identifies over-concentrated and neglected areas.
 */
export function analyzeLineageBias(
  lineageGoals: LineageGoal[],
  visionGoals: VisionGoal[],
  recentCount: number = 10,
): string {
  const lines: string[] = [];

  // Get unique vision sections
  const sections = [...new Set(visionGoals.map((g) => g.section).filter(Boolean))];
  if (sections.length === 0 || lineageGoals.length === 0) return "";

  // Take recent N generations
  const recent = lineageGoals.slice(-recentCount);
  if (recent.length === 0) return "";

  // Map each recent gen goal to vision sections
  const sectionHits = new Map<string, number>();
  const unmappedGoals: string[] = [];

  for (const section of sections) {
    sectionHits.set(section, 0);
  }

  for (const gen of recent) {
    const genTokens = tokenize(gen.goal);
    if (genTokens.length === 0) continue;

    let matched = false;

    for (const section of sections) {
      // Collect tokens from all goals in this section
      const sectionGoals = visionGoals.filter((g) => g.section === section);
      const sectionTokens = sectionGoals.flatMap((g) => tokenize(g.title));
      if (sectionTokens.length === 0) continue;

      const overlap = genTokens.filter((t) => sectionTokens.includes(t));
      const score = overlap.length / genTokens.length;

      if (score >= 0.15) {
        sectionHits.set(section, (sectionHits.get(section) ?? 0) + 1);
        matched = true;
      }
    }

    if (!matched) {
      unmappedGoals.push(gen.id);
    }
  }

  lines.push("### Lineage Bias Analysis");
  lines.push("");
  lines.push(`Analyzed the last ${recent.length} generation(s) for vision section coverage:`);
  lines.push("");

  // Show distribution
  const totalHits = [...sectionHits.values()].reduce((a, b) => a + b, 0);
  const sortedSections = [...sectionHits.entries()].sort((a, b) => b[1] - a[1]);

  for (const [section, hits] of sortedSections) {
    const bar = hits > 0 ? " " + "█".repeat(hits) : "";
    lines.push(`- **${section}**: ${hits}/${recent.length} generations${bar}`);
  }
  lines.push("");

  // Detect concentration bias (>60% in one section)
  const concentrated = sortedSections.filter(([, hits]) => totalHits > 0 && hits / totalHits > 0.6);
  if (concentrated.length > 0) {
    lines.push("**Concentration warning**: Recent work is heavily focused on:");
    for (const [section, hits] of concentrated) {
      lines.push(`- **${section}** (${hits}/${recent.length} generations)`);
    }
    lines.push("Consider diversifying to other areas.");
    lines.push("");
  }

  // Detect neglected sections (0 hits with unchecked goals)
  const neglected = sortedSections.filter(([section, hits]) => {
    if (hits > 0) return false;
    return visionGoals.some((g) => g.section === section && !g.checked);
  });
  if (neglected.length > 0) {
    lines.push("**Neglected areas** (unchecked goals, no recent work):");
    for (const [section] of neglected) {
      const unchecked = visionGoals.filter((g) => g.section === section && !g.checked);
      lines.push(`- **${section}** (${unchecked.length} unchecked goal${unchecked.length > 1 ? "s" : ""})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ── Vision Development Suggestions ───────────────────────────

/**
 * Build vision development suggestions by combining diagnosis criteria,
 * vision goals, and lineage bias analysis.
 * All suggestions are prompt text only — no automatic modifications.
 */
export function buildVisionDevelopmentSuggestions(
  visionGoals: VisionGoal[],
  lineageGoals: LineageGoal[],
): string {
  const lines: string[] = [];
  const suggestions: string[] = [];

  // 1. Detect criteria not covered by any vision goal
  const criteriaNames = SOFTWARE_COMPLETION_CRITERIA.map((c) => ({
    id: c.id,
    name: c.name,
    tokens: tokenize(c.name + " " + c.description),
  }));

  for (const criterion of criteriaNames) {
    if (criterion.tokens.length === 0) continue;

    let covered = false;
    for (const goal of visionGoals) {
      const goalTokens = tokenize(goal.title + " " + goal.section);
      const overlap = criterion.tokens.filter((t) => goalTokens.includes(t));
      const score = overlap.length / criterion.tokens.length;
      if (score >= 0.2) {
        covered = true;
        break;
      }
    }

    if (!covered) {
      suggestions.push(`- **Missing coverage**: Criterion "${criterion.name}" (id: ${criterion.id}) has no matching vision goal. Consider adding a goal for this area.`);
    }
  }

  // 2. Detect unchecked goals with no recent lineage work (stale goals)
  const unchecked = visionGoals.filter((g) => !g.checked);
  const recentGoals = lineageGoals.slice(-10);

  for (const goal of unchecked) {
    const goalTokens = tokenize(goal.title);
    if (goalTokens.length === 0) continue;

    let hasRecentWork = false;
    for (const gen of recentGoals) {
      const genTokens = tokenize(gen.goal);
      const overlap = goalTokens.filter((t) => genTokens.includes(t));
      const score = goalTokens.length > 0 ? overlap.length / goalTokens.length : 0;
      if (score >= 0.2) {
        hasRecentWork = true;
        break;
      }
    }

    if (!hasRecentWork && lineageGoals.length >= 5) {
      suggestions.push(`- **Stale goal**: "${goal.title}" (${goal.section}) — no related work in the last ${recentGoals.length} generations. Review if still relevant.`);
    }
  }

  // 3. Detect sections with many unchecked goals (scope might be too large)
  const sectionUnchecked = new Map<string, number>();
  for (const goal of unchecked) {
    const section = goal.section || "(no section)";
    sectionUnchecked.set(section, (sectionUnchecked.get(section) ?? 0) + 1);
  }
  for (const [section, count] of sectionUnchecked) {
    if (count >= 4) {
      suggestions.push(`- **Large scope**: Section "${section}" has ${count} unchecked goals. Consider breaking it down or prioritizing.`);
    }
  }

  if (suggestions.length === 0) return "";

  lines.push("### Vision Development Suggestions");
  lines.push("");
  lines.push("Based on completion criteria coverage and lineage analysis:");
  lines.push("(These are suggestions only — do NOT modify vision/goals.md automatically.)");
  lines.push("");
  lines.push(...suggestions.slice(0, 5)); // Limit to top 5
  lines.push("");

  return lines.join("\n");
}

// ── Utilities ────────────────────────────────────────────────

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w가-힣\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}
