import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";

export default function CoreConceptsPage() {
  return (
    <DocLayout>
      <DocPage title="Core Concepts" breadcrumb="Concepts">

        <h2 className="text-base font-semibold text-foreground mb-2">Genome</h2>
        <p className="text-sm text-muted-foreground mb-3">
          The Genome is the application's genetic information — architecture principles, business rules, conventions, and technical constraints.
        </p>
        <CodeBlock language="text">{`.reap/genome/
├── principles.md      # Architecture principles/decisions
├── domain/            # Business rules (per module)
├── conventions.md     # Development rules/conventions
└── constraints.md     # Technical constraints/choices`}</CodeBlock>

        <div className="mt-4 space-y-3 mb-6">
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">Genome Immutability Principle</div>
            <p className="text-xs text-muted-foreground">The Genome is never modified directly during the current generation. Issues are recorded in the backlog and only applied at the Completion stage.</p>
          </div>
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">Environment Immutability Principle</div>
            <p className="text-xs text-muted-foreground">The Environment is never modified directly during the current generation. External changes are recorded in the backlog and applied at the Completion stage.</p>
          </div>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Life Cycle</h2>
        <p className="text-sm text-muted-foreground mb-3">Each generation follows five stages:</p>
        <div className="flex items-center gap-1 flex-wrap mb-4">
          {[
            { label: "Objective" }, null,
            { label: "Planning" }, null,
            { label: "Implementation" }, "⟷",
            { label: "Validation" }, null,
            { label: "Completion" },
          ].map((item, i) => {
            if (item === null) return <span key={i} className="text-muted-foreground text-xs">→</span>;
            if (typeof item === "string") return <span key={i} className="text-muted-foreground text-xs">{item}</span>;
            return (
              <span key={i} className="text-xs font-mono bg-muted text-foreground border border-border rounded px-2 py-0.5">
                {item.label}
              </span>
            );
          })}
        </div>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
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
                  <td className="px-4 py-2 text-muted-foreground text-xs">{what}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{artifact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Backlog & Deferral</h2>
        <p className="text-sm text-muted-foreground mb-3">
          All backlog items stored in <code className="text-xs bg-muted px-1 rounded">.reap/life/backlog/</code> as markdown files with frontmatter:
        </p>
        <div className="space-y-2 mb-4">
          {[
            { type: "genome-change", desc: "Applied to Genome at Completion stage." },
            { type: "environment-change", desc: "Applied to Environment at Completion stage." },
            { type: "task", desc: "Candidate goals for the next Objective." },
          ].map((item) => (
            <div key={item.type} className="flex gap-3 text-sm">
              <code className="text-xs bg-muted text-primary px-1.5 py-0.5 rounded h-fit mt-0.5 shrink-0">{item.type}</code>
              <span className="text-muted-foreground text-xs">{item.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-2">Each item also carries a <code className="bg-muted px-1 rounded">status</code> field:</p>
        <div className="space-y-2 mb-4">
          {[
            { type: "pending", desc: "Not yet processed. Default value — absent field is treated as pending." },
            { type: "consumed", desc: "Processed in the current generation. Requires consumedBy: gen-XXX." },
          ].map((item) => (
            <div key={item.type} className="flex gap-3 text-sm">
              <code className="text-xs bg-muted text-primary px-1.5 py-0.5 rounded h-fit mt-0.5 shrink-0">{item.type}</code>
              <span className="text-muted-foreground text-xs">{item.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          At archiving time, <code className="bg-muted px-1 rounded">consumed</code> items move to lineage. <code className="bg-muted px-1 rounded">pending</code> items are carried forward to the next generation's backlog.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Partial completion is normal — tasks depending on Genome changes are marked <code className="text-xs bg-muted px-1 rounded">[deferred]</code> and handed to the next generation.
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">Evolution Flow Example</h2>
        <CodeBlock language="text">{`Generation #1 (Genome v1)
  → Objective: "Implement user authentication"
  → Planning → Implementation
  → OAuth2 need discovered → genome-change logged in backlog
  → Validation (partial)
  → Completion → Retrospective + genome update → Genome v2 → Archive

Generation #2 (Genome v2)
  → Objective: "OAuth2 integration + permission management"
  → Deferred tasks from previous generation + new goals
  → ...`}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
