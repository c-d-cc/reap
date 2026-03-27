import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function BacklogPage() {
  const t = useT();
  const b = t.backlogPage;
  return (
    <DocLayout>
      <DocPage title={b.title} breadcrumb={b.breadcrumb}>
        <p className="text-sm text-muted-foreground mb-4">{b.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{b.typesTitle}</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border border-border">
            <thead><tr className="bg-muted">{b.typeHeaders.map((h, i) => <th key={i} className="p-2 text-left border-b border-border">{h}</th>)}</tr></thead>
            <tbody>{b.typeItems.map((row, i) => <tr key={i} className="border-b border-border">{row.map((c, j) => <td key={j} className="p-2">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{b.statusTitle}</h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-xs border border-border">
            <thead><tr className="bg-muted">{b.statusHeaders.map((h, i) => <th key={i} className="p-2 text-left border-b border-border">{h}</th>)}</tr></thead>
            <tbody>{b.statusItems.map((row, i) => <tr key={i} className="border-b border-border">{row.map((c, j) => <td key={j} className="p-2">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{b.archivingTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{b.archivingDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{b.deferralTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{b.deferralDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{b.abortTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{b.abortDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{b.formatTitle}</h2>
        <CodeBlock language="yaml">{b.format}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
