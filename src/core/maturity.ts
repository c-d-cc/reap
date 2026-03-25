import type { GenerationType } from "../types/index.js";

// ── Maturity Levels ──────────────────────────────────────────

export type MaturityLevel = "bootstrap" | "growth" | "cruise";

/**
 * Determine maturity level from generation type and cruise mode.
 */
export function detectMaturity(
  type: GenerationType,
  cruiseCount: string | undefined,
): MaturityLevel {
  if (type === "embryo") return "bootstrap";
  if (cruiseCount) return "cruise";
  return "growth";
}

// ── Embryo Transition Urgency ────────────────────────────────

export type TransitionUrgency = "soft" | "hard";

/**
 * Determine how urgently embryo→normal transition should be proposed.
 * - soft (≤5): optional check, propose only if clearly stable
 * - hard (6+): must check every adapt, propose if conditions met
 * No mandatory — genome stabilization takes as long as it needs.
 */
export function getTransitionUrgency(generationCount: number): TransitionUrgency {
  if (generationCount <= 5) return "soft";
  return "hard";
}

// ── Software Completion Criteria (16 items) ──────────────────

export const SOFTWARE_COMPLETION_CRITERIA = [
  { id: 1, name: "Core functionality", description: "Are core features working as expected?" },
  { id: 2, name: "Architecture stability", description: "Is the architecture stable and well-established?" },
  { id: 3, name: "Modularity", description: "Is the code sufficiently modular and reusable for extension?" },
  { id: 4, name: "Error handling", description: "Is error handling appropriate and consistent?" },
  { id: 5, name: "Test coverage", description: "Is test coverage sufficient?" },
  { id: 6, name: "Documentation", description: "Is user/developer documentation in place?" },
  { id: 7, name: "Security", description: "Are basic security requirements met?" },
  { id: 8, name: "Performance", description: "Is performance within acceptable bounds?" },
  { id: 9, name: "Deployment readiness", description: "Is the project ready for deployment?" },
  { id: 10, name: "Code quality", description: "Is code quality and convention usage consistent?" },
  { id: 11, name: "User experience", description: "Is the user experience acceptable?" },
  { id: 12, name: "Visual verification", description: "For UI apps — has the user visually verified the interface?" },
  { id: 13, name: "Integration layer", description: "For systems with external integrations — are communication logic, API logic, and API error handling well-implemented?" },
  { id: 14, name: "Domain maturity", description: "Are domain feature specs (environment) and implementations (code) in place?" },
  { id: 15, name: "Governance compliance", description: "If governance guidelines exist, are they sufficiently followed?" },
  { id: 16, name: "Genome stability", description: "Has the genome been proven stable across multiple generations?" },
] as const;

/**
 * Format completion criteria as prompt text.
 */
export function formatCompletionCriteria(): string {
  return SOFTWARE_COMPLETION_CRITERIA.map(
    (c) => `${c.id}. **${c.name}** — ${c.description}`,
  ).join("\n");
}

// ── Maturity Behavior Guides ─────────────────────────────────

export function getMaturityBehaviorGuide(level: MaturityLevel): string {
  switch (level) {
    case "bootstrap":
      return [
        "### Maturity: Bootstrap (Embryo)",
        "Tone: Collaborator — 60% questions, 40% proposals.",
        "",
        "- Scan full source + lineage. Compare against completion criteria.",
        "- Actively discuss gaps with user. Identify what is missing or undefined.",
        "- Prioritize filling genome gaps (application.md, evolution.md) through user interaction.",
        "- Style: \"These areas are currently lacking. Shall we define this first?\"",
        "- Use the 16 Software Completion Criteria as a diagnostic checklist.",
        "- Every adapt phase: assess genome stability and propose embryo→normal transition when ready.",
      ].join("\n");

    case "growth":
      return [
        "### Maturity: Growth (Normal)",
        "Tone: Driver — 30% questions, 70% proposals.",
        "",
        "- Use vision/goals.md + lineage for gap analysis. Full source scan unnecessary.",
        "- Identify gaps vs completion criteria. Guide user to fill them with specific definitions.",
        "- Style: \"Vision has X, current state is Y, doing Z next will close the gap.\"",
        "- Propose specific next generation goals based on gap analysis.",
        "- Confidence in established patterns — leverage existing genome knowledge.",
      ].join("\n");

    case "cruise":
      return [
        "### Maturity: Cruise (Autonomous)",
        "Tone: Autonomous — 10% questions, 90% proposals.",
        "",
        "- Execute autonomously. Minimal interaction.",
        "- Self-assess at fitness phase. Only escalate on uncertainty or risk.",
        "- Maintain established patterns and quality standards.",
        "- Focus on execution speed while preserving genome compliance.",
      ].join("\n");
  }
}

/**
 * Build embryo→normal transition check prompt for adapt phase.
 */
export function buildTransitionCheckPrompt(
  generationCount: number,
  urgency: TransitionUrgency,
): string {
  const lines: string[] = [];

  lines.push("### Embryo → Normal Transition Check");
  lines.push("");

  switch (urgency) {
    case "soft":
      lines.push(`Current generation count: ${generationCount} (Soft check — ≤5 generations)`);
      lines.push("If the project appears clearly stable, you MAY propose embryo→normal transition.");
      lines.push("This is optional. Skip if the genome is still actively evolving.");
      break;
    case "hard":
      lines.push(`Current generation count: ${generationCount} (Hard check — 6+ generations)`);
      lines.push("**You MUST check transition readiness at every adapt phase.**");
      lines.push("Propose transition if conditions are met. If genome is still actively evolving, explain why and defer.");
      break;
  }

  lines.push("");
  lines.push("**Assess the following:**");
  lines.push("1. Genome modification frequency trend — are application.md changes decreasing?");
  lines.push("2. Application.md stability — is the core identity and purpose well-defined?");
  lines.push("3. Restart frequency — are there fewer restarts in recent generations?");
  lines.push("4. Vision/goals clarity — does vision/goals.md have clear, actionable items?");
  lines.push("");
  lines.push("**Present your findings and recommendation to the user.**");
  lines.push("Final decision is the human's. If approved, create a backlog item:");
  lines.push("`type: genome-change`, `priority: high`, content: \"transition embryo → normal\"");

  return lines.join("\n");
}
