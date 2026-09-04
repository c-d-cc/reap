import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function GenerationPage() {
  const t = useT();
  const g = t.generationPage;
  return (
    <DocLayout>
      <DocPage title={g.title} breadcrumb={g.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{g.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{g.groundsTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {g.groundsHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {g.grounds.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.worthTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{g.worthDesc}</p>
        <h3 className="text-sm font-semibold text-foreground mb-2 mt-4">{g.worthSmallTitle}</h3>
        <ul className="text-sm text-muted-foreground space-y-1.5 mb-6 pl-3 border-l border-border">
          {g.worthSmall.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.openTitle}</h2>
        <CodeBlock language="bash">{g.openCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{g.openDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.bindingTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{g.bindingDesc}</p>
        <CodeBlock language="bash">{g.bindCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{g.bindDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.vocabTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{g.vocabDesc}</p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {g.vocabHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {g.vocab.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-foreground align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.commitTitle}</h2>
        <ul className="text-sm text-muted-foreground space-y-1.5 mb-3 pl-3 border-l border-border">
          {g.commitItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{g.commitDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.closeTitle}</h2>
        <CodeBlock language="bash">{g.closeCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{g.closeDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{g.exampleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{g.exampleDesc}</p>
        <CodeBlock language="text">{g.exampleCode}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
