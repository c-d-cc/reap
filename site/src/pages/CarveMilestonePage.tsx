import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function CarveMilestonePage() {
  const t = useT();
  const c = t.carveMilestonePage;
  return (
    <DocLayout>
      <DocPage title={c.title} breadcrumb={c.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{c.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{c.checkTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.checkDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.sizeTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{c.sizeDesc}</p>
        <div className="border-l-2 border-primary pl-4 py-2 mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">{c.sizeNote}</p>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.vocabTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{c.vocabDesc}</p>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {c.vocabHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {c.vocab.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-foreground align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.fitnessQuestionsTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.fitnessQuestionsDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.carveTitle}</h2>
        <CodeBlock language="bash">{c.carveCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{c.carveDesc}</p>

        <h3 className="text-sm font-semibold text-foreground mb-2 mt-6">{c.focusTitle}</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.focusDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.retireTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.retireDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.closeTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{c.closeDesc}</p>
        <ol className="space-y-3 mb-6 list-none">
          {c.closeSteps.map((step) => (
            <li key={step.title} className="border-l-2 border-border hover:border-primary transition-colors pl-3 py-0.5">
              <div className="text-sm font-semibold text-foreground mb-0.5">{step.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{step.desc}</div>
            </li>
          ))}
        </ol>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.exampleTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{c.exampleDesc}</p>
        <CodeBlock language="text">{c.exampleCode}</CodeBlock>
      </DocPage>
    </DocLayout>
  );
}
