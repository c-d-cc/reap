import { DocLayout } from "@/components/DocLayout";
import { DocPage } from "@/components/DocPage";
import { CodeBlock } from "@/components/CodeBlock";
import { useT } from "@/i18n";

export default function ConfigurationPage() {
  const t = useT();
  const c = t.configurationPage;
  return (
    <DocLayout>
      <DocPage title={c.title} breadcrumb={c.breadcrumb}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{c.intro}</p>

        <h2 className="text-base font-semibold text-foreground mb-2">{c.yamlTitle}</h2>
        <CodeBlock language="yaml">{c.yamlCode}</CodeBlock>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.fieldsTitle}</h2>
        <div className="border border-border rounded-md overflow-hidden text-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {c.fieldHeaders.map((h, i) => (
                  <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {c.fields.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-2 font-mono text-xs text-primary align-top whitespace-nowrap">{row[0]}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs align-top">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.langTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.langDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.overrideTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{c.overrideDesc}</p>

        <h2 className="text-base font-semibold text-foreground mb-2 mt-6">{c.gitignoreTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{c.gitignoreDesc}</p>
      </DocPage>
    </DocLayout>
  );
}
