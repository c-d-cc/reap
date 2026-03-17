import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function WorkflowPage() {
  return (
    <DocLayout>
      <DocPage title="Workflow" breadcrumb="Workflow">

        <h2 className="text-base font-semibold text-foreground mb-2">/reap.evolve</h2>
        <p className="text-sm text-muted-foreground mb-3">
          The primary command. Runs the entire Generation lifecycle from start to finish, interactively with the human.
        </p>
        <div className="space-y-1 text-sm text-muted-foreground mb-4 pl-3 border-l border-border">
          <div>1. If no active Generation: runs <code className="text-xs bg-muted px-1 rounded">/reap.start</code> first</div>
          <div>2. Reads <code className="text-xs bg-muted px-1 rounded">current.yml</code> to determine current stage</div>
          <div>3. Executes the stage command (objective → planning → ... → completion)</div>
          <div>4. Advances with <code className="text-xs bg-muted px-1 rounded">/reap.next</code> after each stage</div>
          <div>5. Loops until generation completes</div>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Handles validation failures (regress to implementation), pausing (state preserved), and stage skipping.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Stage Commands</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Command</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["/reap.start", "Start a new generation"],
                ["/reap.objective", "Define goal + requirements"],
                ["/reap.planning", "Task decomposition + implementation plan"],
                ["/reap.implementation", "Code implementation with AI + human"],
                ["/reap.validation", "Run tests, verify completion criteria"],
                ["/reap.completion", "Retrospective + apply Genome changes"],
                ["/reap.next", "Advance to the next stage"],
                ["/reap.back", "Return to a previous stage (micro loop)"],
                ["/reap.status", "Show current generation state and project health"],
              ].map(([cmd, desc]) => (
                <tr key={cmd}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{cmd}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Micro Loop</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Any stage can regress to a previous stage. This is the micro loop — it allows structured backtracking without losing work.
        </p>
        <p className="text-sm text-muted-foreground mb-2 font-medium text-foreground">Artifact handling on regression:</p>
        <ul className="text-xs text-muted-foreground space-y-1 mb-6 pl-3 border-l border-border">
          <li><strong className="text-foreground">Before target stage:</strong> Preserved as-is</li>
          <li><strong className="text-foreground">Target stage:</strong> Overwritten (implementation stage only appends)</li>
          <li><strong className="text-foreground">After target stage:</strong> Preserved, overwritten upon re-entry</li>
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Hooks</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Projects can define hooks in <code className="text-xs bg-muted px-1 rounded">.reap/config.yml</code>:
        </p>
        <CodeBlock language="yaml">{`hooks:
  onGenerationStart:
    - command: "echo 'Generation started'"
  onStageTransition:
    - command: "echo 'Stage changed'"
  onGenerationComplete:
    - command: "reap update"
    - prompt: "Update README if this generation changed any features."
  onRegression:
    - command: "echo 'Regressed'"`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-3 mb-2">Each hook supports <code className="bg-muted px-1 rounded">command</code> (shell) or <code className="bg-muted px-1 rounded">prompt</code> (AI agent instruction).</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex gap-2"><code className="bg-muted px-1 rounded text-primary shrink-0">onGenerationStart</code> Runs when a new generation begins.</div>
          <div className="flex gap-2"><code className="bg-muted px-1 rounded text-primary shrink-0">onStageTransition</code> Runs on every stage change.</div>
          <div className="flex gap-2"><code className="bg-muted px-1 rounded text-primary shrink-0">onGenerationComplete</code> Runs after generation is archived and committed.</div>
          <div className="flex gap-2"><code className="bg-muted px-1 rounded text-primary shrink-0">onRegression</code> Runs when a stage regresses.</div>
        </div>
      </DocPage>
    </DocLayout>
  );
}
