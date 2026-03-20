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

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{e.flowTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{e.flowDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{e.syncTitle}</h2>
        <p className="text-sm text-muted-foreground">{e.syncDesc}</p>
      </DocPage>
    </DocLayout>
  );
}
