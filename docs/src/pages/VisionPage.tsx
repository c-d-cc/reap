import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function VisionPage() {
  const t = useT();
  const v = t.visionPage;
  return (
    <DocLayout>
      <DocPage title={v.title} breadcrumb={v.breadcrumb}>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {v.intro}
        </p>

        {/* Structure */}
        <h2 className="text-base font-semibold text-foreground mb-2">{v.structureTitle}</h2>
        <CodeBlock language="text">{`.reap/vision/
  goals.md              # North star objectives and milestones
  docs/                 # Planning documents, specs, design notes
  memory/               # AI memory (3-tier)
    longterm.md          #   Project lifetime — lessons, decision rationale
    midterm.md           #   Multi-generation — ongoing plans, agreed directions
    shortterm.md         #   1-2 sessions — next session handoff, immediate context`}</CodeBlock>

        {/* Goals */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{v.goalsTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {v.goalsDesc}
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
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{v.memoryTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {v.memoryDesc}
        </p>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {v.memoryHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {v.memoryRows.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{row[0]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[1]}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* When to Update */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{v.whenToUpdateTitle}</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
          {v.whenToUpdateItems.map((item, i) => (
            <li key={i}><strong className="text-foreground">{item.label}</strong> — {item.desc}</li>
          ))}
        </ul>

        {/* What NOT to write */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{v.whatNotTitle}</h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
          {v.whatNotItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>

        {/* Gap-driven Evolution */}
        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{v.gapDrivenTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {v.gapDrivenDesc}
        </p>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mb-4">
          {v.gapDrivenSteps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>


      </DocPage>
    </DocLayout>
  );
}
