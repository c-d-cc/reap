import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function AdvancedPage() {
  return (
    <DocLayout>
      <DocPage title="Advanced" breadcrumb="Reference">

        <h2 className="text-base font-semibold text-foreground mb-2">Lineage Compression</h2>
        <p className="text-sm text-muted-foreground mb-3">
          As generations accumulate, lineage archives are automatically compressed to manage size.
        </p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Level</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Input</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Output</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Max lines</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Level 1</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">Generation folder (5 artifacts)</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">gen-XXX.md</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">40</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">lineage &gt; 10,000 lines + 5+ generations</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-xs text-primary">Level 2</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">5 Level 1 files</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">epoch-XXX.md</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">60</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">5+ Level 1 files exist</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">Presets</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Presets provide pre-configured Genome and project scaffolding for common stacks.
        </p>
        <CodeBlock language="bash">{`reap init my-project --preset bun-hono-react`}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          The <code className="text-xs bg-muted px-1 rounded">bun-hono-react</code> preset configures Genome with conventions for a Bun + Hono + React stack, including appropriate architecture principles, conventions, and constraints.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Entry Modes</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Specified with <code className="text-xs bg-muted px-1 rounded">reap init --mode</code>. Controls how the Genome is initially structured.
        </p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Mode</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["greenfield", "Build a new project from scratch. Default mode. Genome starts empty and grows."],
                ["migration", "Build anew while referencing an existing system. Genome is seeded with analysis of the existing system."],
                ["adoption", "Apply REAP to an existing codebase. Genome starts from templates and is populated during the first generation's Objective stage."],
              ].map(([mode, desc]) => (
                <tr key={mode}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{mode}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Comparison with Other Tools</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Traditional spec-driven tools (like Spec Kit) pioneered the idea of writing specifications before code. REAP builds on this concept and addresses key limitations:
        </p>
        <div className="space-y-3 text-sm mb-4">
          {[
            {
              title: "Static specs vs Living Genome",
              desc: "Traditional tools treat specs as static documents. REAP's Genome is a living system — defects found during implementation feed back through the backlog and are applied at Completion. The design evolves with the code."
            },
            {
              title: "No cross-session memory",
              desc: "Most AI development tools lose context between sessions. REAP's SessionStart Hook injects full project context (Genome, generation state, workflow rules) into every new session automatically."
            },
            {
              title: "Linear workflow vs Micro loops",
              desc: "Traditional tools follow a linear flow (spec → plan → build). REAP supports structured regression — any stage can loop back to a previous one while preserving artifacts."
            },
            {
              title: "Isolated tasks vs Generational evolution",
              desc: "Each task in traditional tools is independent. In REAP, generations build on each other. Knowledge compounds through Lineage archives and Genome evolution."
            },
            {
              title: "No lifecycle hooks",
              desc: "REAP provides project-level hooks (onGenerationStart, onStageTransition, onGenerationComplete, onRegression) for automation."
            },
          ].map((item) => (
            <div key={item.title} className="border-l border-border pl-3">
              <div className="text-xs font-semibold text-foreground mb-0.5">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </DocPage>
    </DocLayout>
  );
}
