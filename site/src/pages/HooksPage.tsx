import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function HooksPage() {
  const t = useT();
  const h = t.hooks;
  return (
    <DocLayout>
      <DocPage title={h.title} breadcrumb={h.breadcrumb}>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{h.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{h.eventsTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-3">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {h.eventHeaders.map((header) => (
                  <th key={header} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {h.events.map(([event, when]) => (
                <tr key={event}>
                  <td className="px-4 py-2 font-mono text-xs text-primary">{event}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">{h.fireTiming}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{h.fileConventionTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{h.fileConventionDesc}</p>
        <CodeBlock language="bash">{h.makeHookExample}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{h.typesTitle}</h2>
        <div className="space-y-3 mb-6">
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">{h.shType}</div>
            <p className="text-xs text-muted-foreground">{h.shTypeDesc}</p>
          </div>
          <div className="border-l-2 border-primary pl-3 py-1">
            <div className="text-xs font-semibold text-foreground mb-0.5">{h.mdType}</div>
            <p className="text-xs text-muted-foreground">{h.mdTypeDesc}</p>
          </div>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{h.conditionOrderTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{h.conditionOrderDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{h.failureTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{h.failureDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{h.conditionScriptTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{h.conditionScriptDesc}</p>
      </DocPage>
    </DocLayout>
  );
}
