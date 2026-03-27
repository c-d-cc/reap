import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function EnvironmentPage() {
  const t = useT();
  const e = t.environmentPage;
  return (
    <DocLayout>
      <DocPage title={e.title} breadcrumb={e.breadcrumb}>
        <p className="text-sm text-muted-foreground mb-4">{e.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{e.structureTitle}</h2>
        <CodeBlock language="text">{e.structure}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{e.layersTitle}</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border border-border">
            <thead><tr className="bg-muted">{e.layerHeaders.map((h, i) => <th key={i} className="p-2 text-left border-b border-border">{h}</th>)}</tr></thead>
            <tbody>{e.layerItems.map((row, i) => <tr key={i} className="border-b border-border">{row.map((c, j) => <td key={j} className="p-2">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{e.immutabilityTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{e.immutabilityDesc}</p>
        <div className="border-l-2 border-primary/30 pl-4 py-2 mb-4 bg-muted/30 rounded-r-md">
          <p className="text-sm text-muted-foreground italic">{e.immutabilityWhy}</p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{e.flowTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{e.flowDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{e.syncTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{e.syncDesc}</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {e.syncSources.map((src, i) => (
            <div key={i} className="flex-1 border border-border rounded-md p-3 bg-card">
              <div className="text-xs font-semibold text-foreground mb-1">{src.label}</div>
              <div className="text-[10px] uppercase tracking-wider text-primary/70 mb-1.5">{src.role}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{src.desc}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic">{e.syncContrast}</p>
      </DocPage>
    </DocLayout>
  );
}
