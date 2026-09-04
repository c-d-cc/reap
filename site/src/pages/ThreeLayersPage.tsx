import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function ThreeLayersPage() {
  const t = useT();
  const l = t.threeLayersPage;
  return (
    <DocLayout>
      <DocPage title={l.title} breadcrumb={l.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{l.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{l.layersTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{l.layersDesc}</p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {l.layerHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {l.layers.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-semibold text-primary text-xs align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top whitespace-nowrap">{row[1]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[2]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{l.noGateTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{l.noGateDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{l.doctorTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{l.doctorDesc}</p>
        <CodeBlock language="text">{l.doctorCode}</CodeBlock>

        <h3 className="text-sm font-semibold text-foreground mb-2 mt-6">{l.doctorSplitTitle}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{l.doctorSplitDesc}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-foreground mb-2">{l.defectTitle}</div>
            <ul className="text-xs text-muted-foreground space-y-1.5 pl-3 border-l border-border">
              {l.defectItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground mb-2">{l.referenceTitle}</div>
            <ul className="text-xs text-muted-foreground space-y-1.5 pl-3 border-l border-border">
              {l.referenceItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </DocPage>
    </DocLayout>
  );
}
