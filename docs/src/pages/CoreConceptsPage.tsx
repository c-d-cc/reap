import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { Link } from "wouter";
import { useT } from "@/i18n";

export default function CoreConceptsPage() {
  const t = useT();
  const c = t.concepts;
  return (
    <DocLayout>
      <DocPage title={c.title} breadcrumb={c.breadcrumb}>

        {/* Architecture Image */}
        <div className="flex justify-center mb-6">
          <img src="/architecture.png" alt="REAP Architecture" className="max-w-[600px] w-full rounded-md" />
        </div>

        {/* Four-Axis Structure */}
        <h2 className="text-base font-semibold text-foreground mb-2">{c.fourAxisTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{c.fourAxisDesc}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {c.axes.map((item) => (
            <Link key={item.axis} href={item.href} className="flex">
              <div className="border border-border rounded-md p-3 bg-card hover:border-primary/50 transition-colors cursor-pointer flex flex-col flex-1">
                <div className="text-sm font-semibold text-foreground">{item.axis}</div>
                <div className="text-xs font-mono text-muted-foreground mb-1">{item.path}</div>
                <p className="text-xs text-muted-foreground flex-1">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Key Principles */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.principlesTitle}</h2>
        <div className="space-y-2 mb-6">
          {c.principles.map((p) => (
            <div key={p.name} className="border border-border rounded-md p-3 bg-card">
              <div className="text-sm font-semibold text-foreground mb-1">{p.name}</div>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Lifecycle Overview */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.lifecycleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{c.lifecycleDesc}</p>
        <div className="flex items-center gap-1 flex-wrap mb-4">
          {[
            { label: "Learning" }, null,
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
                {c.stageHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {c.stages.map(([stage, what, artifact]) => (
                <tr key={stage}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{stage}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{what}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{artifact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          <Link href="/docs/lifecycle" className="text-primary hover:underline">→ Lifecycle details</Link>
          {" · "}
          <Link href="/docs/backlog" className="text-primary hover:underline">→ Backlog & Deferral</Link>
        </p>

        {/* Session Initialization */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.sessionInitTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{c.sessionInitDesc}</p>
        <div className="border border-border rounded-md overflow-hidden mb-6 inline-block">
          <img
            src="/session-init-screenshot.png"
            alt={c.sessionInitAlt}
            className="max-w-md"
          />
        </div>

        {/* Evolution Flow */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.evolutionFlowTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{c.evolutionFlowDesc}</p>
        <CodeBlock language="text">{`Generation #1 (Genome v1)
  → Learning: explore project, build context
  → Planning → Implementation
  → OAuth2 need discovered → genome-change logged in backlog
  → Validation (partial)
  → Completion: reflect → fitness → adapt (genome v2) → commit → Archive

Generation #2 (Genome v2)
  → Learning: review updated genome, deferred tasks
  → Vision-driven goal: "OAuth2 integration + permission management"
  → ...`}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
