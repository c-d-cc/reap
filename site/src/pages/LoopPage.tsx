import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function LoopPage() {
  const t = useT();
  const l = t.loopPage;
  return (
    <DocLayout>
      <DocPage title={l.title} breadcrumb={l.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{l.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{l.typesTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {l.typeHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {l.types.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{l.openTitle}</h2>
        <CodeBlock language="bash">{l.openCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{l.openDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{l.continueTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{l.continueDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{l.vocabTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{l.vocabDesc}</p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {l.vocabHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {l.vocab.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-foreground align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{l.closeTitle}</h2>
        <CodeBlock language="bash">{l.closeCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{l.closeDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{l.stayOpenTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{l.stayOpenDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{l.exampleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{l.exampleDesc}</p>
        <CodeBlock language="text">{l.exampleCode}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
