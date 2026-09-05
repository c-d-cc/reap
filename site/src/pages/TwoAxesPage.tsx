import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function TwoAxesPage() {
  const t = useT();
  const a = t.twoAxesPage;
  return (
    <DocLayout>
      <DocPage title={a.title} breadcrumb={a.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{a.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{a.cycleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{a.cycleDesc}</p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {a.cycleHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {a.cycleRows.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-semibold text-foreground text-xs align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{a.meetTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{a.meetDesc}</p>
        <CodeBlock language="text">{a.meetDiagram}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{a.meetNote}</p>
      </DocPage>
    </DocLayout>
  );
}
