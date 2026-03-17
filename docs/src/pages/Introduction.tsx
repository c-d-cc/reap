import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function Introduction() {
  return (
    <DocLayout>
      <DocPage title="Introduction" breadcrumb="Getting Started">
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          REAP (Recursive Evolutionary Autonomous Pipeline) is a development pipeline where AI and humans collaborate to incrementally evolve an Application across successive Generations. Rather than treating each AI session as an isolated task, REAP maintains continuity through a structured lifecycle and a living knowledge base called the <strong className="text-foreground">Genome</strong>.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">3-Layer Model</h2>
        <div className="flex items-stretch border border-border rounded-md overflow-hidden text-sm mb-6">
          {[
            { label: "Genome", sub: "Design & Knowledge", path: ".reap/genome/" },
            { label: "Evolution", sub: "Generational Process", path: ".reap/life/ → .reap/lineage/" },
            { label: "Civilization", sub: "Source Code", path: "your codebase/" },
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex-1 px-4 py-3 ${i < arr.length - 1 ? "border-r border-border" : ""}`}>
              <div className="font-semibold text-foreground text-sm">{item.label}</div>
              <div className="text-xs text-primary mt-0.5 mb-1">{item.sub}</div>
              <div className="text-xs font-mono text-muted-foreground">{item.path}</div>
            </div>
          ))}
        </div>

        <ul className="text-sm space-y-2 mb-8">
          <li className="flex gap-2"><span className="text-primary font-mono mt-0.5 shrink-0 w-24">Genome</span><span className="text-muted-foreground">Design and knowledge for building the Application. Architecture principles, business rules, conventions, and technical constraints. Stored in <code className="text-xs bg-muted px-1 rounded">.reap/genome/</code>.</span></li>
          <li className="flex gap-2"><span className="text-primary font-mono mt-0.5 shrink-0 w-24">Evolution</span><span className="text-muted-foreground">The process by which the Genome evolves and Civilization grows through repeated Generations.</span></li>
          <li className="flex gap-2"><span className="text-primary font-mono mt-0.5 shrink-0 w-24">Civilization</span><span className="text-muted-foreground">Source Code. The entire project codebase outside <code className="text-xs bg-muted px-1 rounded">.reap/</code>.</span></li>
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Why REAP?</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Problem</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">REAP Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Context Loss — Agent forgets project context every session", "SessionStart Hook — Every session injects full Genome + generation state automatically"],
                ["Scattered Development — Code modified with no clear goal", "Generation Model — Each generation focuses on one objective with a structured lifecycle"],
                ["Design–Code Drift — Documentation diverges from code", "Genome Mutation via Backlog — Design defects logged during implementation, applied at Completion"],
                ["Forgotten Lessons — Insights from past work are lost", "Lineage & Retrospectives — Lessons accumulate in Genome, generations archived and compressed"],
              ].map(([problem, solution]) => (
                <tr key={problem}>
                  <td className="px-4 py-2.5 text-muted-foreground align-top">{problem}</td>
                  <td className="px-4 py-2.5 text-foreground align-top">{solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Four-Axis Structure</h2>
        <p className="text-sm text-muted-foreground mb-3">REAP organizes everything under <code className="text-xs bg-muted px-1 rounded">.reap/</code> into four axes:</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { axis: "Genome", path: ".reap/genome/", desc: "Genetic information. Principles, rules, architecture decisions." },
            { axis: "Environment", path: ".reap/environment/", desc: "External context. API docs, infrastructure, business constraints." },
            { axis: "Life", path: ".reap/life/", desc: "Current generation's lifecycle. Progress state and artifacts." },
            { axis: "Lineage", path: ".reap/lineage/", desc: "Archive of completed generations." },
          ].map((item) => (
            <div key={item.axis} className="border border-border rounded-md p-3 bg-card">
              <div className="text-sm font-semibold text-foreground">{item.axis}</div>
              <div className="text-xs font-mono text-primary mt-0.5 mb-1">{item.path}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Project Structure</h2>
        <CodeBlock language="text">{`my-project/
├── src/                          # Civilization (your code)
└── .reap/
    ├── config.yml                # Project configuration
    ├── genome/                   # Genetic information
    │   ├── principles.md
    │   ├── domain/
    │   ├── conventions.md
    │   └── constraints.md
    ├── environment/              # External context
    ├── life/                     # Current generation
    │   ├── current.yml
    │   └── backlog/
    └── lineage/                  # Completed generation archive

~/.claude/                        # User-level (installed by reap init)
├── commands/                     # Slash commands (/reap.*)
└── hooks.json                    # SessionStart hook registration`}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
