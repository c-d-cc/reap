import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function OrchestratePage() {
  const t = useT();
  const o = t.orchestrate;
  return (
    <DocLayout>
      <DocPage title={o.title} breadcrumb={o.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{o.intro}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{o.aloneNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{o.worktreeTitle}</h2>
        <CodeBlock language="bash">{o.worktreeCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-2 leading-relaxed">{o.worktreeDesc}</p>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{o.sameDirNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{o.idTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{o.idDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{o.claimTitle}</h2>
        <CodeBlock language="bash">{o.claimCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{o.claimDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{o.barrierTitle}</h2>
        <CodeBlock language="bash">{o.barrierCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{o.barrierDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{o.rosterTitle}</h2>
        <CodeBlock language="bash">{o.rosterCode}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">{o.rosterDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{o.kindTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-3">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {o.kindHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {o.kinds.map(([kind, meaning]) => (
                <tr key={kind}>
                  <td className="px-4 py-2 font-mono text-xs text-primary whitespace-nowrap">{kind}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{o.coordinatorNote}</p>
      </DocPage>
    </DocLayout>
  );
}
