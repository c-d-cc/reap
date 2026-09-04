import { Link } from "wouter";
import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function ConceptsPage() {
  const t = useT();
  const c = t.concepts;
  return (
    <DocLayout>
      <DocPage title={c.title} breadcrumb={c.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{c.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{c.layersTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-3">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {c.layersHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {c.layers.map(([layer, who, what]) => (
                <tr key={layer}>
                  <td className="px-4 py-2 font-semibold text-foreground text-xs align-top">{layer}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground align-top">{who}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground align-top">{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.layersNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.unitsTitle}</h2>
        <div className="space-y-3 mb-6">
          {c.units.map((u) => (
            <div key={u.name} className="border-l-2 border-primary pl-3 py-1">
              <div className="text-xs font-semibold text-foreground mb-0.5">{u.name}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-md overflow-hidden text-sm mb-3">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {c.splitHeaders.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {c.splitRows.map(([kind, what, membership]) => (
                <tr key={kind}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top">{kind}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground align-top">{what}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground align-top">{membership}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.splitNote}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.storageTitle}</h2>
        <CodeBlock language="text">{c.storageTree}</CodeBlock>
        <p className="text-sm text-muted-foreground mt-2 mb-3 leading-relaxed">{c.storageNote}</p>

        <div className="space-y-2 mb-6">
          {c.topLevelItems.map((item) => (
            <div key={item.name} className="text-sm">
              <span className="font-mono text-xs text-primary">{item.name}</span>
              <span className="text-muted-foreground"> — {item.desc}</span>
            </div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.statusLineTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{c.statusLineDesc1}</p>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.statusLineDesc2}</p>
        <p className="text-sm text-muted-foreground">
          {c.backLinkPrefix} <Link href="/docs/quick-start" className="text-primary hover:underline">{c.backLinkText}</Link>
        </p>
      </DocPage>
    </DocLayout>
  );
}
