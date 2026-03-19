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
├── constraints.md     # Technical constraints/choices
└── source-map.md      # C4 Container/Component diagrams`}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{t.concepts.principles}</h2>
        <div className="space-y-3 mb-6">
          <div className="border border-border rounded-md p-3 bg-card">
            <div className="text-sm font-semibold text-foreground mb-1">{t.concepts.genomeImmutability}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.concepts.genomeImmutabilityDesc}</p>
          </div>
          <div className="border border-border rounded-md p-3 bg-card">
            <div className="text-sm font-semibold text-foreground mb-1">{t.concepts.envImmutability}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.concepts.envImmutabilityDesc}</p>
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
        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.concepts.backlogHeaders.map((h) => (
                  <th key={h} className={`text-left px-4 py-2 text-xs font-semibold text-muted-foreground ${h === t.concepts.backlogHeaders[0] ? "w-48" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.concepts.backlogTypes.map((item) => (
                <tr key={item.type}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{item.type}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{t.concepts.statusField}</p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {t.concepts.statusHeaders.map((h) => (
                  <th key={h} className={`text-left px-4 py-2 text-xs font-semibold text-muted-foreground ${h === t.concepts.statusHeaders[0] ? "w-48" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.concepts.statuses.map((item) => (
                <tr key={item.type}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{item.type}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
