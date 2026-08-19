import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function DaemonPage() {
  const t = useT();
  const d = t.daemonPage;
  return (
    <DocLayout>
      <DocPage title={d.title} breadcrumb={d.breadcrumb}>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{d.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-3">{d.installTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{d.installDesc}</p>
        <CodeBlock language="bash">{d.installCmd}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">{d.installNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-3">{d.optInTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{d.optInDesc}</p>
        <CodeBlock language="yaml">{d.optInConfig}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">{d.optInNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.locateTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.locateDesc}</p>
        <CodeBlock language="yaml">{d.locateConfig}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">{d.locateNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.unusableTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{d.unusableDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.autoTriggerTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{d.autoTriggerDesc}</p>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-xs border border-border">
            <thead>
              <tr className="bg-muted">
                {d.autoTriggerHeaders.map((h, i) => (
                  <th key={i} className="p-2 text-left border-b border-border font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.autoTriggerItems.map((row, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="p-2 font-mono text-primary">{row[0]}</td>
                  <td className="p-2 text-muted-foreground">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mb-6">{d.autoTriggerNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.queryTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{d.queryDesc}</p>
        <CodeBlock language="bash">{d.queryHealth}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-3 mb-2">Look up the current project's ID:</p>
        <CodeBlock language="bash">{d.queryProjectId}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-3 mb-2">Common queries:</p>
        <CodeBlock language="bash">{d.queryExamples}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.stalenessTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{d.stalenessDesc}</p>
        <CodeBlock language="bash">{d.stalenessCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.cliTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{d.cliDesc}</p>
        <CodeBlock language="bash">{d.cliCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.fallbackTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{d.fallbackDesc}</p>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-xs border border-border">
            <thead>
              <tr className="bg-muted">
                {d.fallbackHeaders.map((h, i) => (
                  <th key={i} className="p-2 text-left border-b border-border font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.fallbackItems.map((row, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="p-2 font-semibold text-foreground">{row[0]}</td>
                  <td className="p-2 text-muted-foreground">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocPage>
    </DocLayout>
  );
}
