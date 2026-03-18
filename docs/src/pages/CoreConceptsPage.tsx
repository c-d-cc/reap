import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function CoreConceptsPage() {
  const t = useT();
  return (
    <DocLayout>
      <DocPage title={t.concepts.title} breadcrumb={t.concepts.breadcrumb}>

        <h2 className="text-base font-semibold text-foreground mb-2">{t.concepts.genomeTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {t.concepts.genomeDesc}
        </p>
        <CodeBlock language="text">{`.reap/genome/
├── principles.md      # Architecture principles/decisions
├── domain/            # Business rules (per module)
├── conventions.md     # Development rules/conventions
└── constraints.md     # Technical constraints/choices`}</CodeBlock>

        <div className="mt-4 space-y-3 mb-6">
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">{t.concepts.genomeImmutability}</div>
            <p className="text-xs text-muted-foreground">{t.concepts.genomeImmutabilityDesc}</p>
          </div>
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">{t.concepts.envImmutability}</div>
            <p className="text-xs text-muted-foreground">{t.concepts.envImmutabilityDesc}</p>
          </div>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.concepts.lifecycle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{t.concepts.lifecycleDesc}</p>
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
                {t.concepts.stageHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.concepts.stages.map(([stage, what, artifact]) => (
                <tr key={stage}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{stage}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{what}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{artifact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.concepts.backlog}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {t.concepts.backlogDesc}
        </p>
        <div className="space-y-2 mb-4">
          {t.concepts.backlogTypes.map((item) => (
            <div key={item.type} className="flex gap-3 text-sm">
              <code className="text-xs bg-muted text-primary px-1.5 py-0.5 rounded h-fit mt-0.5 shrink-0">{item.type}</code>
              <span className="text-muted-foreground text-xs">{item.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-2">{t.concepts.statusField}</p>
        <div className="space-y-2 mb-4">
          {t.concepts.statuses.map((item) => (
            <div key={item.type} className="flex gap-3 text-sm">
              <code className="text-xs bg-muted text-primary px-1.5 py-0.5 rounded h-fit mt-0.5 shrink-0">{item.type}</code>
              <span className="text-muted-foreground text-xs">{item.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {t.concepts.archivingNote}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {t.concepts.deferralNote}
        </p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.concepts.evolutionFlow}</h2>
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
