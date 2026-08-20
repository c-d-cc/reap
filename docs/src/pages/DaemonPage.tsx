import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

/**
 * The code index page.
 *
 * The route is still /docs/daemon so existing links keep working; the daemon
 * itself was retired in v0.17.6 and the last section says so.
 */
export default function DaemonPage() {
  const t = useT();
  const d = t.daemonPage;
  return (
    <DocLayout>
      <DocPage title={d.title} breadcrumb={d.breadcrumb}>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{d.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-3">{d.commandsTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{d.commandsDesc}</p>
        <CodeBlock language="bash">{d.commandsCode}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">{d.commandsNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.commitTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.commitDesc}</p>
        <CodeBlock language="bash">{d.commitCode}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">{d.commitNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.statusTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.statusDesc}</p>
        <CodeBlock language="text">{d.statusCode}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">{d.statusNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.locationTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{d.locationDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.whenTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">{d.whenDesc}</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border border-border">
            <thead>
              <tr className="bg-muted">
                {d.whenHeaders.map((h, i) => (
                  <th key={i} className="p-2 text-left border-b border-border font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.whenItems.map((row, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="p-2 font-semibold text-foreground">{row[0]}</td>
                  <td className="p-2 text-muted-foreground">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-3 mt-6">{d.retiredTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{d.retiredDesc}</p>
        <CodeBlock language="bash">{d.retiredCode}</CodeBlock>
        <p className="text-xs text-muted-foreground mt-2 mb-6">{d.retiredNote}</p>
      </DocPage>
    </DocLayout>
  );
}
