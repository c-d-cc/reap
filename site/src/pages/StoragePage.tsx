import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function StoragePage() {
  const t = useT();
  const s = t.storagePage;
  return (
    <DocLayout>
      <DocPage title={s.title} breadcrumb={s.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{s.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{s.treeTitle}</h2>
        <CodeBlock language="text">{s.tree}</CodeBlock>
        <p className="text-xs text-muted-foreground mb-6 mt-2 leading-relaxed">{s.treeDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{s.tierTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{s.tierDesc}</p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {s.tierHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {s.tiers.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{s.outsideTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{s.outsideDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{s.mapTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{s.mapDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{s.sessionTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{s.sessionDesc}</p>
      </DocPage>
    </DocLayout>
  );
}
