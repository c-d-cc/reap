import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { Link } from "wouter";

export default function WorkflowPage() {
  return (
    <DocLayout>
      <DocPage title="Workflow" breadcrumb="Workflow">

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          A generation is the fundamental unit of work in REAP. Each generation carries a single goal through five stages, producing artifacts along the way. Here's what happens at each stage and how they connect.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-2">/reap.evolve — The Primary Way to Work</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Most of the time, you run <code className="text-xs bg-muted px-1 rounded">/reap.evolve</code> and let the AI agent drive through all stages autonomously. It handles starting the generation, executing each stage, advancing between them, and archiving at the end. Routine per-stage confirmations are skipped — the agent proceeds without pausing unless it is genuinely blocked (ambiguous goal, significant trade-off decision, genome conflict, or unexpected error).
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          For fine-grained control, you can run individual stage commands. See <Link href="/docs/commands" className="text-primary hover:underline">Command Reference</Link> for details.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Stage-by-Stage Walkthrough</h2>

        <div className="space-y-5 mb-6">
          <div className="border-l-2 border-primary pl-3">
            <div className="text-sm font-semibold text-foreground mb-1">1. Objective</div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-1">
              Define what this generation will accomplish. The AI agent scans the environment for external context, reviews the backlog for pending items, checks genome health, and then works with you to refine the goal.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Output: <code className="bg-muted px-1 rounded">01-objective.md</code> — goal, completion criteria (max 7, verifiable), functional requirements (max 10), scope, and genome gap analysis.
            </p>
          </div>

          <div className="border-l-2 border-border pl-3">
            <div className="text-sm font-semibold text-foreground mb-1">2. Planning</div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-1">
              Break the objective into actionable tasks. The AI reads the requirements, references genome conventions and constraints, and proposes an implementation plan with architecture decisions.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Output: <code className="bg-muted px-1 rounded">02-planning.md</code> — phased task list (max 20 per phase), dependencies, parallelizable tasks marked with [P].
            </p>
          </div>

          <div className="border-l-2 border-border pl-3">
            <div className="text-sm font-semibold text-foreground mb-1">3. Implementation</div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-1">
              Build the code. Tasks are executed sequentially, with each completion recorded immediately. When genome or environment defects are discovered, they're logged to the backlog — never applied directly. Tasks that depend on pending genome changes are marked <code className="bg-muted px-1 rounded">[deferred]</code>.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Output: <code className="bg-muted px-1 rounded">03-implementation.md</code> — completed tasks table, deferred tasks, genome-change backlog items.
            </p>
          </div>

          <div className="border-l-2 border-border pl-3">
            <div className="text-sm font-semibold text-foreground mb-1">4. Validation</div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-1">
              Verify the work. Runs validation commands from <code className="bg-muted px-1 rounded">constraints.md</code> (test, lint, build, type check), checks completion criteria, and applies minor fixes (≤ 5 min, no design changes). Verdict is pass, partial (some criteria deferred), or fail.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Output: <code className="bg-muted px-1 rounded">04-validation.md</code> — test results with actual command output, criteria check table, verdict.
            </p>
          </div>

          <div className="border-l-2 border-border pl-3">
            <div className="text-sm font-semibold text-foreground mb-1">5. Completion</div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-1">
              Retrospect and evolve. Extract lessons learned (max 5), apply genome-change backlog items to the genome files, run garbage collection for tech debt, hand off deferred tasks to the next generation's backlog. When run standalone, genome changes require human confirmation; when called via <code className="bg-muted px-1 rounded">/reap.evolve</code>, the agent proceeds autonomously.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Output: <code className="bg-muted px-1 rounded">05-completion.md</code> — summary, retrospective, genome changelog. Then <code className="bg-muted px-1 rounded">/reap.next</code> archives everything to lineage.
            </p>
          </div>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Micro Loop (Regression)</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Any stage can go back to a previous stage. This is common — validation fails and you return to implementation, or a planning flaw is found during implementation and you go back to planning. The regression reason is recorded in the timeline and the target artifact.
        </p>
        <p className="text-sm text-muted-foreground mb-2 font-medium text-foreground">Artifact handling on regression:</p>
        <ul className="text-xs text-muted-foreground space-y-1 mb-6 pl-3 border-l border-border">
          <li><strong className="text-foreground">Before target stage:</strong> Preserved as-is</li>
          <li><strong className="text-foreground">Target stage:</strong> Overwritten (implementation only appends)</li>
          <li><strong className="text-foreground">After target stage:</strong> Preserved, overwritten upon re-entry</li>
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Minor Fix</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Trivial issues (typos, lint errors, etc.) can be fixed directly in the current stage without a regression, as long as they're resolvable within 5 minutes and require no design changes. The fix is recorded in the stage artifact.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Role Separation</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Who</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">CLI (reap)</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Project setup and maintenance — init, status, update, fix</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">AI Agent</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Workflow executor — performs each stage's work via slash commands</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Human</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Decision maker — sets goals, reviews artifacts, approves stage transitions</td>
              </tr>
            </tbody>
          </table>
        </div>

      </DocPage>
    </DocLayout>
  );
}
