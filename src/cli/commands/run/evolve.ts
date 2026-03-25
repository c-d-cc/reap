import YAML from "yaml";
import type { ReapPaths } from "../../../core/paths.js";
import type { GenerationState, ReapConfig } from "../../../types/index.js";
import { GenerationManager } from "../../../core/generation.js";
import { readTextFile } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import {
  detectMaturity,
  getMaturityBehaviorGuide,
  formatCompletionCriteria,
} from "../../../core/maturity.js";

function buildSubagentPrompt(
  paths: ReapPaths,
  state: GenerationState | null,
  genome: { application: string; evolution: string; invariants: string },
  environment: string,
  visionGoals: string,
  cruiseCount?: string,
): string {
  const lines: string[] = [];

  const isMerge = state?.type === "merge";

  lines.push("# REAP Subagent Instructions");
  lines.push("");
  lines.push("You are a subagent executing a reap generation lifecycle.");
  if (isMerge) {
    lines.push("reap is a self-evolving pipeline. This is a **merge** generation:");
    lines.push("detect → mate → merge → reconcile → validation → completion");
  } else {
    lines.push("reap is a self-evolving pipeline. Each generation follows:");
    lines.push("learning → planning → implementation ⟷ validation → completion");
  }
  lines.push("");

  lines.push("## Rules");
  lines.push("- Use `reap run <stage> [--phase <phase>]` commands to drive the lifecycle.");
  lines.push("- NEVER modify `current.yml` directly.");
  lines.push("- Each `--phase complete` verifies the artifact exists (>50 chars), issues a nonce, and auto-transitions.");
  lines.push("- Write artifact content BEFORE running `--phase complete`.");
  lines.push("- **All artifacts are at `.reap/life/{NN}-{stage}.md`** (e.g., `.reap/life/01-learning.md`, `.reap/life/02-planning.md`). NEVER create artifacts elsewhere.");
  lines.push("");

  lines.push("## Genome");
  lines.push("");
  lines.push("### application.md");
  lines.push(genome.application);
  lines.push("");
  lines.push("### evolution.md");
  lines.push(genome.evolution);
  lines.push("");
  lines.push("### invariants.md");
  lines.push(genome.invariants);
  lines.push("");

  if (environment) {
    lines.push("## Environment");
    lines.push(environment);
    lines.push("");
  }

  if (visionGoals) {
    lines.push("## Vision Goals");
    lines.push(visionGoals);
    lines.push("");
  }

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

  lines.push("## Lifecycle Execution");
  lines.push("");

  if (isMerge) {
    lines.push("### Merge Stage Loop");
    lines.push("For each stage (detect → mate → merge → reconcile → validation):");
    lines.push("1. `reap run <stage>` — loads context, prompts for work");
    lines.push("2. Do the work (analyze branches, resolve genome/source conflicts, reconcile)");
    lines.push("3. `reap run <stage> --phase complete` → verifies artifact → auto-transitions");
    lines.push("");
    lines.push("### Merge Stages Detail");
    lines.push("- **detect**: Analyze branch divergence, find common ancestor, extract genome diff. Artifact: 01-detect.md");
    lines.push("- **mate**: Merge genome files (application.md, evolution.md, invariants.md) and vision/goals.md. Artifact: 02-mate.md");
    lines.push("- **merge**: Execute `git merge --no-commit`, resolve source conflicts. Artifact: 03-merge.md");
    lines.push("- **reconcile**: Regenerate environment, verify genome-source consistency. Artifact: 04-reconcile.md");
    lines.push("- **validation**: Run tests, verify merged result. Artifact: 05-validation.md");
    lines.push("");
    lines.push("### Completion (4-phase)");
    lines.push("```");
    lines.push("reap run completion --phase reflect      # write 06-completion.md + update environment");
    lines.push("reap run completion --phase fitness       # present summary to human");
    lines.push('reap run completion --phase fitness --feedback "<text>"  # save feedback');
    lines.push("reap run completion --phase adapt         # review genome, propose next goals");
    lines.push("reap run completion --phase commit        # archive to lineage");
    lines.push("```");
    lines.push("");
    lines.push("### Merge-specific Rules");
    lines.push("- Genome is mutable ONLY during the mate stage.");
    lines.push("- Use `reap run back` to regress to a previous merge stage if needed.");
    lines.push("- invariants.md conflicts require human judgment.");
    lines.push("");
  } else {
    lines.push("### Stage Loop");
    lines.push("For each stage (learning → planning → implementation → validation):");
    lines.push("1. `reap run <stage>` — loads context, prompts for work");
    lines.push("2. Do the work (explore code, write artifact, write code)");
    lines.push("3. `reap run <stage> --phase complete` → verifies artifact → auto-transitions");
    lines.push("");
    lines.push("### Completion (4-phase)");
    lines.push("```");
    lines.push("reap run completion --phase reflect      # write 05-completion.md + update environment");
    lines.push("reap run completion --phase fitness       # present summary to human");
    lines.push('reap run completion --phase fitness --feedback "<text>"  # save feedback');
    lines.push("reap run completion --phase adapt         # review genome, propose next goals");
    lines.push("reap run completion --phase commit        # archive to lineage");
    lines.push("```");
    lines.push("");
  }

  lines.push("## Generation Type");
  if (state?.type === "embryo") {
    lines.push("This is an **embryo** generation. Genome modifications are freely allowed during any stage.");
  } else if (isMerge) {
    lines.push("This is a **merge** generation. Genome is mutable only during the mate stage. Use backlog for other genome changes.");
  } else {
    lines.push("This is a **normal** generation. Genome is immutable during the generation. Use backlog for genome changes.");
  }
  lines.push("");

  // Maturity-based behavior guide
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

  lines.push("## Validation Rules");
  lines.push("- HARD-GATE: Do NOT declare 'pass' without running validation commands. Do NOT reuse previous results.");
  lines.push("- Run ALL validation commands FRESH: TypeCheck → Build → Tests.");
  lines.push("- Minor Fix: trivial issues (under 5 minutes) — fix and re-run.");
  lines.push("- Red Flags: 'It will probably pass' → Run it. 'It passed before' → Run it again.");
  lines.push("- Verdict: pass (all pass) / partial (minor issues) / fail (critical, must regress).");
  lines.push("");

  lines.push("## Backlog Rules");
  lines.push("- backlog 생성 시 반드시 `reap make backlog --type <type> --title <title> [--body <body>] [--priority <priority>]` 명령을 사용하라.");
  lines.push("- Write 도구로 backlog 파일을 직접 생성하지 마라 (frontmatter 형식 오류 방지).");
  lines.push("- 생성된 backlog 파일에 상세 내용을 추가해야 하면, 생성 후 해당 파일을 Edit 도구로 편집하라.");
  lines.push("- Do NOT modify genome/ or environment/ directly — record changes as backlog.");
  lines.push("");

  lines.push("## Echo Chamber Prevention");
  lines.push("- AI autonomous additions are only allowed within the direct cause/impact scope of the current goal");
  lines.push("- 'Nice to have' items must go to a separate backlog after human review");
  lines.push("");

  lines.push("## AI-Human Collaboration Principles");
  lines.push("- Organize your thoughts first and present them, but do not force decisions");
  lines.push("- Provide examples and options so the human can make informed judgments");
  lines.push("- Actively request feedback on areas you are uncertain about");
  lines.push("");

  lines.push("## Clarity-driven Interaction");
  lines.push("Your interaction level is automatically determined by the clarity of the current context.");
  lines.push("");
  lines.push("### Clarity Levels:");
  lines.push("- **High clarity** (goal clear, details defined, specific tasks listed) → Minimal questions, execute autonomously");
  lines.push("- **Medium clarity** (direction exists, details unclear) → Present options with tradeoffs, ask targeted questions");
  lines.push("- **Low clarity** (goal ambiguous, next steps unknown) → Active interaction, ask clarifying questions, provide examples");
  lines.push("");
  lines.push("### Clarity Signals:");
  lines.push("- vision/goals.md exists with specific goals → higher clarity");
  lines.push("- Backlog with clear, actionable tasks → higher clarity");
  lines.push("- Embryo generation with frequent genome changes → lower clarity");
  lines.push("- Short lineage + undefined direction → lower clarity");
  lines.push("- Previous generation fitness feedback is positive → higher clarity");
  lines.push("");
  lines.push("### Per-Stage Behavior:");
  lines.push("- **Learning**: Assess project clarity level early. If low, flag it.");
  lines.push("- **Planning**: If goal is ambiguous (low clarity), increase interaction before committing to a plan.");
  lines.push("- **Implementation**: High clarity → execute. Low clarity → break into smaller steps, verify after each.");
  lines.push("- **Completion/Adapt**: If uncertain about genome changes, present options rather than deciding.");
  lines.push("");

  lines.push("## Project");
  lines.push(`Path: ${paths.root}`);

  return lines.join("\n");
}

