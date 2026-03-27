import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function LineagePage() {
  const t = useT();
  const l = t.lineagePage;
  return (
    <DocLayout>
      <DocPage title={l.title} breadcrumb={l.breadcrumb}>
        <p className="text-sm text-muted-foreground mb-4">{l.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{l.structureTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2">{l.structureDesc}</p>
        <CodeBlock language="text">{l.structure}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{l.dagTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{l.dagDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{l.compressionTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{l.compressionDesc}</p>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-xs border border-border">
            <thead><tr className="bg-muted">{l.compressionHeaders.map((h, i) => <th key={i} className="p-2 text-left border-b border-border">{h}</th>)}</tr></thead>
            <tbody>{l.compressionItems.map((row, i) => <tr key={i} className="border-b border-border">{row.map((c, j) => <td key={j} className="p-2">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">{l.compressionSafety}</p>
      </DocPage>
    </DocLayout>
  );
}
