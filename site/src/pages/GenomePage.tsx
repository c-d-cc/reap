import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function GenomePage() {
  const t = useT();
  const g = t.genomePage;
  return (
    <DocLayout>
      <DocPage title={g.title} breadcrumb={g.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{g.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{g.filesTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {g.filesHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {g.files.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.injectionTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{g.injectionDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.seedTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{g.seedDesc}</p>
        <CodeBlock language="text">{g.seedCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.fillOrderTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{g.fillOrderDesc}</p>
        <ol className="space-y-3 mb-6 list-none">
          {g.fillOrderSteps.map((step) => (
            <li key={step.title} className="border-l-2 border-border hover:border-primary transition-colors pl-3 py-0.5">
              <div className="text-sm font-semibold text-foreground mb-0.5">{step.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{step.desc}</div>
            </li>
          ))}
        </ol>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.sizeTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{g.sizeDesc}</p>
      </DocPage>
    </DocLayout>
  );
}