export async function execute(paths: ReapPaths, _phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  const configContent = await readTextFile(paths.config);
  const config = configContent ? (YAML.parse(configContent) as ReapConfig) : null;
  const autoSubagent = config?.autoSubagent ?? true;

  const [application, evolution, invariants, environment, visionGoals] = await Promise.all([
    readTextFile(paths.application),
    readTextFile(paths.evolution),
    readTextFile(paths.invariants),
    readTextFile(paths.environmentSummary),
    readTextFile(paths.visionGoals),
  ]);

  const genome = {
    application: application ?? "(not found)",
    evolution: evolution ?? "(not found)",
    invariants: invariants ?? "(not found)",
  };

  const subagentPrompt = buildSubagentPrompt(paths, state, genome, environment ?? "", visionGoals ?? "", config?.cruiseCount);

  if (autoSubagent) {
    emitOutput({
      status: "prompt",
      command: "evolve",
      phase: "delegate",
      completed: ["gate", "genome-load"],
      context: {
        autoSubagent: true,
        subagentPrompt,
        generationId: state?.id,
        goal: state?.goal,
      },
      prompt: [
        "## AutoSubagent Mode",
        "",
        "Launch a subagent using the Agent tool with:",
        "- description: generation goal",
        "- prompt: the subagentPrompt from context",
        "",
        "After the subagent completes, report the result.",
      ].join("\n"),
    });
  } else {
    emitOutput({
      status: "prompt",
      command: "evolve",
      phase: "manual",
      completed: ["gate"],
      context: {
        id: state?.id,
        goal: state?.goal,
        stage: state?.stage,
      },
      prompt: state
        ? `Generation ${state.id} active (stage: ${state.stage}). Execute stages sequentially until completion.`
        : "No active generation. Run `reap run start --goal \"<goal>\"` first.",
    });
  }
}
