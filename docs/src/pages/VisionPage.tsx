import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function VisionPage() {
  return (
    <DocLayout>
      <DocPage title="Vision" breadcrumb="Guide">

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Vision is the layer that drives direction. The human defines where the project is going — setting goals, milestones, and priorities. The AI references vision during the adapt phase to analyze gaps and propose the next goal, but the human owns the vision.
        </p>

        {/* Structure */}
        <h2 className="text-base font-semibold text-foreground mb-2">Structure</h2>
        <CodeBlock language="text">{`.reap/vision/
  goals.md              # North star objectives and milestones
  docs/                 # Planning documents, specs, design notes
  memory/               # AI memory (3-tier)
    longterm.md          #   Project lifetime — lessons, decision rationale
    midterm.md           #   Multi-generation — ongoing plans, agreed directions
    shortterm.md         #   1-2 sessions — next session handoff, immediate context`}</CodeBlock>

        {/* Goals */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Goals</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          <code className="bg-muted px-1 rounded">goals.md</code> contains the project's long-term objectives as a checklist. During the <code className="bg-muted px-1 rounded">adapt</code> phase, the AI analyzes gaps between vision and current state to suggest the next generation's goal. Completed goals are automatically checked off.
        </p>
        <CodeBlock language="markdown">{`# Vision Goals

## Ultimate Goal
Build a self-evolving development pipeline.

## Goal Items
- [x] Core lifecycle implementation
- [x] Merge lifecycle
- [ ] README rewrite for v0.16
- [ ] External project validation`}</CodeBlock>

        {/* Memory */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Memory</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Memory is a free-form recording system where AI persists context across sessions and generations. Unlike genome (which has modification constraints) or lineage (which gets compressed), memory is always accessible and freely writable.
        </p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Tier</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Lifespan</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Shortterm</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">1-2 sessions</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Generation summary, next session handoff, undecided matters</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Midterm</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Multiple generations</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Large task flow, multi-gen plans, agreed directions</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Longterm</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Project lifetime</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Design lessons, architecture decision rationale, transition lessons</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* When to Update */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">When to Update</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
          <li><strong className="text-foreground">Reflect phase</strong> — natural moment to update memory (shortterm is mandatory every generation)</li>
          <li><strong className="text-foreground">Any time</strong> — memory can be updated during any stage if useful context arises</li>
          <li><strong className="text-foreground">Shortterm cleanup</strong> — clear items that have been acted on</li>
        </ul>

        {/* What NOT to write */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">What NOT to Write in Memory</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
          <li>Code change details — belongs in environment</li>
          <li>Test counts or build status — belongs in artifacts</li>
          <li>Principles already in genome — no duplication</li>
        </ul>

        {/* Gap-driven Evolution */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Gap-driven Evolution</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          During the <code className="bg-muted px-1 rounded">adapt</code> phase of completion, the AI:
        </p>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mb-4">
          <li>Reads <code className="bg-muted px-1 rounded">goals.md</code> and scans backlog</li>
          <li>Identifies unchecked goals and pending tasks</li>
          <li>Cross-references with the current project state</li>
          <li>Suggests the next generation's goal based on the most impactful gap</li>
        </ol>


      </DocPage>
    </DocLayout>
  );
}
