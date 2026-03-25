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

export type TransitionUrgency = "soft" | "hard" | "mandatory";

/**
 * Determine how urgently embryo→normal transition should be proposed.
 */
export function getTransitionUrgency(generationCount: number): TransitionUrgency {
  if (generationCount <= 5) return "soft";
  if (generationCount <= 9) return "hard";
  return "mandatory";
}

// ── Software Completion Criteria (16 items) ──────────────────

export const SOFTWARE_COMPLETION_CRITERIA = [
  { id: 1, name: "Core functionality", description: "핵심 기능이 동작하는가" },
  { id: 2, name: "Architecture stability", description: "아키텍처가 안정적으로 완성되었는가" },
  { id: 3, name: "Modularity", description: "코드 확장을 위한 공통화, 모듈화가 충분한가" },
  { id: 4, name: "Error handling", description: "에러 처리가 적절한가" },
  { id: 5, name: "Test coverage", description: "테스트가 충분한가" },
  { id: 6, name: "Documentation", description: "사용자/개발자 문서가 있는가" },
  { id: 7, name: "Security", description: "기본 보안 요건을 충족하는가" },
  { id: 8, name: "Performance", description: "성능이 허용 범위 내인가" },
  { id: 9, name: "Deployment readiness", description: "배포 가능한 상태인가" },
  { id: 10, name: "Code quality", description: "코드 품질/컨벤션이 일관적인가" },
  { id: 11, name: "User experience", description: "사용자 경험이 수용 가능한가" },
  { id: 12, name: "Visual verification", description: "UI가 있는 경우, 시각적으로 검증했는가" },
  { id: 13, name: "Integration layer", description: "타 시스템 연계 공통 레이어/로직이 충분한가" },
  { id: 14, name: "Domain maturity", description: "도메인 기능의 spec과 impl이 갖춰져 있는가" },
  { id: 15, name: "Governance compliance", description: "governance guideline 준수 여부" },
  { id: 16, name: "Genome stability", description: "genome이 generation을 거치며 안정적으로 검증되었는가" },
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
      lines.push(`Current generation count: ${generationCount} (Hard check — 6~9 generations)`);
      lines.push("**You MUST check transition readiness at every adapt phase.**");
      lines.push("Propose transition if conditions are met.");
      break;
    case "mandatory":
      lines.push(`Current generation count: ${generationCount} (Mandatory — ≥10 generations)`);
      lines.push("**Embryo beyond 10 generations is abnormal. You MUST propose transition.**");
      lines.push("Present your assessment and strongly recommend transitioning to normal mode.");
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
