import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";

export default function CommandReferencePage() {
  return (
    <DocLayout>
      <DocPage title="Command Reference" breadcrumb="Reference">

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          REAP has two types of commands: <strong className="text-foreground">CLI commands</strong> and <strong className="text-foreground">Slash commands</strong>.
        </p>
        <div className="border-l-2 border-primary pl-3 py-1 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">CLI commands</strong> (<code className="bg-muted px-1 rounded">reap ...</code>) run in your terminal. They handle project setup and maintenance — init, status, update, fix. They do not interact with the AI agent.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            <strong className="text-foreground">Slash commands</strong> (<code className="bg-muted px-1 rounded">/reap.*</code>) run inside Claude Code. They drive the development workflow — the AI agent reads the prompt and executes the described task interactively with you.
          </p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-8">Slash Commands</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Installed to <code className="text-xs bg-muted px-1 rounded">~/.claude/commands/</code> by <code className="text-xs bg-muted px-1 rounded">reap init</code>. Used inside Claude Code sessions.
        </p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground w-48">Command</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["/reap.evolve", "Run an entire generation from start to finish. The primary command for day-to-day development. Loops through all stages interactively."],
                ["/reap.start", "Start a new generation. Asks for a goal, creates current.yml, and sets stage to objective."],
                ["/reap.objective", "Define the generation's goal, requirements, and acceptance criteria. Scans environment, reviews backlog, checks genome health."],
                ["/reap.planning", "Break down the objective into tasks with dependencies. Creates the implementation plan."],
                ["/reap.implementation", "Execute tasks from the plan. Records completed/deferred tasks and genome discoveries in the artifact."],
                ["/reap.validation", "Run validation commands from constraints.md. Check completion criteria. Verdict: pass / partial / fail."],
                ["/reap.completion", "Retrospective, apply genome changes from backlog, garbage collection, finalize."],
                ["/reap.next", "Advance to the next lifecycle stage. Creates the next artifact from template. Archives on completion."],
                ["/reap.back", "Return to a previous stage (micro loop). Records regression reason in timeline and artifact."],
                ["/reap.status", "Show current generation state, stage progress, backlog summary, timeline, and genome health."],
                ["/reap.sync", "Analyze source code and synchronize Genome. Direct update when no active generation; records to backlog otherwise."],
              ].map(([cmd, desc]) => (
                <tr key={cmd}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top">{cmd}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-2">Lifecycle Flow</h3>
        <p className="text-xs text-muted-foreground mb-3">
          The typical flow when using <code className="bg-muted px-1 rounded">/reap.evolve</code>:
        </p>
        <div className="border-l border-border pl-3 space-y-1 text-xs text-muted-foreground mb-6">
          <div>1. <code className="bg-muted px-1 rounded">/reap.start</code> → Create generation</div>
          <div>2. <code className="bg-muted px-1 rounded">/reap.objective</code> → Define goal</div>
          <div>3. <code className="bg-muted px-1 rounded">/reap.next</code></div>
          <div>4. <code className="bg-muted px-1 rounded">/reap.planning</code> → Plan tasks</div>
          <div>5. <code className="bg-muted px-1 rounded">/reap.next</code></div>
          <div>6. <code className="bg-muted px-1 rounded">/reap.implementation</code> → Build</div>
          <div>7. <code className="bg-muted px-1 rounded">/reap.next</code></div>
          <div>8. <code className="bg-muted px-1 rounded">/reap.validation</code> → Verify</div>
          <div>9. <code className="bg-muted px-1 rounded">/reap.next</code></div>
          <div>10. <code className="bg-muted px-1 rounded">/reap.completion</code> → Retrospect</div>
          <div>11. <code className="bg-muted px-1 rounded">/reap.next</code> → Archive, generation ends</div>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-2">Each Command Structure</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Every slash command follows the same pattern: <strong className="text-foreground">Gate</strong> (precondition check — stage must be correct, previous artifact must exist) → <strong className="text-foreground">Steps</strong> (work execution with human interaction) → <strong className="text-foreground">Artifact</strong> (progressively recorded to <code className="bg-muted px-1 rounded">.reap/life/</code>).
        </p>

      </DocPage>
    </DocLayout>
  );
}
