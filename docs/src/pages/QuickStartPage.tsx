import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function QuickStartPage() {
  return (
    <DocLayout>
      <DocPage title="Quick Start" breadcrumb="Getting Started">
        <h2 className="text-base font-semibold text-foreground mb-2">Install</h2>
        <CodeBlock language="bash">{`# npm
npm install -g reap

# or Bun
bun install -g reap`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Initialize a project</h2>
        <CodeBlock language="bash">{`# New project
reap init my-project

# Existing project
cd my-project
reap init`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Run your first generation</h2>
        <p className="text-sm text-muted-foreground mb-3">Open Claude Code in your project directory:</p>
        <CodeBlock language="bash">{`claude
> /reap.evolve "Implement user authentication"`}</CodeBlock>

        <div className="border-l-2 border-primary pl-4 py-2 mt-4 mb-6">
          <div className="text-sm font-semibold text-foreground mb-1">
            <code className="text-primary">/reap.evolve</code> is the primary command
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            It runs the entire generation lifecycle — Objective, Planning, Implementation, Validation, and Completion — interactively with you. The AI agent asks questions at each stage, and you approve before advancing. This is the command you'll use most for day-to-day development.
          </p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Manual stage control</h2>
        <p className="text-sm text-muted-foreground mb-3">You can also control each stage individually:</p>
        <CodeBlock language="bash">{`> /reap.start            # Start a new generation
> /reap.objective        # Define objective + spec
> /reap.planning         # Create implementation plan
> /reap.implementation   # Code with AI + human
> /reap.validation       # Run tests, verify criteria
> /reap.completion       # Retrospective + apply Genome changes
> /reap.next             # Advance to next stage
> /reap.back             # Return to previous stage`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">What happens during a generation</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Stage</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">What happens</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Artifact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Objective", "Define goal, requirements, and acceptance criteria", "01-objective.md"],
                ["Planning", "Break down tasks, choose approach, map dependencies", "02-planning.md"],
                ["Implementation", "Build with AI + human collaboration", "03-implementation.md"],
                ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
                ["Completion", "Retrospective + apply Genome changes + archive", "05-completion.md"],
              ].map(([stage, what, artifact]) => (
                <tr key={stage}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{stage}</td>
                  <td className="px-4 py-2 text-muted-foreground">{what}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{artifact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocPage>
    </DocLayout>
  );
}
