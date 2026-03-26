import type { GenerationType } from "../types/index.js";

// ── Types ────────────────────────────────────────────────────

export type ClarityLevel = "high" | "medium" | "low";

export interface ClarityInput {
  /** Number of unchecked vision goals */
  uncheckedGoals: number;
  /** Total number of vision goals (checked + unchecked) */
  totalGoals: number;
  /** Number of pending backlog items */
  pendingBacklog: number;
  /** Number of high-priority pending backlog items */
  highPriorityBacklog: number;
  /** Current generation type */
  generationType: GenerationType;
  /** Number of generations in lineage */
  lineageCount: number;
  /** Whether memory files exist (any tier) */
  hasMemory: boolean;
}

export interface ClarityResult {
  level: ClarityLevel;
  signals: string[];
}

// ── Calculate ────────────────────────────────────────────────

/**
 * Calculate clarity level from project state signals.
 * Rule-based (no numeric scores) — follows evolution.md Clarity-driven Interaction.
 */
export function calculateClarity(input: ClarityInput): ClarityResult {
  const signals: string[] = [];
  let highSignals = 0;
  let lowSignals = 0;

  // ── High clarity signals ──

  if (input.uncheckedGoals >= 3 && input.highPriorityBacklog >= 1) {
    signals.push("Vision has 3+ unchecked goals with high-priority backlog — clear direction");
    highSignals++;
  }

  if (input.highPriorityBacklog >= 2) {
    signals.push("Multiple high-priority backlog items — specific work defined");
    highSignals++;
  }

  if (input.pendingBacklog >= 3 && input.uncheckedGoals >= 1) {
    signals.push("Active backlog with vision goals — work pipeline established");
    highSignals++;
  }

  // ── Low clarity signals ──

  if (input.generationType === "embryo" && input.lineageCount < 5) {
    signals.push("Early embryo stage with short lineage — project direction still forming");
    lowSignals++;
  }

  if (input.totalGoals === 0 || (input.uncheckedGoals === 0 && input.pendingBacklog === 0)) {
    signals.push("No unchecked goals and no pending backlog — no clear next direction");
    lowSignals++;
  }

  if (input.uncheckedGoals > 0 && input.pendingBacklog === 0 && !input.hasMemory) {
    signals.push("Vision goals exist but no backlog or memory — direction needs concretization");
    lowSignals++;
  }

  // ── Determine level ──

  if (highSignals > 0 && lowSignals === 0) {
    return { level: "high", signals };
  }

  if (lowSignals > 0 && highSignals === 0) {
    return { level: "low", signals };
  }

  // Mixed signals or no strong signals → medium
  if (signals.length === 0) {
    signals.push("No strong clarity signals detected — defaulting to medium");
  }

  return { level: "medium", signals };
}

// ── Prompt Guide ─────────────────────────────────────────────

/**
 * Generate prompt text for the calculated clarity level.
 */
export function getClarityGuide(result: ClarityResult): string {
  const lines: string[] = [];

  lines.push(`**Current Clarity: ${result.level.toUpperCase()}**`);
  lines.push("");

  switch (result.level) {
    case "high":
      lines.push("Direction is clear. Execute with minimal questions. Confirm key decisions briefly and proceed.");
      break;
    case "medium":
      lines.push("Direction exists but details need refinement. Present options with tradeoffs. Ask targeted questions to resolve ambiguity.");
      break;
    case "low":
      lines.push("Direction is unclear. Actively interact — ask clarifying questions, provide examples, and explore possibilities before committing to a plan.");
      break;
  }

  lines.push("");
  lines.push("Signals:");
  for (const signal of result.signals) {
    lines.push(`- ${signal}`);
  }

  return lines.join("\n");
}
